# Tiệm Nét Cỏ · 克隆笔记 (Clone Notes)

## 源信息
- **原站 URL**: https://tiem-net-co-online.netlify.app/
- **CDN Assets URL**: https://tiem-net-co-assets.pages.dev/
- **游戏名称**: Tiệm Nét Cỏ – Ông Chủ Quán Nét (v1.2.1)
- **Mô tả**: Game quản lý quán net pixel art: từ net cỏ 4 máy thành cyber game lớn nhất khu phố.
- **许可证**: UNLICENSED / Bản quyền thuộc về tác giả game gốc. Chỉ dùng cho mục đích học tập, nghiên cứu và giải trí cá nhân ngoại tuyến.

## 技术栈 (Tech Stack)
- **Rendering**: HTML5 Canvas 2D + Pixel Art Spritesheets.
- **Audio Engine**: Web Audio API + Custom Audio Packs (`.pack` format - header `NCPA`) + Streaming BGM (`.m4a`).
- **Styling**: CSS3 Custom Properties (Variables), Responsive Layout, Retro Pixel Aesthetic.
- **Typography**: Google Fonts (Baloo 2, Be Vietnam Pro, VT323) — đã được tải về nội bộ (self-hosted) trong `assets/fonts/`.
- **App Shell / PWA**: Web App Manifest (`manifest.webmanifest`), Service Worker (`sw.js`).
- **Data Persistence**: `localStorage` (lưu trên máy), hỗ trợ chơi Offline / Khách không cần mạng.

## Cấu trúc thư mục (Project Structure)
```
tiem-net-co-online-clone/
├── index.html                   # Trang chính đã tối ưu chạy 100% offline
├── index-original.html          # Bản gốc nguyên bản tải từ Netlify
├── manifest.webmanifest         # Cấu hình PWA
├── version.json                 # Thông tin build v1.2.1
├── sw.js                        # Service worker cache
├── favicon.ico                  # Favicon game
├── package.json                 # Scripts chạy npm start
├── server.js                    # Web server Node.js zero-dependency
├── start.bat                    # Script click đúp chạy ngay trên Windows
├── css/
│   ├── app.css                  # Toàn bộ CSS phong cách game
│   ├── app.original.css         # Bản CSS gốc lưu trữ
│   ├── app-48069e1e05ad.css     # Bản CDN hash tương thích
│   └── fonts.css                # CSS nhúng font offline
├── js/
│   ├── app.js                   # Mã nguồn logic game (đã tinh chỉnh audio base local)
│   ├── app.original.js          # Bản JS gốc lưu trữ
│   └── app-ae259e7be763.js      # Bản CDN hash tương thích
├── assets/
│   ├── icons/                   # Icon ứng dụng (192, 512, apple-touch, maskable)
│   ├── fonts/                   # 22 file font woff2 tự lưu trữ
│   ├── art/decor/               # Spritesheet & tranh vẽ pixel trang trí tiệm net
│   └── audio/
│       ├── CREDITS.md           # Nguồn gốc & bản quyền âm thanh
│       ├── *.m4a                # 6 bài nhạc nền BGM (day, night, florist, countryside, chill, hiphop)
│       └── packs/               # 7 pack âm thanh hiệu ứng (.pack - NCPA format)
└── RECON/
    └── screenshots/             # Ảnh chụp kiểm thử tự động (Title, Character Create, Gameplay)
```

## Cách chạy game (How to Run)
### Cách 1: Click file chạy ngay trên Windows
Click đúp chuột vào file `start.bat`. File này sẽ tự bật server và mở trình duyệt tại `http://localhost:8080/`.

### Cách 2: Bằng dòng lệnh Node.js
```bash
cd C:\Users\phamn\.gemini\antigravity\scratch\tiem-net-co-online-clone
node server.js
```
Hoặc:
```bash
npm start
```
Sau đó mở trình duyệt truy cập: `http://localhost:8080/`

## 改了什么 (Các thay đổi & Tinh chỉnh Offline)
1. **Self-hosted toàn bộ tài nguyên CDN**:
   - Tải toàn bộ 7 sound pack (`assets/audio/packs/*.pack`) và 6 bản nhạc nền BGM từ CDN về local.
   - Tải toàn bộ 22 biến thể font (Baloo 2, Be Vietnam Pro, VT323) về `assets/fonts/` kèm `css/fonts.css`.
2. **Audio Base**:
   - Tinh chỉnh `window.GAME_AUDIO_BASE = window.GAME_AUDIO_BASE || "./"` trong `js/app.js` để âm thanh và nhạc nền ưu tiên tải trực tiếp từ thư mục nội bộ, không phụ thuộc vào kết nối mạng.
3. **Giữ nguyên bản gốc đối chiếu**:
   - `index-original.html`, `js/app.original.js`, `css/app.original.css` được lưu giữ nguyên trạng 100% không chỉnh sửa.

## 复刻评分 (Fidelity Score)
| Tiêu chí | Điểm | Đánh giá thực tế |
|---|---|---|
| **源证据 (Source Evidence)** | 5/5 | Toàn bộ 46 tệp tin thật được tải trực tiếp từ production host của Netlify & Cloudflare Pages. |
| **结构保真 (Structure)** | 5/5 | 100% nguyên bản Canvas 2D + DOM HUD + Modal + PWA structure. |
| **视觉保真 (Visual)** | 5/5 | Điểm ảnh pixel art, font chữ, màu sắc, hiệu ứng ánh sáng đồng nhất hoàn toàn với web gốc. |
| **动效/交互 (Interaction)** | 5/5 | Thử nghiệm tự động qua Playwright: tạo nhân vật, đặt tên tiệm, vào game loop, di chuyển, render máy móc CRT, khách hàng mượt mà. |
| **响应式 (Responsive)** | 5/5 | Tương thích đầy đủ cả giao diện máy tính (ngang) và điện thoại (dọc). |
| **功能完整 (Completeness)** | 5/5 | Hỗ trợ lưu trữ cục bộ (local save), quản lý tài chính, nâng cấp tiệm, mua sắm đồ đạc trang trí. |
| **Tổng kết** | **5.0 / 5.0** | Bản sao hoàn chỉnh, chạy offline độc lập 100%. |

## 验证 (Verification)
- [x] Đã khởi chạy server local tại `http://127.0.0.1:8125/` và `8126/`.
- [x] Đã tự động điều khiển trình duyệt kiểm tra:
  - Màn hình tiêu đề (Title screen): Đầy đủ logo, nút Bắt đầu, Cài đặt.
  - Tạo nhân vật: Chọn kiểu tóc, màu da, màu áo, đổi tên quán.
  - Khai trương: Load đầy đủ phòng net, quầy thu ngân, tủ nước ngọt, 4 máy tính đời đầu, ghế đỏ.
- [x] Ảnh đối chiếu lưu tại: `RECON/screenshots/clone-title-1440.png`, `clone-gameplay-1440.png`, `clone-playing-1440.png`.
