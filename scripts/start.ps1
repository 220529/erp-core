# 启动 ERP Core 服务（会先清理端口）
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Mode = "dev",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 3009
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  ERP Core 服务启动脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 清理端口
Write-Host "[1/3] 检查并清理端口 $Port..." -ForegroundColor Yellow
& "$PSScriptRoot\kill-port.ps1" -Port $Port
Write-Host ""

# 2. 切换到项目目录
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot
Write-Host "[2/3] 当前目录: $projectRoot" -ForegroundColor Green
Write-Host ""

# 3. 启动服务
Write-Host "[3/3] 启动服务（模式: $Mode）..." -ForegroundColor Yellow

if ($Mode -eq "dev") {
    Write-Host "提示: 按 Ctrl+C 停止服务" -ForegroundColor Gray
    Write-Host ""
    pnpm run start:dev
} else {
    Write-Host "提示: 按 Ctrl+C 停止服务" -ForegroundColor Gray
    Write-Host ""
    pnpm run start:prod
}

