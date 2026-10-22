# Trạng thái công bố và nội dung cần duyệt

Repository đã được tạo/xác minh: https://github.com/dtc245220001-svg/LeeCinema . Tài khoản và tên repository do người dùng cung cấp. **Mã nguồn chưa được push**: bước công bố toàn bộ project/evidence bị kiểm duyệt tự động từ chối do chưa có xác nhận rõ cho payload cụ thể.

Nội dung chuẩn bị công bố gồm mã nguồn Express/frontend, SQL, Docker/Nginx/metrics/log configs, tests/scripts, 12 poster WebP, README, tài liệu demo, báo cáo Word/PDF/HTML và ảnh minh chứng. Báo cáo có tên Trần Nhật Lệ và MSSV suy ra từ tài khoản (được đánh dấu cần xác nhận). Ảnh phpMyAdmin bookings chỉ chọn ID/mã vé/suất/tổng tiền/trạng thái/thời gian, không hiển thị tên hoặc email khách.

File .env, monitoring/mysql/exporter.cnf, docs/report-student.local.json, node_modules và tmp không được Git quản lý. scripts/check-secrets.cjs kiểm tra file được track không chứa các giá trị bí mật đã cấu hình; kiểm tra này không bảo đảm mọi dữ liệu đều phù hợp công khai. Người dùng cần duyệt báo cáo và ảnh trước khi cho phép push.

Bìa còn thiếu lớp, trường/khoa, giảng viên và xác nhận MSSV. Không tự điền giả. Báo cáo PDF đã kiểm tra 22 trang, 18 hình, không tràn nội dung; DOCX có XML và ảnh nhúng hợp lệ. Bộ kiểm thử đầy đủ đều đạt trong phiên chạy lưu tại docs/evidence/test-results.json.

Sau khi người dùng đồng ý công khai payload trên, chạy kiểm tra bí mật, bảo đảm Git sạch, rồi dùng scripts/publish-github.py --push. Script từ chối remote khác, kiểm tra đúng tài khoản, không force push, không in token và xác minh remote main khớp local HEAD. Chỉ khi xác minh thành công mới ghi nhận đã publish.
