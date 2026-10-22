-- Safe to apply to an existing demo database; preserves bookings and showtimes.
SET NAMES utf8mb4;
USE cinema;
INSERT IGNORE INTO movies(id,title,genre,duration,description,poster) VALUES
(4,'Vương quốc mây','Hoạt hình',95,'Một cô bé và chú chim máy khám phá vương quốc lơ lửng trên bầu trời. Phim mẫu phục vụ demo.','/posters/cloud.svg'),
(5,'Đường đua rực lửa','Hành động',125,'Đội đua trẻ vượt qua thử thách để giành chiến thắng trong giải đấu cuối mùa. Phim mẫu phục vụ demo.','/posters/race.svg'),
(6,'Chuyến đi bất ngờ','Hài',105,'Một chuyến xe nhầm điểm đến đưa những người xa lạ vào hành trình đầy tiếng cười. Phim mẫu phục vụ demo.','/posters/trip.svg'),
(7,'Giai điệu thanh xuân','Âm nhạc',115,'Nhóm bạn thành lập ban nhạc và chuẩn bị cho đêm diễn quan trọng nhất tuổi trẻ. Phim mẫu phục vụ demo.','/posters/music.svg'),
(8,'Ngôi nhà trong sương','Kinh dị',110,'Những tiếng động bí ẩn dẫn một gia đình đến câu chuyện bị lãng quên trong căn nhà cũ. Phim mẫu phục vụ demo.','/posters/mist.svg'),
(9,'Dấu chân đại ngàn','Phiêu lưu',120,'Hai anh em băng qua khu rừng để tìm người cha và học cách bảo vệ thiên nhiên. Phim mẫu phục vụ demo.','/posters/forest.svg'),
(10,'Lá thư cuối mùa','Tâm lý',108,'Một lá thư cũ kết nối hai thế hệ, mở ra những ký ức và lời hẹn chưa hoàn thành. Phim mẫu phục vụ demo.','/posters/letter.svg'),
(11,'Huyền thoại ánh trăng','Giả tưởng',130,'Người giữ đèn trẻ tuổi phải tìm lại ánh trăng trước khi bóng tối bao phủ vương quốc. Phim mẫu phục vụ demo.','/posters/moon.svg'),
(12,'Dòng sông ký ức','Lịch sử',118,'Câu chuyện về những người gìn giữ quê hương bên dòng sông qua nhiều biến động. Phim mẫu phục vụ demo.','/posters/river.svg');
INSERT IGNORE INTO rooms(id,name) VALUES(3,'Phòng 03'),(4,'Phòng 04'),(5,'Phòng 05');
INSERT IGNORE INTO seats(room_id,row_label,seat_number)
SELECT r.id,a.label,b.n FROM rooms r
CROSS JOIN (SELECT 'A' label UNION SELECT 'B' UNION SELECT 'C' UNION SELECT 'D' UNION SELECT 'E') a
CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8) b
WHERE r.id BETWEEN 3 AND 5 ORDER BY r.id,a.label,b.n;
-- Three movies per new room: 10:00, 14:00, 18:00. Four hours prevents overlap.
INSERT IGNORE INTO showtimes(movie_id,room_id,starts_at,price)
SELECT m.id,3+FLOOR((m.id-4)/3),TIMESTAMP(DATE_ADD(CURDATE(),INTERVAL d.n DAY),MAKETIME(10+MOD(m.id-4,3)*4,0,0)),80000
FROM movies m CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) d
WHERE m.id BETWEEN 4 AND 12;
