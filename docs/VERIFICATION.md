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

Ảnh website được tạo bởi tests/browser.cjs; scripts/capture-evidence.cjs bổ sung ảnh trực tiếp phpMyAdmin, Prometheus, Grafana và ba truy vấn LogQL. Ảnh quyền/mạng/headers và kết quả lệnh là phiếu dữ liệu kiểm chứng thật, không giả ảnh terminal. Manifest ghi thời điểm và nguồn. PNG/JPG evidence không còn bị Git bỏ qua để có thể nộp cùng repository. File metrics-check.json, logging-check.json, persistence-check.json và evidence/test-results.json lưu dữ liệu kiểm tra; không chứa mật khẩu.

## Các lỗi phát hiện và đã sửa

- Tài khoản SELECT/INSERT thiếu quyền phục vụ SELECT FOR UPDATE: bổ sung UPDATE chỉ trên showtimes, khóa bảng suất chiếu riêng thay vì khóa cả JOIN.
- MySQL CLI import mặc định latin1: thêm SET NAMES utf8mb4 và sửa một lần seed cũ bằng scripts/repair-encoding.sql, giữ nguyên bookings. Edge sau sửa tìm “vũ trụ” đúng.
- Loki 3.5.0 phát log lỗi metadata size=0 mặc dù vẫn nhận log: nâng cặp Loki/Promtail lên 3.5.12; nguồn lỗi upstream https://github.com/grafana/loki/issues/17371 .
- PowerShell ExecutionPolicy chặn npm.ps1: dùng npm.cmd, setup dùng Bypass cho tiến trình.
- Sandbox không truy cập Docker pipe và CIM: các kiểm tra Docker/cổng được chạy sau khi cấp quyền; không khẳng định đã kiểm tra nếu thiếu quyền.

## Giới hạn kiểm chứng

Cập nhật giao diện: trang chủ/banner, danh sách 12 poster WebP, lọc thể loại, trang lịch chiếu lấy MySQL và chọn sẵn suất, trang giới thiệu, hướng dẫn/FAQ và menu mobile. tests/browser.cjs đã kiểm tra các luồng này ở desktop 1440px/mobile 390px, đặt vé thành công, không lỗi JS/CSP hoặc tràn ngang. Kiểm thử API có thêm GET /api/showtimes. Poster là hình minh họa AI cho phim demo, không phải ảnh minh chứng kết quả hệ thống; screenshot trong evidence được chụp từ website thật.

Cập nhật danh mục ngày 09/10/2026: thêm 9 phim mẫu, tổng 12 phim; thêm 3 phòng, tổng 200 ghế và 105 suất khi khởi tạo mới. Mỗi phim mới có lịch 7 ngày và poster SVG nội bộ. Kiểm thử Edge với 12 phim, kiểm tra vé cũ và khởi tạo database rỗng đều đạt. Các số 3 phim/42 suất/80 ghế ở kết quả ban đầu mô tả mốc trước khi mở rộng danh mục.

Chưa kiểm thử tải lớn, mất điện/đĩa hỏng, backup/restore, retention đủ 7 ngày, bảo mật production, thanh toán thật hoặc trình duyệt ngoài Edge. Persistence là kiểm tra restart, không thay cho phục hồi thảm họa. Báo cáo nội dung và ảnh được xuất riêng sang DOCX/HTML/PDF; thông tin bìa và repository chưa được cung cấp đầy đủ nên đánh dấu chờ bổ sung. Promtail EOL được công bố, cAdvisor dùng privileged và số liệu từ Linux VM. HTTP localhost chỉ phục vụ demo.

## Ba mốc Git

1. `feat: booking website, MySQL transactions and Docker Nginx deployment` — website/database/Nginx, đã test API và persistence.
2. `feat: provision Prometheus Grafana and real container Nginx MySQL metrics` — metrics thật và dashboard, đã kiểm tra mọi panel.
3. `feat: centralize Loki Promtail logs and complete verified demo documentation` — logs, bản sửa tìm thấy khi test trình duyệt, tài liệu và kiểm tra cuối.

Không push. Kiểm tra lịch sử bằng `git log --oneline -3`. Nếu Git báo dubious ownership do tài khoản sandbox khởi tạo repo, dùng `git -c safe.directory=C:/dat-ve-xem-phim log --oneline -3` cho lệnh đó; không cần tắt kiểm tra toàn cục.
