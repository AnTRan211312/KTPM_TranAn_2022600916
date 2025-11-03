# HƯỚNG DẪN TEST CHAT CONTROLLER TRÊN POSTMAN

## 📋 Tổng quan các API

ChatController có **6 endpoints** để quản lý chat với AI:

1. **POST /api/chat-sessions** - Tạo session chat mới (MỚI - để lấy sessionId)
2. **POST /api/chat-message** - Gửi tin nhắn tới AI
3. **GET /api/chat-sessions** - Lấy danh sách tất cả sessions của user
4. **GET /api/chat-history/{sessionId}** - Lấy lịch sử chat theo sessionId
5. **GET /api/chat-session/{sessionId}/info** - Lấy thông tin session
6. **DELETE /api/chat-history/{sessionId}** - Xóa lịch sử chat

---

## 🔐 Yêu cầu Authentication

Tất cả các API đều yêu cầu:
- **Bearer Token** (JWT) trong header `Authorization`
- User phải có quyền tương ứng cho mỗi endpoint

### Cách thêm Token trong Postman:
1. Tab **Authorization**
2. Type: **Bearer Token**
3. Nhập token vào ô Token

---

## 📝 Chi tiết từng API

### 1. Tạo Session Mới (BẮT BUỘC TRƯỚC KHI GỬI MESSAGE)

**Endpoint:** `POST /api/chat-sessions`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Request Body:** Không cần (empty body)

**Response:**
```json
{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "message": "Session created successfully"
}
```

**Cách sử dụng:**
- Gọi API này trước để lấy `sessionId`
- Copy `sessionId` từ response để dùng cho các API khác

---

### 2. Gửi Tin Nhắn Tới AI

**Endpoint:** `POST /api/chat-message`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
Content-Type: application/json
```

**Request Body:**
```json
{
    "question": "Xin chào, bạn là ai?",
    "sessionId": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Validation:**
- `question`: Không được để trống, tối đa 5000 ký tự
- `sessionId`: Không được để trống, tối đa 100 ký tự

**Response:**
```json
"Xin chào! Tôi là trợ lý AI, tôi có thể giúp gì cho bạn?"
```

**Lưu ý:**
- SessionId có thể là:
  - UUID từ API tạo session mới (khuyên dùng)
  - Hoặc bất kỳ string nào (nếu session chưa tồn tại, sẽ tự động tạo)

---

### 3. Lấy Danh Sách Tất Cả Sessions

**Endpoint:** `GET /api/chat-sessions`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Response:**
```json
[
    {
        "sessionId": "550e8400-e29b-41d4-a716-446655440000",
        "firstMessage": "Xin chào, bạn là ai?",
        "lastMessage": "Tôi có thể giúp gì cho bạn?",
        "messageCount": 4,
        "createdAt": "2024-11-03 19:00:00",
        "lastMessageTime": "2024-11-03 19:05:00"
    },
    {
        "sessionId": "660e8400-e29b-41d4-a716-446655440001",
        "firstMessage": "Thời tiết hôm nay thế nào?",
        "lastMessage": "Thời tiết đẹp",
        "messageCount": 2,
        "createdAt": "2024-11-03 18:00:00",
        "lastMessageTime": "2024-11-03 18:02:00"
    }
]
```

**Cách dùng:**
- Dùng để xem tất cả sessions đã tạo
- Lấy `sessionId` từ đây để test các API khác

---

### 4. Lấy Lịch Sử Chat Theo SessionId

**Endpoint:** `GET /api/chat-history/{sessionId}`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Path Parameters:**
- `sessionId`: ID của session cần lấy lịch sử

**Ví dụ:** `GET /api/chat-history/550e8400-e29b-41d4-a716-446655440000`

**Response:**
```json
[
    {
        "id": 1,
        "role": "USER",
        "content": "Xin chào",
        "createdAt": "2024-11-03 19:00:00",
        "createdBy": "user@example.com"
    },
    {
        "id": 2,
        "role": "ASSISTANT",
        "content": "Xin chào! Tôi có thể giúp gì cho bạn?",
        "createdAt": "2024-11-03 19:00:05",
        "createdBy": "AI"
    }
]
```

---

### 5. Lấy Thông Tin Session

**Endpoint:** `GET /api/chat-session/{sessionId}/info`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Path Parameters:**
- `sessionId`: ID của session cần kiểm tra

**Ví dụ:** `GET /api/chat-session/550e8400-e29b-41d4-a716-446655440000/info`

**Response:**
```json
{
    "sessionId": "550e8400-e29b-41d4-a716-446655440000",
    "exists": true,
    "messageCount": 4
}
```

---

### 6. Xóa Lịch Sử Chat

**Endpoint:** `DELETE /api/chat-history/{sessionId}`

**Headers:**
```
Authorization: Bearer {your_jwt_token}
```

**Path Parameters:**
- `sessionId`: ID của session cần xóa

**Ví dụ:** `DELETE /api/chat-history/550e8400-e29b-41d4-a716-446655440000`

**Response:**
- Status: `204 No Content`
- Body: Không có

---

## 🚀 Quy Trình Test Đầy Đủ (Recommended)

### Bước 1: Tạo Session Mới
```
POST /api/chat-sessions
→ Copy sessionId từ response
```

### Bước 2: Gửi Tin Nhắn Đầu Tiên
```
POST /api/chat-message
Body: {
    "question": "Xin chào",
    "sessionId": "{sessionId từ bước 1}"
}
```

### Bước 3: Gửi Thêm Tin Nhắn (Cùng Session)
```
POST /api/chat-message
Body: {
    "question": "Bạn có thể làm gì?",
    "sessionId": "{sessionId từ bước 1}"
}
```

### Bước 4: Xem Lịch Sử Chat
```
GET /api/chat-history/{sessionId}
```

### Bước 5: Xem Danh Sách Sessions
```
GET /api/chat-sessions
```

### Bước 6: Xem Thông Tin Session
```
GET /api/chat-session/{sessionId}/info
```

### Bước 7: Xóa Session (Tùy chọn)
```
DELETE /api/chat-history/{sessionId}
```

---

## ⚠️ Lưu Ý Quan Trọng

1. **SessionId không bắt buộc phải tạo trước**: Bạn có thể tự tạo bất kỳ sessionId nào (ví dụ: "test-session-1") và gửi message. Session sẽ tự động được tạo khi có message đầu tiên.

2. **Cách lấy sessionId:**
   - **Cách 1 (Khuyên dùng)**: Gọi `POST /api/chat-sessions` để lấy UUID tự động
   - **Cách 2**: Tự tạo sessionId (bất kỳ string nào)
   - **Cách 3**: Lấy từ `GET /api/chat-sessions` nếu đã có sessions trước đó

3. **Quyền truy cập:**
   - `POST /api/chat-message` → Cần quyền: `POST /api/chat-message`
   - `GET /api/chat-sessions` → Cần quyền: `GET /api/chat-sessions`
   - `GET /api/chat-history/{sessionId}` → Cần quyền: `GET /api/chat-history`
   - `DELETE /api/chat-history/{sessionId}` → Cần quyền: `DELETE /api/chat-history`
   - `GET /api/chat-session/{sessionId}/info` → Cần quyền: `GET /api/chat-session`

4. **Base URL:** Thay đổi theo môi trường của bạn
   - Local: `http://localhost:8080`
   - Development: `http://your-dev-server:8080`
   - Production: `https://your-production-server.com`

---

## 📊 Ví Dụ Collection Postman

### Import vào Postman Collection:

```json
{
    "info": {
        "name": "Chat API Collection",
        "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
    },
    "item": [
        {
            "name": "1. Create Session",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Authorization",
                        "value": "Bearer {{token}}",
                        "type": "text"
                    }
                ],
                "url": {
                    "raw": "{{baseUrl}}/api/chat-sessions",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "chat-sessions"]
                }
            }
        },
        {
            "name": "2. Send Message",
            "request": {
                "method": "POST",
                "header": [
                    {
                        "key": "Authorization",
                        "value": "Bearer {{token}}",
                        "type": "text"
                    },
                    {
                        "key": "Content-Type",
                        "value": "application/json",
                        "type": "text"
                    }
                ],
                "body": {
                    "mode": "raw",
                    "raw": "{\n    \"question\": \"Xin chào\",\n    \"sessionId\": \"{{sessionId}}\"\n}"
                },
                "url": {
                    "raw": "{{baseUrl}}/api/chat-message",
                    "host": ["{{baseUrl}}"],
                    "path": ["api", "chat-message"]
                }
            }
        }
    ],
    "variable": [
        {
            "key": "baseUrl",
            "value": "http://localhost:8080"
        },
        {
            "key": "token",
            "value": "your-jwt-token-here"
        },
        {
            "key": "sessionId",
            "value": ""
        }
    ]
}
```

---

## ✅ Checklist Test

- [ ] Tạo session mới thành công
- [ ] Gửi tin nhắn với sessionId hợp lệ
- [ ] Gửi tin nhắn với sessionId mới (tự tạo)
- [ ] Lấy lịch sử chat thành công
- [ ] Lấy danh sách sessions thành công
- [ ] Lấy thông tin session thành công
- [ ] Xóa lịch sử chat thành công
- [ ] Test validation (question rỗng, quá dài)
- [ ] Test unauthorized (không có token)
- [ ] Test forbidden (không có quyền)

---

Chúc bạn test thành công! 🎉

