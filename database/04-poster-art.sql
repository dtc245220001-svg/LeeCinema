SET NAMES utf8mb4;
USE cinema;
-- Preserve bookings and movie data; replace demo poster paths only.
UPDATE movies SET poster=REPLACE(poster,'.svg','.webp') WHERE id BETWEEN 1 AND 12 AND poster LIKE '/posters/%.svg';
