# PowerShell script to test FaithLink360 backend endpoints
Write-Host "🧪 Testing FaithLink360 Backend API Endpoints" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:8000"
$endpoints = @(
    @{ Path = "/health"; Name = "Health Check" },
    @{ Path = "/api/test"; Name = "Test API" },
    @{ Path = "/api/members"; Name = "Members API" },
    @{ Path = "/api/groups"; Name = "Groups API" },
    @{ Path = "/api/events"; Name = "Events API" }
)

$results = @()

foreach ($endpoint in $endpoints) {
    $url = "$baseUrl$($endpoint.Path)"
    Write-Host "`n🔍 Testing: $($endpoint.Name)" -ForegroundColor Yellow
    Write-Host "   URL: $url" -ForegroundColor Gray
    
    try {
        $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 10
        $statusCode = $response.StatusCode
        $content = $response.Content | ConvertFrom-Json
        
        Write-Host "   ✅ Status: $statusCode" -ForegroundColor Green
        Write-Host "   📄 Response: $($content | ConvertTo-Json -Compress)" -ForegroundColor Gray
        
        $results += @{
            Endpoint = $endpoint.Name
            Status = "Success"
            StatusCode = $statusCode
            Response = $content
        }
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        $results += @{
            Endpoint = $endpoint.Name
            Status = "Failed"
            Error = $_.Exception.Message
        }
    }
}

# Summary
Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "======================" -ForegroundColor Cyan

$successCount = ($results | Where-Object { $_.Status -eq "Success" }).Count
$totalCount = $results.Count

Write-Host "✅ Successful: $successCount/$totalCount" -ForegroundColor Green
Write-Host "❌ Failed: $($totalCount - $successCount)/$totalCount" -ForegroundColor Red

if ($successCount -eq $totalCount) {
    Write-Host "`n🎉 All endpoints are working!" -ForegroundColor Green
} elseif ($successCount -gt 0) {
    Write-Host "`n⚠️  Some endpoints are working, check failed ones" -ForegroundColor Yellow
} else {
    Write-Host "`n💥 No endpoints are accessible" -ForegroundColor Red
}
