-- Refresh the six visible demo movies without changing showtimes or bookings.
SET NAMES utf8mb4;
USE cinema;
UPDATE movies SET title='Dune: Part Two', genre='Tình cảm', description='Một chuyến phiêu lưu điện ảnh quy mô lớn giữa sa mạc và những lựa chọn định mệnh.' WHERE id=2;
UPDATE movies SET title='Avatar: The Way of Water', genre='Trinh thám', description='Thế giới giả tưởng rực rỡ với những chuyến khám phá vượt ra ngoài ranh giới quen thuộc.' WHERE id=3;
UPDATE movies SET title='Inside Out 2', genre='Hoạt hình', description='Những cảm xúc mới mẻ cùng nhau tạo nên một hành trình trưởng thành đáng nhớ.' WHERE id=4;
UPDATE movies SET title='Mission: Impossible', genre='Hành động', description='Nhiệm vụ nguy hiểm, tốc độ nghẹt thở và những màn rượt đuổi mãn nhãn.' WHERE id=5;
UPDATE movies SET title='The Wild Robot', genre='Hài', description='Một câu chuyện ấm áp về tình bạn, gia đình và hành trình thích nghi trong thế giới mới.' WHERE id=6;
UPDATE movies SET title='A Quiet Place', genre='Kinh dị', description='Một gia đình phải giữ im lặng tuyệt đối để sống sót trước mối đe dọa bí ẩn.' WHERE id=8;
