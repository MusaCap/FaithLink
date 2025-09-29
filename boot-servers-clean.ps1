# FaithLink360 Server Boot Script (Clean Version)
# Launches both frontend and backend servers with robust error handling
# No emoji characters - PowerShell compatible

Write-Host ""
Write-Host "[BOOT] FaithLink360 Server Boot Script" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Function to test if port is in use
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    } catch {
        return $false
    }
}

# Function to wait for port to be available
function Wait-ForPort {
    param([int]$Port, [string]$Name, [int]$TimeoutSeconds = 30)
    
    Write-Host "[WAIT] Waiting for $Name to start on port $Port..." -ForegroundColor Yellow
    
    $elapsed = 0
    while ($elapsed -lt $TimeoutSeconds) {
        if (Test-Port -Port $Port) {
            Write-Host "[SUCCESS] $Name is running on port $Port" -ForegroundColor Green
            return $true
        }
        Start-Sleep -Seconds 1
        $elapsed++
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "[ERROR] Timeout waiting for $Name on port $Port" -ForegroundColor Red
    return $false
}

# Step 1: Clean up existing processes
Write-Host "[STEP 1] Cleaning up existing processes..." -ForegroundColor Blue

# Kill all node processes
try {
    Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "[SUCCESS] Killed existing node processes" -ForegroundColor Green
} catch {
    Write-Host "[INFO] No existing node processes found" -ForegroundColor Gray
}

# Kill processes on specific ports
$ports = @(3000, 3001, 5000)
foreach ($port in $ports) {
    $connections = netstat -ano | Select-String ":$port "
    if ($connections) {
        foreach ($conn in $connections) {
            $pid = ($conn.ToString() -split '\s+')[-1]
            if ($pid -match '^\d+$') {
                try {
                    taskkill /F /PID $pid 2>$null | Out-Null
                    Write-Host "[SUCCESS] Killed process $pid on port $port" -ForegroundColor Green
                } catch {
                    Write-Host "[WARNING] Could not kill process $pid" -ForegroundColor Yellow
                }
            }
        }
    }
}

Write-Host "[SUCCESS] Port cleanup completed" -ForegroundColor Green
Write-Host ""

# Step 2: Start Backend Server
Write-Host "[STEP 2] Starting Backend Server..." -ForegroundColor Blue

$backendPath = "c:\Users\allen\Downloads\FaithLink-main\FaithLink-main\src\backend"

if (-not (Test-Path "$backendPath\simple-server.js")) {
    Write-Host "[ERROR] Backend server file not found at $backendPath\simple-server.js" -ForegroundColor Red
    Write-Host "[INFO] Current directory contents:" -ForegroundColor Gray
    Get-ChildItem $backendPath -ErrorAction SilentlyContinue | Format-Table Name -AutoSize
    exit 1
}

try {
    # Start backend in new PowerShell window
    $backendProcess = Start-Process powershell -ArgumentList @(
        "-Command",
        "cd '$backendPath'; Write-Host '[BACKEND] Starting Backend Server...' -ForegroundColor Blue; node simple-server.js; Write-Host '[BACKEND] Press Enter to close' -ForegroundColor Gray; Read-Host"
    ) -WindowStyle Normal -PassThru
    
    Write-Host "[SUCCESS] Backend process started (PID: $($backendProcess.Id))" -ForegroundColor Green
    
    # Wait for backend to start
    if (Wait-ForPort -Port 5000 -Name "Backend API" -TimeoutSeconds 15) {
        Write-Host "[SUCCESS] Backend server is ready!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Backend server failed to start properly" -ForegroundColor Red
        Write-Host "[INFO] Check the backend console window for error details" -ForegroundColor Yellow
        exit 1
    }
    
} catch {
    Write-Host "[ERROR] Failed to start backend server: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 3: Start Frontend Server
Write-Host "[STEP 3] Starting Frontend Server..." -ForegroundColor Blue

$frontendPath = "c:\Users\allen\Downloads\FaithLink-main\FaithLink-main\src\frontend"

if (-not (Test-Path "$frontendPath\package.json")) {
    Write-Host "[ERROR] Frontend package.json not found at $frontendPath" -ForegroundColor Red
    Write-Host "[INFO] Current directory contents:" -ForegroundColor Gray
    Get-ChildItem $frontendPath -ErrorAction SilentlyContinue | Format-Table Name -AutoSize
    exit 1
}

try {
    # Start frontend in new PowerShell window
    $frontendProcess = Start-Process powershell -ArgumentList @(
        "-Command",
        "cd '$frontendPath'; Write-Host '[FRONTEND] Starting Frontend Server...' -ForegroundColor Blue; npm run dev; Write-Host '[FRONTEND] Press Enter to close' -ForegroundColor Gray; Read-Host"
    ) -WindowStyle Normal -PassThru
    
    Write-Host "[SUCCESS] Frontend process started (PID: $($frontendProcess.Id))" -ForegroundColor Green
    
    # Wait for frontend to start (try both 3000 and 3001)
    $frontendReady = $false
    $frontendPort = 0
    
    Start-Sleep -Seconds 5  # Give Next.js time to compile
    
    foreach ($port in @(3000, 3001)) {
        if (Test-Port -Port $port) {
            Write-Host "[SUCCESS] Frontend server is running on port $port" -ForegroundColor Green
            $frontendPort = $port
            $frontendReady = $true
            break
        }
    }
    
    if (-not $frontendReady) {
        Write-Host "[WAIT] Frontend still starting, waiting longer..." -ForegroundColor Yellow
        if (Wait-ForPort -Port 3000 -Name "Frontend" -TimeoutSeconds 20) {
            $frontendPort = 3000
            $frontendReady = $true
        } elseif (Wait-ForPort -Port 3001 -Name "Frontend" -TimeoutSeconds 5) {
            $frontendPort = 3001
            $frontendReady = $true
        }
    }
    
    if ($frontendReady) {
        Write-Host "[SUCCESS] Frontend server is ready!" -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Frontend server failed to start properly" -ForegroundColor Red
        Write-Host "[INFO] Check the frontend console window for error details" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "[ERROR] Failed to start frontend server: $($_.Exception.Message)" -ForegroundColor Red
    $frontendReady = $false
}

Write-Host ""

# Step 4: Test API Connectivity
Write-Host "[STEP 4] Testing API Connectivity..." -ForegroundColor Blue

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:5000/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[SUCCESS] Backend API health check passed (Status: $($healthResponse.StatusCode))" -ForegroundColor Green
    
    $groupsResponse = Invoke-WebRequest -Uri "http://localhost:5000/api/groups" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "[SUCCESS] Groups API responding (Status: $($groupsResponse.StatusCode))" -ForegroundColor Green
    
} catch {
    Write-Host "[ERROR] API connectivity test failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Step 5: Summary
Write-Host "[SUMMARY] Server Status Summary" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

if (Test-Port -Port 5000) {
    Write-Host "[SUCCESS] Backend API: http://localhost:5000" -ForegroundColor Green
    Write-Host "          Health Check: http://localhost:5000/health" -ForegroundColor Gray
    Write-Host "          Groups API: http://localhost:5000/api/groups" -ForegroundColor Gray
} else {
    Write-Host "[ERROR] Backend API: Not running" -ForegroundColor Red
}

$frontendUrl = ""
if (Test-Port -Port 3000) {
    $frontendUrl = "http://localhost:3000"
    Write-Host "[SUCCESS] Frontend: $frontendUrl" -ForegroundColor Green
} elseif (Test-Port -Port 3001) {
    $frontendUrl = "http://localhost:3001"
    Write-Host "[SUCCESS] Frontend: $frontendUrl" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Frontend: Not running" -ForegroundColor Red
}

Write-Host ""

if ($frontendUrl -and (Test-Port -Port 5000)) {
    Write-Host "[SUCCESS] FaithLink360 is ready!" -ForegroundColor Green
    Write-Host "[INFO] Open your browser to: $frontendUrl" -ForegroundColor Cyan
    Write-Host "[INFO] Backend API available at: http://localhost:5000" -ForegroundColor Cyan
    
    # Test if we can actually access the frontend
    try {
        $frontendTest = Invoke-WebRequest -Uri $frontendUrl -TimeoutSec 5 -ErrorAction Stop
        Write-Host "[SUCCESS] Frontend is accessible (Status: $($frontendTest.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "[WARNING] Frontend may not be fully ready yet: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[WARNING] Some services failed to start. Check the console windows for details." -ForegroundColor Yellow
}

# Display running processes
Write-Host ""
Write-Host "[INFO] Current Node.js processes:" -ForegroundColor Gray
Get-Process | Where-Object {$_.ProcessName -like "*node*"} | Format-Table Id, ProcessName, StartTime -AutoSize

Write-Host ""
Write-Host "[INFO] Current port usage:" -ForegroundColor Gray
netstat -ano | Select-String ":3000|:3001|:5000" | ForEach-Object { Write-Host "         $_" -ForegroundColor Gray }

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
