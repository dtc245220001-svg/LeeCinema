# Dàn ý báo cáo tối thiểu 10 trang

Đề xuất 12 trang nội dung (không tính bìa, mục lục, tài liệu tham khảo). Đây là dàn ý; sinh viên bổ sung ảnh chạy thật, diễn giải và thông tin cá nhân. Không coi dàn ý là báo cáo hoàn chỉnh.

1. **Trang 1 — Bối cảnh và mục tiêu.** Đề tài 11; vấn đề đặt vé, khách demo, phạm vi phim; yêu cầu môn học; thanh toán giả lập. Nêu thành công đo bằng đặt vé/persistence/race/metrics/log.
2. **Trang 2 — Yêu cầu chức năng và phi chức năng.** Bảng chức năng tìm kiếm, chi tiết, lịch, ghế, xác nhận; validation; dữ liệu MySQL; responsive; đồng thời; giới hạn tối đa 8 ghế. Không đưa tính năng chưa xây dựng.
3. **Trang 3 — Kiến trúc triển khai.** Sơ đồ các container, mạng frontend/database/monitoring; đường request và đường metrics/log; lý do Nginx, volumes; ghi cổng thực 3003/8082/3002/9091 và lý do không dùng 3000/3001.
4. **Trang 4 — Thiết kế cơ sở dữ liệu.** ERD sáu bảng, kiểu dữ liệu, khóa chính/ngoại, CHECK, UNIQUE, composite FK; dữ liệu mẫu và thời gian UTC+7. Chụp SHOW CREATE TABLE thực tế.
5. **Trang 5 — Giao diện và API.** Ảnh desktop/mobile, flow chọn phim→lịch→ghế→khách→vé; bảng GET/POST endpoints, status 200/201/400/404/409/503; loading/error/empty. Giải thích SVG nội bộ và không localStorage.
6. **Trang 6 — Transaction và đồng thời.** Pseudocode begin→lock showtime→check seats→calculate→insert→commit/rollback. Giải thích UNIQUE chống trùng, server price và kiểm thử hai request. Đính kèm output race thật; phân biệt kiểm thử chức năng với load test.
7. **Trang 7 — Docker Compose và Nginx.** Dockerfile non-root, build reproducible npm ci; image versions; depends_on healthy; init MySQL; persistent volume; Nginx proxy/headers; phân biệt stop/down/down -v. Ảnh stack.
8. **Trang 8 — Giám sát metrics.** Prometheus jobs, exporter MySQL/Nginx/cAdvisor; provisioning Grafana; giải thích queries/s, requests/s, CPU core-seconds/s, RAM working set. Chụp targets và dashboard có dữ liệu, ghi Docker Desktop VM giới hạn.
9. **Trang 9 — Log tập trung.** Luồng file volumes→Promtail→Loki→Grafana; nhãn, JSON, positions, retention; trình bày ≥3 LogQL và kết quả. Công bố Promtail EOL 02/03/2026, lựa chọn học tập, hướng Alloy.
10. **Trang 10 — Hardening.** Ít nhất 4 biện pháp, file áp dụng, bằng chứng; quyền app vs root, cap_drop, read-only, networks, env, headers, localhost. Nêu cAdvisor privileged ngoại lệ và HTTP demo chưa TLS.
11. **Trang 11 — Kiểm thử, sự cố và kết quả.** Dùng docs/VERIFICATION.md và các JSON. Bảng case/kỳ vọng/kết quả/thời gian. Mô tả lỗi quyền FOR UPDATE tìm thấy và sửa. Không bịa screenshot, latency benchmark hay uptime SLA; liệt kê phần chưa kiểm tra.
12. **Trang 12 — Demo, đánh giá và hướng phát triển.** Đối chiếu 7 tiêu chí, 3 commits, quy trình demo/dừng; giới hạn (không payment thật, không auth/admin business, không seat hold, thiếu TLS/backup tự động), kế hoạch TLS, auth, backup/restore, Alloy và kiểm thử tải.

Phụ lục: lệnh PowerShell, version matrix, LogQL, cấu hình chính; tham khảo tài liệu chính thức Express/MySQL/Docker/Prometheus/Grafana. Dẫn nguồn và ngày truy cập thật. Bìa/mục lục tùy mẫu trường. Mỗi trang cần phát triển thành văn bản có hình/bảng liên quan, không kéo dài bằng nội dung lặp.
