# Lee Cinema — Hệ thống đặt vé xem phim

Dự án môn Triển khai và Quản trị Hệ thống Phần mềm. Node.js/Express, HTML/CSS/JS thuần, MySQL và Docker Compose. Thanh toán hoàn toàn giả lập.

Sinh viên: **Trần Nhật Lệ**. Repository: **[dtc245220001-svg/LeeCinema](https://github.com/dtc245220001-svg/LeeCinema)**. Thông tin lớp, trường/khoa và giảng viên trên bìa cần sinh viên bổ sung/xác nhận trước khi nộp.

Repository đã tạo; mã nguồn **chưa push**, đang chờ người dùng duyệt nội dung công khai theo yêu cầu kiểm duyệt tự động. Xem [phạm vi công bố](docs/PUBLICATION.md).

## Khởi chạy trên Windows / PowerShell

Đối chiếu theo file Word mới: [checklist 7 giai đoạn](docs/DE-11-CHECKLIST.md). Hồ sơ báo cáo được xuất tại [Word](docs/BAO-CAO-DE-11.docx), [PDF](docs/BAO-CAO-DE-11.pdf) và [HTML](docs/BAO-CAO-DE-11.html); các trường thông tin sinh viên/repository còn thiếu được đánh dấu rõ. Dàn ý cũ chỉ là tài liệu tham khảo.

Yêu cầu Docker Desktop ở chế độ Linux containers, Docker Compose v2; Node.js 24 nếu chạy kiểm thử từ host. Dùng `npm.cmd` thay vì `npm` nếu PowerShell chặn npm.ps1.

```powershell
Set-Location C:\dat-ve-xem-phim
# Chỉ lần đầu, nếu chưa có .env:
powershell -ExecutionPolicy Bypass -File scripts/setup.ps1
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 config
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 ps
```

Script tạo mật khẩu ngẫu nhiên, không ghi đè .env, tạo file credential exporter bị Git bỏ qua. Không commit .env. Mật khẩu trong .env chỉ dùng ký tự chữ/số vì script khởi tạo MySQL sử dụng SQL tạo tài khoản. Chỉ database rỗng mới chạy script init.

Website qua Nginx mặc định http://localhost:3001. Trong phiên triển khai này, người dùng yêu cầu giữ Node đang chiếm 3001 nên `.env` dùng **http://localhost:3003**. phpMyAdmin: http://localhost:8082; đăng nhập cinema_app và DB_PASSWORD để xem dữ liệu (root chỉ dùng quản trị). Grafana: http://localhost:3002; Prometheus: http://localhost:9091.

Kiểm tra cổng trước khi chạy: `Get-NetTCPConnection -State Listen | Select-Object LocalPort,OwningProcess`. Thay các biến *_PORT trong .env nếu có xung đột, không dừng dịch vụ dự án khác. MySQL không publish cổng host.

```powershell
$env:TEST_URL = 'http://localhost:3003'
node tests/integration.cjs
docker compose restart db app nginx
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
node tests/persistence.cjs
# Dừng và gỡ container của riêng leecinema, giữ dữ liệu:
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 down
# Chạy lại:
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
```

`docker compose down -v` xóa toàn bộ volume của dự án, bao gồm vé, database, metrics và logs: chỉ dùng khi chủ động muốn xóa dữ liệu demo. Không dùng docker system prune.

## Kiến trúc và tính đúng đắn

Host → Nginx → Express → MySQL. Nginx và app trên frontend; db chỉ trên mạng database nội bộ; app và phpMyAdmin nối cả hai. Sáu bảng: movies, rooms, seats, showtimes, bookings, booking_seats. Khóa ngoại và CHECK, UNIQUE(showtime_id,seat_id). Backend kiểm tra ghế thuộc phòng, dùng truy vấn tham số và khóa dòng suất chiếu FOR UPDATE trong transaction. Hai yêu cầu cùng ghế được tuần tự hóa; một thành công 201, một nhận 409; insert lỗi rollback toàn bộ. Giá và tổng tiền lấy từ MySQL; mọi total do client gửi bị bỏ qua. Suất chiếu và giờ hiển thị theo UTC+7.

Hardening: app USER node (UID 1000); read-only filesystem với volume log và tmpfs; cap_drop ALL và no-new-privileges; mạng db internal, không publish MySQL; bí mật từ env; tài khoản app SELECT/INSERT và UPDATE chỉ showtimes (MySQL yêu cầu quyền này để SELECT FOR UPDATE); không dùng root; Nginx CSP, nosniff, DENY, Referrer-Policy, Permissions-Policy. Bind cổng dịch vụ vào 127.0.0.1. HTTP demo chưa có TLS; triển khai ngoài máy cần TLS và kiểm soát truy cập.

## Cấu trúc

Giao diện có 5 trang điều hướng bằng hash, mở trực tiếp được: `/#home` (trang chủ/banner/phim), `/#movies` (tìm kiếm/lọc thể loại), `/#schedule` (lịch chiếu và ghế trống từ MySQL), `/#about` (giới thiệu) và `/#guide` (hướng dẫn/FAQ). Menu responsive trên điện thoại. API `GET /api/showtimes` cung cấp lịch trong 14 ngày sắp tới; bấm suất chiếu sẽ chọn sẵn đúng ngày/phòng/giờ trong form đặt vé.

12 poster WebP được tạo bằng imagegen và lưu nội bộ tại public/posters; database/04-poster-art.sql cập nhật đường dẫn cho cả init mới và database demo đang có, giữ nguyên đơn đã đặt. Xem nguồn/prompt và cách tối ưu ở [ARTWORK.md](docs/ARTWORK.md). Website không cần API tạo ảnh hay nguồn ảnh ngoài khi chạy.

`server.js`: API và log JSON; `public/`: frontend và SVG tự tạo; `database/`: schema, seed, tài khoản; `nginx/`: proxy; `compose.yaml`: dịch vụ nền; `scripts/`: chuẩn bị môi trường; `tests/`: kiểm thử API/race/persistence; `monitoring/`: Prometheus, exporters, Grafana, Loki/Promtail; `docs/`: kết quả, demo và dàn ý báo cáo.

Seed tạo 12 phim, năm phòng với 40 ghế/phòng và lịch bảy ngày kế tiếp tính từ ngày khởi tạo volume. Khi lịch hết hạn, thêm lịch mới bằng SQL qua phpMyAdmin; không xóa volume để làm mới lịch nếu cần giữ đơn cũ.

Cách nhanh để làm mới lịch demo mà giữ toàn bộ đơn: `powershell -ExecutionPolicy Bypass -File scripts/refresh-showtimes.ps1`. Chạy sau khi database healthy; script chỉ thêm các suất còn thiếu trong bảy ngày tới.

Nếu cần lịch demo mới nhưng vẫn giữ vé cũ, đăng nhập phpMyAdmin bằng root và chạy truy vấn có thể lặp lại sau (không đổi suất đã tồn tại):

```sql
INSERT IGNORE INTO showtimes(movie_id,room_id,starts_at,price)
SELECT m.id,r.id,TIMESTAMP(DATE_ADD(CURDATE(),INTERVAL d.n DAY),MAKETIME(CASE WHEN m.id<=3 THEN 10+m.id*3+(r.id-1) ELSE 10+MOD(m.id-4,3)*4 END,0,0)),CASE WHEN m.id<=3 THEN 70000+(r.id-1)*20000 ELSE 80000 END
FROM movies m CROSS JOIN rooms r
CROSS JOIN (SELECT 1 n UNION SELECT 2 UNION SELECT 3 UNION SELECT 4 UNION SELECT 5 UNION SELECT 6 UNION SELECT 7) d
WHERE (m.id<=3 AND r.id<=2) OR (m.id BETWEEN 4 AND 12 AND r.id=3+FLOOR((m.id-4)/3));
```

## Xử lý lỗi

- `port is already allocated`: kiểm tra cổng, đổi .env rồi `docker compose up -d`; giữ nguyên container dự án khác.
- 503/database unhealthy: `docker compose logs --tail 80 db app`; kiểm tra init, mật khẩu và volume đã có từ trước. Đổi .env không tự đổi password của tài khoản tồn tại.
- 502 sau rebuild app: Nginx resolve DNS Docker mỗi 10 giây; kiểm tra app healthy, chờ cập nhật DNS hoặc `docker compose restart nginx`.
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

`stack.ps1` dùng compose.yaml + compose.monitoring.yaml và tự thêm compose.logging.yaml khi file tồn tại. Lệnh compose chỉ với file nền không quản lý đầy đủ dịch vụ giám sát/log; dùng stack.ps1 cho demo cuối cùng. Grafana đăng nhập admin, mật khẩu GRAFANA_PASSWORD trong .env. Dashboard Lee Cinema được provision tự động tại `/d/leecinema`; datasource Prometheus trỏ tới service nội bộ. Prometheus `/targets` phải có bốn targets UP; mysql_up và nginx_up phải là 1. Dashboard hiển thị requests/s, queries/s, connections, CPU và RAM container leecinema từ exporters thực.

cAdvisor cần privileged và đọc socket/mount Docker để lấy metadata: đây là ngoại lệ hardening có chủ đích, không publish cổng và không áp dụng cho app. Có thể nhìn thấy metadata container khác ở exporter, nhưng Prometheus lọc lưu chỉ project leecinema. Trên Docker Desktop, số liệu phản ánh container trong Linux VM, không phải toàn bộ Windows host. Docker Engine mới yêu cầu API mới; cAdvisor 0.55.1 được chọn để phù hợp. Nếu thiếu nhãn hoặc không có metrics từng container, kiểm tra logs cAdvisor, quyền đọc socket và mount. Không dùng số liệu root cgroup để giả làm container metrics.

Tham khảo cấu hình exporter: https://github.com/prometheus/mysqld_exporter ; cAdvisor: https://github.com/google/cadvisor . Phiên bản pin trong các file Compose, không dùng latest; pin không có nghĩa là đã kiểm toán toàn bộ lỗ hổng.

## Log tập trung: Loki / Promtail

Loki và Promtail dùng cặp 3.5.12, file config được mount read-only. Promtail đọc volume log app/Nginx, không cần Docker socket; positions có volume riêng để tiếp tục sau restart. Nhãn cố định `project="leecinema"`, `service="app"` hoặc `service="nginx"`, `stream="access"/"error"` với Nginx. Log app là JSON: time, level, service, method, path, status, duration_ms; không ghi body, tên, email, password, token hoặc query string. Nginx access log JSON không ghi IP, cookie, authorization, query string hay request body. Loki lưu filesystem với retention 7 ngày; file nguồn trong volume cần chính sách xoay log khi vận hành dài hạn.

**Promtail đã EOL ngày 02/03/2026**, không còn cập nhật hỗ trợ. Giữ Promtail để đáp ứng đề môn học; hệ thống production nên chuyển sang Grafana Alloy. Nguồn chính thức: https://grafana.com/docs/loki/latest/send-data/promtail/ . Loki auth tắt trong mạng monitoring riêng và không publish host; không dùng cấu hình này để công khai Loki.

Trong Grafana Explore chọn Loki, time range Last 15 minutes. Dashboard log: `/d/leecinema-logs`. Các truy vấn tương ứng định dạng thực:

```logql
{project="leecinema",service="app"} | json
{project="leecinema",service="app",level="error"} | json
{project="leecinema",service="app"} | json | status >= 400
sum by (service) (count_over_time({project="leecinema"}[1m]))
{project="leecinema",service="nginx",stream="access"} | json | status >= 400
```

Error-level có thể không có log khi hệ thống bình thường; tạo request API với payload sai để demo HTTP 400, không gây lỗi database. Chạy `node tests/logging.cjs` kiểm tra nhận log và LogQL; `node tests/grafana.cjs --loki` kiểm tra datasource. Nếu chưa có log, chờ một chu kỳ gửi (~10–15 giây), tạo vài request, xem `scripts/stack.ps1 logs`; kiểm tra permissions volume, nhãn và khoảng thời gian.

## Đối chiếu 7 tiêu chí

Đối chiếu rubric chính thức trong ảnh đề người dùng cung cấp ngày 09/10/2026. Tổng 10 điểm; trạng thái dưới đây không phải điểm giảng viên chấm.

| Tiêu chí | Điểm tối đa | File / minh chứng | Trạng thái và cách kiểm chứng |
|---|---|---|---|
| 1. Quản lý mã nguồn trên GitHub | 1.5 | Git, README, Dockerfile, compose*.yaml | Ba commit chính được giữ nguyên; các cập nhật phim/giao diện/hồ sơ có commit hoàn thiện. Repository đích LeeCinema trên tài khoản dtc245220001-svg; kiểm tra lịch sử và remote khi nộp. |
| 2. Triển khai ứng dụng + Database | 1.5 | server.js, public/, database/, compose.yaml | Website 12 phim, đặt vé/MySQL hoạt động; phpMyAdmin HTTP 200. Demo đăng nhập DB và xem đơn; tests/integration.cjs, persistence.cjs. |
| 3. Nginx Reverse Proxy | 1.5 | nginx/default.conf | Website qua Nginx, có CSP/nosniff/DENY và headers khác. HTTPS tùy chọn theo đề, security headers đã đáp ứng. |
| 4. Giám sát Prometheus + Grafana | 1.5 | compose.monitoring.yaml, monitoring/prometheus.yml, monitoring/grafana/ | Metrics container/web/DB có dữ liệu thật; tests/monitoring.cjs và grafana.cjs; chụp targets/dashboard. |
| 5. Log tập trung Loki | 1.5 | compose.logging.yaml, monitoring/loki.yml, promtail.yml, datasource logs | Loki + Promtail hoạt động, có hơn 3 LogQL bên trên; tests/logging.cjs. Công bố Promtail EOL. |
| 6. Hardening hệ thống | 1.5 | Dockerfile, Compose, .gitignore, nginx/, database/02-users.sh | Non-root, tách mạng, mật khẩu ngẫu nhiên/env, headers, quyền DB giới hạn, cap_drop/read-only; tests/hardening.cjs. |
| 7. Tổng thể & trình bày | 1.0 | scripts/stack.ps1, docs/DEMO.md, VERIFICATION.md, BAO-CAO-DE-11.*, evidence/ | Stack chạy bằng Compose; báo cáo PDF 22 trang có nội dung và ảnh thật, bản Word sửa được. Có ảnh DB/metrics/LogQL/hardening. Bổ sung các trường bìa còn thiếu và đối chiếu định dạng trường trước khi nộp. |

Trước khi nộp: điền thông tin bìa còn thiếu, xác nhận MSSV và định dạng trường. Ảnh evidence đã được đưa vào quản lý mã nguồn, không còn bị ignore. Ba mốc commit ban đầu được giữ nguyên; file Word cho phép commit hoàn thiện bổ sung. Repository LeeCinema được tạo theo tên người dùng chọn; chỉ ghi nhận publish sau khi kiểm tra remote HEAD khớp local.

Xem [kịch bản demo](docs/DEMO.md), [báo cáo](docs/BAO-CAO-DE-11.pdf), [checklist theo Word](docs/DE-11-CHECKLIST.md) và [kết quả kiểm tra](docs/VERIFICATION.md).

Kiểm thử trình duyệt trên máy có Microsoft Edge: `npm.cmd ci`, rồi `npm.cmd run test:browser`. Kiểm tra hardening cần Docker: `node tests/hardening.cjs`. `node tests/fresh-init.cjs` tạo container MySQL tạm với volume riêng để kiểm tra script init và tự dừng/xóa container tạm; không xóa dữ liệu leecinema. Các test đặt vé tạo đơn demo thật, chọn ghế còn trống; đổi sang suất khác hoặc thêm lịch nếu chạy lặp quá nhiều lần. Dùng `$env:TEST_URL='http://localhost:3001'` nếu chuyển website về cổng 3001; TEST_URL mặc định 3003 theo phiên triển khai này.
