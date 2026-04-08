import asyncio
import httpx
import time
from collections import Counter

# --- CẤU HÌNH ---
BASE_URL = "http://localhost:8080"
ENDPOINT = "/auth/login"
TOTAL_LOGINS = 2000              # Tổng số lượt login muốn giả lập
CONCURRENCY_LIMIT = 50           # Số lượng login đồng thời (mô phỏng 50 user bấm login cùng lúc liên tục)

# --- THÀNH PHẦN TEST ---
# CHÚ Ý: Bạn phải có tài khoản này trong database thì test mới trả về 200 được
# Nếu không có, nó sẽ trả về 401 (Unauthorized) nhưng vẫn giúp test được độ tải của BCrypt.
TEST_EMAIL = "admin@gmail.com"   
TEST_PASSWORD = "1"

LOGIN_DATA = {
    "email": TEST_EMAIL,
    "password": TEST_PASSWORD,
    "sessionMetaRequest": {
        "deviceName": "Chrome on Windows",
        "deviceType": "PC",
        "userAgent": "StressTest-Script-v1"
    }
}

async def send_login(client, semaphore, login_id):
    async with semaphore:
        start_time = time.perf_counter()
        try:
            # Gửi POST request kèm JSON body
            response = await client.post(f"{BASE_URL}{ENDPOINT}", json=LOGIN_DATA)
            end_time = time.perf_counter()
            duration = end_time - start_time
            return response.status_code, duration
        except Exception as e:
            # print(f"Error {login_id}: {e}")
            return "ERROR", 0

async def run_login_test():
    print(f"🔥 Đang bắt đầu STRESS TEST {TOTAL_LOGINS} logins vào {BASE_URL}{ENDPOINT}...")
    print(f"👥 Số user đồng thời (Concurrency): {CONCURRENCY_LIMIT}")
    print(f"📧 Email sử dụng: {TEST_EMAIL}")
    print("-" * 40)
    
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    
    # Dùng timeout dài hơn vì login xử lý BCrypt rất nặng CPU
    async with httpx.AsyncClient(timeout=30.0) as client:
        tasks = []
        for i in range(TOTAL_LOGINS):
            tasks.append(send_login(client, semaphore, i))
        
        start_test = time.perf_counter()
        results = await asyncio.gather(*tasks)
        end_test = time.perf_counter()
    
    # Phân tích kết quả
    total_time = end_test - start_test
    status_codes = [r[0] for r in results]
    durations = [r[1] for r in results if r[0] != "ERROR"]
    
    counts = Counter(status_codes)
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    print("\n" + "="*50)
    print("🚩 KẾT QUẢ LOGIN STRESS TEST:")
    print("="*50)
    print(f"⏱️  Tổng thời gian thực hiện: {total_time:.2f} giây")
    print(f"⚡ Tốc độ trung bình (Auth TPS): {TOTAL_LOGINS / total_time:.2f} logins/sec")
    print(f"📈 Thời gian login trung bình per request: {avg_duration*1000:.2f} ms")
    print("-" * 30)
    print("🔹 Trạng thái phản hồi (Status Codes):")
    for code, count in counts.items():
        msg = ""
        if code == 200: msg = "(Thành công)"
        elif code == 401: msg = "(Sai Email/Pass)"
        elif code == 400: msg = "(Dữ liệu không hợp lệ)"
        elif code == 500: msg = "(Server quá tải/Lỗi code)"
        print(f"   - {code} {msg}: {count} requests")
    
    if 500 in counts:
        print("\n⚠️  CẢNH BÁO: Đã có request bị lỗi 500, hệ thống đã chạm ngưỡng giới hạn!")
    
    print("="*50)

if __name__ == "__main__":
    try:
        asyncio.run(run_login_test())
    except KeyboardInterrupt:
        print("\nTest bị dừng bởi người dùng.")
    except Exception as e:
        print(f"\nLỗi: {e}")
