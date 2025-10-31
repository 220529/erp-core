# 重启 ERP Core 服务
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("dev", "prod")]
    [string]$Mode = "dev",
    
    [Parameter(Mandatory=$false)]
    [int]$Port = 3009
)

Write-Host "正在重启 ERP Core 服务..." -ForegroundColor Cyan

# 1. 停止服务
& "$PSScriptRoot\kill-port.ps1" -Port $Port

# 2. 等待1秒
Start-Sleep -Seconds 1

# 3. 启动服务
& "$PSScriptRoot\start.ps1" -Mode $Mode -Port $Port

