"""
Add release dates to dataset/spotify_youtube_clean_v2.csv  ->  dataset/spotify_youtube_release_date.csv

New columns, one value per song:
  release_date              the song's first release (see "How the date is chosen")
  release_date_precision    'day', 'month' or 'year'. Year-only dates are set to 1 July of that year
                            and month-only dates to the 15th, so they are at most half a period off.
  release_date_source       wikidata_song, musicbrainz_album, wikidata_album, musicbrainz_song,
                            spotify or deezer: where the chosen date came from
  release_date_confidence   confirmed           a second source agrees within 6 months
                            single source       only one first-release source has a date
                            edition date only   only Deezer/Spotify: the date of the edition they
                                                carry, often a remaster or compilation, so the song
                                                may be older than this
  release_year, years_since_release   year of release_date, and years from it to the day the
                            Kaggle data was collected (7 Feb 2023)
  youtube_published_at, years_on_youtube   only written when YouTube upload dates were fetched
  age_band                  years since release, grouped: <3 mo, 3–6 mo, ..., 12–20 y, 20+ y
  stream_vs_age, views_vs_age, likes_vs_age, comments_vs_age
                            log10 count minus the median log10 count of songs in the same age band:
                            0 = typical for its age, +1 = 10x a typical song of the same age
  spotify_tier_age_adj, youtube_tier_age_adj
                            popularity quartile within the song's age band: Q1 (Low) ... Q4 (Top)

How the date is chosen:
  Streaming services (Deezer, Spotify) give the release date of the edition they carry, which for
  older songs is usually a remaster or compilation (Billy Joel's 1977 'Movin' Out' is only on Deezer
  as the 2009 Legacy Edition). First-release sources give the original date across all editions:
    wikidata_song       the song's own Wikidata entry
    musicbrainz_album   MusicBrainz release group (all editions of the album) of the Spotify track's album
    wikidata_album      the album's Wikidata entry
    musicbrainz_song    earliest release of the recording in MusicBrainz
  Album dates are not used for compilations, re-recordings (Taylor's Version) or remix/live tracks
  on studio albums. The chosen date is the earliest one that a second source confirms within
  6 months, with at least one of the pair a first-release source. A first-release date more than a
  year after an edition date is dropped (the edition proves the song was out by then). If none is confirmed, the first
  available source in the order above wins, then Spotify, then Deezer.

How it runs (each step skips itself if its key isn't set):
  1. YouTube upload dates (needs YOUTUBE_API_KEY): 50 videos per request, a few minutes.
  2. Deezer search (no key needed) for every song, about 1-2 hours.
  3. Wikidata songs and albums (no key), 20 artists per query, a few minutes.
  4-5. MusicBrainz. Fast way: download the database dump (mbdump.tar.bz2, ~7.5 GB) into dataset/
     and run scripts/musicbrainz_dump.py once (~15 min); its extracts are then used for every song.
     Slow way (no dump): the web API at 1 request per second, which throttles anonymous clients:
     album first-release dates (most at-risk songs first), then song lookups for songs whose date
     isn't confirmed yet. Several hours; can be stopped and resumed.
  6. Spotify (optional, needs SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET): album date of the exact track.
Progress is saved in scripts/release_date_cache/, so you can stop at any time (Ctrl+C) and re-run
to continue. Re-running with everything cached only rebuilds the CSV (seconds).

Usage (from the repo root):
  python scripts/add_release_dates.py               # full run
  python scripts/add_release_dates.py --sample 200  # quick test on 200 random songs, with its own
                                                    # cache; writes scripts/release_date_cache_sample/sample_output.csv
  python scripts/add_release_dates.py --skip-musicbrainz   # rebuild from what is cached so far
  In a notebook:  %run ../scripts/add_release_dates.py

Setup:
  pip install pandas numpy requests
  YouTube: in Google Cloud Console, enable "YouTube Data API v3", create an API key,
           then set the environment variable YOUTUBE_API_KEY.
  Spotify: create an app at https://developer.spotify.com/dashboard (the app owner's account needs
           Spotify Premium), then set the environment variables SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.
           Spotify doesn't publish its quota for such apps; if it is reached the script stops and
           you can re-run later to continue.
  In a notebook you can set them with:  import os; os.environ["YOUTUBE_API_KEY"] = "..."
"""
import argparse
import csv
import os
import re
import threading
import time
import unicodedata
from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import date
from pathlib import Path

import numpy as np
import pandas as pd
import requests

HERE = Path(__file__).resolve().parent
SRC = HERE.parent / "dataset" / "spotify_youtube_clean_v2.csv"
OUT = HERE.parent / "dataset" / "spotify_youtube_release_date.csv"
CACHE = HERE / "release_date_cache"

# Date the Kaggle data was collected (streams and views were counted on this day).
# Check the dataset's Kaggle page and adjust if needed.
COLLECTION_DATE = pd.Timestamp("2023-02-07")

SPOTIFY_PAUSE = 0.3   # seconds between Spotify requests
DEEZER_GAP = 0.11     # Deezer allows roughly 50 requests per 5 seconds
DEEZER_WORKERS = 4    # songs looked up at the same time (all share the rate limit above)
MUSICBRAINZ_GAP = 1.1  # MusicBrainz allows 1 request per second
WIKIDATA_BATCH = 20   # artists per Wikidata query
TIMEOUT = 30
FLUSH_EVERY = 100     # cache rows are written to disk in chunks of this size
USER_AGENT = {"User-Agent": "VA-Group7-release-dates/1.0 (university student project)"}

COMPILATION_WORDS = r"greatest hits|best of|the essential|anthology|collection|\bhits\b|\bgold\b|\bsingles\b"
RERECORDING_WORDS = r"taylor.s version|re-?recorded"
FIRST_RELEASE_SOURCES = ["wikidata_song", "musicbrainz_album", "wikidata_album", "musicbrainz_song"]
SOURCE_PRIORITY = FIRST_RELEASE_SOURCES + ["spotify", "deezer"]
CONFIRM_DAYS = 183    # two sources agreeing within this many days (about 6 months) confirm a date

AGE_BANDS = [0, 0.25, 0.5, 1, 2, 3, 5, 8, 12, 20, np.inf]
AGE_LABELS = ["<3 mo", "3–6 mo", "6–12 mo", "1–2 y", "2–3 y", "3–5 y", "5–8 y", "8–12 y", "12–20 y", "20+ y"]
TIER_LABELS = ["Q1 (Low)", "Q2", "Q3", "Q4 (Top)"]
SONG_COLUMNS = ["Uri", "Artist", "Track", "Album", "Album_type"]


# ---------- small helpers ----------

def read_cache(name, key):
    path = CACHE / name
    if not path.exists():
        return pd.DataFrame(columns=[key])
    # Later rows win: a lookup that hit a temporary error is retried and appended again.
    return pd.read_csv(path, dtype=str, keep_default_na=False).drop_duplicates(key, keep="last")


class CacheWriter:
    """Appends rows to a cache CSV; pending rows are saved even on Ctrl+C or a crash."""

    def __init__(self, name, header):
        self.path, self.header, self.rows = CACHE / name, header, []
        self.lock = threading.RLock()

    def add(self, row):
        with self.lock:
            self.rows.append(row)
            if len(self.rows) >= FLUSH_EVERY:
                self.flush()

    def flush(self):
        with self.lock:
            if not self.rows:
                return
            new = not self.path.exists()
            with open(self.path, "a", newline="", encoding="utf-8") as f:
                w = csv.writer(f)
                if new:
                    w.writerow(self.header)
                w.writerows(self.rows)
            self.rows = []

    def __enter__(self):
        return self

    def __exit__(self, *exc):
        self.flush()


def http_get(url, **kwargs):
    """requests.get that waits and retries when the network drops."""
    for attempt in range(1, 6):
        try:
            return requests.get(url, timeout=TIMEOUT, **kwargs)
        except requests.RequestException as e:
            print(f"  network error ({type(e).__name__}), retrying in {10 * attempt} s")
            time.sleep(10 * attempt)
    raise SystemExit("The network keeps failing. Progress is saved; re-run to continue.")


def norm(text):
    """Lower case, no accents, letters and digits only: 'Beyoncé' -> 'beyonce', 'Ke$ha' -> 'kesha'.
    Keeps non-Latin scripts, and symbol-only titles as they are ('÷' must not match '+')."""
    text = unicodedata.normalize("NFKD", str(text).casefold().replace("$", "s"))
    text = "".join(c for c in text if not unicodedata.combining(c))
    return re.sub(r"[\W_]", "", text) or re.sub(r"\s", "", text)


def norm_artist(name):
    return re.sub(r"^the", "", norm(name))


def artist_names(name):
    """The full credit plus each act in it: 'Joan Jett & the Blackhearts' -> {joanjetttheblackhearts,
    joanjett, blackhearts}, so it matches Deezer's 'Joan Jett'."""
    parts = re.split(r"\s+(?:and|x|y|e|feat\.?|ft\.?|with)\s+|\s*[,&/+]\s*", str(name), flags=re.I)
    return {norm_artist(p) for p in [name, *parts]} - {""}


def base_title(title):
    """Song name without version info: 'Smooth Criminal - 2012 Remaster' -> 'Smooth Criminal',
    'Love Story (Taylor's Version)' -> 'Love Story'."""
    t = re.sub(r"\s+-\s+.*$", "", str(title))
    t = re.sub(r"\s*[\(\[][^\)\]]*[\)\]]", "", t)
    return t.strip() or str(title).strip()


def clean_album(album):
    """Album name without edition info: 'The Stranger (Legacy Edition)' -> 'The Stranger',
    'Countdown To Extinction (Expanded Edition - Remastered)' -> 'Countdown To Extinction'.
    Volume numbers stay: 'Cinematic Songs (Vol. 2)' -> 'Cinematic Songs vol 2', the same as 'Cinematic Songs, Volume 2'."""
    a = re.sub(r"\b(?:vol(?:ume)?|pt|part)\b\.?\s*(\d+|[ivx]+)\b", r"vol \1", str(album), flags=re.I)
    a = re.sub(r"\s*[\(\[][^\)\]]*\b(vol \w+)[^\)\]]*[\)\]]", r" \1", a)
    for _ in range(3):
        a = re.sub(r"\s*[\(\[][^\)\]]*[\)\]]\s*$", "", a)
        a = re.sub(r"\s+-\s+[^-]*(remaster|edition|version|deluxe|expanded|anniversary|mono|stereo)[^-]*$", "", a, flags=re.I)
    return a.strip() or str(album).strip()


# Words in the version part of a title that mean a different recording than the original.
# ('Remastered', 'Radio Edit', 'feat. X' are treated as the same song.)
VERSION_TAGS = {
    "live": r"\blive\b|\ben vivo\b|\bao vivo\b|\bunplugged\b|\bsessions?\b|recorded at|spotify (singles|studios)",
    "remix": r"remix|\bmix\b|\brmx\b|\bdub\b|\bbootleg\b",
    "acoustic": r"acoustic|acustic|\bstripped\b",
    "instrumental": r"instrumental|\bbacking track\b",
    "karaoke": r"karaoke|originally performed|in the style of|\btribute\b|\bcover\b|\bmade famous\b"
               r"|カラオケ|原曲歌手|オリジナル歌手",
    "sped/slowed": r"sped up|slowed|reverb|nightcore|\b8d\b",
    "demo": r"\bdemo\b",
    "re-recording": r"taylor.s version|re-?recorded",
    "orchestral": r"orchestra|symphonic|\bpiano version\b",
}


def version_tags(title):
    version_part = str(title).replace(base_title(title), "", 1).lower()
    return frozenset(name for name, pat in VERSION_TAGS.items() if re.search(pat, version_part))


def version_text(title):
    """The version part of a versioned title, letters and digits only:
    'Everytime We Touch - Fallen Superhero Remix' -> 'fallensuperheroremix'; '' when not a version."""
    if not version_tags(title):
        return ""
    return re.sub(r"[\W_]", "", str(title).replace(base_title(title), "", 1).casefold())


def same_version(track, other_title, other_comment=""):
    """Same kind of version, and for a remix/live/... track the same named version
    ('Fallen Superhero Remix' must not match another remix of the song)."""
    other = f"{other_title} ({other_comment})" if other_comment else str(other_title)
    if version_tags(track) != version_tags(other):
        return False
    wanted = version_text(track)
    return not wanted or wanted in re.sub(r"[\W_]", "", other.casefold())


def album_date_applies(track, album, album_type):
    """Whether the album's first release is also the song's: not for compilations ('The Very Best
    Of'), re-recordings ('Red (Taylor's Version)') or a remix/live track added to a studio album."""
    if album_type == "compilation" or re.search(COMPILATION_WORDS, str(album), re.I):
        return False
    if re.search(RERECORDING_WORDS, f"{track} {album}", re.I):
        return False
    return version_tags(track) <= version_tags(f"x ({album})")


def usable_date(d):
    """A date the song could really have been released on: known, and before the data was collected.
    (Deezer uses 0001-01-01, 1900-01-01 and 1901-01-01 for 'unknown', hence the 1920 floor.)"""
    return bool(d) and "1920" <= d[:10] <= COLLECTION_DATE.strftime("%Y-%m-%d")


def precision_of(d):
    return {4: "year", 7: "month"}.get(len(d), "day")


def full_date(d):
    # Some old albums only have a year or a month. Use the middle of that period,
    # so a year-only date isn't treated as 1 January (up to a year too old).
    d = str(d)
    if re.fullmatch(r"\d{4}", d):
        d += "-07-01"
    elif re.fullmatch(r"\d{4}-\d{2}", d):
        d += "-15"
    return min(d, COLLECTION_DATE.strftime("%Y-%m-%d"))


# ---------- 1. YouTube upload dates ----------

def fetch_youtube(songs):
    key = os.environ.get("YOUTUBE_API_KEY")
    if not key:
        print("YouTube: YOUTUBE_API_KEY not set, skipping.")
        return
    ids = songs["Url_youtube"].dropna().str.extract(r"v=([\w-]{11})")[0].dropna().unique()
    done = set(read_cache("youtube.csv", "video_id")["video_id"])
    todo = [v for v in ids if v not in done]
    print(f"YouTube: {len(todo):,} of {len(ids):,} videos left to look up.")
    with CacheWriter("youtube.csv", ["video_id", "published_at", "status"]) as out:
        for start in range(0, len(todo), 50):
            chunk = todo[start:start + 50]
            r = http_get("https://www.googleapis.com/youtube/v3/videos",
                         params={"part": "snippet", "id": ",".join(chunk), "key": key})
            if r.status_code == 403 and "quotaExceeded" in r.text:
                print("YouTube: daily quota used up. Re-run tomorrow to continue.")
                return
            if r.status_code != 200:
                raise SystemExit(f"YouTube API error {r.status_code}: {r.text[:300]}")
            found = {it["id"]: it["snippet"]["publishedAt"] for it in r.json().get("items", [])}
            for v in chunk:
                out.add([v, found.get(v, ""), "ok" if v in found else "not_found"])
    print("YouTube: done.")


# ---------- 2. Deezer ----------

_deezer_lock = threading.Lock()
_last_deezer_call = 0.0


def deezer_get(path, params=None):
    """One Deezer API call, kept under the rate limit. None if Deezer has no such item."""
    global _last_deezer_call
    for _ in range(8):
        with _deezer_lock:                     # spaces out the calls of all worker threads
            wait = DEEZER_GAP - (time.monotonic() - _last_deezer_call)
            if wait > 0:
                time.sleep(wait)
            _last_deezer_call = time.monotonic()
        r = http_get(f"https://api.deezer.com/{path}", params=params)
        try:
            j = r.json()
        except ValueError:
            time.sleep(2)
            continue
        if isinstance(j, dict) and j.get("error"):
            if j["error"].get("code") == 4:    # Deezer's "quota exceeded": everyone pauses 5 s
                with _deezer_lock:
                    _last_deezer_call = time.monotonic() + 5
                continue
            return None
        return j
    raise SystemExit("Deezer keeps failing. Progress is saved; re-run later to continue.")


class DeezerAlbums:
    """Release dates of Deezer albums, cached on disk. A whole discography comes in one or two
    calls, so most albums don't need a request of their own."""

    def __init__(self, out):
        cached = read_cache("deezer_albums.csv", "album_id")
        self.dates = dict(zip(cached.get("album_id", []), cached.get("release_date", [])))
        self.out, self.lock = out, threading.Lock()
        self.artists = {}                      # artist id -> Event, set once the discography is in

    def _store(self, album_id, date):
        with self.lock:
            if album_id not in self.dates:
                self.dates[album_id] = date
                self.out.add([album_id, date])

    def load_artist(self, artist_id):
        with self.lock:
            loaded = self.artists.get(artist_id)
            if loaded is None:
                loaded = self.artists[artist_id] = threading.Event()
                mine = True
            else:
                mine = False
        if not mine:                           # another thread is loading it: wait for that
            loaded.wait()
            return
        try:
            for page in range(5):
                j = deezer_get(f"artist/{artist_id}/albums", {"limit": 100, "index": 100 * page}) or {}
                for album in j.get("data", []):
                    self._store(str(album["id"]), album.get("release_date") or "")
                if not j.get("next"):
                    break
        finally:
            loaded.set()

    def date(self, album_id):
        if album_id not in self.dates:
            self._store(album_id, (deezer_get(f"album/{album_id}") or {}).get("release_date") or "")
        return self.dates[album_id]


def deezer_match(artist, track, album, albums):
    """Earliest Deezer release of one song. Returns (release_date, status).

    Deezer's search ranks live versions, covers and karaoke tracks above the original
    (the top 'Oasis Wonderwall' hit is a 2021 live album), so the first hit can't be trusted.
    A hit must have the same song name and kind of version (live, remix, ...) and be by the same
    artist. The dataset's Artist is whoever's top-10 list the song came from, which isn't always
    the main artist ('All By Myself' by Alok is listed under Sigala), so a hit on the same album
    by someone else also counts if the dataset's artist is in its Deezer credits.
    """
    title = base_title(track)
    want_artists, want_title, want_tags = artist_names(artist), norm(title), version_tags(track)
    want_artist, want_album = norm_artist(artist), norm(album)
    if not want_artist or not want_title:
        return "", "no_match"
    credit_checks = [4]                        # at most this many credit lookups per song

    def same_artist(hit):
        return (bool(artist_names(hit.get("artist", {}).get("name", "")) & want_artists)
                or (len(want_artist) >= 4 and want_artist in norm(hit.get("title", ""))))   # 'feat. X'

    def credited(hit):
        if credit_checks[0] == 0:
            return False
        credit_checks[0] -= 1
        credits = (deezer_get(f"track/{hit['id']}") or {}).get("contributors", [])
        return any(artist_names(c.get("name", "")) & want_artists for c in credits)

    # The plain query often misses the studio original; 'track:"..."' usually finds it.
    # (Deezer's 'artist:"..."' filter is broken and returns unrelated songs, so it isn't used.)
    # The album query runs only if the Spotify track's own album wasn't among the hits yet,
    # and the plain query only if nothing was found at all.
    queries = [f'track:"{title}" {artist}', f"{artist} {title} {album}", f"{artist} {title}"]
    hits = {}                                  # album id -> artist id, in search-rank order
    found_album = False
    for q in queries:
        if found_album or (hits and q == queries[-1]):
            break
        for hit in (deezer_get("search", {"q": q, "limit": 25}) or {}).get("data", []):
            if ("id" not in hit.get("album", {})
                    or norm(base_title(hit.get("title_short") or hit.get("title", ""))) != want_title
                    or version_tags(hit.get("title", "")) != want_tags):
                continue
            on_album = bool(want_album) and norm(hit["album"].get("title", "")) == want_album
            if same_artist(hit) or (on_album and credited(hit)):
                hits.setdefault(str(hit["album"]["id"]), str(hit["artist"]["id"]))
                found_album = found_album or on_album
    if not hits:
        return "", "no_match"
    for artist_id in set(hits.values()):
        albums.load_artist(artist_id)
    # Albums not in the discography (e.g. other artists' compilations): look up a few directly.
    dates = [albums.dates[a] if a in albums.dates else albums.date(a) for a in list(hits)[:12]]
    dates = [d for d in dates if usable_date(d)]
    return (min(dates), "ok") if dates else ("", "no_date")


def fetch_deezer(songs):
    done = set(read_cache("deezer.csv", "uri")["uri"])
    todo = (songs.loc[~songs["Uri"].isin(done), ["Uri", "Artist", "Track", "Album"]]
            .drop_duplicates("Uri").fillna(""))
    print(f"Deezer: {len(todo):,} of {songs['Uri'].nunique():,} songs left to look up.")
    start = time.monotonic()
    with CacheWriter("deezer.csv", ["uri", "release_date", "status"]) as out, \
            CacheWriter("deezer_albums.csv", ["album_id", "release_date"]) as album_out:
        albums = DeezerAlbums(album_out)
        # A few songs at a time: each call mostly waits on the network, so this is ~3x faster.
        pool = ThreadPoolExecutor(DEEZER_WORKERS)
        jobs = {pool.submit(deezer_match, row.Artist, row.Track, row.Album, albums): row.Uri
                for row in todo.itertuples(index=False)}
        try:
            for n, job in enumerate(as_completed(jobs), 1):
                date, status = job.result()
                out.add([jobs[job], date, status])
                if n % 250 == 0:
                    left = (time.monotonic() - start) / n * (len(todo) - n) / 60
                    print(f"  Deezer: {n:,} of {len(todo):,} (about {left:.0f} min left)")
        finally:                               # on Ctrl+C or an error, drop the songs not started yet
            pool.shutdown(wait=True, cancel_futures=True)
    print("Deezer: done.")


# ---------- 3. Wikidata (first release of songs and albums) ----------

WIKIDATA_KINDS = {  # Wikidata class -> what its date means here
    "Q7366": "song", "Q134556": "song", "Q105543609": "song", "Q2188189": "song",  # song, single, musical work
    "Q482994": "album", "Q208569": "album", "Q169930": "album", "Q4176708": "album", "Q209939": "album",
}


class WikidataTimeout(Exception):
    pass


def wikidata_query(artists):
    def literal(s):
        return '"' + s.replace("\\", "\\\\").replace('"', '\\"') + '"'
    names = " ".join(f"{literal(a)}@{lang}" for a in artists for lang in ("en", "mul"))
    kinds = " ".join(f'(wd:{q} "{k}")' for q, k in WIKIDATA_KINDS.items())
    query = f"""SELECT ?name ?kind ?title ?date ?precision WHERE {{
      VALUES ?name {{ {names} }}
      ?artist rdfs:label ?name .
      ?work wdt:P175 ?artist ; wdt:P31 ?class ; rdfs:label ?title ;
            p:P577/psv:P577 [ wikibase:timeValue ?date ; wikibase:timePrecision ?precision ] .
      VALUES (?class ?kind) {{ {kinds} }}
    }}"""
    for attempt in range(1, 5):
        try:
            r = requests.post("https://query.wikidata.org/sparql", data={"query": query}, timeout=90,
                              headers={**USER_AGENT, "Accept": "application/sparql-results+json"})
        except requests.RequestException:
            raise WikidataTimeout()
        if r.status_code == 200:
            return [[b[k]["value"] for k in ("name", "kind", "title", "date", "precision")]
                    for b in r.json()["results"]["bindings"]]
        if r.status_code == 429:
            time.sleep(int(r.headers.get("Retry-After", "30")))
            continue
        if r.status_code in (500, 502, 503, 504):  # usually the query was too heavy
            raise WikidataTimeout()
        raise SystemExit(f"Wikidata error {r.status_code}: {r.text[:300]}")
    raise WikidataTimeout()


def wikidata_rows(artists):
    """All rows for these artists; a batch that times out is split in half and retried."""
    try:
        return wikidata_query(artists)
    except WikidataTimeout:
        if len(artists) == 1:
            return []
        mid = len(artists) // 2
        return wikidata_rows(artists[:mid]) + wikidata_rows(artists[mid:])


def fetch_wikidata(songs):
    artists = sorted(songs["Artist"].dropna().unique())
    done = set(read_cache("wikidata_done.csv", "artist")["artist"])
    todo = [a for a in artists if a not in done]
    print(f"Wikidata: {len(todo):,} of {len(artists):,} artists left to look up.")
    with CacheWriter("wikidata.csv", ["name", "kind", "title", "date", "precision"]) as out, \
            CacheWriter("wikidata_done.csv", ["artist"]) as done_out:
        for start in range(0, len(todo), WIKIDATA_BATCH):
            batch = todo[start:start + WIKIDATA_BATCH]
            for row in wikidata_rows(batch):
                out.add(row)
            for a in batch:
                done_out.add([a])
            time.sleep(1)
    print("Wikidata: done.")


def wikidata_dates():
    """(artist, title) -> earliest date for songs, and (artist, album) -> earliest date for albums."""
    songs, albums = {}, {}
    rows = pd.read_csv(CACHE / "wikidata.csv", dtype=str, keep_default_na=False)
    for name, kind, title, value, precision in rows[["name", "kind", "title", "date", "precision"]].itertuples(index=False):
        p = int(precision)
        d = value[:4] if p <= 9 else value[:7] if p == 10 else value[:10]
        if not usable_date(d):
            continue
        if kind == "song":
            target, key = songs, (norm_artist(name), norm(base_title(title)), version_tags(title))
        else:
            target, key = albums, (norm_artist(name), norm(clean_album(title)))
        if key not in target or full_date(d) < full_date(target[key]):
            target[key] = d
    return songs, albums


# ---------- 4. MusicBrainz (first release across all editions) ----------

_last_mb_call = 0.0


def lucene(text):
    return '"' + str(text).replace("\\", "\\\\").replace('"', '\\"') + '"'


def musicbrainz_search(entity, query):
    global _last_mb_call
    for attempt in range(1, 13):
        wait = MUSICBRAINZ_GAP - (time.monotonic() - _last_mb_call)
        if wait > 0:
            time.sleep(wait)
        _last_mb_call = time.monotonic()
        r = http_get(f"https://musicbrainz.org/ws/2/{entity}", headers=USER_AGENT,
                     params={"query": query, "fmt": "json", "limit": 100})
        if r.status_code == 200:
            return r.json()
        if r.status_code in (429, 502, 503, 504):  # busy (it often throttles anonymous traffic): retry soon
            time.sleep(min(30, 2 + attempt))
            continue
        return {}
    raise SystemExit("MusicBrainz keeps refusing requests. Progress is saved; re-run later to continue.")


def mb_credited(entry, artist):
    want = artist_names(artist)
    return any(artist_names(c.get("name", "")) & want or artist_names(c.get("artist", {}).get("name", "")) & want
               for c in entry.get("artist-credit", []))


def musicbrainz_album_date(artist, album):
    """Earliest first-release date of a matching release group (all editions of the album)."""
    res = musicbrainz_search("release-group", f"releasegroup:{lucene(album)} AND artist:{lucene(artist)}")
    dates = [rg["first-release-date"] for rg in res.get("release-groups", [])
             if rg.get("first-release-date") and norm(clean_album(rg["title"])) == norm(album) and mb_credited(rg, artist)
             and not set(rg.get("secondary-types", [])) & {"Compilation", "Live", "Remix", "DJ-mix"}]
    return min(dates, key=full_date) if dates else ""


def musicbrainz_song_date(artist, track):
    """Earliest first-release date among recordings with the same artist, title and kind of version."""
    title = base_title(track)
    res = musicbrainz_search("recording", f"recording:{lucene(title)} AND artist:{lucene(artist)}")
    dates = [r["first-release-date"] for r in res.get("recordings", [])
             if r.get("first-release-date") and norm(base_title(r["title"])) == norm(title) and mb_credited(r, artist)
             and same_version(track, r["title"], r.get("disambiguation", ""))]
    return min(dates, key=full_date) if dates else ""


def lookup_priority(deezer_date):
    """Sort key: Deezer dates before 2016 (oldest first), then no date, then 2016 onwards."""
    if not deezer_date:
        return "2016-00"
    return deezer_date if deezer_date < "2016" else "2016-01-" + deezer_date


def album_key(artist, album):
    return f"{artist}\t{clean_album(album)}"


def fetch_musicbrainz_albums(songs):
    sources = Sources()
    rows = songs[SONG_COLUMNS].fillna("")
    rows = rows[[album_date_applies(t, a, at) for t, a, at in zip(rows.Track, rows.Album, rows.Album_type)]]
    # Skip albums whose songs all have a confirmed date already
    rows = rows[[choose_date(sources.candidates(r))[1] != "confirmed" for r in rows.itertuples(index=False)]]
    rows = rows.assign(key=[album_key(a, al) for a, al in zip(rows.Artist, rows.Album)],
                       deezer=rows.Uri.map(sources.deezer).fillna(""))
    # Most at risk first: old Deezer dates (oldest first), then undated songs, then recent ones
    order = rows.groupby("key").deezer.min().map(lookup_priority).sort_values()
    done = set(read_cache("mb_albums.csv", "key")["key"])
    todo = [k for k in order.index if k not in done]
    print(f"MusicBrainz albums: {len(todo):,} of {len(order):,} albums left to look up "
          f"(about {len(todo) * MUSICBRAINZ_GAP / 3600:.1f} hours at 1 per second).")
    start = time.monotonic()
    with CacheWriter("mb_albums.csv", ["key", "release_date"]) as out:
        for n, key in enumerate(todo, 1):
            artist, album = key.split("\t", 1)
            out.add([key, musicbrainz_album_date(artist, album)])
            if n % 200 == 0:
                left = (time.monotonic() - start) / n * (len(todo) - n) / 3600
                print(f"  MusicBrainz albums: {n:,} of {len(todo):,} (about {left:.1f} hours left)")
    print("MusicBrainz albums: done.")


def fetch_musicbrainz_songs(songs):
    """Song-level lookups, only for songs whose date no second source confirms yet."""
    sources = Sources()
    rows = songs[SONG_COLUMNS].fillna("")
    unconfirmed = [choose_date(sources.candidates(r))[1] != "confirmed" for r in rows.itertuples(index=False)]
    rows = rows[unconfirmed].drop_duplicates("Uri")
    done = set(read_cache("mb_songs.csv", "uri")["uri"])
    rows = rows[~rows.Uri.isin(done)]
    rows = rows.assign(deezer=rows.Uri.map(sources.deezer).fillna(""))
    rows = rows.iloc[rows.deezer.map(lookup_priority).argsort(kind="stable")]
    print(f"MusicBrainz songs: {len(rows):,} unconfirmed songs left to look up "
          f"(about {len(rows) * MUSICBRAINZ_GAP / 3600:.1f} hours).")
    start = time.monotonic()
    with CacheWriter("mb_songs.csv", ["uri", "release_date"]) as out:
        for n, r in enumerate(rows.itertuples(index=False), 1):
            out.add([r.Uri, musicbrainz_song_date(r.Artist, r.Track)])
            if n % 200 == 0:
                left = (time.monotonic() - start) / n * (len(rows) - n) / 3600
                print(f"  MusicBrainz songs: {n:,} of {len(rows):,} (about {left:.1f} hours left)")
    print("MusicBrainz songs: done.")


class MusicBrainzDump:
    """Dates from the extracts written by musicbrainz_dump.py, matched the same way as the web API lookups."""

    def __init__(self):
        self.albums, self.songs = {}, {}
        rg = pd.read_csv(CACHE / "mbdump_release_groups.csv", dtype=str, keep_default_na=False)
        for title, artists, secondary, first in rg[["title", "artists", "secondary_types", "first_release"]].itertuples(index=False):
            if first and not set(secondary.split("|")) & {"Compilation", "Live", "Remix", "DJ-mix"}:
                self.albums.setdefault(norm(clean_album(title)), []).append((set(artists.split("|")), first))
        rec = pd.read_csv(CACHE / "mbdump_recordings.csv", dtype=str, keep_default_na=False)
        for title, comment, artists, first in rec[["title", "comment", "artists", "first_release"]].itertuples(index=False):
            if first:
                self.songs.setdefault(norm(base_title(title)), []).append(
                    (set(artists.split("|")), title, comment, first))

    def album_date(self, artist, album):
        want = artist_names(artist)
        dates = [d for names, d in self.albums.get(norm(clean_album(album)), []) if names & want]
        return min(dates, key=full_date) if dates else ""

    def song_date(self, artist, track):
        want = artist_names(artist)
        dates = [d for names, title, comment, d in self.songs.get(norm(base_title(track)), [])
                 if names & want and same_version(track, title, comment)]
        return min(dates, key=full_date) if dates else ""


# ---------- 5. Spotify (optional) ----------

def spotify_token():
    r = requests.post(
        "https://accounts.spotify.com/api/token",
        data={"grant_type": "client_credentials"},
        auth=(os.environ["SPOTIFY_CLIENT_ID"], os.environ["SPOTIFY_CLIENT_SECRET"]),
        timeout=TIMEOUT,
    )
    if r.status_code != 200:
        raise SystemExit(f"Spotify login failed ({r.status_code}): {r.text[:300]}\n"
                         "Check SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET.")
    return r.json()["access_token"]


def fetch_spotify(songs):
    if not (os.environ.get("SPOTIFY_CLIENT_ID") and os.environ.get("SPOTIFY_CLIENT_SECRET")):
        print("Spotify: SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET not set, skipping (optional).")
        return
    uris = songs["Uri"].dropna().unique()
    cached = read_cache("spotify.csv", "uri")
    # 'ok' and 4xx answers (e.g. track deleted) are final; temporary errors are tried again.
    final = cached["status"].str.match(r"ok$|http_4") if "status" in cached else []
    done = set(cached.loc[final, "uri"]) if len(cached) else set()
    todo = [u for u in uris if u not in done]
    print(f"Spotify: {len(todo):,} of {len(uris):,} songs left to look up.")
    if not todo:
        return
    token = spotify_token()
    with CacheWriter("spotify.csv", ["uri", "release_date", "precision", "status"]) as out:
        for n, uri in enumerate(todo, 1):
            track_id = uri.split(":")[-1]
            for attempt in range(1, 7):
                r = http_get(f"https://api.spotify.com/v1/tracks/{track_id}",
                             headers={"Authorization": f"Bearer {token}"})
                if r.status_code == 401:           # token expired after an hour
                    token = spotify_token()
                    continue
                if r.status_code == 429:           # too many requests
                    wait = int(r.headers.get("Retry-After", "30"))
                    if "QUOTA_EXCEEDED" in r.text or wait > 600:
                        print(f"Spotify: quota reached after {n - 1:,} songs this run. "
                              f"Re-run later (Spotify asked to wait {wait:,} s) to continue.")
                        return
                    time.sleep(wait + 1)
                    continue
                if r.status_code >= 500:           # Spotify having a moment
                    time.sleep(5 * attempt)
                    continue
                break
            if r.status_code == 200:
                album = r.json().get("album") or {}
                out.add([uri, album.get("release_date") or "", album.get("release_date_precision") or "", "ok"])
            elif r.status_code == 403:
                raise SystemExit("Spotify refused the request (403): " + r.text[:200] + "\n"
                                 "Check that the app owner has Premium. Spotify is optional: delete the "
                                 "two SPOTIFY_ variables to run without it.")
            else:
                out.add([uri, "", "", f"http_{r.status_code}"])
            if n % 500 == 0:
                print(f"  Spotify: {n:,} of {len(todo):,}")
            time.sleep(SPOTIFY_PAUSE)
    print("Spotify: done.")


# ---------- 6. Choosing the date ----------

class Sources:
    """Every cached date for a song, as candidates (date, precision, source)."""

    def __init__(self):
        def as_dict(name, key):
            c = read_cache(name, key)
            return dict(zip(c.get(key, []), c.get("release_date", [])))
        self.deezer = as_dict("deezer.csv", "uri")
        self.mb_albums = as_dict("mb_albums.csv", "key")
        self.mb_songs = as_dict("mb_songs.csv", "uri")
        sp = read_cache("spotify.csv", "uri")
        self.spotify = {u: (d, p) for u, d, p in zip(sp.get("uri", []), sp.get("release_date", []), sp.get("precision", []))}
        self.wd_songs, self.wd_albums = wikidata_dates() if (CACHE / "wikidata.csv").exists() else ({}, {})
        self.dump = MusicBrainzDump() if (CACHE / "mbdump_recordings.csv").exists() else None

    def candidates(self, row):
        cands = []

        def add(date, source, precision=None):
            if date.endswith("-01-01"):            # 1 January almost always stands for "year unknown"
                date, precision = date[:4], "year"
            if usable_date(date):
                cands.append((date, precision or precision_of(date), source))

        artist, album_ok = norm_artist(row.Artist), album_date_applies(row.Track, row.Album, row.Album_type)
        add(self.wd_songs.get((artist, norm(base_title(row.Track)), version_tags(row.Track)), ""), "wikidata_song")
        if album_ok:
            mb_album = self.dump.album_date(row.Artist, row.Album) if self.dump else ""
            add(mb_album or self.mb_albums.get(album_key(row.Artist, row.Album), ""), "musicbrainz_album")
            add(self.wd_albums.get((artist, norm(clean_album(row.Album))), ""), "wikidata_album")
        mb_song = self.dump.song_date(row.Artist, row.Track) if self.dump else ""
        add(mb_song or self.mb_songs.get(row.Uri, ""), "musicbrainz_song")
        sp_date, sp_precision = self.spotify.get(row.Uri, ("", ""))
        add(sp_date, "spotify", sp_precision or None)
        add(self.deezer.get(row.Uri, ""), "deezer")
        # An edition date (Deezer/Spotify) is a real release of the song, so it can't have first come out
        # more than a year later; such a first-release date means that source is missing early releases.
        # (Not for remix/live/... tracks: Deezer may have matched a different remix of the song.)
        editions = [full_date(c[0]) for c in cands if c[2] not in FIRST_RELEASE_SOURCES]
        if editions and not version_tags(row.Track):
            limit = date.fromisoformat(min(editions)).replace(day=1)
            limit = limit.replace(year=limit.year + 1).isoformat()
            cands = [c for c in cands if c[2] not in FIRST_RELEASE_SOURCES or full_date(c[0]) <= limit]
        return cands


def choose_date(cands):
    """(candidate, confidence). The earliest date confirmed by a second source within CONFIRM_DAYS
    (one of the two a first-release source) wins; otherwise the highest-priority source."""
    if not cands:
        return None, ""
    when = {c: date.fromisoformat(full_date(c[0])) for c in cands}
    for c in sorted(cands, key=when.get):
        if any(o[2] != c[2] and abs((when[o] - when[c]).days) <= CONFIRM_DAYS
               and (c[2] in FIRST_RELEASE_SOURCES or o[2] in FIRST_RELEASE_SOURCES) for o in cands):
            return c, "confirmed"
    best = min(cands, key=lambda c: SOURCE_PRIORITY.index(c[2]))
    return best, "single source" if best[2] in FIRST_RELEASE_SOURCES else "edition date only"


def add_age_columns(out):
    """Age band, age-relative scores and age-adjusted tiers (see the module docstring)."""
    out["age_band"] = pd.cut(out["years_since_release"], AGE_BANDS, labels=AGE_LABELS, right=False)
    for src, col in [("log_stream", "stream_vs_age"), ("log_views", "views_vs_age"),
                     ("log_likes", "likes_vs_age"), ("log_comments", "comments_vs_age")]:
        basis = out[src] if src == "log_stream" else out[src].where(out["yt_primary"])  # each video once
        out[col] = (out[src] - basis.groupby(out["age_band"], observed=False).transform("median")).round(4)
    for value_col, basis_mask, col in [("log_stream", out["Stream"].notna(), "spotify_tier_age_adj"),
                                       ("log_views", out["yt_primary"], "youtube_tier_age_adj")]:
        tiers = pd.Series(np.nan, index=out.index, dtype=object)
        for _, idx in out.groupby("age_band", observed=True).groups.items():
            values = out.loc[idx, value_col]
            edges = values[basis_mask.loc[idx]].quantile([0, 0.25, 0.5, 0.75, 1]).to_numpy()
            edges[0], edges[-1] = -np.inf, np.inf
            tiers.loc[idx] = pd.cut(values, edges, labels=TIER_LABELS).astype(object)
        out[col] = pd.Categorical(tiers, categories=TIER_LABELS, ordered=True)


def merge_and_save(df):
    out = df.copy()
    sources = Sources()
    rows = out[SONG_COLUMNS].fillna("")
    chosen = [choose_date(sources.candidates(r)) for r in rows.itertuples(index=False)]
    out["release_date"] = pd.to_datetime([full_date(c[0]) if c else None for c, _ in chosen],
                                         errors="coerce", format="%Y-%m-%d")
    out["release_date_precision"] = pd.Series([c[1] if c else pd.NA for c, _ in chosen], index=out.index)
    out["release_date_source"] = pd.Series([c[2] if c else pd.NA for c, _ in chosen], index=out.index)
    out["release_date_confidence"] = pd.Series([conf or pd.NA for _, conf in chosen], index=out.index)
    out["release_year"] = out["release_date"].dt.year.astype("Int64")
    out["years_since_release"] = ((COLLECTION_DATE - out["release_date"]).dt.days / 365.25).round(2)

    yt = read_cache("youtube.csv", "video_id")
    yt_date = dict(zip(yt.get("video_id", []), yt.get("published_at", [])))
    if any(yt_date.values()):
        vid = out["Url_youtube"].str.extract(r"v=([\w-]{11})")[0]
        out["youtube_published_at"] = pd.to_datetime(vid.map(yt_date), errors="coerce", utc=True).dt.tz_localize(None)
        out["years_on_youtube"] = ((COLLECTION_DATE - out["youtube_published_at"]).dt.days / 365.25).round(2)
    add_age_columns(out)

    out.to_csv(OUT, index=False)
    n, dated = len(out), out["release_date"].notna()
    print(f"\nSaved {OUT}")
    print(f"  release date: {dated.sum():,} of {n:,} songs ({dated.mean():.1%})")
    print("  confidence:", out["release_date_confidence"].value_counts().to_dict())
    print("  source:", out["release_date_source"].value_counts().to_dict())


def main():
    global CACHE, OUT
    ap = argparse.ArgumentParser(description="Add release dates to the Spotify-YouTube dataset.")
    ap.add_argument("--sample", type=int, metavar="N",
                    help="test on N random songs, with a separate cache and output file")
    ap.add_argument("--skip-musicbrainz", action="store_true",
                    help="don't query MusicBrainz now; build the CSV from what is cached")
    args, _ = ap.parse_known_args()
    data = pd.read_csv(SRC, float_precision="round_trip")   # keeps the original values exact
    if args.sample:
        data = data.sample(min(args.sample, len(data)), random_state=7)
        CACHE = HERE / "release_date_cache_sample"
        OUT = CACHE / "sample_output.csv"
    CACHE.mkdir(exist_ok=True)
    fetch_youtube(data)
    fetch_deezer(data)
    fetch_wikidata(data)
    if (CACHE / "mbdump_recordings.csv").exists():
        print("MusicBrainz: using the database dump extracts from musicbrainz_dump.py.")
    elif not args.skip_musicbrainz:
        fetch_musicbrainz_albums(data)
        fetch_musicbrainz_songs(data)
    fetch_spotify(data)
    merge_and_save(data)


if __name__ == "__main__":
    main()
