# Cinema 11 — Hệ thống đặt vé xem phim

Dự án môn Triển khai và Quản trị Hệ thống Phần mềm. Node.js/Express, HTML/CSS/JS thuần, MySQL và Docker Compose. Thanh toán hoàn toàn giả lập.

## Khởi chạy trên Windows / PowerShell

Yêu cầu Docker Desktop ở chế độ Linux containers, Docker Compose v2; Node.js 24 nếu chạy kiểm thử từ host. Dùng `npm.cmd` thay vì `npm` nếu PowerShell chặn npm.ps1.

```powershell
Set-Location C:\dat-ve-xem-phim
# Chỉ lần đầu, nếu chưa có .env:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
docker compose config --quiet
docker compose up -d --build --wait
docker compose ps
```

Script tạo mật khẩu ngẫu nhiên, không ghi đè .env, tạo file credential exporter bị Git bỏ qua. Không commit .env. Mật khẩu trong .env chỉ dùng ký tự chữ/số vì script khởi tạo MySQL sử dụng SQL tạo tài khoản. Chỉ database rỗng mới chạy script init.

Website qua Nginx mặc định http://localhost:3001. Trong phiên triển khai này, người dùng yêu cầu giữ Node đang chiếm 3001 nên `.env` dùng **http://localhost:3003**. phpMyAdmin: http://localhost:8082; đăng nhập cinema_app và DB_PASSWORD để xem dữ liệu (root chỉ dùng quản trị). Grafana: http://localhost:3002; Prometheus: http://localhost:9091.

Kiểm tra cổng trước khi chạy: `Get-NetTCPConnection -State Listen | Select-Object LocalPort,OwningProcess`. Thay các biến *_PORT trong .env nếu có xung đột, không dừng dịch vụ dự án khác. MySQL không publish cổng host.

```powershell
$env:TEST_URL = 'http://localhost:3003'
node tests/integration.cjs
docker compose restart db app nginx
docker compose up -d --wait
node tests/persistence.cjs
# Dừng và gỡ container của riêng cinema11, giữ dữ liệu:
docker compose down
# Chạy lại:
docker compose up -d --wait
```

`docker compose down -v` xóa toàn bộ volume của dự án, bao gồm vé, database, metrics và logs: chỉ dùng khi chủ động muốn xóa dữ liệu demo. Không dùng docker system prune.

## Kiến trúc và tính đúng đắn

Host → Nginx → Express → MySQL. Nginx và app trên frontend; db chỉ trên mạng database nội bộ; app và phpMyAdmin nối cả hai. Sáu bảng: movies, rooms, seats, showtimes, bookings, booking_seats. Khóa ngoại và CHECK, UNIQUE(showtime_id,seat_id). Backend kiểm tra ghế thuộc phòng, dùng truy vấn tham số và khóa dòng suất chiếu FOR UPDATE trong transaction. Hai yêu cầu cùng ghế được tuần tự hóa; một thành công 201, một nhận 409; insert lỗi rollback toàn bộ. Giá và tổng tiền lấy từ MySQL; mọi total do client gửi bị bỏ qua. Suất chiếu và giờ hiển thị theo UTC+7.

Hardening: app USER node (UID 1000); read-only filesystem với volume log và tmpfs; cap_drop ALL và no-new-privileges; mạng db internal, không publish MySQL; bí mật từ env; tài khoản app SELECT/INSERT và UPDATE chỉ showtimes (MySQL yêu cầu quyền này để SELECT FOR UPDATE); không dùng root; Nginx CSP, nosniff, DENY, Referrer-Policy, Permissions-Policy. Bind cổng dịch vụ vào 127.0.0.1. HTTP demo chưa có TLS; triển khai ngoài máy cần TLS và kiểm soát truy cập.

## Cấu trúc

`server.js`: API và log JSON; `public/`: frontend và SVG tự tạo; `database/`: schema, seed, tài khoản; `nginx/`: proxy; `compose.yaml`: dịch vụ nền; `scripts/`: chuẩn bị môi trường; `tests/`: kiểm thử API/race/persistence; `monitoring/`: Prometheus, exporters, Grafana, Loki/Promtail; `docs/`: kết quả, demo và dàn ý báo cáo.

Seed tạo ba phim, hai phòng với 40 ghế/phòng và lịch bảy ngày kế tiếp tính từ ngày khởi tạo volume. Khi lịch hết hạn, thêm lịch mới bằng SQL qua phpMyAdmin; không xóa volume để làm mới lịch nếu cần giữ đơn cũ.

## Xử lý lỗi

- `port is already allocated`: kiểm tra cổng, đổi .env rồi `docker compose up -d`; giữ nguyên container dự án khác.
- 503/database unhealthy: `docker compose logs --tail 80 db app`; kiểm tra init, mật khẩu và volume đã có từ trước. Đổi .env không tự đổi password của tài khoản tồn tại.
- 502 sau rebuild app: `docker compose restart nginx` để cập nhật DNS upstream.
- Ghế vừa được đặt: API trả 409, frontend tải lại sơ đồ và yêu cầu chọn lại.
- PowerShell chặn script: lệnh `powershell -ExecutionPolicy Bypass -File scripts/setup.ps1` chỉ thay policy cho tiến trình đó.
- Không có phim/suất chiếu: kiểm tra tìm kiếm và lịch trong database, UI có trạng thái rỗng riêng.

## Giám sát Prometheus / Grafana

```powershell
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 ps
node tests/monitoring.cjs
# Dừng toàn bộ stack, giữ volume:
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 down
```

`stack.ps1` dùng compose.yaml + compose.monitoring.yaml và tự thêm compose.logging.yaml khi file tồn tại. Lệnh compose chỉ với file nền không quản lý đầy đủ dịch vụ giám sát/log; dùng stack.ps1 cho demo cuối cùng. Grafana đăng nhập admin, mật khẩu GRAFANA_PASSWORD trong .env. Dashboard Cinema 11 được provision tự động tại `/d/cinema11`; datasource Prometheus trỏ tới service nội bộ. Prometheus `/targets` phải có bốn targets UP; mysql_up và nginx_up phải là 1. Dashboard hiển thị requests/s, queries/s, connections, CPU và RAM container cinema11 từ exporters thực.

cAdvisor cần privileged và đọc socket/mount Docker để lấy metadata: đây là ngoại lệ hardening có chủ đích, không publish cổng và không áp dụng cho app. Có thể nhìn thấy metadata container khác ở exporter, nhưng Prometheus lọc lưu chỉ project cinema11. Trên Docker Desktop, số liệu phản ánh container trong Linux VM, không phải toàn bộ Windows host. Docker Engine mới yêu cầu API mới; cAdvisor 0.55.1 được chọn để phù hợp. Nếu thiếu nhãn hoặc không có metrics từng container, kiểm tra logs cAdvisor, quyền đọc socket và mount. Không dùng số liệu root cgroup để giả làm container metrics.

Tham khảo cấu hình exporter: https://github.com/prometheus/mysqld_exporter ; cAdvisor: https://github.com/google/cadvisor . Phiên bản pin trong các file Compose, không dùng latest; pin không có nghĩa là đã kiểm toán toàn bộ lỗ hổng.
