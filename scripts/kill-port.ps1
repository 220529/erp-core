# 关闭占用指定端口的进程
param(
    [Parameter(Mandatory=$false)]
    [int]$Port = 3009
)

Write-Host "正在查找占用端口 $Port 的进程..." -ForegroundColor Yellow

$connections = netstat -ano | findstr ":$Port"

if ($connections) {
    Write-Host "找到以下占用端口 $Port 的进程：" -ForegroundColor Cyan
    Write-Host $connections
    
    # 提取 PID（最后一列）
    $pids = $connections | ForEach-Object {
        if ($_ -match '\s+(\d+)\s*$') {
            $matches[1]
        }
    } | Select-Object -Unique
    
    foreach ($pid in $pids) {
        $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
        if ($process) {
            Write-Host "进程信息: PID=$pid, Name=$($process.Name)" -ForegroundColor Green
            Write-Host "正在关闭进程 $pid..." -ForegroundColor Yellow
            
            try {
                Stop-Process -Id $pid -Force
                Write-Host "✓ 进程 $pid 已关闭" -ForegroundColor Green
            } catch {
                Write-Host "✗ 关闭进程 $pid 失败: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "✓ 端口 $Port 未被占用" -ForegroundColor Green
}

