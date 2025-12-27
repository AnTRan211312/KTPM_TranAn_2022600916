# TalentBridge

> **Nen tang tuyen dung the he moi** - Ket noi nha tuyen dung, ung vien va quan tri vien trong mot he sinh thai tien loi, minh bach va bao mat.

![TalentBridge Banner](img.png)

---

## Muc Luc

- [Gioi Thieu](#gioi-thieu)
- [Tinh Nang](#tinh-nang)
- [Cong Nghe](#cong-nghe)
- [Cai Dat](#cai-dat)
- [Cau Hinh](#cau-hinh)
- [Huong Dan Su Dung](#huong-dan-su-dung)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)

---

## Gioi Thieu

TalentBridge khong chi don thuan la website tra cuu viec lam - day la nen tang giup toi uu hoa quy trinh tuyen dung, nang cao trai nghiem nguoi dung va hieu qua quan ly cho tat ca cac ben.

### 3 Nhom Nguoi Dung

| Vai tro | Mo ta |
|---------|-------|
| **USER** (Ung vien) | Tim viec, quan ly CV, nhan goi y viec lam |
| **RECRUITER** (Nha tuyen dung) | Dang tin, quan ly ung vien, phan quyen team |
| **ADMIN** (Quan tri vien) | Quan ly toan he thong, phan quyen chi tiet |

---

## Tinh Nang

### Danh cho Ung vien (USER)
- Tim kiem va kham pha chi tiet thong tin cong ty, vi tri tuyen dung
- Quan ly ho so ca nhan toan dien: thong tin, avatar, bao mat tai khoan
- Tao, chinh sua, xoa, tai len CV - nop/rut CV moi luc, moi noi
- Dang ky nhan email job alert ca nhan hoa theo nganh/nghe, ky nang
- **AI CV Analysis** - Phan tich CV bang Gemini AI

### Danh cho Nha tuyen dung (RECRUITER)
- Dang tin tuyen dung, quan ly vi tri, chinh sua/ngung tuyen
- Quan tri thong tin cong ty: profile, hinh anh, gioi thieu
- Quan ly & loc ung vien: duyet CV, tu choi/noi bat ho so
- Moi dong nghiep, phan quyen theo chuc nang tuyen dung

### Danh cho Quan tri vien (ADMIN)
- Quan ly toan bo he thong: duyet, chinh sua, khoa/xoa tai khoan
- Tao, chinh sua va phan quyen vai tro chi tiet

---

## Cong Nghe

### Backend
| Cong nghe | Mo ta |
|-----------|-------|
| **Spring Boot 3** | Framework chinh, 80+ REST endpoints |
| **Spring Security + OAuth2** | Xac thuc & phan quyen JWT |
| **MySQL** | Co so du lieu chinh |
| **Redis** | Cache & session management |
| **AWS S3** | Luu tru file (CV, avatar, logo) |
| **Spring Mail + Thymeleaf** | Email templates |
| **Gemini AI** | AI CV Analysis & Chat |
| **VNPay** | Thanh toan truc tuyen |
| **Swagger/OpenAPI** | API Documentation |

### Frontend
| Cong nghe | Mo ta |
|-----------|-------|
| **React 18** | UI Library |
| **TypeScript** | Type Safety |
| **Vite** | Build Tool |
| **TailwindCSS** | Styling |
| **Shadcn/UI** | UI Components |
| **React Query** | Data Fetching |
| **React Router** | Routing |

---

## Cai Dat

### Yeu Cau He Thong
- **Java 17+**
- **Node.js 18+**
- **MySQL 8.0+**
- **Redis** (optional but recommended)
- **AWS Account** (for S3)

### 1. Clone Repository

```bash
git clone https://github.com/AnTRan211312/web_tuyendung.git
cd web_tuyendung
```

### 2. Backend Setup

```bash
cd BackEnd-Works

# Copy file cau hinh mau
cp src/main/resources/application.properties.example src/main/resources/application.properties

# Chinh sua application.properties voi thong tin cua ban
# (xem phan Cau Hinh ben duoi)

# Build & Run
./mvnw spring-boot:run
```

### 3. Frontend Setup

```bash
cd TalentBridge-Frontend

# Copy file cau hinh mau
cp .env.example .env.production

# Cai dat dependencies
npm install

# Chay development server
npm run dev
```

---

## Cau Hinh

### Backend Configuration

Tao file `application.properties` tu template `application.properties.example`:

```properties
# Database
spring.datasource.url=jdbc:mysql://localhost:3306/talentbridge
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD

# JWT Secret (256-bit minimum)
jwt.secret-key=YOUR_SECRET_KEY

# AWS S3
aws.access-key-id=YOUR_AWS_ACCESS_KEY
aws.secret-access-key=YOUR_AWS_SECRET_KEY
aws.s3.bucket-name=YOUR_BUCKET_NAME

# Email (Gmail)
spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_APP_PASSWORD

# VNPay (Optional)
vnpay.tmn-code=YOUR_VNPAY_TMN_CODE
vnpay.hash-secret=YOUR_VNPAY_HASH_SECRET

# Gemini AI (Optional)
gemini.api-key=YOUR_GEMINI_API_KEY
```

> **Quan trong:** File `application.properties` da duoc them vao `.gitignore`. Khong bao gio commit file nay len GitHub!

### Frontend Configuration

Tao file `.env.production` tu template `.env.example`:

```env
VITE_API_URL=http://localhost:8080
```

### AWS S3 Configuration

#### Bucket Policy

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadForPublicFolder",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": [
        "arn:aws:s3:::YOUR_BUCKET_NAME/public/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME/company-logos/*",
        "arn:aws:s3:::YOUR_BUCKET_NAME/avatar/*"
      ]
    }
  ]
}
```

#### CORS Configuration

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "HEAD", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": ["ETag", "Content-Length"]
  }
]
```

#### Block Public Access Settings

Bo chon:
- Block public access to buckets and objects granted through new public bucket policies
- Block public and cross-account access to buckets and objects through any public bucket policies

Giu check:
- Block public access to buckets and objects granted through new ACLs
- Block public and cross-account access to buckets and objects through any ACLs

---

## Huong Dan Su Dung

### Chay Ung Dung

**Backend:**
```bash
cd BackEnd-Works
./mvnw spring-boot:run
```

**Frontend:**
```bash
cd TalentBridge-Frontend
npm run dev
```

### Truy Cap
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8080
- **Swagger UI:** http://localhost:8080/swagger-ui/index.html

---

## API Documentation

Swagger UI duoc tich hop san. Sau khi chay Backend, truy cap:

**http://localhost:8080/swagger-ui/index.html**

---

## Screenshots

| Trang Chu | Tim Viec |
|-----------|----------|
| ![Homepage](img.png) | ![Job Search](img_1.png) |

| Chi Tiet Cong Viec | Dashboard |
|--------------------|-----------|
| ![Job Detail](img_2.png) | ![Dashboard](img_3.png) |

---

## License

This project is licensed under the MIT License.

---

## Tac Gia

**TalentBridge Team**

---

<p align="center">Made with love by TalentBridge Team</p>
