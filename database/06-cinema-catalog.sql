-- Demo catalogue requested for Lee Cinema. Posters remain original local artwork.
SET NAMES utf8mb4;
USE cinema;
UPDATE movies SET title='Mai',genre='Tâm lý, tình cảm',description='Câu chuyện tình cảm và những lựa chọn trưởng thành.' WHERE id=1;
UPDATE movies SET title='Nhà Bà Nữ',genre='Tâm lý, gia đình',description='Một câu chuyện gia đình gần gũi về yêu thương và tha thứ.' WHERE id=2;
UPDATE movies SET title='Lật Mặt 7: Một Điều Ước',genre='Gia đình',description='Hành trình gia đình đầy cảm xúc và những điều ước giản dị.' WHERE id=3;
UPDATE movies SET title='Đào, Phở và Piano',genre='Lịch sử, tình cảm',description='Một chuyện tình lãng mạn trong bối cảnh lịch sử Việt Nam.' WHERE id=4;
UPDATE movies SET title='Quỷ Cẩu',genre='Kinh dị',description='Bí ẩn kinh dị bắt đầu từ một lời nguyền trong đêm tối.' WHERE id=5;
UPDATE movies SET title='Dune: Hành Tinh Cát – Phần Hai',genre='Khoa học viễn tưởng',description='Cuộc chiến định mệnh giữa sa mạc và những thế lực khổng lồ.' WHERE id=6;
UPDATE movies SET title='Godzilla x Kong: Đế Chế Mới',genre='Hành động, quái vật',description='Hai thế lực khổng lồ đối đầu để bảo vệ thế giới.' WHERE id=7;
UPDATE movies SET title='Kung Fu Panda 4',genre='Hoạt hình, hành động',description='Cuộc phiêu lưu hài hước của một chiến binh gấu trúc.' WHERE id=8;
UPDATE movies SET title='Những Mảnh Ghép Cảm Xúc 2',genre='Hoạt hình, gia đình',description='Những cảm xúc mới cùng đồng hành trong tuổi trưởng thành.' WHERE id=9;
UPDATE movies SET title='Kẻ Trộm Mặt Trăng 4',genre='Hoạt hình, hài',description='Một phi vụ vui nhộn với những nhân vật tinh quái.' WHERE id=10;
UPDATE movies SET title='Deadpool & Wolverine',genre='Hành động, hài',description='Cặp đôi bất đắc dĩ tạo nên cuộc phiêu lưu siêu anh hùng hài hước.' WHERE id=11;
UPDATE movies SET title='Avatar: Dòng Chảy Của Nước',genre='Khoa học viễn tưởng',description='Khám phá đại dương kỳ vĩ trong thế giới ngoài hành tinh.' WHERE id=12;
UPDATE movies SET poster='/posters/mai.webp' WHERE id=1;
UPDATE movies SET poster='/posters/nhabaunu.webp' WHERE id=2;
UPDATE movies SET poster='/posters/latmat7.webp' WHERE id=3;
