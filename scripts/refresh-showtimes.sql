-- Add the next seven days for the demo; existing sessions and bookings stay intact.
SET NAMES utf8mb4;
USE cinema;
INSERT IGNORE INTO showtimes(movie_id,room_id,starts_at,price)
SELECT m.id,r.id,TIMESTAMP(DATE_ADD(CURDATE(),INTERVAL d.n DAY),MAKETIME(CASE WHEN m.id<=3 THEN 10+m.id*3+(r.id-1) ELSE 10+MOD(m.id-4,3)*4 END,0,0)),CASE WHEN m.id<=3 THEN 70000+(r.id-1)*20000 ELSE 80000 END
FROM movies m CROSS JOIN rooms r
CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) d
WHERE (m.id<=3 AND r.id<=2) OR (m.id BETWEEN 4 AND 12 AND r.id=3+FLOOR((m.id-4)/3));
