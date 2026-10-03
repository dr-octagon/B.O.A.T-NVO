$ErrorActionPreference = 'Stop'
$taskBase = 'http://127.0.0.1:18765'
try {
    $taskHealth = Invoke-RestMethod "$taskBase/health" -TimeoutSec 2
    if ($taskHealth.service -eq 'nuvio-hls') {
        $taskExpectedScript = Join-Path $PSScriptRoot 'desktop_hls_bridge.js'
        $taskExpectedRevision = (Get-FileHash -LiteralPath $taskExpectedScript -Algorithm SHA256).Hash
        $taskTransportScript = Join-Path $PSScriptRoot 'desktop_provider_transport.js'
        $taskTransportRevision = (Get-FileHash -LiteralPath $taskTransportScript -Algorithm SHA256).Hash
        $taskLiveRevision = (Get-FileHash -LiteralPath (Join-Path $PSScriptRoot 'desktop_live_transport.js') -Algorithm SHA256).Hash
        $taskCineStreamRevision = (Get-FileHash -LiteralPath (Join-Path $PSScriptRoot 'desktop_cinestream_transport.js') -Algorithm SHA256).Hash
        $taskCatalogRevision = & node -e 'const fs=require("fs"),p=require("path"),c=require("crypto"),root=p.resolve(process.argv[1],".."),d=fs.existsSync(p.join(root,"dist/desktop/catalog-inventory.json"))?p.join(root,"dist/desktop"):p.join(root,"desktop"),h=c.createHash("sha256");for(const f of [p.join(process.argv[1],"desktop_catalog_addon.js"),p.join(process.argv[1],"desktop_catalog_runtime.js"),p.join(d,"catalog-inventory.json"),p.join(d,"runtime_modules.cjs")])if(fs.existsSync(f))h.update(fs.readFileSync(f));process.stdout.write(h.digest("hex"));' $PSScriptRoot
        if ($taskHealth.version -ge 7 -and $taskHealth.revision -eq $taskExpectedRevision -and $taskHealth.transportRevision -eq $taskTransportRevision -and $taskHealth.liveRevision -eq $taskLiveRevision -and $taskHealth.cinestreamRevision -eq $taskCineStreamRevision -and $taskHealth.catalogRevision -eq $taskCatalogRevision) { return }
        $taskPidFile = Join-Path (Split-Path $PSScriptRoot -Parent) 'tmp/desktop-hls.pid'
        $taskOwnedId = if (Test-Path -LiteralPath $taskPidFile) { [int](Get-Content -LiteralPath $taskPidFile) } else { 0 }
        $taskOwnedProcess = if ($taskOwnedId) { Get-CimInstance Win32_Process -Filter "ProcessId = $taskOwnedId" } else { $null }
        if (-not $taskOwnedProcess -or $taskOwnedProcess.Name -ne 'node.exe' -or -not $taskOwnedProcess.CommandLine.Contains($taskExpectedScript)) { throw 'Eski yardımcı bu kurulum tarafından başlatılmamış; 18765 portundaki işlemi kontrol edin.' }
        if (Get-Process Nuvio -ErrorAction SilentlyContinue) { throw 'Yardımcıyı güncellemek için önce Nuvio Desktop uygulamasını kapatın.' }
        Stop-Process -Id $taskOwnedId -ErrorAction Stop
    } else { throw '18765 portunda başka bir servis çalışıyor.' }
} catch {
    if ($_.Exception.Message -eq '18765 portunda başka bir servis çalışıyor.' -or $_.Exception.Message -like 'Eski yardımcı*' -or $_.Exception.Message -like 'Yardımcıyı güncellemek*') { throw }
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
