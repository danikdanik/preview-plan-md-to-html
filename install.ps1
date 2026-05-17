$repo = "https://raw.githubusercontent.com/danikdanik/preview-plan-md-to-html/master"
$dest = "$env:USERPROFILE\.claude\skills\preview-plan-md-to-html"

Write-Host "Installing preview-plan-md-to-html..."

New-Item -ItemType Directory -Force -Path "$dest\scripts" | Out-Null

Invoke-WebRequest -Uri "$repo/SKILL.md"               -OutFile "$dest\SKILL.md"
Invoke-WebRequest -Uri "$repo/scripts/postprocess.js" -OutFile "$dest\scripts\postprocess.js"

Write-Host "Installed to $dest"
Write-Host "Restart Claude Code to pick up the new skill."
