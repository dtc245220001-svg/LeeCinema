$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
if (Test-Path .env) { throw '.env exists; refusing to overwrite passwords.' }
function New-Password { $bytes = New-Object byte[] 24; $rng = [Security.Cryptography.RandomNumberGenerator]::Create(); $rng.GetBytes($bytes); $rng.Dispose(); return -join ($bytes | ForEach-Object { $_.ToString('x2') }) }
$rootPassword = New-Password
$appPassword = New-Password
$exportPassword = New-Password
$grafanaPassword = New-Password
$utf8 = New-Object System.Text.UTF8Encoding($false)
[IO.File]::WriteAllText((Join-Path $PWD '.env'), "WEB_PORT=3001`nPMA_PORT=8082`nGRAFANA_PORT=3002`nPROMETHEUS_PORT=9091`nMYSQL_ROOT_PASSWORD=$rootPassword`nDB_PASSWORD=$appPassword`nEXPORTER_PASSWORD=$exportPassword`nGRAFANA_PASSWORD=$grafanaPassword`n", $utf8)
New-Item -ItemType Directory -Force monitoring/mysql | Out-Null
[IO.File]::WriteAllText((Join-Path $PWD 'monitoring/mysql/exporter.cnf'), "[client]`nuser=exporter`npassword=$exportPassword`nhost=db`nport=3306`n", $utf8)
Write-Host 'Created .env and exporter configuration. Passwords are not printed.'
