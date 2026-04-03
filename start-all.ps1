# start-all.ps1
# Starts the Language Academy platform (4 services only)

Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host "    STARTING LANGUAGE ACADEMY PLATFORM" -ForegroundColor Cyan
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host ""

$baseDir = $PSScriptRoot

$components = @(
    @{ Name = "Backend API";     Dir = "backend";        Cmd = "node server.js"; Port = 5000 },
    @{ Name = "Website";         Dir = "website";        Cmd = "npm run dev";    Port = 3001 },
    @{ Name = "Admin Portal";    Dir = "admin-portal";   Cmd = "npm run dev";    Port = 5174 },
    @{ Name = "Student Portal";  Dir = "student-portal"; Cmd = "npm run dev";    Port = 5173 },
    @{ Name = "Gateway";         Dir = "gateway";        Cmd = "node server.js"; Port = 3000 }
)

foreach ($comp in $components) {
    $fullPath = Join-Path $baseDir $comp.Dir
    if (Test-Path $fullPath) {
        Write-Host "  [+] Starting $($comp.Name) on port $($comp.Port)..." -ForegroundColor Green
        $title = $comp.Name
        $cmd = $comp.Cmd
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$fullPath'; `$host.UI.RawUI.WindowTitle = '$title'; $cmd" -WindowStyle Minimized
        Start-Sleep -Seconds 2
    } else {
        Write-Host "  [!] SKIP: $fullPath not found" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host "    ALL SERVICES LAUNCHED" -ForegroundColor Cyan
Write-Host "  ========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Website  : http://localhost:3000" -ForegroundColor White
Write-Host "  Admin    : http://localhost:3000/admin" -ForegroundColor White
Write-Host "  Student  : http://localhost:3000/student" -ForegroundColor White
Write-Host ""
