Dashboard Guide: What Each Chart Shows and Why
The question and the three dashboards
Our research question: which audio features go with popularity on Spotify and on YouTube, and do the two platforms reward the same sound? Following the proposal feedback, the project focuses on where the two platforms disagree. Each dashboard answers one part of the question, and each ends on a finding the next one tests.
Dashboard
Question it answers
Short answer
Charts
Where the platforms disagree
Do Spotify and YouTube agree on which songs are hits?
Mostly, but 1 in 5 songs is a hit on only one platform
Cross Platform, Song card
What viral hit sounds like
Do hits share a sound, and does each platform reward it equally?
Hits are louder, less acoustic and rarely instrumental; YouTube rewards this at least twice as strongly. Spotify-only hits have no distinct sound
Audio Profile by quadrant, Feature by Popularity
Sound or artist
Does that sound still separate hits within an artist's own songs? If not, what does?
No: within an artist, every sound gap almost disappears. Who the artist is, and how the song is published on YouTube, matter more
Traits vs average song, Traits vs same artists, Unlicensed YouTube upload
All charts use the same 17,380 songs: the cleaned dataset minus 1,467 songs with missing streams or views, or whose YouTube video is shared with another track.
Reading the charts
Five terms come up on every dashboard.
Term
Meaning
Example
Tier (quartile)
Each platform's songs split into four equal groups by that platform's own numbers. Q1 is the bottom 25%, Q4 the top 25%.
Q4 on Spotify means 134.7M streams or more
Hit
A song in its platform's top 25% (Q4). Popularity is never combined across platforms.
A YouTube hit has 65.5M views or more
Quadrant
The four combinations of hit or not on each platform: Hit on both, YouTube-only hit, Spotify-only hit, Neither. "Neither" is not a flop; it is every song outside the top 25% on both.
2,767 songs are hits on both
Gap in standard deviations (z-score)
How far a group's average sits from the average song, in units of that feature's usual spread. It puts loudness (dB) and acousticness (0 to 1) on one scale. 0 means typical; within ±0.15 we treat as barely different.
+0.35 on loudness ≈ 1.6 dB louder than the average song
Within the same artist
Each song compared with its own artist's average, instead of with all songs. This removes the effect of who the artist is.
A loud Adele song compared with other Adele songs
The scatter on the first dashboard uses log scales: each gridline is 10 times the one before, so songs with 1 million and 1 billion plays fit on one chart.
Dashboard 1: Where the platforms disagree
The platforms agree on most songs, but 1 in 5 songs (19%) is a hit on only one of them. This dashboard sets up the whole project: those one-platform hits are what the next two dashboards try to explain.
Cross Platform
What it shows. A scatter of all 17,380 songs. Each dot is one song, placed by its Spotify streams (across) and YouTube views (up), both on log scales. Two dashed lines mark each platform's top-25% cut-off: 134.7M streams and 65.5M views. They split the chart into four quadrants, and the dots are coloured by quadrant. Hovering shows the track, artist and video type.
Why we built it. The proposal feedback asked us to make cross-platform divergence the whole project and suggested this quadrant scatter. Before asking what hits sound like, we needed to know how often the platforms disagree; if they always agreed, a cross-platform comparison would have nothing to explain.
What it revealed.
• The platforms agree only partly. 62% of Spotify's top-25% songs are also in YouTube's top 25%. The other 38% are not.
• Divergence is common and runs both ways. 1,690 songs are Spotify-only hits and 1,629 are YouTube-only hits. Neither platform simply dominates the other.
• Some disagreements are extreme. 481 songs sit in the top 25% on one platform and the bottom 25% on the other, so "popular" can depend entirely on which platform you ask.
Quadrant
Songs
Share
Hit on both
2,767
16%
Spotify-only hit
1,690
10%
YouTube-only hit
1,629
9%
Neither
11,294
65%
Song card
What it shows. Clicking any dot fills a card beside the scatter with that song's track, artist, quadrant, video type, streams, views, loudness, acousticness and energy.
Why we built it. Averages hide individual songs. The card lets the audience test the story on songs they know, and it is how we show the Adele example live.
What it revealed. The same artist can land in different quadrants with songs of similar fame. Adele has 7 hits on both platforms and 3 Spotify-only hits. "Set Fire to the Rain" has 926M Spotify streams but only 3M YouTube views, while "Someone Like You" has 1.47B streams and 1.96B views. This is not unusual: 80% of artists (1,621 of 2,035) have songs in at least two quadrants. So divergence is not only about which artist a song belongs to, which Dashboard 3 examines.
Dashboard 2: What viral hit sounds like
Hits do share a sound: louder, less acoustic and rarely instrumental. YouTube rewards that sound at least twice as steeply as Spotify, and Spotify-only hits have no distinct sound at all.
Audio Profile by quadrant
What it shows. One row per audio feature and one dot per quadrant. Each dot is the quadrant's average gap from the average song in standard deviations, so loudness and acousticness share one scale. The line at 0 is the average song.
Why we built it. The team's feedback asked which audio traits each quadrant mainly has. One chart with the four quadrants side by side replaces four separate charts, so the audience compares them directly instead of flicking between panels.
What it revealed.
• Hits on both have a clear profile. They are louder (+0.35; median −5.7 dB against −6.8 dB for Neither), less acoustic (−0.31) and rarely instrumental (−0.23), and slightly more energetic (+0.21) and danceable (+0.18).
• YouTube-only hits share most of it. They are louder (+0.30) and rarely instrumental (−0.24), but also longer (+0.19; median 3.8 against 3.5 minutes) and more upbeat (valence +0.15).
• Spotify-only hits have no distinct sound. No feature sits further than 0.10 from the average song. Whatever makes these songs Spotify-only, it is not how they sound; Dashboard 3 looks for the answer.
• These are tendencies, not rules. 31% of hits on both are quieter than the typical Neither song.
Feature by Popularity
What it shows. Pick a feature from the dropdown, and two lines show its median in each popularity tier, from each platform's bottom 25% (Q1) to its top 25% (Q4). The vertical axis is zoomed in and doesn't start at 0, so small changes are visible; the axis title says so.
Why we built it. The proposal feedback suggested ridgelines of each feature by tier per platform. Our ridgelines overlapped too much to read, so this chart keeps the same comparison (tier by platform) as two lines. A steeper line means that platform's top songs differ more from its bottom ones.
What it revealed. The chart below puts all seven dropdown features on one scale.
On YouTube, popular songs are clearly louder, more energetic, more danceable and more upbeat than unpopular ones. On Spotify, those same features barely change; its clearest shift is acousticness, which falls just as much as on YouTube. Tempo barely moves on either platform. So the two platforms don't reward different sounds; YouTube rewards the same sound more strongly.
Dashboard 3: Sound or artist
The hit sound from Dashboard 2 mostly belongs to artists, not to songs: compared with the same artist's other songs, every trait gap shrinks to under 0.07 SD. What sets Spotify-only hits apart is how they are published on YouTube: 39% have an unlicensed upload, against 10% of hits on both.
Traits vs average song
What it shows. Three panels, one per hit quadrant, with one bar per feature: the quadrant's gap from the average song in SD. Bars inside the grey ±0.15 lines are barely different, colour deepens as the gap grows, and an annotation names each quadrant's top 3 traits.
Why we built it. The team wanted to end on "the top traits of a hit on each platform". This chart states them as a ranked list per quadrant, using the same numbers as Audio Profile by quadrant, and sets up the test in the next chart.
What it revealed. Hits on both are louder, less acoustic and rarely instrumental. YouTube-only hits are louder, rarely instrumental and longer. Spotify-only hits have no trait beyond ±0.10. The grey dots in the chart below show these values.
Traits vs same artists
What it shows. The same layout, but each song is compared with its own artist's average instead of with all songs.
Why we built it. The proposal feedback warned that artist popularity dominates everything. If hits are louder only because popular artists make louder music, the gaps should vanish when songs are compared with the same artist's other songs. This chart is that test.
What it revealed. They vanish.
So the hit sound describes which artists are popular more than which of an artist's songs become hits. Who the artist is accounts for 56% of the variation in (log) Spotify streams and 45% in YouTube views. Adele shows it in miniature: "Set Fire to the Rain" is the loudest and least acoustic of her ten songs, exactly the hit sound, and it is the one that missed on YouTube.
Unlicensed YouTube upload
What it shows. For each quadrant, the share of songs whose YouTube video is not a licensed upload, meaning it was not claimed by a YouTube content partner such as the record label.
Why we built it. Dashboard 2 showed that Spotify-only hits have no distinct sound, so something other than sound must explain why they miss on YouTube. This chart tests one candidate: how the song is published there.
What it revealed.
Quadrant
Unlicensed YouTube upload
Spotify-only hit
39%
Neither
36%
YouTube-only hit
13%
Hit on both
10%
Spotify-only hits are about four times as likely as hits on both to have an unlicensed upload. A song whose matched YouTube video is an unofficial upload collects fewer views however good it sounds. This is a likely explanation, not proof: the dataset links each song to one video, and a licensed one may exist elsewhere.
What we know now
Six findings came out of the charts. Each one replaces an assumption we would otherwise have made, and the later ones change how the earlier ones should be read.
Finding
Chart that shows it
What we would have assumed
1 in 5 songs is a hit on only one platform; 481 are top 25% on one and bottom 25% on the other
Cross Platform
A hit is a hit everywhere
80% of artists have songs in at least two quadrants, such as Adele's 7 hits on both and 3 Spotify-only hits
Song card
Divergence is just about which artist a song belongs to
Hits on both and YouTube-only hits are louder and rarely instrumental; Spotify-only hits have no distinct sound
Audio Profile by quadrant
Each platform has its own "sound"
YouTube rewards loudness, energy and danceability at least twice as steeply as Spotify; acousticness drops equally on both
Feature by Popularity
Audio features matter the same on both platforms
Compared with the same artist's other songs, every trait gap shrinks to under 0.07 SD
Traits vs same artists
Making a song louder makes it more likely to be a hit
39% of Spotify-only hits have an unlicensed YouTube upload, against 10% of hits on both
Unlicensed YouTube upload
A YouTube miss means the song didn't appeal there
The one-line answer to the research question: hits share a sound, and YouTube rewards it more strongly, but the sound mostly marks popular artists rather than making individual songs popular. Who the artist is, and how the song is published, matter more.
Limits
The charts show what goes together, not what causes what. Say these points before an examiner does.
• Correlation, not a recipe. No chart shows that changing a song's sound changes its popularity. Present the traits as common among hits, not as advice a record label can follow.
• The gaps are small. The biggest trait gap is 0.35 SD (about 1.6 dB of loudness), and 31% of hits on both are quieter than the typical Neither song.
• No release date. Streams and views pile up over time, so older songs have had longer to become hits. Comparing the two platforms cancels some of this, because each song is the same age on both, but not all of it.
• A biased sample. The dataset holds about the top 10 tracks per artist, so it over-represents popular songs and leaves out most of each artist's catalogue.
• One YouTube video per song. Licensing and views come from the single video matched to each song. A licensed upload may exist elsewhere on YouTube.
• 1,467 songs left out. Songs with missing streams or views, or whose YouTube video is shared with another track, are excluded from every chart.
• No refresh possible. Spotify retired its audio-features API in November 2024, so the audio data can't be updated.