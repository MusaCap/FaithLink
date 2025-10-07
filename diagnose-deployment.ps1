# FaithLink360 Production Deployment Diagnostic Script

Write-Host "🔍 FaithLink360 Deployment Diagnostics" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

$backendUrl = "https://faithlink-ntgg.onrender.com"

# Test 1: Basic connectivity
Write-Host "🌐 Testing basic connectivity..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $backendUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Basic connectivity: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Connectivity failed: $($_.Exception.Message)" -ForegroundColor Red
    $statusCode = $_.Exception.Response.StatusCode
    Write-Host "   HTTP Status: $statusCode" -ForegroundColor Yellow
    
    if ($statusCode -eq "ServiceUnavailable") {
        Write-Host "   💡 503 Service Unavailable usually means:" -ForegroundColor Cyan
        Write-Host "      - Deployment still in progress" -ForegroundColor White
        Write-Host "      - Build failed and service crashed" -ForegroundColor White
        Write-Host "      - Cold start delay (Render free tier)" -ForegroundColor White
    }
}

Write-Host ""

# Test 2: Extended timeout test
Write-Host "⏱️  Testing with extended timeout (60s)..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$backendUrl/health" -TimeoutSec 60 -ErrorAction Stop
    Write-Host "✅ Extended timeout SUCCESS!" -ForegroundColor Green
    Write-Host "   Response: $($response | ConvertTo-Json -Compress)" -ForegroundColor White
} catch {
    Write-Host "❌ Extended timeout failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Alternative endpoints
$endpoints = @("/health", "/api/info", "/api/members", "/")
foreach ($endpoint in $endpoints) {
    Write-Host "🔗 Testing endpoint: $endpoint" -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "$backendUrl$endpoint" -TimeoutSec 15 -ErrorAction Stop
        Write-Host "   ✅ $endpoint : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $endpoint : $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 TROUBLESHOOTING NEXT STEPS:" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "If all endpoints return 503:" -ForegroundColor Yellow
Write-Host "1. 🕒 Wait 2-3 more minutes for deployment to complete" -ForegroundColor White
Write-Host "2. 🔍 Check Render dashboard for build logs" -ForegroundColor White
Write-Host "3. 🔄 Try manual redeploy in Render dashboard" -ForegroundColor White
Write-Host ""
Write-Host "If deployment keeps failing:" -ForegroundColor Yellow
Write-Host "1. 🗄️ Create simpler server without Prisma temporarily" -ForegroundColor White
Write-Host "2. 🔧 Test with basic Express.js hello world" -ForegroundColor White
Write-Host "3. 📊 Add more detailed logging to identify issue" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs:" -ForegroundColor Green
Write-Host "Backend: $backendUrl" -ForegroundColor White
Write-Host "Frontend: https://subtle-semifreddo-ed7b4b.netlify.app" -ForegroundColor White
