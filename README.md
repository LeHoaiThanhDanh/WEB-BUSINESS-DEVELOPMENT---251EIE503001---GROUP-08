# 🍵 Hồng Trà Ngô Gia - Website Thương Mại Điện Tử

> Website bán hàng trực tuyến cho thương hiệu Hồng Trà Ngô Gia, xây dựng bằng Django và HTML/CSS/JavaScript thuần.

[![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-4.x-green.svg)](https://www.djangoproject.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ-sử-dụng)
- [Cài Đặt](#-cài-đặt)
- [Cách Chạy](#-cách-chạy-dự-án)
- [Cấu Trúc Dự Án](#-cấu-trúc-dự-án)
- [Đóng Góp](#-đóng-góp)
- [Tác Giả](#-tác-giả)

---

## 🎯 Giới Thiệu

**Hồng Trà Ngô Gia** là một nền tảng thương mại điện tử được thiết kế để cung cấp trải nghiệm đặt đồ uống trực tuyến tối ưu cho các sản phẩm trà và thức uống của thương hiệu Hồng Trà Ngô Gia. Website được xây dựng với giao diện thân thiện, dễ sử dụng và tích hợp đầy đủ các tính năng cần thiết cho một website bán hàng chuyên nghiệp.

### 🎓 Thông Tin Dự Án

- **Môn học:** WEB BUSINESS DEVELOPMENT
- **Mã môn:** 251EIE503001
- **Nhóm:** GROUP-08
- **Học kỳ:** I Năm học 2025-2026

---

## ✨ Tính Năng

### 👥 Dành Cho Khách Hàng

- 🏠 **Trang Chủ:** Hiển thị sản phẩm nổi bật, khuyến mãi
- 📱 **Menu Thức Uống:** Danh sách đầy đủ các loại trà và thức uống
- 🛒 **Giỏ Hàng:** Quản lý sản phẩm, cập nhật số lượng
- 💳 **Thanh Toán:** Hỗ trợ nhiều phương thức (MoMo, ZaloPay, Payoo, Tiền mặt)
- 👤 **Tài Khoản:** Đăng ký, đăng nhập, quản lý thông tin cá nhân
- 📝 **Đặt Hàng:** Theo dõi trạng thái đơn hàng
- 📰 **Blog/Diễn Đàn:** Đọc bài viết về trà và văn hóa thưởng trà
- 📍 **Chi Nhánh:** Xem thông tin các cửa hàng
- 📞 **Liên Hệ:** Form liên hệ và thông tin công ty
- 🌡️ **Gợi Ý Thời Tiết:** Đề xuất món uống phù hợp theo thời tiết

### 🔐 Dành Cho Admin

- 📊 **Dashboard:** Thống kê doanh thu, đơn hàng, sản phẩm
- 📦 **Quản Lý Đơn Hàng:** Xem, cập nhật trạng thái đơn hàng
- 📝 **Quản Lý Blog:** Thêm, sửa, xóa bài viết
- 👥 **Quản Lý Tài Khoản:** Xem danh sách người dùng
- 📈 **Báo Cáo:** Xuất báo cáo CSV

### 🌐 Tính Năng Khác

- 🌍 **Đa Ngôn Ngữ:** Hỗ trợ Tiếng Việt và Tiếng Anh
- 📱 **Responsive:** Tương thích mọi thiết bị (Desktop, Tablet, Mobile)
- 🎨 **UI/UX:** Giao diện hiện đại, màu sắc hài hòa
- ⚡ **Performance:** Tải trang nhanh, tối ưu hóa hình ảnh

---

## 🛠️ Công Nghệ Sử Dụng

### Backend
- **Python 3.8+** - Ngôn ngữ lập trình chính
- **Django 4.x** - Web framework
- **LocalStorage** - Cơ sở dữ liệu

### Frontend
- **HTML5** - Cấu trúc trang web
- **CSS3** - Styling và responsive design
- **JavaScript (Vanilla)** - Xử lý logic phía client
- **Django Templates** - Template engine

### Tools & Libraries
- **Git** - Version control
- **VS Code** - Code editor
- **Django Static Files** - Quản lý tài nguyên tĩnh

---

## 📦 Cài Đặt

### 1. Yêu Cầu Hệ Thống

- **Python:** 3.8 trở lên
- **pip:** Package manager của Python
- **Git:** Version control
- **PowerShell** hoặc **Command Prompt** (Windows)

### 2. Clone Repository

```bash
git clone https://github.com/LeHoaiThanhDanh/WEB-BUSINESS-DEVELOPMENT---251EIE503001---GROUP-08.git
cd Website-Hồng-Trà-Ngô-Gia-FrontEnd
```

### 3. Tạo Virtual Environment

```powershell
# Di chuyển vào thư mục backend
cd backend

# Tạo virtual environment
python -m venv .venv

# Kích hoạt virtual environment (PowerShell)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

# Hoặc trên Linux/Mac
source .venv/bin/activate
```

### 4. Cài Đặt Dependencies

```bash
# Cài đặt các package cần thiết
pip install -r requirements.txt
```
---

## 🚀 Cách Chạy Dự Án

### Khởi Động Development Server

```powershell
# 1. Đảm bảo đang ở thư mục gốc
cd f:\Website-Hồng-Trà-Ngô-Gia-FrontEnd

# 2. Di chuyển vào thư mục backend
cd backend

# 3. Kích hoạt virtual environment
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\.venv\Scripts\Activate.ps1

# 4. Chạy migrations (lần đầu hoặc khi có thay đổi model)
python manage.py migrate

# 5. Khởi động server
python manage.py runserver
```

### Truy Cập Website

- **Trang chủ:** http://127.0.0.1:8000/
- **Trang admin:** http://127.0.0.1:8000/admin/
- **Trang đăng nhập admin:** http://127.0.0.1:8000/login-admin/

### Tài Khoản Demo

#### Admin
- **Username:** `admin`
- **Password:** `admin123`

#### User
- **Email:** `user@example.com`
- **Password:** `user123`

---

## 📁 Cấu Trúc Dự Án

```
Website-Hồng-Trà-Ngô-Gia-FrontEnd/
│
├── backend/                          # Django backend
│   ├── accounts/                     # App quản lý tài khoản
│   │   ├── migrations/               # Database migrations
│   │   ├── template/                 # Django templates
│   │   │   ├── app/                  # Trang HTML chính
│   │   │   └── Components/           # Components tái sử dụng
│   │   ├── __init__.py
│   │   ├── apps.py
│   │   ├── urls.py                   # URL routing
│   │   └── views.py                  # Views xử lý request
│   │
│   ├── backend/                      # Django project settings
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py               # Cấu hình dự án
│   │   ├── urls.py                   # URL chính
│   │   └── wsgi.py
│   │
│   ├── .venv/                        # Virtual environment
│   ├── manage.py                     # Django management script
│   └── requirements.txt              # Python dependencies
│
├── src/                              # Frontend source code
│   ├── Components/                   # Shared components
│   │   ├── page-header/              # Header component
│   │   └── page-footer/              # Footer component
│   │
│   └── Pages/                        # Các trang website
│       ├── Admin/                    # Trang admin
│       │   ├── admin.html
│       │   ├── admin.css
│       │   ├── admin.js
│       │   ├── admin-order.html/css/js
│       │   ├── Admin-Blog.html/css/js
│       │   └── admin-account.html/css/js
│       │
│       ├── Homepage/                 # Trang chủ
│       ├── Menu/                     # Trang menu
│       ├── Cart/                     # Giỏ hàng
│       ├── Product/                  # Chi tiết sản phẩm
│       ├── Payment/                  # Thanh toán
│       ├── Login/                    # Đăng nhập
│       ├── Register/                 # Đăng ký
│       ├── Profile/                  # Hồ sơ cá nhân
│       ├── Blog/                     # Blog/Diễn đàn
│       ├── Contact/                  # Liên hệ
│       ├── Agency/                   # Chi nhánh
│       └── Aboutus/                  # Về chúng tôi
│
├── assets/                           # Tài nguyên tĩnh
│   ├── icons/                        # Icons
│   ├── images/                       # Hình ảnh
│   │   └── products/                 # Hình sản phẩm
│   └── js/                           # JavaScript libraries
│       ├── app.js                    # App logic
│       ├── i18n.js                   # Đa ngôn ngữ
│       └── weather.js                # Tính năng thời tiết
│
├── public/                           # Public data
│   ├── data/
│   │   ├── products.json             # Dữ liệu sản phẩm
│   │   ├── orders.json               # Dữ liệu đơn hàng
│   │   └── blogs.json                # Dữ liệu blog
│   └── lang/                         # Translation files
│       ├── vi.json                   # Tiếng Việt
│       └── en.json                   # English
│
├── .gitignore                        # Git ignore file
├── README.md                         # File này
└── style.css                         # Global styles
```

---

## 🔧 Cấu Hình

### Static Files

Django tự động phục vụ static files trong development mode. Đảm bảo `settings.py` có cấu hình:

```python
STATIC_URL = '/static/'
STATICFILES_DIRS = [
    BASE_DIR.parent / 'src',
    BASE_DIR.parent / 'assets',
    BASE_DIR.parent / 'public',
    BASE_DIR.parent / 'lang',
]
```

### Environment Variables

Tạo file `.env` trong thư mục `backend/` nếu cần:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
```

---

## 📝 Sử Dụng

### Khách Hàng

1. **Duyệt Sản Phẩm:** Truy cập trang chủ hoặc menu để xem sản phẩm
2. **Thêm Vào Giỏ:** Click "Thêm vào giỏ hàng"
3. **Thanh Toán:** Vào giỏ hàng → Chọn phương thức thanh toán → Hoàn tất
4. **Đăng Ký/Đăng Nhập:** Để theo dõi đơn hàng và lưu thông tin

### Admin

1. **Đăng Nhập:** `/login-admin/`
2. **Dashboard:** Xem thống kê tổng quan
3. **Quản Lý Đơn Hàng:** Tab "Đơn hàng" → Cập nhật trạng thái
4. **Quản Lý Blog:** Tab "Blog" → Thêm/Sửa/Xóa bài viết
5. **Xuất Báo Cáo:** Nút "Xuất file" trên các trang quản lý

---

## 🐛 Debug & Troubleshooting

### Lỗi "No module named 'django'"

```bash
# Đảm bảo đã kích hoạt virtual environment
.\.venv\Scripts\Activate.ps1

# Cài lại Django
pip install django
```

### Lỗi Port 8000 đã được sử dụng

```bash
# Chạy trên port khác
python manage.py runserver 8080
```

### Static files không load

```bash
# Collect static files
python manage.py collectstatic
```

---

## 🤝 Đóng Góp

Chúng tôi hoan nghênh mọi đóng góp! Để đóng góp:

1. Fork repository
2. Tạo branch mới (`git checkout -b feature/TenTinhNang`)
3. Commit changes (`git commit -m 'Thêm tính năng X'`)
4. Push to branch (`git push origin feature/TenTinhNang`)
5. Tạo Pull Request

---

## 📄 License

Dự án này được phát hành dưới [MIT License](LICENSE).

---

## 👥 Tác Giả

**GROUP-08 - WEB BUSINESS DEVELOPMENT**

- 👤 **Lê Hoài Thanh Danh** - [GitHub](https://github.com/LeHoaiThanhDanh)
- 👤 **Nguyễn Thị Hồng Hạnh** - [GitHub](https://github.com/honghanh1431)
- 👤 **Nguyễn Thanh Thanh** - [GitHub](https://github.com/ThanhThanh-263)
- 👤 **Trần Khánh Linh** - [GitHub](https://github.com/trankhanhlinh1372005)
- 🔗 **Repository:** [WEB-BUSINESS-DEVELOPMENT---251EIE503001---GROUP-08](https://github.com/LeHoaiThanhDanh/WEB-BUSINESS-DEVELOPMENT---251EIE503001---GROUP-08)

---

## 📞 Liên Hệ

- **Email:** support@hongtrangogia.com
- **Website:** [Hồng Trà Ngô Gia](http://127.0.0.1:8000/)
- **Facebook:** [Hồng Trà Ngô Gia](https://facebook.com/hongtrangogia)

---

## 🎉 Acknowledgments

- Django Documentation
- MDN Web Docs
- Stack Overflow Community
- Các thư viện và công cụ mã nguồn mở

---

**⭐ Nếu thấy dự án hữu ích, hãy cho chúng tôi một star trên GitHub!**

---

*Cập nhật lần cuối: Tháng 11, 2025*
