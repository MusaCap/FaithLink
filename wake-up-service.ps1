# FaithLink360 - Wake Up Render Free Tier Service
# Render free tier services sleep after 15 minutes of inactivity
# This script repeatedly pings the service to wake it up

Write-Host "🔄 Waking up FaithLink360 Backend (Render Free Tier)" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

$backendUrl = "https://faithlink-ntgg.onrender.com"
$maxAttempts = 20
$waitSeconds = 15

Write-Host "🕒 Cold Start Info:" -ForegroundColor Yellow
Write-Host "   - Render free tier sleeps after 15min inactivity" -ForegroundColor White
Write-Host "   - Cold start can take 2-5 minutes to wake up" -ForegroundColor White
Write-Host "   - Service needs to rebuild and reconnect to database" -ForegroundColor White
Write-Host ""

for ($i = 1; $i -le $maxAttempts; $i++) {
    Write-Host "🔄 Attempt $i/$maxAttempts - Pinging service..." -ForegroundColor Yellow
    
    try {
        $response = Invoke-RestMethod -Uri "$backendUrl/health" -TimeoutSec 30 -ErrorAction Stop
        Write-Host "🎉 SUCCESS! Service is awake and responding!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Response:" -ForegroundColor Cyan
        Write-Host "   Status: $($response.status)" -ForegroundColor White
        Write-Host "   Database: $($response.database)" -ForegroundColor White
        Write-Host "   Timestamp: $($response.timestamp)" -ForegroundColor White
        if ($response.data) {
            Write-Host "   Members: $($response.data.members)" -ForegroundColor White
        }
        Write-Host ""
        Write-Host "✅ Backend URL: $backendUrl" -ForegroundColor Green
        Write-Host "✅ Frontend URL: https://subtle-semifreddo-ed7b4b.netlify.app" -ForegroundColor Green
        exit 0
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode
        Write-Host "   ❌ Status: $statusCode" -ForegroundColor Red
        
        if ($statusCode -eq "ServiceUnavailable") {
            Write-Host "      (503 = Service still starting up)" -ForegroundColor Gray
        }
        elseif ($statusCode -eq "InternalServerError") {
            Write-Host "      (500 = Service awake but has errors)" -ForegroundColor Gray
        }
    }
    
    if ($i -lt $maxAttempts) {
        Write-Host "   ⏱️ Waiting $waitSeconds seconds before next attempt..." -ForegroundColor Gray
        Start-Sleep -Seconds $waitSeconds
    }
}

Write-Host ""
Write-Host "⚠️  Service did not wake up after $maxAttempts attempts" -ForegroundColor Yellow
Write-Host ""
Write-Host "🔧 Next Steps:" -ForegroundColor Green
Write-Host "1. Check Render dashboard for deployment status" -ForegroundColor White
Write-Host "2. Look at build logs for errors" -ForegroundColor White
Write-Host "3. Try manual redeploy if needed" -ForegroundColor White
Write-Host "4. Consider upgrading to paid tier for instant wake-up" -ForegroundColor White
