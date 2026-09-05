# 🔊 AVASTHA — REACTION AUDIO DIRECTORY

This directory houses short (1–5s) Malayalam meme-style reaction audio clips.

## Category Folders:
- `/public/audio/sitting/` — Audio reactions for motionless/sitting victims (e.g. "Ivide anangathe irunnaal mathi", "Entho oru shubhasoojana...").
- `/public/audio/standing/` — Audio reactions for standing victims (e.g. "Avan enthaada angane nilkkunne?").
- `/public/audio/walking/` — Audio reactions for walking victims (e.g. "Evidekko povaanu...").
- `/public/audio/phone/` — Audio reactions for phone victims (e.g. "Phone has taken full custody", "Enthokke aada ivide nadakkunne?").
- `/public/audio/laptop/` — Audio reactions for laptop victims (e.g. "Scene contra!", "Assignment submission deadline...").
- `/public/audio/group/` — Audio reactions for multiple victims/groups.
- `/public/audio/idle/` — Audio reactions for pure zero-purpose idle behavior.
- `/public/audio/unclear/` — Audio reactions for unclear or occluded activity.

## Rules:
- Audio clips should be between 1.0 and 5.0 seconds.
- Format: `.mp3`, `.wav`, or `.webm`.
- Zero microphone input is ever used; audio is strictly playback.
- If an audio file is missing or blocked by browser autoplay policies, the application automatically uses the Web Audio API synthesizer fallback and provides a prominent `[ PLAY REACTION ]` button.
