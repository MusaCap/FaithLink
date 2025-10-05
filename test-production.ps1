# FaithLink360 Production Backend Test Script
# Tests the deployed PostgreSQL backend on Render

Write-Host "🚀 Testing FaithLink360 Production Backend" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green
Write-Host ""

$backendUrl = "https://faithlink-ntgg.onrender.com"

# Test 1: Health Check
Write-Host "🏥 Testing Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "$backendUrl/health" -Method GET -TimeoutSec 30
    Write-Host "✅ Health Check Passed!" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)" -ForegroundColor White
    Write-Host "   Database: $($healthResponse.database)" -ForegroundColor White
    Write-Host "   Members: $($healthResponse.data.members)" -ForegroundColor White
    Write-Host "   Churches: $($healthResponse.data.churches)" -ForegroundColor White
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Members API
Write-Host "👥 Testing Members API..." -ForegroundColor Yellow
try {
    $membersResponse = Invoke-RestMethod -Uri "$backendUrl/api/members" -Method GET -TimeoutSec 30
    Write-Host "✅ Members API Passed!" -ForegroundColor Green
    Write-Host "   Members Count: $($membersResponse.count)" -ForegroundColor White
    if ($membersResponse.members.Length -gt 0) {
        Write-Host "   Sample Member: $($membersResponse.members[0].firstName) $($membersResponse.members[0].lastName)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Members API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Prayer Requests API
Write-Host "🙏 Testing Prayer Requests API..." -ForegroundColor Yellow
try {
    $prayerResponse = Invoke-RestMethod -Uri "$backendUrl/api/care/prayer-requests" -Method GET -TimeoutSec 30
    Write-Host "✅ Prayer Requests API Passed!" -ForegroundColor Green
    Write-Host "   Prayer Requests Count: $($prayerResponse.count)" -ForegroundColor White
} catch {
    Write-Host "❌ Prayer Requests API Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Production Backend Test Complete!" -ForegroundColor Green
Write-Host "Backend URL: $backendUrl" -ForegroundColor White
Write-Host "Frontend URL: https://subtle-semifreddo-ed7b4b.netlify.app" -ForegroundColor White
