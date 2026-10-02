$ErrorActionPreference = 'Stop'
$taskBase = 'http://127.0.0.1:18765'
try {
    $taskHealth = Invoke-RestMethod "$taskBase/health" -TimeoutSec 2
    if ($taskHealth.service -eq 'nuvio-hls') { return }
    throw '18765 portunda başka bir servis çalışıyor.'
} catch {
    if ($_.Exception.Message -eq '18765 portunda başka bir servis çalışıyor.') { throw }
}
$taskNode = (Get-Command node -ErrorAction Stop).Source
$taskServer = Join-Path $PSScriptRoot 'desktop_hls_bridge.js'
$taskRoot = Split-Path $PSScriptRoot -Parent
$taskTmp = Join-Path $taskRoot 'tmp'
New-Item -ItemType Directory -Path $taskTmp -Force | Out-Null
$taskProcess = Start-Process -FilePath $taskNode -ArgumentList @('"' + $taskServer + '"') -WorkingDirectory $taskRoot -WindowStyle Hidden -PassThru -RedirectStandardOutput (Join-Path $taskTmp 'desktop-hls.log') -RedirectStandardError (Join-Path $taskTmp 'desktop-hls-error.log')
$taskProcess.Id | Set-Content -LiteralPath (Join-Path $taskTmp 'desktop-hls.pid')
for ($taskAttempt = 0; $taskAttempt -lt 20; $taskAttempt++) {
    Start-Sleep -Milliseconds 250
    try {
        $taskHealth = Invoke-RestMethod "$taskBase/health" -TimeoutSec 1
        if ($taskHealth.service -eq 'nuvio-hls') { return }
    } catch { }
    if ($taskProcess.HasExited) { break }
}
throw "Desktop HLS yardımcısı başlatılamadı. Günlük: $taskTmp/desktop-hls-error.log"
