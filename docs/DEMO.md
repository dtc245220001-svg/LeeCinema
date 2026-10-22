# Kịch bản demo và ảnh cần chụp

## Chuẩn bị

Mở Docker Desktop, Linux containers. `.env` phiên này đã tạo, không chạy setup lần nữa. Chạy trong PowerShell tại C:\dat-ve-xem-phim:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 ps
```

Website http://localhost:3003 (cổng 3001 giữ nguyên tiến trình Node theo yêu cầu). phpMyAdmin http://localhost:8082, Grafana http://localhost:3002, Prometheus http://localhost:9091. Mở .env cục bộ để lấy mật khẩu, không chụp ảnh mật khẩu. Grafana tài khoản admin; phpMyAdmin tài khoản cinema_app, DB_PASSWORD. Root dành cho quản trị schema, không dùng trong app.

## Trình bày khoảng 10–15 phút

1. Giới thiệu kiến trúc Nginx → Express → MySQL; hai mạng và volumes. Hiển thị compose ps của project leecinema.
2. Website: tìm từ “vũ trụ”, tìm chuỗi không tồn tại, mở chi tiết phim. Chọn ngày, suất và phòng. Chọn 2 ghế, đối chiếu tổng tiền. Nêu ghế chỉ giữ khi xác nhận, tối đa 8 ghế.
3. Nhập tên/email, xác nhận thanh toán giả lập. Hiển thị mã vé và thông tin, tải lại để thấy ghế đã đặt. Không có giao dịch tiền thật.
4. phpMyAdmin: SELECT từ bookings và booking_seats, chỉ dùng dữ liệu khách demo; chỉ ra UNIQUE(showtime_id,seat_id), foreign keys. Có thể chạy `SHOW CREATE TABLE booking_seats`.
5. `node tests/integration.cjs`: demo hai request đồng thời cùng ghế, 201/409; backend bỏ qua total=1, rollback nhiều ghế nếu một ghế bị chiếm. Test tạo 2 đơn thật mỗi lần, không xóa chúng tự động.
6. Chạy các lệnh sau để chứng minh persistence:

```powershell
docker compose restart db app nginx
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
node tests/persistence.cjs
```

7. Prometheus /targets: bốn UP. Grafana dashboard Lee Cinema: MySQL/Nginx ready, requests, queries, CPU/RAM dịch vụ. Tải lại website để tạo traffic; rate cần ít nhất 2 điểm scrape (~30 giây). `node tests/monitoring.cjs` và `node tests/grafana.cjs --loki`.
8. Grafana Explore, datasource Loki: xem app, lọc status>=400, count_over_time theo service. `node tests/logging.cjs` tạo HTTP 400 để có log demo. Nhắc Promtail EOL và hướng chuyển Alloy.
9. Hardening: `docker compose exec -T app id`, MySQL không publish; .env bị ignore; headers trình duyệt; tài khoản app không root.
10. Dừng `powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 down`, giải thích giữ volume. Không dùng down -v khi cần giữ dữ liệu. Không ảnh hưởng stack khác.

## Ảnh minh chứng cần chụp

| Tên ảnh đề xuất | Nội dung thực tế |
|---|---|
| 01-stack.png | compose ps, tên leecinema, trạng thái healthy |
| 02-movies-desktop.png | Trang danh sách phim và tìm kiếm |
| 03-mobile.png | Trang responsive rộng khoảng 390px |
| 04-seats.png | Ngày/suất/phòng, ghế trống/chọn/đã đặt và tổng tiền |
| 05-receipt.png | Mã đặt vé, phim, ghế, tổng và giả lập |
| 06-database.png | Đơn và chi tiết ghế trong phpMyAdmin, che email nếu thật |
| 07-race-persistence.png | Kết quả test race và giữ ghế sau restart |
| 08-targets.png | Prometheus cả bốn targets UP |
| 09-dashboard.png | Grafana metrics có dữ liệu, không ảnh panel rỗng |
| 10-loki.png | LogQL app, lọc lỗi, count theo thời gian |
| 11-hardening.png | id non-root, headers, port mapping |
| 12-git.png | Ba commit theo ba mốc; không có .env |

Lưu ảnh tự chụp trong docs/evidence. Không tạo ảnh giả để chứng minh. Các file JSON kiểm tra là dữ liệu chạy thật, không thay ảnh giao diện. Ghi thời gian, cấu hình máy và giới hạn vào báo cáo.
