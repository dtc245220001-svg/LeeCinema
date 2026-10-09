param([ValidateSet('up','down','ps','logs','config')][string]$Action='up')
$ErrorActionPreference='Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
$composeArgs=@('compose','-f','compose.yaml','-f','compose.monitoring.yaml')
if (Test-Path 'compose.logging.yaml') { $composeArgs+=@('-f','compose.logging.yaml') }
switch ($Action) {
 'up' { & docker @composeArgs up -d --build --wait }
 'down' { & docker @composeArgs down }
 'ps' { & docker @composeArgs ps }
 'logs' { & docker @composeArgs logs --tail 80 }
 'config' { & docker @composeArgs config --quiet }
}
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
