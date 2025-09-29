# FaithLink360 Platform Startup Script
Write-Host "Starting FaithLink360 Platform..." -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Green

# Kill any existing node processes
Write-Host "Cleaning up existing processes..." -ForegroundColor Yellow
try {
    $nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
    if ($nodeProcesses) {
        Write-Host "Found $($nodeProcesses.Count) node processes - terminating..." -ForegroundColor Yellow
        $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    } else {
        Write-Host "No existing node processes found" -ForegroundColor Green
    }
} catch {
    Write-Host "Process cleanup completed" -ForegroundColor Yellow
}

# Start Backend Server
Write-Host "Starting Backend Server (Port 3000)..." -ForegroundColor Cyan
$backendJob = Start-Job -ScriptBlock {
    Set-Location 'c:\Users\allen\Downloads\FaithLink-main\FaithLink-main\src\backend'
    node server-production.js
} -Name "BackendServer"

# Wait for backend to start
Start-Sleep -Seconds 5

# Test backend
Write-Host "Testing backend connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Backend Server: Online" -ForegroundColor Green
    } else {
        Write-Host "Backend Server: Responding but status $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Backend Server: Not responding" -ForegroundColor Red
}

# Start Frontend Server
Write-Host "Starting Frontend Server..." -ForegroundColor Cyan
$frontendJob = Start-Job -ScriptBlock {
    Set-Location "c:\Users\allen\Downloads\FaithLink-main\FaithLink-main\src\frontend"
    npm run dev 2>&1
}

# Wait for frontend to start
Start-Sleep -Seconds 8

# Test frontend
Write-Host "Testing frontend connectivity..." -ForegroundColor Yellow
$frontendPort = $null
try {
    # Try port 3001 first (since backend is on 3000)
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -UseBasicParsing -TimeoutSec 3 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "Frontend Server: Online at port 3001" -ForegroundColor Green
        $frontendPort = 3001
    }
} catch {
    # Try port 3000 if 3001 failed (but this conflicts with backend)
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 3
        if ($response.StatusCode -eq 200) {
            Write-Host "Frontend Server: Online at port 3000 (WARNING: Conflicts with backend)" -ForegroundColor Yellow
            $frontendPort = 3000
        }
    } catch {
        Write-Host "Frontend Server: Not responding on ports 3000 or 3001" -ForegroundColor Red
    }
}

Write-Host "" 
Write-Host "FaithLink360 Platform Status" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "Backend:  http://localhost:3000" -ForegroundColor Cyan
if ($frontendPort) {
    Write-Host "Frontend: http://localhost:$frontendPort" -ForegroundColor Cyan
    Write-Host "Login:    admin@faithlink360.com / admin123" -ForegroundColor Yellow
} else {
    Write-Host "Frontend: Starting up..." -ForegroundColor Yellow
}
Write-Host "===============================" -ForegroundColor Green

# Test API integration
Write-Host "Testing API Integration..." -ForegroundColor Cyan
try {
    $loginData = @{
        email = "admin@faithlink360.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "Authentication: Working" -ForegroundColor Green
        Write-Host "Platform Ready for Use!" -ForegroundColor Green
    }
} catch {
    Write-Host "Authentication test failed - backend may still be starting" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor White
Write-Host "1. Access frontend at http://localhost:$frontendPort" -ForegroundColor White
Write-Host "2. Login with admin@faithlink360.com / admin123" -ForegroundColor White
Write-Host "3. Explore the church management platform" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop both servers" -ForegroundColor Red

# Keep script running
try {
    while ($true) {
        Start-Sleep -Seconds 30
        # Could add periodic health checks here
    }
} finally {
    Write-Host "Stopping servers..." -ForegroundColor Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
}
