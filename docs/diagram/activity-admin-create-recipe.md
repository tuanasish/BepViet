```mermaid
flowchart TD
    A[Admin mở trang /admin/recipes/create] --> B{Đã đăng nhập & là admin?}
    B -- Không --> B1[Hiện toast 'Bạn không có quyền truy cập trang quản trị'] --> B2[Chuyển hướng /admin/recipes] --> Z[Kết thúc]
    B -- Có --> C[Nhập form: tiêu đề, mô tả, thời gian, độ khó, servings, danh mục, tags, vùng miền]
    C --> D[Thêm nguyên liệu: name, amount, note]
    D --> E[Thêm các bước: order, title, content, imageUrl]
    E --> F{Upload ảnh công thức?}
    F -- Có --> F1[Chọn file ảnh] --> F2[apiUploadImage(file)] --> F3[Cập nhật images[] trong form]
    F -- Không --> G
    F3 --> G[Xem lại và nhấn 'Tạo công thức']
    
    G --> H{Tiêu đề hợp lệ?}
    H -- Không --> H1[Toast 'Vui lòng nhập tiêu đề công thức'] --> C
    H -- Có --> I{Danh mục hợp lệ?}
    I -- Không --> I1[Toast 'Vui lòng nhập danh mục'] --> C
    I -- Có --> J{Có ít nhất 1 bước?}
    J -- Không --> J1[Toast 'Vui lòng thêm ít nhất một bước thực hiện'] --> E
    J -- Có --> K[Chuẩn bị tags: loại bỏ vùng miền cũ, thêm vùng miền mới nếu có]
    K --> L[setSaving(true)]
    L --> M[apiCreateAdminRecipe(formData + tags đã xử lý)]
    M -->|Thành công| N[Toast 'Đã tạo công thức thành công'] --> O[Chuyển hướng /admin/recipes] --> Z
    M -->|Lỗi| P[Toast 'Không thể tạo công thức' hoặc err.message] --> Q[setSaving(false)] --> C
```
