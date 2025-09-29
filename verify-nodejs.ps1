# Verify Node.js Installation Script

Write-Host "[CHECK] Verifying Node.js Installation..." -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Test Node.js
try {
    $nodeVersion = node --version
    Write-Host "[SUCCESS] Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Node.js not found in PATH" -ForegroundColor Red
    Write-Host "[INFO] Please install Node.js from https://nodejs.org/" -ForegroundColor Yellow
    exit 1
}

# Test npm
try {
    $npmVersion = npm --version
    Write-Host "[SUCCESS] npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] npm not found" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[SUCCESS] Node.js installation verified!" -ForegroundColor Green
Write-Host "[INFO] You can now run the boot script: .\boot-servers-clean.ps1" -ForegroundColor Cyan
