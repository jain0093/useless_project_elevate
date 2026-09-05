$ErrorActionPreference = "Stop"

$ffmpeg = "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe"
$ffprobe = "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffprobe.exe"
$source = "C:\Users\LENOVO\Downloads\Malayalam Troll dialogues free download  Top 10  Malayalam troll sounds  Malayalam movie dialogues_MP3.mp3.mpeg"

$destSourceDir = "public\audio\source"
if (-not (Test-Path $destSourceDir)) {
    New-Item -ItemType Directory -Path $destSourceDir -Force
}
Copy-Item -LiteralPath $source -Destination "$destSourceDir\master_meme_audio_new.mpeg" -Force

$memesDir = "public\audio\memes"
Write-Host "Cleaning existing meme clips in $memesDir..."
Get-ChildItem -Path $memesDir -Filter "meme-*.mp3" | Remove-Item -Force
Get-ChildItem -Path $memesDir -Filter "temp_*.mp3" | Remove-Item -Force

Write-Host "Splitting master audio into 6-second segments..."
& $ffmpeg -y -i "$source" -f segment -segment_time 6 -c:a libmp3lame -b:a 192k -ar 44100 -ac 2 "$memesDir\temp_%03d.mp3"

$tempFiles = Get-ChildItem -Path $memesDir -Filter "temp_*.mp3" | Sort-Object Name
Write-Host "Generated $($tempFiles.Count) segment files."

$counter = 1
foreach ($f in $tempFiles) {
    $newName = "meme-{0:D3}.mp3" -f $counter
    $destPath = Join-Path $memesDir $newName
    Move-Item -LiteralPath $f.FullName -Destination $destPath -Force
    $counter++
}

# Check the last clip duration and pad if needed
$finalClipCount = $counter - 1
$lastClip = Join-Path $memesDir ("meme-{0:D3}.mp3" -f $finalClipCount)

$lastDurStr = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $lastClip
$lastDur = [double]$lastDurStr
Write-Host "Last clip ($lastClip) raw duration: $lastDur seconds"

if ($lastDur -lt 5.8) {
    Write-Host "Padding last clip with silence to 6.0 seconds..."
    $paddedTemp = Join-Path $memesDir "padded_last.mp3"
    & $ffmpeg -y -i $lastClip -af "apad=whole_dur=6" -c:a libmp3lame -b:a 192k -ar 44100 -ac 2 $paddedTemp
    Move-Item -LiteralPath $paddedTemp -Destination $lastClip -Force
}

Write-Host "`n=== Verifying All Generated Clips ==="
$allClips = Get-ChildItem -Path $memesDir -Filter "meme-*.mp3" | Sort-Object Name
Write-Host "Total clips: $($allClips.Count)"
foreach ($clip in $allClips) {
    $dur = & $ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $clip.FullName
    Write-Host ("{0} : {1:F2}s" -f $clip.Name, [double]$dur)
}
