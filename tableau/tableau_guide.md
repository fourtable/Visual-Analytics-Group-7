Tableau Build Guide: Spotify vs YouTube Divergence Story
Oct 6, 2026 · @Josh
Before you start
Everything uses one data source, Songs, which is spotify_youtube_clean_v2.csv connected as it is. Every formula below only uses CSV columns or fields created in an earlier step. Build in the order of this guide and each field will already exist when a formula needs it.
The count field is added by Tableau automatically. It sits at the bottom of the Data pane and its name ends in (Count), for example spotify_youtube_clean_v2.csv (Count). Older versions call it Number of Records.
Tableau may tidy column names when it connects. For example, spotify_popular can appear as Spotify Popular, platform_lean as Platform Lean and duration_min as Duration Min. These are still the same columns. When you type a formula, type [ and the first few letters, then pick the field from the list that pops up, so the name always matches your Data pane.
1. Connect the CSV. Go to Data > New Data Source > Text file and choose spotify_youtube_clean_v2.csv. In the Data pane, right-click the data source > Rename and call it "Songs".
2. Switch to an extract. On the Data Source tab, choose Extract at the top right. Tableau asks where to save the extract the first time you open a sheet. The extract is needed for PERCENTILE (Chart 2) and CORR (Chart 6), and makes everything faster.
3. Check the true/false columns. spotify_popular, youtube_popular, is_instrumental, is_spoken_word, is_live, is_collab and Licensed should show the T|F icon. If any shows Abc, right-click > Change Data Type > Boolean.
4. Set defaults. Right-click lean_score > Default Properties > Aggregation > Average. Right-click platform_lean > Default Properties > Color and set Spotify-leaning to #1DB954, YouTube-leaning to #FF0000 and Balanced to #BDBDBD (double-click an item to type a hex code).
5. Learn how to create fields. These three actions are used throughout.
    ◦ Calculated field: Go to Analysis > Create Calculated Field. Type the field name in the top box, type or paste the formula, and check that the bottom of the box says "The calculation is valid" before clicking OK. To make a similar field quickly, right-click an existing one > Duplicate, then edit its name and formula.
    ◦ Parameter: Right-click empty space in the Data pane > Create Parameter. To display its control on a sheet, right-click it under Parameters at the bottom of the Data pane > Show Parameter.
    ◦ Convert to Dimension: Right-click the field in the Data pane > Convert to Dimension.
6. Create the shared fields. Several charts use these, so create them now:
    ◦ Parameter Songs to include: Data type String, Allowable values List, with two values typed as "All songs" and "Official videos only". Set the current value to All songs.
    ◦ Include song = [Songs to include] = "All songs" OR [video_type] = "Official video". On Charts 2, 3, 4, 6 and 7, drag it to Filters and keep True. This lets the audience re-run the analysis on official videos only.
    ◦ Lean within artist = [lean_score] - {FIXED [Artist] : AVG([lean_score])}. How much more YouTube-leaning a song is than its artist's other songs. Used in Charts 6 and 7.
    ◦ Spotify-leaning share = AVG(IIF([platform_lean] = "Spotify-leaning", 1, 0)). Used in Charts 4 and 5.
    ◦ YouTube-leaning share = AVG(IIF([platform_lean] = "YouTube-leaning", 1, 0)). Used in Chart 4.
7. Name each sheet by its chart number, for example "1 Quadrant". The dashboard and story steps refer to these names.
Fields you create, in build order
Field
Kind
Created in
Built from
Songs to include
Parameter
Before you start, step 6
Typed values
Include song
Calculated field
Before you start, step 6
Songs to include, video_type
Lean within artist
Calculated field
Before you start, step 6
lean_score, Artist
Spotify-leaning share, YouTube-leaning share
Calculated field
Before you start, step 6
platform_lean
Spotify hit line, YouTube hit line, Quadrant
Calculated field
Chart 1
spotify_popular, youtube_popular, Stream, Views
Select feature
Parameter
Chart 2
Typed values
Feature value, Bin width, Value bin, Typical range, Share of tier, Share (smoothed)
Calculated field
Chart 2
Audio columns, Select feature, Uri
Instrumental share, Spoken-word share, Live share
Calculated field
Chart 2 (2c)
is_instrumental, is_spoken_word, is_live
Ten z-score fields, such as Loudness (z)
Calculated field
Chart 3
Audio columns
Energy cell, Acousticness cell
Calculated field
Chart 4
Energy, Acousticness
Ten All: and ten Artist: correlation fields
Calculated field
Chart 6
Audio columns, lean_score, Lean within artist, Artist
Duration group
Calculated field
Chart 7
duration_min
Selected song, Selected artist
Parameter
Chart 8
Set by clicks
Is selected song, Same artist, Song role
Calculated field
Chart 8
Uri, Artist, the two parameters
If time is short before the 7 October review, build Charts 1, 3 and 5 first. They are the quickest and carry the backbone of the story.
Chart 1: Cross-platform quadrant
The result is a log-scale scatter of 17,380 songs, split at the dataset's own top-quartile cut-offs: 134.7M Spotify streams and 65.5M YouTube views. About 1 in 5 songs are a hit on only one platform. A small tier table sits beside it.
Sheet "1 Quadrant" (data source: Songs)
1. Create three calculated fields:
    ◦ Spotify hit line = {FIXED : MIN(IF [spotify_popular] THEN [Stream] END)}. This is the smallest stream count in Spotify's top tier.
    ◦ YouTube hit line = {FIXED : MIN(IF [youtube_popular] THEN [Views] END)}
    ◦ Quadrant = IF [spotify_popular] AND [youtube_popular] THEN "Hit on both" ELSEIF [spotify_popular] THEN "Spotify-only hit" ELSEIF [youtube_popular] THEN "YouTube-only hit" ELSE "Neither" END
2. Drag Stream to Columns and Views to Rows. Drag Uri to Detail so each song is its own dot.
3. Right-click each axis > Edit Axis and tick Logarithmic. Title them "Spotify streams (log scale)" and "YouTube views (log scale)".
4. Drag platform_lean to Filters and untick Null. This drops songs with missing streams or views and songs whose YouTube video is shared with another track.
5. Set the Marks type to Circle and the size to small. Drag platform_lean to Color, then set Opacity to about 40% and Border to None.
6. Drag Spotify hit line and YouTube hit line to Detail and set both to MIN. They hold one value each, so they don't split the dots.
7. From the Analytics pane, drag Reference Line onto Table for the Stream axis. Set Value to MIN(Spotify hit line), Label to Custom "Top 25% on Spotify" and the line to dashed grey. Repeat on the Views axis with MIN(YouTube hit line) and "Top 25% on YouTube".
8. Label the quadrants: right-click inside each one > Annotate > Area. Use "Hit on both: 2,767" (top right), "YouTube-only hit: 1,629" (top left) and "Spotify-only hit: 1,690" (bottom right). To confirm the counts, make a scratch sheet with Quadrant on Rows, Uri on Text as Count (Distinct) and the same platform_lean filter.
9. Drag Track, Artist, video_type and Quadrant to Tooltip and arrange them with the track and artist on the first line.
10. Make the sheet title the finding, for example "1 in 5 songs is a hit on only one platform."
Sheet "1b Tier table" (data source: Songs)
1. Drag spotify_tier to Rows and youtube_tier to Columns.
2. Drag the count field to Color and to Label. It is called spotify_youtube_clean_v2.csv (Count), or Number of Records in older versions. Set the Marks type to Square to get a highlight table.
3. Drag both tier fields to Filters and untick Null.
4. Right-click spotify_tier on Rows > Sort > Alphabetic, Descending, so Q4 (Top) is on top.
5. On both the Color and Label count pills, choose Quick Table Calculation > Percent of Total, then Compute Using > Table (across). Each Spotify tier row now adds up to 100%. The top-right cell should read 62%.
Chart 2: Ridgeline distributions by tier
Tableau has no ridgeline chart, so this draws a smoothed histogram for each tier, one row per tier. A dropdown switches the audio feature. Spotify and YouTube are two sheets placed side by side.
Sheet "2a Ridgelines Spotify" (data source: Songs)
Part A: create the dropdown and fields. Click Songs at the top of the Data pane first, so everything is created there.
1. Parameter Select feature. Right-click empty space in the Data pane > Create Parameter. Name it "Select feature", set Data type to String and Allowable values to List, and type these seven values exactly as written: Danceability, Energy, Loudness, Valence, Acousticness, Tempo, duration_min. Set the current value to Loudness and click OK. Then right-click it under Parameters > Show Parameter.
2. Feature value picks the column that matches the dropdown: CASE [Select feature] WHEN "Danceability" THEN [Danceability] WHEN "Energy" THEN [Energy] WHEN "Loudness" THEN [Loudness] WHEN "Valence" THEN [Valence] WHEN "Acousticness" THEN [Acousticness] WHEN "Tempo" THEN [Tempo] WHEN "duration_min" THEN [duration_min] END
3. Bin width = CASE [Select feature] WHEN "Loudness" THEN 1 WHEN "Tempo" THEN 5 WHEN "duration_min" THEN 0.25 ELSE 0.025 END. Each feature gets a sensible bin size in its own units.
4. Value bin = FLOOR([Feature value] / [Bin width]) * [Bin width]. After clicking OK, right-click Value bin in the Data pane > Convert to Dimension. It moves up into the dimensions section and keeps its green icon. This step matters: if Value bin stays a measure, the chart collapses to one point per tier.
5. Typical range = [Feature value] >= {FIXED : PERCENTILE([Feature value], 0.01)} AND [Feature value] <= {FIXED : PERCENTILE([Feature value], 0.99)}. This trims the extreme 1% at each end so long tails don't squash the curves.
6. Share of tier = COUNT([Uri]) / MIN({EXCLUDE [Value bin] : COUNT([Uri])}). This divides the songs in each bin by all the songs in the same tier, so each tier's curve adds up to 100% without any table-calculation settings.
7. Share (smoothed) = WINDOW_AVG([Share of tier], -1, 1). This averages each bin with its two neighbours so the curve looks smooth.
Part B: build the chart.
1. Drag Typical range and Include song to Filters and keep True for each. Drag spotify_tier to Filters and untick Null.
2. Drag Value bin to Columns. The pill should read Value bin. If it reads SUM(Value bin), right-click the pill and choose Dimension.
3. Drag spotify_tier to Rows, then drag Share (smoothed) to Rows to the right of it. You should see four rows, one per tier, each with a line across.
4. Right-click the Share (smoothed) pill on Rows > Compute Using > Value bin. This makes the smoothing run along the bins within each tier.
5. On the Marks card, open the dropdown that says Automatic and choose Area. Drag spotify_tier to Color, then click Color > Edit Colors, choose a sequential palette such as Green, click Assign Palette and OK. Q4 (Top) should be the darkest.
6. Right-click spotify_tier on Rows > Sort. Set Sort By to Alphabetic and Sort Order to Descending, so the top tier sits at the top.
7. Tidy it into a ridgeline:
    ◦ Hide the left axes. Each row has a vertical axis on the left labelled Share (smoothed). Right-click any one of them and untick Show Header; all four disappear.
    ◦ Fit the rows to the sheet. In the toolbar at the top, find the dropdown that says Standard and change it to Entire View. The four rows now share the sheet's height, and on a dashboard they shrink to fit the box you give them.
    ◦ Remove grid lines. In the top menu, choose Format > Lines. A Format Lines panel replaces the Data pane on the left. On its Sheet tab, set Grid Lines and Zero Lines to None. Close the panel with the × at its top to get the Data pane back.
8. Rename the bottom axis: right-click the horizontal axis labelled Value bin > Edit Axis. In the Title box, replace "Value bin" with "Feature value" and close the dialog.
9. Set the sheet title: if no title shows above the chart, choose Worksheet > Show Title. Double-click the title and delete the text in the Edit Title box. Type "Spotify tiers: ", then click Insert at the top right of the box and choose Parameters.Select feature. Click OK. The title now changes with the dropdown.
Sheet "2b Ridgelines YouTube"
1. Duplicate 2a and replace spotify_tier with youtube_tier on Filters, Rows and Color. Change the title to "YouTube tiers:".
2. Nothing else is needed. The parameter is shared, so the one "Select feature" dropdown switches both sheets.
What to look for: with Loudness selected, the curves move right across YouTube tiers (median −7.6 to −5.8 dB) more than across Spotify tiers (−7.0 to −6.1 dB).
Sheets "2c Flags Spotify" and "2d Flags YouTube" (data source: Songs)
Instrumentalness, speechiness and liveness are left out of the dropdown because most values sit near zero, so their curves would just be spikes. Show them as shares of flagged songs instead.
1. Create three calculated fields: Instrumental share = AVG(INT([is_instrumental])), Spoken-word share = AVG(INT([is_spoken_word])) and Live share = AVG(INT([is_live])).
2. Drag spotify_tier to Columns and filter out Null. Drag Instrumental share to Rows. Then drag Spoken-word share from the Data pane onto that same axis, dropping it when a double green ruler appears, and do the same with Live share. Tableau switches to Measure Values with only these three measures, so there is nothing to remove.
3. Drag Measure Names to Color and to Columns (after spotify_tier) to get grouped bars. Format the axis as a percentage.
4. Duplicate the sheet and swap spotify_tier for youtube_tier. Place both under the ridgelines on the story point.
#
Act
Contents
Caption
1
Do the platforms agree?
D1 Agreement
1 in 5 songs is a hit on only one platform
2
Is there a platform sound?
D2 Ridgelines
Popularity tracks loudness more steeply on YouTube than on Spotify