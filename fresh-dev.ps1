# PowerShell script to clean build cache and restart dev server
# Usage: .\fresh-dev.ps1

Write-Host "🧹 Cleaning build cache..." -ForegroundColor Cyan
Remove-Item -Path ".\.next" -Recurse -Force -ErrorAction SilentlyContinue
Write-Host "✅ Build cache cleared" -ForegroundColor Green

Write-Host "`n🚀 Starting development server...`n" -ForegroundColor Green
npm run dev
