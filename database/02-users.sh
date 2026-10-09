#!/bin/sh
set -eu
mysql --protocol=socket -uroot -p"$MYSQL_ROOT_PASSWORD" <<SQL
CREATE USER 'cinema_app'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT SELECT, INSERT ON cinema.* TO 'cinema_app'@'%';
GRANT UPDATE ON cinema.showtimes TO 'cinema_app'@'%';
CREATE USER 'exporter'@'%' IDENTIFIED BY '${EXPORTER_PASSWORD}' WITH MAX_USER_CONNECTIONS 3;
GRANT PROCESS, REPLICATION CLIENT, SELECT ON *.* TO 'exporter'@'%';
SQL
