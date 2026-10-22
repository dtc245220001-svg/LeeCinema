# Hình minh họa phim

12 hình được tạo bằng công cụ imagegen tích hợp, dùng cho các phim giả định của dự án Cinema 11. Không tải poster thương mại từ website ngoài, không dùng khuôn mặt người nổi tiếng. Hình gốc được giữ tại nơi công cụ sinh ảnh; bản sử dụng trong website được tối ưu thành WebP 768×1152 tại `public/posters/`.

Prompt chung: “Original portrait movie poster artwork for a fictional Vietnamese demo film; premium detailed cinematic key art, compelling vertical composition, full bleed; no text, typography, logos, watermarks, celebrities or existing franchise characters.”

| File WebP | Phim | Cảnh / prompt riêng |
|---|---|---|
| space | Hành trình vũ trụ | Astronaut on a rocky planet beneath an enormous luminous ringed planet, spacecraft and nebula, teal blue and warm gold |
| summer | Mùa hè đáng nhớ | Three young Vietnamese friends cycling along a tropical coast at golden sunset, nostalgic summer romance |
| city | Bí mật thành phố | Detective in a trench coat walking through a rainy neon-lit Asian city, cinematic noir |
| cloud | Vương quốc mây | Girl and friendly mechanical bird facing a floating castle among clouds, family animation |
| race | Đường đua rực lửa | Sports cars racing on a mountain circuit at dusk, low camera, cinematic action |
| trip | Chuyến đi bất ngờ | Cheerful vintage minibus and friends on a winding Vietnamese coastal road, travel comedy |
| music | Giai điệu thanh xuân | Vietnamese youth band performing under purple and amber concert lights |
| mist | Ngôi nhà trong sương | Old isolated house with one glowing window in fog and twisted trees, suspense, no gore |
| forest | Dấu chân đại ngàn | Two siblings hiking through tropical forest toward a monumental waterfall, adventure |
| letter | Lá thư cuối mùa | Vietnamese woman reading a letter by a rain-streaked window, autumn golden light |
| moon | Huyền thoại ánh trăng | Lantern keeper on a bridge toward a magical kingdom under a luminous moon, fantasy |
| river | Dòng sông ký ức | Wooden boat, misty river, traditional Vietnamese village, historical cinematic atmosphere |

Các file SVG cũ được giữ để không mất nguồn minh họa ban đầu. `database/04-poster-art.sql` chuyển đường dẫn poster sang WebP khi init database; file này cũng đã áp dụng vào database hiện tại, không thay dữ liệu vé. Banner trang chủ dùng space.webp, trang giới thiệu dùng music.webp. Nhãn phim demo/ảnh minh họa được giải thích trong trang hướng dẫn.

`scripts/optimize-posters.cjs` dùng sharp để chuyển/resize ảnh, không gọi API tạo ảnh. Muốn tái tối ưu cần có nguồn PNG tương ứng tại tmp/artwork-input; tmp bị bỏ qua khỏi Git/Docker. WebP đã lưu trong repo nên chạy website không cần công cụ sinh ảnh hay sharp.
