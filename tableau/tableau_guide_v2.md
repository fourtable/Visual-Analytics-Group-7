Tableau Build Guide: Spotify vs YouTube Divergence Story
Oct 6, 2026 · @Josh
The workbook has three dashboards, one per question, presented in this order. Each one ends on a finding the next one questions.
Dashboard
Question it answers
Sheets
1 Where the platforms disagree
Do Spotify and YouTube agree on which songs are hits?
Cross Platform, Song card
2 What hits sound like
Do hits in each quadrant share a sound, and does each platform reward it equally?
Audio Profile by quadrant, Feature by Popularity
3 Sound or artist?
Does that sound still separate hits within an artist's own songs, and if not, what else does?
Traits vs average song, Traits vs same artists, Unlicensed share
Before you start
Everything uses one data source, Songs, which is spotify_youtube_clean_v2.csv connected as it is. Every formula below only uses CSV columns or fields created in an earlier step. Build in the order of this guide and each field will already exist when a formula needs it.
The count field is added by Tableau automatically. It sits at the bottom of the Data pane and its name ends in (Count), for example spotify_youtube_clean_v2.csv (Count). Older versions call it Number of Records.
Tableau may tidy column names when it connects. For example, spotify_popular can appear as Spotify Popular, platform_lean as Platform Lean and duration_min as Duration Min. These are still the same columns. When you type a formula, type [ and the first few letters, then pick the field from the list that pops up, so the name always matches your Data pane.
1. Connect the CSV. Go to Data > New Data Source > Text file and choose spotify_youtube_clean_v2.csv. In the Data pane, right-click the data source > Rename and call it "Songs".
2. Optional: switch to an extract. If the workbook feels slow, choose Extract at the top right of the Data Source tab. The live connection also works.
3. Check the true/false columns. spotify_popular, youtube_popular and Licensed should show the T|F icon. If any shows Abc, right-click > Change Data Type > Boolean.
4. Learn how to create fields. These three actions are used throughout.
    ◦ Calculated field: Go to Analysis > Create Calculated Field. Type the field name in the top box, type or paste the formula, and check that the bottom of the box says "The calculation is valid" before clicking OK. To make a similar field quickly, right-click an existing one > Duplicate, then edit its name and formula.
    ◦ Parameter: Right-click empty space in the Data pane > Create Parameter. To display its control on a sheet, right-click it under Parameters at the bottom of the Data pane > Show Parameter.
    ◦ Convert to Dimension: Right-click the field in the Data pane > Convert to Dimension.
5. Create the "Songs to include" switch. It lets the audience re-run Dashboards 2 and 3 on official videos only.
    ◦ Parameter Songs to include: Data type String, Allowable values List, with two values, "All songs" and "Official video". Set the current value to All songs.
    ◦ Include song = [Songs to include] = "All songs" OR [video_type] = "Official video". On every sheet in Dashboards 2 and 3 except Unlicensed share, drag it to Filters and keep True.
6. Name each sheet as in this guide. The dashboard steps refer to these names.
7. Keep v1.twbx as the archive. The retired sheets live there (see Archive at the end).
Fields you create, in build order
Field
Kind
Used on
Built from
Songs to include, Include song
Parameter, calculated field
Dashboards 2 and 3
video_type
Spotify top-25% cut-off, YouTube top-25% cut-off, Quadrant
Calculated field
Cross Platform, then every sheet
spotify_popular, youtube_popular, Stream, Views
Ten z-score fields, such as Loudness (z)
Calculated field
Audio Profile by quadrant, Traits vs average song
Audio columns
Select Feature
Parameter
Feature by Popularity
Typed values
Feature value, YouTube median (same tier)
Calculated field
Feature by Popularity
Audio columns, Select Feature, spotify_tier, youtube_tier
Ten artist z-score fields, such as Loudness (artist z)
Calculated field
Traits vs same artists
Audio columns, Artist
Unlicensed share
Calculated field
Unlicensed share
Licensed
Your workbook also holds fields the three dashboards no longer use: Lean within artist, Spotify-leaning share, YouTube-leaning share, Bin Width, Value bin, Typical range, Share of tier, Share (smoothed), Instrumental Share, Spoken-word share, Live share and z value. To tidy the Data pane without deleting them, select them all, right-click > Folders > Create Folder and name it "Unused".
Dashboard 1: Where the platforms disagree
Question: do Spotify and YouTube agree on which songs are hits? About 1 in 5 songs is a hit on only one platform. A log-scale scatter places each of the 17,380 songs by its Spotify streams and YouTube views, coloured by quadrant. Clicking a song shows its details on a card beside the chart.
A note on terms: each platform has four quartiles (Q1 to Q4, its own bottom 25% to top 25%). The two cut-off lines split the chart into four quadrants. The other two dashboards compare quadrants.
Sheet "Cross Platform" (data source: Songs)
1. Create three calculated fields. If you already have Spotify hit line and Youtube hit line, right-click them > Rename instead.
    ◦ Spotify top-25% cut-off = {FIXED : MIN(IF [spotify_popular] THEN [Stream] END)}. The smallest stream count among Spotify's top 25% of songs.
    ◦ YouTube top-25% cut-off = {FIXED : MIN(IF [youtube_popular] THEN [Views] END)}
    ◦ Quadrant = IF [spotify_popular] AND [youtube_popular] THEN "Hit on both" ELSEIF [spotify_popular] THEN "Spotify-only hit" ELSEIF [youtube_popular] THEN "YouTube-only hit" ELSE "Neither" END
2. Set the quadrant colours once, so every sheet uses them. Right-click Quadrant in the Data pane > Default Properties > Color, and set Hit on both to #7B3FA0 (purple), YouTube-only hit to #FF0000, Spotify-only hit to #1DB954 and Neither to #D9D9D9 (light grey). Neither is 65% of the songs, so grey stops it drowning out the three groups the story is about.
3. Drag Stream to Columns and Views to Rows. Drag Uri to Detail so each song is its own dot.
4. Right-click each axis > Edit Axis and tick Logarithmic. Title them "Spotify streams (log scale)" and "YouTube views (log scale)".
5. Drag platform_lean to Filters and untick Null. This drops songs with missing streams or views and songs whose YouTube video is shared with another track, so every sheet works on the same 17,380 songs.
6. Set the Marks type to Circle and the size to small. Drag Quadrant to Color, then set Opacity to about 50% and Border to None. If the grey dots cover the coloured ones, drag Neither to the other end of the colour legend.
7. Drag Spotify top-25% cut-off and YouTube top-25% cut-off to Detail and set both to MIN. They hold one value each, so they don't split the dots.
8. From the Analytics pane, drag Reference Line onto Table for the Stream axis. Set Value to MIN(Spotify top-25% cut-off) and the line to dashed grey. For Label choose Custom, type "Top 25% on Spotify: ", then click the arrow at the right of the box and choose Value. Repeat on the Views axis with MIN(YouTube top-25% cut-off) and "Top 25% on YouTube: ".
9. Label the quadrants by name only: right-click inside each one > Annotate > Area, and type "Hit on both" (top right), "YouTube-only hit" (top left), "Spotify-only hit" (bottom right) and "Neither" (bottom left). Leave the counts out, because they change when the dashboard filters are used. For speaking, they are 2,767, 1,629, 1,690 and 11,294.
10. Drag Track, Artist, video_type and Quadrant to Tooltip and arrange them with the track and artist on the first line.
11. Add the dashboard filters. Drag Artist and video_type to Filters and keep all values. Right-click each > Show Filter. Set Artist to Single Value (dropdown) and make sure (All) is offered; set video_type to Multiple Values (dropdown).
12. Choose Worksheet > Show Caption, double-click the caption and type: "62% of Spotify's top-25% songs are also in YouTube's top 25%. The other 38% are where this story starts."
13. Title the sheet with the finding: "1 in 5 songs is a hit on only one platform".
Sheet "Song card" (data source: Songs)
1. Rename "8b Song card" to "Song card". Delete "8a Explorer Quadrant" (right-click its tab > Delete): Cross Platform now does its job.
2. On the Marks card, change Automatic to Text. Drag Track, Artist, Quadrant, video_type, Stream, Views, Loudness, Acousticness and Energy onto Text. Set Stream and Views to Sum and the three features to Average; for a single song these are just its own values.
3. Click Text > the "…" button and lay the card out as five lines:
    ◦ Line 1: <Track>, bold, size 14
    ◦ Line 2: <Artist>
    ◦ Line 3: <Quadrant> · <video_type>
    ◦ Line 4: Spotify streams: <SUM(Stream)> · YouTube views: <SUM(Views)>
    ◦ Line 5: Loudness <AVG(Loudness)> dB · Acousticness <AVG(Acousticness)> · Energy <AVG(Energy)>
4. On the Marks card, right-click the Stream pill > Format > Numbers > Number (Custom), 0 decimals, Display Units Millions. Do the same for Views. Give the three features 2 decimals.
5. Until the dashboard action exists, the card shows totals for all songs. That's expected.
Assemble Dashboard 1
1. Choose Dashboard > New Dashboard and rename its tab "1 Where the platforms disagree". Under Size, choose Fixed, 1366 × 768.
2. Drag Cross Platform into the left ~70% of the dashboard. Its colour legend and the Artist and video type filters appear on the right automatically.
3. Build the right column, top to bottom: a Text object reading "Click any song to see its details. Use the filters to focus on one artist or video type.", then Song card, then the Quadrant legend, then the two filters.
4. Choose Dashboard > Actions > Add Action > Filter. Name it "Show song card". Set Source Sheets to Cross Platform, Run action on to Select, Target Sheets to Song card, and Clearing the selection will to Exclude all values. Under Filter, choose Selected Fields and set both Source Field and Target Field to Uri. Click OK.
5. On the Quadrant legend, click its menu arrow > Highlight Selected Items. Clicking a quadrant in the legend now highlights its songs.
6. Test with Adele: set Artist to Adele and click "Set Fire to the Rain". The card should show Spotify-only hit · Official video, 926M streams and 3M views, Loudness −3.88 dB, Acousticness 0.00, Energy 0.67. Click "Someone Like You": Hit on both, 1,470M streams and 1,960M views, −8.25 dB, 0.89, 0.32.
7. Set Artist back to (All), click an empty part of the scatter to clear the selection, and save. The card stays empty until someone clicks a song.
Dashboard 2: What hits sound like
Question: do hits in each quadrant share a sound, and does each platform reward it equally? Hits on both and YouTube-only hits are louder and rarely instrumental; Spotify-only hits sound like an average song. The left chart compares all ten features across the quadrants; the right one zooms into one feature by popularity tier, with one line per platform.
Sheet "Audio Profile by quadrant" (data source: Songs)
A dot plot with one row per feature and one dot per quadrant, on a shared z-score scale where 0 is the average song.
Part A: create the ten z-score fields. Each one shows how far a group's average sits from the average song, in standard deviations, so all features share one scale. Create the first, then right-click it > Duplicate, rename the copy and swap the column name in both places.
Field name
Formula
Loudness (z)
(AVG([Loudness]) - MIN({FIXED : AVG([Loudness])})) / MIN({FIXED : STDEV([Loudness])})
Instrumentalness (z)
(AVG([Instrumentalness]) - MIN({FIXED : AVG([Instrumentalness])})) / MIN({FIXED : STDEV([Instrumentalness])})
Acousticness (z)
(AVG([Acousticness]) - MIN({FIXED : AVG([Acousticness])})) / MIN({FIXED : STDEV([Acousticness])})
Duration (z)
(AVG([duration_min]) - MIN({FIXED : AVG([duration_min])})) / MIN({FIXED : STDEV([duration_min])})
Danceability (z)
(AVG([Danceability]) - MIN({FIXED : AVG([Danceability])})) / MIN({FIXED : STDEV([Danceability])})
Energy (z)
(AVG([Energy]) - MIN({FIXED : AVG([Energy])})) / MIN({FIXED : STDEV([Energy])})
Liveness (z)
(AVG([Liveness]) - MIN({FIXED : AVG([Liveness])})) / MIN({FIXED : STDEV([Liveness])})
Speechiness (z)
(AVG([Speechiness]) - MIN({FIXED : AVG([Speechiness])})) / MIN({FIXED : STDEV([Speechiness])})
Tempo (z)
(AVG([Tempo]) - MIN({FIXED : AVG([Tempo])})) / MIN({FIXED : STDEV([Tempo])})
Valence (z)
(AVG([Valence]) - MIN({FIXED : AVG([Valence])})) / MIN({FIXED : STDEV([Valence])})
Part B: build the chart.
1. Drag Measure Names to Rows and Measure Values to Columns.
2. On the Filters shelf, right-click Measure Names > Edit Filter. Click None, tick only the ten (z) fields and click OK.
3. Drag platform_lean to Filters and untick Null, so the sheet uses the same 17,380 songs as Cross Platform. Drag Include song to Filters and keep True.
4. Drag Quadrant to Color; it picks up the colours set on the field. On the Marks card, change Automatic to Circle and increase the size a little. Keep mark labels off; 40 numbers would overlap.
5. From the Analytics pane, drag Reference Line onto Table, set it to Constant 0 and give it the custom label "Average song".
6. Drag the pills on the Measure Values card into the table's order: Loudness, Instrumentalness, Acousticness, Duration, Danceability, Energy, Liveness, Speechiness, Tempo, Valence. The rows follow the card, and the two Traits sheets copy this order.
7. Right-click each row label > Edit Alias and drop the " (z)" suffix, so the rows read Loudness, Instrumentalness and so on.
8. Title the axis "Average z-score (0 = average song)". Title the sheet with the finding: "Hits on both are louder, less acoustic and rarely instrumental; Spotify-only hits sound like an average song."
Check values:
Feature
Hit on both
YouTube-only hit
Spotify-only hit
Neither
Loudness
+0.35
+0.30
+0.03
−0.09
Instrumentalness
−0.23
−0.24
−0.09
+0.08
Acousticness
−0.31
+0.03
−0.02
+0.05
Duration
+0.04
+0.19
−0.07
−0.03
No Spotify-only dot sits further than 0.10 from zero. That is a finding in itself: there is no "Spotify sound". Dashboard 3 shows what explains those songs instead.
Sheet "Feature by Popularity" (data source: Songs)
One chart, two lines: the median of the selected feature in each popularity tier, one line for Spotify and one for YouTube. A steeper line means that platform's top songs differ more from its bottom ones. With Loudness selected, YouTube climbs 1.8 dB from Q1 to Q4 while Spotify climbs 0.9 dB. This is the readable version of the ridgelines the proposal feedback suggested.
Part A: create the dropdown and fields. If Select Feature and Feature value already exist, skip to step 3.
1. Parameter Select Feature. Data type String, Allowable values List, with these seven values typed exactly: Danceability, Energy, Loudness, Valence, Acousticness, Tempo, duration_min. Set the current value to Loudness.
2. Feature value picks the column that matches the dropdown: CASE [Select Feature] WHEN "Danceability" THEN [Danceability] WHEN "Energy" THEN [Energy] WHEN "Loudness" THEN [Loudness] WHEN "Valence" THEN [Valence] WHEN "Acousticness" THEN [Acousticness] WHEN "Tempo" THEN [Tempo] WHEN "duration_min" THEN [duration_min] END
3. YouTube median (same tier). The x-axis is Spotify's tiers. For each tier label, this looks up YouTube's median for the tier with the same name, so both platforms share one axis:
CASE [spotify_tier]
WHEN "Q1 (Low)" THEN {FIXED : MEDIAN(IF [youtube_tier] = "Q1 (Low)" THEN [Feature value] END)}
WHEN "Q2" THEN {FIXED : MEDIAN(IF [youtube_tier] = "Q2" THEN [Feature value] END)}
WHEN "Q3" THEN {FIXED : MEDIAN(IF [youtube_tier] = "Q3" THEN [Feature value] END)}
WHEN "Q4 (Top)" THEN {FIXED : MEDIAN(IF [youtube_tier] = "Q4 (Top)" THEN [Feature value] END)}
END
Part B: build the chart.
1. Drag Include song to Filters and keep True, then right-click it on the Filters shelf > Add to Context (the pill turns grey). This makes the YouTube line follow the switch too.
2. Drag spotify_tier to Filters and untick Null. Then drag spotify_tier to Columns; Q1 (Low) should be on the left.
3. Drag Feature value to Rows, then right-click the pill > Measure > Median.
4. Drag YouTube median (same tier) onto the same vertical axis, dropping it when a double green ruler appears. Tableau switches to Measure Values and adds Measure Names to the view.
5. Check the Columns shelf. If Measure Names is there next to spotify_tier, drag it off the shelf. Left there, it splits each tier in two and the lines break into single dots. Columns should hold only spotify_tier.
6. On the Measure Values card, right-click the YouTube pill > Measure > Minimum. It holds one value per tier, so Minimum just reads it; Sum would add it up once per song. The other pill should read MEDIAN(Feature value).
7. On the Marks card, change Automatic to Line and drag Measure Names to Color. Right-click each legend item > Edit Alias and rename them "Spotify" and "YouTube". Click Color > Edit Colors and set Spotify to #1DB954 and YouTube to #FF0000. Then click Color > Markers and choose dots on every point.
8. Click Label > Show mark labels, and under Marks to Label choose Line Ends. Right-click Measure Values on Rows > Format > Numbers > Number (Custom), 2 decimal places.
9. Right-click the vertical axis > Edit Axis. Untick Include zero and set the title to "Median value (zoomed axis, does not start at 0)".
10. Right-click the "spotify_tier" label above the tier headers > Hide Field Labels for Columns. Add the caption: "Tiers are quartiles of each platform's own popularity: Q1 = bottom 25%, Q4 = top 25%."
11. Title: double-click it, type "Median ", click Insert > Parameters.Select Feature, then type " by popularity tier".
Check values:
Feature
Spotify, Q1 → Q4
YouTube, Q1 → Q4
Loudness (dB)
−6.99, −6.76, −6.46, −6.05
−7.64, −6.81, −6.40, −5.80
Energy
0.66, 0.66, 0.67, 0.68
0.61, 0.66, 0.68, 0.69
Acousticness
0.22, 0.22, 0.19, 0.13
0.25, 0.19, 0.17, 0.15
Assemble Dashboard 2
1. Choose Dashboard > New Dashboard, rename the tab "2 What hits sound like", and set Size to Fixed, 1366 × 768.
2. Add a Text object across the top: "Hits on both are louder, less acoustic and rarely instrumental. Spotify-only hits have no distinct sound. Pick a feature on the right to see how it changes from each platform's bottom 25% to its top 25%."
3. Drag Audio Profile by quadrant into the left ~60% and Feature by Popularity into the right ~40%.
4. Show the two controls: click Feature by Popularity on the dashboard, open its menu arrow > Parameters > Select Feature, and place the dropdown above that chart. Do the same for Songs to include and place it at the top right.
5. Keep the Quadrant legend next to the dot plot, and set it to Highlight Selected Items from its menu arrow. Remove any other legend Tableau added.
6. Test: set Select Feature to Loudness. The lines should match the check values above, with YouTube visibly steeper.
Dashboard 3: Sound or artist?
Question: does the hit sound still separate hits within an artist's own songs, and if not, what else does? Against the average song, each hit quadrant has clear traits. Against the same artist's other songs, every gap shrinks to 0.07 SD or less. Meanwhile, 39% of Spotify-only hits have an unlicensed YouTube upload, against 10% of hits on both.
Quadrant
Top 3 traits vs the average song
Vs the same artist's other songs
Unlicensed YouTube upload
Hit on both
Louder (+0.35), less acoustic (−0.31), fewer instrumentals (−0.23)
Every gap within ±0.07
10%
YouTube-only hit
Louder (+0.30), fewer instrumentals (−0.24), longer (+0.19)
Every gap within ±0.07
13%
Spotify-only hit
Nothing beyond ±0.10: no distinct sound
Every gap within ±0.07
39%
Closing line: "Hits share a sound: louder, less acoustic, rarely instrumental. But inside an artist's own catalogue, sound barely separates hits from misses. Who the artist is, and how the song is published, matter more." Present these as traits common among hits, not a recipe a record label can follow: the data is correlational and has no release date.
Sheet "Traits vs average song" (data source: Songs)
1. Right-click the Audio Profile by quadrant tab > Duplicate and rename the copy "Traits vs average song". This keeps the ten (z) fields, the filters, the aliases and the row order.
2. Drag Quadrant to Filters and untick Neither.
3. Drag Quadrant from Color to Columns, to the left of Measure Values. The chart splits into three panes side by side.
4. On the Marks card, change Circle to Bar.
5. Drag Measure Values from the Measure Values card to Color. Click Color > Edit Colors, choose Orange-Blue Diverging, click Advanced, tick Start, End and Center, and set them to −0.45, 0.45 and 0. Small gaps come out pale; big ones turn orange (below average) or blue (above).
6. Mark the "barely different" zone: add Reference Lines on Table at Constant −0.15 and 0.15, each with Label set to None and a light grey line (or one Reference Band from −0.15 to 0.15). Keep the "Average song" line at 0.
7. Click Label > Show mark labels. Right-click Measure Values on Columns > Format > Numbers > Number (Custom), 2 decimal places.
8. Annotate the top of each pane (right-click empty space in the pane > Annotate > Area): "Louder, less acoustic, fewer instrumentals" for Hit on both, "Louder, fewer instrumentals, longer" for YouTube-only hit, and "No distinct sound" for Spotify-only hit.
9. Title the axis "Gap from the average song (SD)" and the sheet "Compared with the average song".
Check values: match the second column of the table above.
Sheet "Traits vs same artists" (data source: Songs)
Part A: create the ten artist z-score fields. Each one takes a song's value minus its artist's average, then divides by the same overall standard deviation as the (z) fields, so both Traits sheets share one scale.
Field name
Formula
Loudness (artist z)
AVG([Loudness] - {FIXED [Artist] : AVG([Loudness])}) / MIN({FIXED : STDEV([Loudness])})
Instrumentalness (artist z)
AVG([Instrumentalness] - {FIXED [Artist] : AVG([Instrumentalness])}) / MIN({FIXED : STDEV([Instrumentalness])})
Acousticness (artist z)
AVG([Acousticness] - {FIXED [Artist] : AVG([Acousticness])}) / MIN({FIXED : STDEV([Acousticness])})
Duration (artist z)
AVG([duration_min] - {FIXED [Artist] : AVG([duration_min])}) / MIN({FIXED : STDEV([duration_min])})
Danceability (artist z)
AVG([Danceability] - {FIXED [Artist] : AVG([Danceability])}) / MIN({FIXED : STDEV([Danceability])})
Energy (artist z)
AVG([Energy] - {FIXED [Artist] : AVG([Energy])}) / MIN({FIXED : STDEV([Energy])})
Liveness (artist z)
AVG([Liveness] - {FIXED [Artist] : AVG([Liveness])}) / MIN({FIXED : STDEV([Liveness])})
Speechiness (artist z)
AVG([Speechiness] - {FIXED [Artist] : AVG([Speechiness])}) / MIN({FIXED : STDEV([Speechiness])})
Tempo (artist z)
AVG([Tempo] - {FIXED [Artist] : AVG([Tempo])}) / MIN({FIXED : STDEV([Tempo])})
Valence (artist z)
AVG([Valence] - {FIXED [Artist] : AVG([Valence])}) / MIN({FIXED : STDEV([Valence])})
Part B: build the sheet.
1. Right-click the Traits vs average song tab > Duplicate and rename the copy "Traits vs same artists".
2. On the Filters shelf, right-click Measure Names > Edit Filter. Click None, tick only the ten (artist z) fields and click OK.
3. Reorder the rows. The copied sort still points at the (z) fields, so the new rows fall back to alphabetical order. Drag the pills on the Measure Values card into the same order as Traits vs average song.
4. Right-click each row label > Edit Alias and drop the " (artist z)" suffix.
5. Remove the copied annotations. Right-click each of the three pane annotations > Remove; they describe gaps this sheet doesn't show. Add one annotation instead: "Every gap is within ±0.07 SD".
6. If the bar colours reset, repeat step 5 of Traits vs average song.
7. Title the sheet "Compared with the same artist's other songs".
Check values: every bar sits inside the ±0.15 lines. The largest is about 0.07 (Duration, Hit on both).
Sheet "Unlicensed share" (data source: Songs)
One bar per quadrant: the share of songs whose YouTube video is not a licensed upload, meaning it wasn't claimed by a YouTube content partner such as the label. It is the evidence for "how the song is published" in the closing line.
1. Create a calculated field Unlicensed share = AVG(IIF([Licensed], 0, 1)).
2. Drag platform_lean to Filters and untick Null. Leave Include song off this sheet.
3. Drag Quadrant to Rows and Unlicensed share to Columns. On the Marks card, change Automatic to Bar and drag Quadrant to Color.
4. Right-click Quadrant on Rows > Sort > Sort By Field, choose Unlicensed share, Descending.
5. Right-click the Unlicensed share pill > Format > Numbers > Percentage, 0 decimals. Click Label > Show mark labels.
6. Title the axis "Share of songs" and the sheet "Unlicensed YouTube upload".
Check values: Spotify-only hit 39%, Neither 36%, YouTube-only hit 13%, Hit on both 10%.
Assemble Dashboard 3
1. Choose Dashboard > New Dashboard, rename the tab "3 Sound or artist?", and set Size to Fixed, 1366 × 768.
2. Add a Text object across the top with the closing line above.
3. Drag Traits vs average song into the top-left ~70% and Traits vs same artists directly below it, the same width and height, so the quadrant panes line up.
4. Drag Unlicensed share into the right column. Under it, add a Text object: "Spotify-only hits often lack a licensed YouTube upload. That explains a YouTube miss better than sound does."
5. Show the Songs to include control at the top right. Remove the colour legends; the quadrant names already label the panes and bars.
6. Test: switch Songs to include to Official video. The Traits bars should shift slightly, and Unlicensed share should stay the same.
Presenting the three dashboards
Present the three dashboards live in Tableau, in order; no Story is needed. They take about 9 minutes, leaving 3 for the intro and method slides in the 12-minute slot.
#
Dashboard
What to say and do
Time
1
Where the platforms disagree
"1 in 5 songs is a hit on only one platform." Set Artist to Adele, click "Someone Like You" and "Set Fire to the Rain", and play about 5 seconds of each.
3 min
2
What hits sound like
"Hits share a sound: louder, less acoustic, rarely instrumental. Spotify-only hits don't have one." Switch the feature to Loudness: YouTube's gap is twice Spotify's.
3 min
3
Sound or artist?
"Within an artist's own songs, the sound gap disappears. Remember 'Set Fire to the Rain': it sounds the most like a hit, and it missed on YouTube. Spotify-only hits often just lack a licensed upload." Close on the top 3 traits.
3 min
1. Set up the Adele hook on Dashboard 1. "Someone Like You" is a quiet, acoustic piano ballad (−8.3 dB, acousticness 0.89), the opposite of the hit sound, yet a hit on both platforms. "Set Fire to the Rain" is loud and barely acoustic (−3.9 dB, acousticness 0.004), exactly the hit sound, yet top tier on Spotify and only Q2 on YouTube. Put the clips in the slide deck and test the volume beforehand.
2. Pay it off on Dashboard 3. The Traits vs same artists chart is the general version of the Adele example.
3. Reset before presenting. Set Artist to (All), Select Feature to Loudness and Songs to include to All songs, clear any selection, and save.
4. Reuse the instructions for the User Guide. The project brief requires a User Guide with the dashboard. The instruction text on each dashboard and the table above are a starting point.
Troubleshooting
Most problems come from four causes: a missing Uri on Detail, a pill summing instead of averaging, a field created before the fields it uses exist, or a copied sheet that kept settings meant for the original.
Symptom
Fix
A formula says a field doesn't exist
Either the field hasn't been created yet, or Tableau tidied the column's name. Pick names from the pop-up list in the formula box instead of typing them.
The scatter shows a single dot
Drag Uri to Detail so each song is its own mark.
A cut-off field isn't offered in the reference line dialog
Drag it to Detail first. Reference lines only list fields that are in the view.
Feature by Popularity shows dots instead of lines
Measure Names is on Columns. Drag it off; it belongs on Color only.
Feature by Popularity's YouTube line is far too high or low
Its pill is summing. On the Measure Values card, right-click it > Measure > Minimum.
The YouTube line ignores "Songs to include"
Right-click Include song on the Filters shelf > Add to Context.
The lines look flat
The axis still starts at 0. Right-click it > Edit Axis > untick Include zero.
Quadrant colours differ between sheets
Set them on the field (Dashboard 1, Cross Platform step 2), not on one sheet's legend.
Traits vs same artists rows are in a different order
The copied sort points at the (z) fields. Drag the pills on its Measure Values card into the other sheet's order.
Traits bars are all one colour
Click Color > Edit Colors: Orange-Blue Diverging, Start −0.45, End 0.45, Center 0.
Quadrant, the cut-offs or Unlicensed share show errors
The true/false column was read as text. Right-click it > Change Data Type > Boolean.
The song card shows totals or a "*"
No song is selected yet. Click a song; if it still shows totals, check the "Show song card" action uses Uri.
The song card stays blank after a click
Check that Uri is on Cross Platform's Detail and that the action's target is Song card.
The workbook feels slow
Switch to an extract, and hide fields you don't use (right-click > Hide).
Archive
Retired sheets live in v1.twbx, which is now the archive copy; keep that file unchanged. To bring a sheet back, open v1.twbx, right-click the sheet's tab > Copy, then in the current workbook right-click any tab > Paste. Charts that were planned but never built are recoverable from this guide's version history.
Sheet
Status
Where it could still help
Tier Table
In v1.twbx. Cross Platform's caption keeps its key number (62%)
Report appendix
Ridgeline Spotify, Ridgelines YouTube
In v1.twbx. Feature by Popularity shows the same thing more clearly
Report, as evidence of how much the tiers overlap
Flags Spotify, Flags Youtube
In v1.twbx
Q&A backup: instrumentals are about 8 times rarer among hits on both than among Neither songs
Profile by platform lean
Never built; Audio Profile by quadrant replaced it
Report section on platform lean
Lean map, video type by lean, correlation bars, track length, explorer with song-vs-artist profile, Tableau Story
Cut to keep three dashboards
Report discussion, if space allows
1b Tier table (data source: Songs)
1. Drag spotify_tier to Rows and youtube_tier to Columns.
2. Drag the count field to Color and to Label. Set the Marks type to Square to get a highlight table.
3. Drag both tier fields to Filters and untick Null.
4. Right-click spotify_tier on Rows > Sort > Alphabetic, Descending, so Q4 (Top) is on top.
5. On both the Color and Label count pills, choose Quick Table Calculation > Percent of Total, then Compute Using > Table (across). Each Spotify tier row now adds up to 100%. The top-right cell should read 62%.
2a and 2b Ridgelines (data source: Songs)
These use Select feature and Feature value from Feature by Popularity, plus five more calculated fields:
• Bin width = CASE [Select feature] WHEN "Loudness" THEN 1 WHEN "Tempo" THEN 5 WHEN "duration_min" THEN 0.25 ELSE 0.025 END
• Value bin = FLOOR([Feature value] / [Bin width]) * [Bin width]. Then right-click it > Convert to Dimension.
• Typical range = [Feature value] >= {FIXED : PERCENTILE([Feature value], 0.01)} AND [Feature value] <= {FIXED : PERCENTILE([Feature value], 0.99)}
• Share of tier = COUNT([Uri]) / MIN({EXCLUDE [Value bin] : COUNT([Uri])})
• Share (smoothed) = WINDOW_AVG([Share of tier], -1, 1)
1. Drag Typical range and Include song to Filters and keep True. Drag spotify_tier to Filters and untick Null.
2. Drag Value bin to Columns; the pill should read Value bin, not SUM(Value bin). Drag spotify_tier and then Share (smoothed) to Rows.
3. Right-click Share (smoothed) > Compute Using > Value bin.
4. Set the Marks type to Area, drag spotify_tier to Color with a sequential palette, and sort spotify_tier Alphabetic, Descending.
5. Hide the left axes (right-click > untick Show Header), set the toolbar's Standard dropdown to Entire View, and remove grid lines under Format > Lines.
6. For 2b, duplicate 2a and replace spotify_tier with youtube_tier on Filters, Rows and Color.
2c and 2d Flags by tier (data source: Songs)
1. Create Spoken-word share = AVG(INT([is_spoken_word])), alongside Instrumental share and Live share (both already in the workbook).
2. Drag spotify_tier to Columns and filter out Null. Drag Instrumental share to Rows, then drop Spoken-word share and Live share onto the same axis.
3. Drag Measure Names to Color and to Columns, after spotify_tier, to get grouped bars. Format the axis as a percentage.
4. For 2d, duplicate the sheet and swap spotify_tier for youtube_tier.
3 Profile by lean (data source: Songs)
Build Audio Profile by quadrant as written, but put platform_lean on Color instead of Quadrant. Check values: Loudness −0.48 for Spotify-leaning and +0.27 for YouTube-leaning; Energy −0.38 and +0.16.