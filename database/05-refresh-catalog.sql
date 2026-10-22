-- Refresh the six visible demo movies without changing showtimes or bookings.
SET NAMES utf8mb4;
USE cinema;
UPDATE movies SET title='Thành phố sau cơn mưa', genre='Tình cảm', description='Một câu chuyện dịu dàng về hai người tìm thấy nhau giữa những con phố ướt mưa và ký ức chưa khép lại.' WHERE id=2;
UPDATE movies SET title='Mật mã cuối cùng', genre='Trinh thám', description='Một điều tra viên lần theo những manh mối cuối cùng để giải mã bí mật bị chôn vùi nhiều năm.' WHERE id=3;
UPDATE movies SET title='Khu vườn trên mây', genre='Hoạt hình', description='Một cô bé và người bạn nhỏ bước vào khu vườn kỳ diệu nằm giữa những tầng mây.' WHERE id=4;
UPDATE movies SET title='Tốc độ hoàng hôn', genre='Hành động', description='Đội đua trẻ đối mặt với chặng đường nguy hiểm nhất để giành lấy cơ hội làm lại.' WHERE id=5;
UPDATE movies SET title='Ngày mai bắt đầu từ hôm nay', genre='Hài', description='Một ngày hỗn loạn biến thành chuyến phiêu lưu ấm áp, nơi những người xa lạ cùng giúp nhau thay đổi.' WHERE id=6;
UPDATE movies SET title='Căn phòng số 7', genre='Kinh dị', description='Những âm thanh kỳ lạ trong căn phòng bị khóa mở ra câu chuyện bí ẩn của một gia đình.' WHERE id=8;
