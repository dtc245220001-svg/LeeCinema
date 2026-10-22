# Đối chiếu trực tiếp với D:\Đề 11.docx

Tài liệu gốc được đọc ngày 22/10/2026, không chỉnh sửa file gốc. File Word yêu cầu 7 giai đoạn và cho phép thêm commit hoàn thiện sau ba commit chính.

| Giai đoạn | Kết quả trong dự án | Minh chứng / phần cần hoàn thiện |
|---|---|---|
| 1. Chuẩn bị dự án và GitHub | Express, .gitignore, .env.example, README, kiến trúc; repository LeeCinema do người dùng chọn | https://github.com/dtc245220001-svg/LeeCinema ; ba mốc commit và commit hoàn thiện, xác minh remote trước khi nộp |
| 2. Website và MySQL | 12 phim; chọn suất/ghế, validation, thanh toán giả lập, mã vé; 6 bảng InnoDB, transaction và UNIQUE; volume | tests/integration.cjs, browser.cjs; ảnh 04–07, 12–13 |
| 3. Docker + Nginx / commit 1 | Dockerfile và compose.yaml; Nginx proxy, security headers; hướng dẫn PowerShell | 648532d; ảnh 08–09; website 3003 theo lựa chọn người dùng |
| 4. Prometheus + Grafana / commit 2 | Exporters container/Nginx/MySQL; datasource/dashboard provisioned; metrics thật | 3c10d96; tests/monitoring.cjs, grafana.cjs; ảnh 11, 14–16 |
| 5. Loki + Promtail / commit 3 | Log ứng dụng/Nginx, datasource Loki; ba nhóm LogQL thực | 7b53b84; tests/logging.cjs; ảnh 17–19 có truy vấn và kết quả |
| 6. Hardening / kiểm thử | Non-root, tách mạng, bí mật env, quyền DB giới hạn, headers và cổng localhost; tranh chấp/persistence | tests/hardening.cjs; scripts/verify.cjs; ảnh 09–10, test-results.json |
| 7. Báo cáo và demo | Báo cáo DOCX/HTML/PDF, ảnh đánh số, giải thích; README, DEMO | Điền thông tin sinh viên/giảng viên và URL repo còn thiếu trước khi nộp; không gọi dàn ý là báo cáo hoàn chỉnh |

## Chạy lại toàn bộ

```powershell
Set-Location C:\dat-ve-xem-phim
powershell -ExecutionPolicy Bypass -File scripts/stack.ps1 up
# Lịch demo cũ hết hạn: thêm lịch mới, không xóa đơn cũ
powershell -ExecutionPolicy Bypass -File scripts/refresh-showtimes.ps1
node scripts/verify.cjs
node scripts/capture-evidence.cjs
python scripts/build-report.py
node scripts/print-report.cjs
```

verify tạo một số đơn demo và restart riêng db/app/Nginx để chứng minh persistence; không xóa database. capture-evidence tạo thêm một đơn cho ảnh xác nhận. Các ảnh Docker/headers/test là phiếu trình bày dữ liệu lệnh thật và được ghi chú rõ, không giả ảnh terminal. Các ảnh Grafana/phpMyAdmin/Prometheus/website là chụp trực tiếp giao diện. Ảnh phpMyAdmin bookings chỉ chọn cột không có tên/email khách.

## Điền bìa mà không sửa mã

Sao chép docs/report-student.example.json thành docs/report-student.local.json rồi điền họ tên, MSSV xác nhận, lớp, trường/khoa, giảng viên và URL repository. File local bị Git bỏ qua. Chạy lại build-report.py và print-report.cjs để xuất báo cáo. Khi chưa có thông tin, bản xuất đánh dấu CHƯA CUNG CẤP/CHƯA CÓ; không tự bịa.

## GitHub

Giữ nguyên ba commit chính, thêm commit hoàn thiện là phù hợp file Word. Không cần squash/rebase để ép lịch sử chỉ còn ba commit. Người dùng đã chọn repository LeeCinema, tài khoản dtc245220001-svg. Không đính kèm .env, exporter.cnf, tmp hay thông tin đăng nhập. scripts/publish-github.py chỉ dùng xác thực Git chuẩn đã lưu, xác nhận đúng tài khoản và từ chối ghi đè lịch sử/remote khác.

## Giới hạn công bố

Promtail đã EOL, vẫn dùng theo đề; có ghi chú chuyển Alloy. cAdvisor privileged là ngoại lệ thu thập metrics Docker Desktop VM. Không có thanh toán thật, TLS production, thử tải lớn, backup/restore hoặc thí nghiệm retention đủ bảy ngày. Không bịa kết quả các mục chưa thử.
