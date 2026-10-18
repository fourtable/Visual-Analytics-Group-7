"""
Extract first-release dates for the dataset's songs from a MusicBrainz database dump.

The MusicBrainz web API allows 1 request per second and throttles anonymous clients heavily, so
looking up ~19,000 songs takes many hours. The full database dump has the same data:
  https://data.metabrainz.org/pub/musicbrainz/data/fullexport/  ->  <latest>/mbdump.tar.bz2  (~7.5 GB)

This script streams the archive once (about 15 minutes; nothing is unpacked to disk) and keeps
only the rows for the dataset's artists whose title matches one of the dataset's songs or albums.
It writes two small files to scripts/release_date_cache/:
  mbdump_release_groups.csv   matching albums/singles/EPs, with their first release date across all
                              editions and their secondary types (Compilation, Live, ...)
  mbdump_recordings.csv       matching recordings, with the earliest date of an official or
                              promotional release that contains them
add_release_dates.py uses these instead of the MusicBrainz web API when they exist.

Usage (from the repo root):
  python scripts/musicbrainz_dump.py                       # uses dataset/mbdump.tar.bz2
  python scripts/musicbrainz_dump.py path/to/mbdump.tar.bz2
"""
import csv
import sys
import tarfile
import time
from array import array
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).resolve().parent))
from add_release_dates import CACHE, SRC, artist_names, base_title, clean_album, norm, norm_artist  # noqa: E402

DUMP = Path(sys.argv[1]) if len(sys.argv) > 1 else SRC.parent / "mbdump.tar.bz2"
NO_DATE = 99_999_999
BAD_STATUS = {3, 4, 5, 6}   # Bootleg, Pseudo-Release, Withdrawn, Cancelled (1 Official, 2 Promotion are kept)
NULL = r"\N"


def entity_names(name):
    """artist_names() for one MusicBrainz artist: split at '&', 'feat.', ... but not at ',' or '/', which
    belong to a single act ('Earth, Wind & Fire', 'AC/DC') or a surname-first alias ('Newton-John, Olivia')."""
    return artist_names(name.replace(",", " ").replace("/", ""))


def packed(y, m, d):
    """'1977', '9', '29' -> 19770929; a missing month or day becomes 00."""
    if y == NULL:
        return NO_DATE
    return int(y) * 10000 + (int(m) * 100 if m != NULL else 0) + (int(d) if d != NULL else 0)


def unpacked(v):
    if v >= NO_DATE:
        return ""
    y, m, d = v // 10000, v // 100 % 100, v % 100
    return f"{y:04d}" + (f"-{m:02d}" if m else "") + (f"-{d:02d}" if m and d else "")


def rows(member_file, table):
    """Fields of a PostgreSQL COPY file (tab-separated, \\N for null). Prints the first row as a schema check."""
    for i, line in enumerate(member_file):
        fields = line.decode("utf-8").rstrip("\n").split("\t")
        if i == 0:
            print(f"    first {table} row: {fields[:8]}", flush=True)
        yield fields


def by_id(ids, values, fill):
    """Dense lookup array: out[id] = value."""
    ids, values = np.frombuffer(ids, dtype=np.int32), np.frombuffer(values, dtype=np.int32)
    out = np.full(int(ids.max()) + 1, fill, dtype=np.int32)
    out[ids] = values
    return out


def main():
    data = pd.read_csv(SRC, usecols=["Artist", "Track", "Album"]).fillna("")
    wanted = set().union(*(artist_names(a) for a in data.Artist.unique()))
    song_titles = {norm(base_title(t)) for t in data.Track}
    album_titles = {norm(clean_album(a)) for a in data.Album} | song_titles   # singles are named after the song
    print(f"Looking for {len(wanted):,} artist names, {len(song_titles):,} song titles and "
          f"{len(album_titles):,} album titles in {DUMP} ({DUMP.stat().st_size / 1e9:.1f} GB)")

    artists = {}                    # MusicBrainz artist id -> normalised names that matched
    credits = {}                    # artist credit id -> normalised names of our artists in it
    medium_ids, medium_release = array("i"), array("i")
    release_ids, release_status, release_group = array("i"), array("i"), array("i")
    medium_to_release = status_of = group_of = release_date = None
    recordings = {}                 # recording id -> [title, comment, credit, earliest date]
    groups = {}                     # release group id -> [title, credit, primary type, first date]
    primary_names, secondary_names, secondary_of = {}, {}, {}

    start = time.monotonic()
    with tarfile.open(DUMP, "r|bz2") as tar:
        for member in tar:
            table = member.name.removeprefix("mbdump/")
            f = tar.extractfile(member) if member.isfile() else None
            if f is None:
                continue
            t0 = time.monotonic()
            if table == "artist":                      # id, gid, name, sort_name, ...
                for r in rows(f, table):
                    found = (entity_names(r[2]) | {norm_artist(r[3])}) & wanted   # "Bob Seger & The Silver Bullet Band" counts as Bob Seger
                    if found:
                        artists[int(r[0])] = found
            elif table == "artist_alias":              # id, artist, name, locale, edits_pending, last_updated, type, sort_name
                for r in rows(f, table):
                    found = entity_names(r[2]) & wanted
                    if found:
                        artists.setdefault(int(r[1]), set()).update(found)
            elif table == "artist_credit_name":        # artist_credit, position, artist, name, join_phrase
                # Only the artist's own names, not the name printed on the credit: Olivia Newton-John is
                # credited as plain "Olivia" on some releases, which would make her albums the R&B singer Olivia's.
                for r in rows(f, table):
                    a = int(r[2])
                    if a in artists:
                        credits.setdefault(int(r[0]), set()).update(artists[a])
            elif table == "medium":                    # id, release, position, format, name, ...
                for r in rows(f, table):
                    medium_ids.append(int(r[0]))
                    medium_release.append(int(r[1]))
                medium_to_release = by_id(medium_ids, medium_release, 0)
            elif table == "recording":                 # id, gid, name, artist_credit, length, comment, ...
                for r in rows(f, table):
                    if int(r[3]) in credits and norm(base_title(r[2])) in song_titles:
                        recordings[int(r[0])] = [r[2], "" if r[5] == NULL else r[5], int(r[3]), NO_DATE]
            elif table == "release":                   # id, gid, name, artist_credit, release_group, status, ...
                for r in rows(f, table):
                    release_ids.append(int(r[0]))
                    release_group.append(int(r[4]))
                    release_status.append(0 if r[5] == NULL else int(r[5]))
                status_of = by_id(release_ids, release_status, 9)
                group_of = by_id(release_ids, release_group, 0)
                release_date = np.full(len(status_of), NO_DATE, dtype=np.int32)
            elif table in ("release_country", "release_unknown_country"):
                y = 2 if table == "release_country" else 1   # (release, country, y, m, d) / (release, y, m, d)
                for r in rows(f, table):
                    rel, d = int(r[0]), packed(r[y], r[y + 1], r[y + 2])
                    if d < release_date[rel]:
                        release_date[rel] = d
            elif table == "release_group":             # id, gid, name, artist_credit, type, ...
                for r in rows(f, table):
                    if int(r[3]) in credits and norm(clean_album(r[2])) in album_titles:
                        groups[int(r[0])] = [r[2], int(r[3]), 0 if r[4] == NULL else int(r[4]), NO_DATE]
            elif table == "release_group_meta":        # id, release_count, first_release_date_y, _m, _d, ...
                for r in rows(f, table):
                    g = groups.get(int(r[0]))
                    if g is not None:
                        g[3] = min(g[3], packed(r[2], r[3], r[4]))
            elif table == "release_group_primary_type":
                primary_names = {int(r[0]): r[1] for r in rows(f, table)}
            elif table == "release_group_secondary_type":
                secondary_names = {int(r[0]): r[1] for r in rows(f, table)}
            elif table == "release_group_secondary_type_join":   # release_group, secondary_type, created
                for r in rows(f, table):
                    if int(r[0]) in groups:
                        secondary_of.setdefault(int(r[0]), []).append(int(r[1]))
            elif table == "track":                     # id, gid, recording, medium, position, number, name, ...
                for r in rows(f, table):
                    rec = recordings.get(int(r[2]))
                    if rec is None:
                        continue
                    rel = medium_to_release[int(r[3])]
                    if status_of[rel] not in BAD_STATUS and release_date[rel] < rec[3]:
                        rec[3] = int(release_date[rel])
            else:
                continue                # tarfile skips the rest of this member
            print(f"  {table:36} {time.monotonic() - t0:6.0f} s   (total {(time.monotonic() - start) / 60:5.1f} min)", flush=True)

    # First release of each release group, from its releases (in case release_group_meta isn't in this dump)
    ok = ~np.isin(status_of, list(BAD_STATUS)) & (release_date < NO_DATE)
    for rel in np.flatnonzero(ok & np.isin(group_of, np.fromiter(groups, dtype=np.int32))):
        g = groups[int(group_of[rel])]
        g[3] = min(g[3], int(release_date[rel]))

    def names(credit):
        return "|".join(sorted(credits.get(credit, ())))

    CACHE.mkdir(exist_ok=True)
    with open(CACHE / "mbdump_release_groups.csv", "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["release_group", "title", "artists", "primary_type", "secondary_types", "first_release"])
        for gid, (title, credit, ptype, date) in groups.items():
            w.writerow([gid, title, names(credit), primary_names.get(ptype, ""),
                        "|".join(secondary_names.get(s, "") for s in secondary_of.get(gid, [])), unpacked(date)])
    with open(CACHE / "mbdump_recordings.csv", "w", newline="", encoding="utf-8") as out:
        w = csv.writer(out)
        w.writerow(["recording", "title", "comment", "artists", "first_release"])
        for rid, (title, comment, credit, date) in recordings.items():
            w.writerow([rid, title, comment, names(credit), unpacked(date)])
    print(f"Done in {(time.monotonic() - start) / 60:.0f} min: {len(artists):,} artists, {len(credits):,} artist credits, "
          f"{len(groups):,} release groups, {len(recordings):,} recordings -> {CACHE}")


if __name__ == "__main__":
    main()
