-- One-time repair for the initial demo volume created before SET NAMES was added.
-- Preserves all bookings. Guard prevents converting correctly encoded titles.
SET NAMES utf8mb4;
USE cinema;
UPDATE movies SET title=CONVERT(CAST(CONVERT(title USING latin1) AS BINARY) USING utf8mb4),genre=CONVERT(CAST(CONVERT(genre USING latin1) AS BINARY) USING utf8mb4),description=CONVERT(CAST(CONVERT(description USING latin1) AS BINARY) USING utf8mb4) WHERE LOCATE(CAST('Ã' AS BINARY),CAST(title AS BINARY))>0 OR LOCATE(CAST('Ä' AS BINARY),CAST(title AS BINARY))>0;
UPDATE rooms SET name=CONVERT(CAST(CONVERT(name USING latin1) AS BINARY) USING utf8mb4) WHERE LOCATE(CAST('Ã' AS BINARY),CAST(name AS BINARY))>0;
