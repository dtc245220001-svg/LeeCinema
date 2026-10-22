$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
docker compose cp scripts/refresh-showtimes.sql db:/tmp/cinema-refresh.sql
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
docker compose exec -T db sh -c 'MYSQL_PWD=$MYSQL_ROOT_PASSWORD mysql -uroot < /tmp/cinema-refresh.sql'
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
Write-Host 'Added upcoming demo showtimes. Existing bookings are preserved.'
