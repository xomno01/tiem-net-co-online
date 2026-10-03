# 🎮 Tiệm Nét Cỏ Online – Server Riêng & Web Game Pixel Art

> **Bản dựng Private Server độc lập & mã nguồn đầy đủ của Web Game "Tiệm Nét Cỏ: Ông Chủ Quán Nét" (v1.2.1). Hỗ trợ chơi Online nhiều người, đồng bộ Cloud Save và Bảng xếp hạng qua SQLite nội bộ.**

---

## 🌟 Điểm Nổi Bật

* **Đầy đủ 100% tài nguyên gốc**: 82 tệp bao gồm toàn bộ Canvas UI, 7 sound pack hiệu ứng âm thanh (`.pack`), 6 bản nhạc nền Lofi BGM (`.m4a`), 16 bộ decor vẽ tay và 22 file web fonts tiếng Việt offline.
* **Tích hợp sẵn Backend API (Node.js + SQLite)**: Thay thế hoàn toàn Supabase, Firebase và Netlify Functions. Không phụ thuộc bất kỳ dịch vụ bên thứ ba nào.
* **Tính năng Online Multiplayer như bản gốc**:
  * 👤 **Tài khoản Online & Đăng nhập khách nhanh**: Tự động sinh ID và cấp JWT token bảo mật.
  * ☁️ **Lưu tiến trình lên Cloud**: Tự động đồng bộ tiệm net (tiền, ngày, máy tính, nhân viên, decor) vào file database `data/netco.db`.
  * 🏆 **Bảng xếp hạng nhiều người chơi (Leaderboard)**: Đua top Doanh thu, Danh tiếng và Số ngày mở quán theo thời gian thực.
  * 💬 **Chat cộng đồng & Ghé thăm tiệm bạn bè (Social Feed & Visit)**: Xem phòng máy và trang trí của các chủ tiệm khác.
* **Zero External Dependencies**: Server viết bằng module chuẩn của Node.js 22+ (`node:http`, `node:sqlite`, `node:crypto`), không cần cài đặt thêm gói `npm` nặng nề nào.

---

## 🚀 Hướng Dẫn Khởi Chạy Nhanh (Windows & VPS)

### Yêu cầu hệ thống
* **Node.js** >= 22.0 (Khuyên dùng Node.js 22 LTS hoặc 24).
* Hệ điều hành: Windows, Windows Server, Linux hoặc macOS.

---

### Cách 1: Click chạy ngay trên Windows (Khuyên dùng)
1. Tải hoặc clone thư mục về máy.
2. Click đúp vào file **`start.bat`**.
3. Mở trình duyệt truy cập: **`http://localhost:8080/`**.

---

### Cách 2: Chạy bằng dòng lệnh
```bash
# Khởi động server
node server.js

# Hoặc dùng npm script
npm start
```
Server sẽ chạy tại `http://localhost:8080/` (hoặc cổng cấu hình qua biến môi trường `PORT`).

---

## 🖥️ Hướng Dẫn Chạy 24/7 Trên VPS Windows

Để server luôn chạy ngầm 24/7 kể cả khi tắt remote desktop, anh có thể dùng 1 trong 2 cách sau:

### Phương án A: Dùng PM2 (Dễ nhất & Tự khởi động lại khi crash)
```powershell
# Cài đặt PM2 toàn cục (nếu chưa có)
npm install -g pm2

# Vào thư mục game và khởi động
cd C:\path\to\tiem-net-co-online
pm2 start server.js --name "netco-server"

# Cài đặt tự khởi động cùng Windows
npm install -g pm2-windows-startup
pm2-startup install
pm2 save
```

### Phương án B: Dùng NSSM (Cài làm Windows Service)
1. Tải [NSSM (Non-Sucking Service Manager)](https://nssm.cc/).
2. Chạy lệnh:
   ```cmd
   nssm install TiemNetCoService "C:\Program Files\nodejs\node.exe" "C:\path\to\tiem-net-co-online\server.js"
   nssm start TiemNetCoService
   ```

---

## 🌐 Gắn Subdomain (Cloudflare Tunnel: `netco.n0ai.cloud`)

Dự án đã chuẩn bị sẵn file cấu hình Cloudflare Tunnel:

1. **Thêm CNAME trên Cloudflare Dashboard**:
   * Truy cập quản lý DNS của domain `n0ai.cloud`.
   * Thêm bản ghi **CNAME**:
     * **Name**: `netco`
     * **Target**: `<Tunnel_ID>.cfargotunnel.com`
     * **Proxy Status**: Bật đám mây cam (Proxied).
2. **Khởi chạy Tunnel**:
   ```powershell
   cloudflared tunnel --protocol http2 --config "$HOME\.cloudflared\netco-tunnel.yml" run
   ```
3. Sau khi kết nối, toàn bộ người chơi bên ngoài có thể truy cập trực tiếp tại:
   👉 **`https://netco.n0ai.cloud/`**

---

## 🔌 Tài Liệu API Backend (SQLite Database)

Tất cả dữ liệu được lưu trữ liên tục trong tệp **`data/netco.db`**:

| Phương thức | Endpoint | Chức năng |
|---|---|---|
| `POST` | `/auth/v1/signup` | Tạo tài khoản khách (Guest Auth) & cấp JWT Token |
| `POST` | `/api/auth/guest` | Tạo nhanh tài khoản khách |
| `GET` | `/api/bootstrap` | Tải dữ liệu cloud save & thông tin tiệm |
| `POST` | `/api/sync` | Lưu tiến trình game (tiền, dàn máy, nhân viên) vào database |
| `POST` | `/api/reset` | Khởi tạo tiệm mới |
| `POST` | `/api/delete-save` | Xóa dữ liệu cloud của tài khoản |
| `GET` | `/api/leaderboard?type=revenue` | Bảng xếp hạng doanh thu / danh tiếng |
| `GET` | `/api/notices` | Thông báo admin hệ thống |
| `POST` | `/api/operations` | Heartbeat duy trì kết nối |
| `GET` | `/api/social/feed` | Lấy danh sách tin nhắn cộng đồng |
| `POST` | `/api/social/message` | Gửi tin nhắn lên bảng tin |
| `POST` | `/api/social/visit` | Ghé thăm phòng net của chủ quán khác |

---

## 📁 Cấu Trúc Dự Án

```
tiem-net-co-online/
├── server.js               # Backend API Server + Static Web Host (Cổng 8080)
├── start.bat               # File khởi động 1-click trên Windows
├── package.json            # Thông tin dự án & lệnh khởi chạy
├── data/
│   └── netco.db            # Cơ sở dữ liệu SQLite lưu tài khoản, save cloud, BXH
├── index.html              # Giao diện chính (đã tối ưu tự nhận diện host)
├── index-original.html     # Bản gốc đối chiếu tải từ Netlify
├── manifest.webmanifest    # Cấu hình PWA cài đặt game vào máy
├── sw.js                   # Service Worker cache game
├── css/
│   ├── app.css             # Style retro pixel art
│   └── fonts.css           # Cấu hình font tiếng Việt offline
├── js/
│   ├── app.js              # Logic trò chơi & kết nối Backend API nội bộ
│   └── app.original.js     # Bản JS gốc đối chiếu
└── assets/
    ├── fonts/              # 22 file Web Font WOFF2
    ├── icons/              # Bộ icon PWA đầy đủ kích thước
    ├── art/decor/          # Spritesheet & ảnh vẽ tay nội thất tiệm net
    └── audio/              # 6 bản nhạc nền Lofi BGM & 7 pack hiệu ứng âm thanh
```

---

## 📜 Bản Quyền
Dự án được clone và phát triển phục vụ mục đích học tập, lưu trữ cá nhân và nghiên cứu kỹ thuật. Bản quyền đồ họa và ý tưởng gốc thuộc về tác giả trò chơi Tiệm Nét Cỏ.
