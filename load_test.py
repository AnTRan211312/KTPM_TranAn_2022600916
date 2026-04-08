import asyncio
import httpx
import time
from collections import Counter

# --- CẤU HÌNH ---
BASE_URL = "http://localhost:8080" # Thay đổi port nếu server chạy ở port khác
ENDPOINT = "/jobs"                 # Endpoint để test (nên chọn GET public)
TOTAL_REQUESTS = 1000              # Tổng số request muốn gửi
CONCURRENCY_LIMIT = 50             # Số lượng request gửi đồng thời (giả lập concurrent users)

async def send_request(client, semaphore, request_id):
    async with semaphore:
        start_time = time.perf_counter()
        try:
            response = await client.get(f"{BASE_URL}{ENDPOINT}")
            end_time = time.perf_counter()
            duration = end_time - start_time
            return response.status_code, duration
        except Exception as e:
            return "ERROR", 0

async def run_load_test():
    print(f"🚀 Đang bắt đầu test {TOTAL_REQUESTS} requests vào {BASE_URL}{ENDPOINT}...")
    print(f"👥 Độ tải đồng thời (Concurrency): {CONCURRENCY_LIMIT}")
    
    semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
    results = []
    
    async with httpx.AsyncClient(timeout=10.0) as client:
        tasks = []
        for i in range(TOTAL_REQUESTS):
            tasks.append(send_request(client, semaphore, i))
        
        start_test = time.perf_counter()
        results = await asyncio.gather(*tasks)
        end_test = time.perf_counter()
    
    # Phân tích kết quả
    total_time = end_test - start_test
    status_codes = [r[0] for r in results]
    durations = [r[1] for r in results if r[0] != "ERROR"]
    
    counts = Counter(status_codes)
    avg_duration = sum(durations) / len(durations) if durations else 0
    
    print("\n" + "="*40)
    print("📊 KẾT QUẢ LOAD TEST:")
    print("="*40)
    print(f"⏱️  Tổng thời gian: {total_time:.2f} giây")
    print(f"⚡ Requests/giây (TPS): {TOTAL_REQUESTS / total_time:.2f}")
    print(f"📈 Thời gian phản hồi trung bình: {avg_duration*1000:.2f} ms")
    print("-" * 20)
    print("🔹 Trạng thái (Status Codes):")
    for code, count in counts.items():
        print(f"   - {code}: {count} requests")
    print("="*40)

if __name__ == "__main__":
    try:
        asyncio.run(run_load_test())
    except KeyboardInterrupt:
        print("\nStopping...")
    except Exception as e:
        print(f"\nLỗi: {e}")
        print("Đảm bảo bạn đã cài đặt thư viện httpx: 'pip install httpx'")
