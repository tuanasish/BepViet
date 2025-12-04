# BepViet - Nền tảng Chia sẻ Công thức Nấu Ăn

BepViet là một ứng dụng web hiện đại cho phép người dùng chia sẻ, khám phá và quản lý các công thức nấu ăn. Dự án này được xây dựng bằng React, TypeScript, Express.js và MongoDB.

## 🌟 Tính năng Chính

- **Chia sẻ Công thức**: Người dùng có thể tạo, chỉnh sửa và chia sẻ công thức nấu ăn
- **Bình luận & Đánh giá**: Cộng động có thể bình luận và thích các công thức
- **Bộ Sưu Tập**: Lưu công thức yêu thích vào bộ sưu tập cá nhân
- **Theo Dõi Người Dùng**: Theo dõi những người nấu ăn yêu thích
- **Tìm Kiếm**: Tìm kiếm công thức theo tên, nguyên liệu hoặc người tạo
- **Chatbot AI**: Trợ lý AI giúp tìm kiếm công thức và gợi ý
- **Quản Trị Viên**: Bảng điều khiển quản trị để giám sát nội dung và người dùng
- **Quản lý Tệp tin**: Tải lên hình ảnh công thức sử dụng Cloudinary

## 📋 Yêu cầu Hệ thống

- **Node.js**: v16 trở lên
- **npm** hoặc **yarn**
- **MongoDB**: Database
- **Cloudinary**: Để quản lý hình ảnh
- **Google Generative AI API**: Cho tính năng Chatbot

## 🚀 Hướng Dẫn Cài Đặt

### 1. Clone Repository
```bash
git clone <repository-url>
cd bepviet
```

### 2. Cài Đặt Dependencies cho Frontend

```bash
npm install
```

### 3. Cài Đặt Dependencies cho Backend

```bash
cd backend
npm install
cd ..
```

### 4. Cấu Hình Biến Môi Trường

Tạo file `.env.local` ở thư mục gốc:
```env
VITE_API_URL=http://localhost:3000
```

Tạo file `.env` ở thư mục `backend/`:
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/bepviet
JWT_SECRET=your_jwt_secret_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
GEMINI_API_KEY=your_gemini_api_key
```

## 💻 Chạy Ứng Dụng

### Frontend (Vite)
```bash
npm run dev
```
Truy cập: http://localhost:5173

### Backend (Express.js)
```bash
cd backend
npm run dev
```
Backend chạy tại: http://localhost:3000

## 📦 Cấu Trúc Dự Án

```
bepviet/
├── frontend/                    # Mã React frontend
│   ├── components/             # Các component React
│   ├── pages/                  # Các trang chính
│   │   ├── admin/             # Trang quản trị
│   │   ├── auth/              # Trang đăng nhập/đăng ký
│   │   └── user/              # Trang người dùng
│   ├── utils/                 # Hàm tiện ích
│   └── api.ts                 # Client API
├── backend/                    # Mã Express.js backend
│   ├── src/
│   │   ├── models/            # Mongoose schemas
│   │   ├── routes/            # API endpoints
│   │   ├── middleware/        # Middleware Express
│   │   ├── utils/             # Hàm tiện ích backend
│   │   └── server.ts          # Entry point
│   ├── package.json
│   └── tsconfig.json
├── components/                 # Shared components
├── pages/                      # Shared pages
├── App.tsx                     # Component chính
└── package.json
```

## 🔗 API Endpoints Chính

### Authentication
- `POST /api/auth/register` - Đăng ký người dùng
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất

### Recipes (Công thức)
- `GET /api/recipes` - Lấy danh sách công thức
- `POST /api/recipes` - Tạo công thức mới
- `GET /api/recipes/:id` - Lấy chi tiết công thức
- `PUT /api/recipes/:id` - Cập nhật công thức
- `DELETE /api/recipes/:id` - Xóa công thức

### Posts (Bài viết)
- `GET /api/posts` - Lấy danh sách bài viết
- `POST /api/posts` - Tạo bài viết mới
- `GET /api/posts/:id` - Lấy chi tiết bài viết
- `PUT /api/posts/:id` - Cập nhật bài viết
- `DELETE /api/posts/:id` - Xóa bài viết

### Users (Người dùng)
- `GET /api/users/:id` - Lấy thông tin người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng
- `POST /api/users/:id/follow` - Theo dõi người dùng

### Comments (Bình luận)
- `GET /api/comments/:postId` - Lấy bình luận
- `POST /api/comments` - Tạo bình luận
- `DELETE /api/comments/:id` - Xóa bình luận

### Likes (Thích)
- `POST /api/likes` - Thích bài viết/công thức
- `DELETE /api/likes/:id` - Bỏ thích

### Chatbot (AI)
- `POST /api/chatbot` - Chat với trợ lý AI

## 🛠️ Stack Công Nghệ

### Frontend
- **React 19**: Thư viện UI
- **TypeScript**: Ngôn ngữ lập trình kiểu tĩnh
- **Vite**: Build tool hiện đại
- **React Router**: Định tuyến trang
- **React Hot Toast**: Thông báo tương tác

### Backend
- **Express.js**: Framework web
- **TypeScript**: Ngôn ngữ lập trình kiểu tĩnh
- **MongoDB**: Database NoSQL
- **Mongoose**: ORM cho MongoDB
- **JWT**: Xác thực token
- **Bcrypt**: Mã hóa mật khẩu
- **Cloudinary**: Dịch vụ quản lý hình ảnh
- **Google Generative AI**: API chatbot

## 🔐 Bảo Mật

- Mật khẩu được mã hóa bằng bcrypt
- JWT được sử dụng cho xác thực
- CORS được cấu hình để bảo vệ API
- Middleware xác thực trên các route cần thiết
- Bộ lọc từ tục miệng (bad-words filter)

## 👤 Các Vai Trò Người Dùng

1. **Người Dùng Thường**: Chia sẻ công thức, bình luận, theo dõi
2. **Quản Trị Viên**: Quản lý nội dung, người dùng, xem nhật ký hoạt động

## 📝 Hướng Dẫn Phát Triển

### Thêm Model Mới
1. Tạo file model trong `backend/src/models/`
2. Định nghĩa schema Mongoose
3. Export model

### Thêm Route Mới
1. Tạo file route trong `backend/src/routes/`
2. Định nghĩa các endpoint
3. Import trong `server.ts`

### Thêm Component React
1. Tạo component trong `frontend/components/` hoặc `pages/`
2. Export component
3. Import nơi cần sử dụng

## 🐛 Debug & Troubleshooting

### Frontend không kết nối được Backend
- Kiểm tra `VITE_API_URL` trong `.env.local`
- Đảm bảo backend đang chạy trên port 3000

### MongoDB Connection Error
- Kiểm tra `MONGODB_URI` trong `.env`
- Đảm bảo MongoDB service đang chạy

### Lỗi Cloudinary
- Kiểm tra credentials Cloudinary trong `.env`

## 📄 Giấy Phép

Dự án này được cấp phép dưới MIT License.

## 👥 Đóng Góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo branch tính năng (`git checkout -b feature/AmazingFeature`)
3. Commit thay đổi (`git commit -m 'Add some AmazingFeature'`)
4. Push lên branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📧 Liên Hệ

Để biết thêm thông tin, vui lòng liên hệ qua repository này.

---

**Cảm ơn bạn đã sử dụng BepViet!** 🍳✨
