# Kết quả kiểm tra thực tế

Môi trường Windows/PowerShell, Docker Desktop 4.86.0, Linux Engine 29.7.2. Ngày kiểm tra: 09/10/2026 (Asia/Saigon). Cổng website thực tế 3003 theo lựa chọn người dùng; tiến trình Node ở 3001 và container dự án khác được giữ nguyên.

| Kiểm tra | Kết quả đã quan sát |
|---|---|
| Build npm ci và audit | Build app thành công; npm báo 0 vulnerabilities tại thời điểm chạy |
| Health qua Nginx | 200, database connected, header nosniff |
| API danh sách/tìm kiếm | 3 phim, chuỗi không khớp trả mảng rỗng |
| Input email, duplicate IDs, sai phòng | 400, không tạo đơn |
| Đặt vé / total client=1 | 201 và mã VE-, tổng tiền bằng giá DB |
| Đặt trùng tuần tự | 409 |
| Hai request đồng thời cùng ghế | Chính xác một 201 và một 409 |
| Một ghế đã đặt trong nhóm nhiều ghế | 409, ghế còn lại không bị đặt (atomic rollback) |
| Restart db/app/Nginx | Ghế đã đặt vẫn booked=1, mã lưu trong persistence-check.json |
| Metrics | 4 targets UP; MySQL/Nginx up=1; CPU/RAM project container có dữ liệu |
| Grafana provisioning | Datasource metrics healthy, mọi panel metrics truy vấn có kết quả |
| Loki/Promtail | App và Nginx logs có trong Loki; lọc status>=400 và count theo phút có kết quả |
| Grafana Loki datasource | Health OK |
| Edge headless | Desktop 1440px/mobile 390px; tìm kiếm tiếng Việt, 40 ghế, chọn ghế, đặt vé nhận receipt; không JS/CSP error hoặc tràn ngang |
| Hardening / dữ liệu thực | USER node, read-only, ALL capabilities dropped, no-new-privileges; db một mạng, không publish; grants giới hạn; UNIQUE và đơn/ghế thực có trong DB |
| Khởi tạo database rỗng | Container MySQL tạm độc lập: seed UTF-8 đúng, 42 suất, 80 ghế, app có quyền FOR UPDATE; đã dừng container tạm, không ảnh hưởng volume chính |

Ảnh website được tạo bởi tests/browser.cjs từ trang thật trong docs/evidence. Ảnh này bị .gitignore bỏ qua để người dùng chủ động chọn minh chứng khi nộp. Chưa có ảnh phpMyAdmin, dashboard Grafana, Prometheus targets, Git hoặc console; dùng checklist DEMO.md để chụp thêm. File metrics-check.json, logging-check.json, persistence-check.json lưu kết quả có timestamp và dữ liệu không chứa mật khẩu/email.

## Các lỗi phát hiện và đã sửa

- Tài khoản SELECT/INSERT thiếu quyền phục vụ SELECT FOR UPDATE: bổ sung UPDATE chỉ trên showtimes, khóa bảng suất chiếu riêng thay vì khóa cả JOIN.
- MySQL CLI import mặc định latin1: thêm SET NAMES utf8mb4 và sửa một lần seed cũ bằng scripts/repair-encoding.sql, giữ nguyên bookings. Edge sau sửa tìm “vũ trụ” đúng.
- Loki 3.5.0 phát log lỗi metadata size=0 mặc dù vẫn nhận log: nâng cặp Loki/Promtail lên 3.5.12; nguồn lỗi upstream https://github.com/grafana/loki/issues/17371 .
- PowerShell ExecutionPolicy chặn npm.ps1: dùng npm.cmd, setup dùng Bypass cho tiến trình.
- Sandbox không truy cập Docker pipe và CIM: các kiểm tra Docker/cổng được chạy sau khi cấp quyền; không khẳng định đã kiểm tra nếu thiếu quyền.

## Giới hạn kiểm chứng

Chưa kiểm thử tải lớn, mất điện/đĩa hỏng, backup/restore, retention đủ 7 ngày, bảo mật production, thanh toán thật hoặc trình duyệt ngoài Edge. Persistence là kiểm tra restart, không thay cho kiểm tra phục hồi thảm họa. Báo cáo là dàn ý 12 trang, chưa phải bản báo cáo sinh viên hoàn chỉnh. Promtail EOL được công bố, cAdvisor dùng privileged và số liệu từ Linux VM. HTTP localhost chỉ phục vụ demo.

## Ba mốc Git

1. `feat: booking website, MySQL transactions and Docker Nginx deployment` — website/database/Nginx, đã test API và persistence.
2. `feat: provision Prometheus Grafana and real container Nginx MySQL metrics` — metrics thật và dashboard, đã kiểm tra mọi panel.
3. `feat: centralize Loki Promtail logs and complete verified demo documentation` — logs, bản sửa tìm thấy khi test trình duyệt, tài liệu và kiểm tra cuối.

Không push. Kiểm tra lịch sử bằng `git log --oneline -3`. Nếu Git báo dubious ownership do tài khoản sandbox khởi tạo repo, dùng `git -c safe.directory=C:/dat-ve-xem-phim log --oneline -3` cho lệnh đó; không cần tắt kiểm tra toàn cục.
