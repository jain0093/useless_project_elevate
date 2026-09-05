$ffmpeg = "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe"
$ffprobe = "C:\Users\LENOVO\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffprobe.exe"
$source = "C:\Users\LENOVO\Downloads\Malayalam Troll dialogues free download  Top 10  Malayalam troll sounds  Malayalam movie dialogues_MP3.mp3.mpeg"

Write-Host "=== Master Audio Info ==="
Get-Item -LiteralPath $source | Format-List Name, Length, LastWriteTime
& $ffprobe -v error -show_entries format=duration,format_name,bit_rate -of default=noprint_wrappers=1 "$source"
