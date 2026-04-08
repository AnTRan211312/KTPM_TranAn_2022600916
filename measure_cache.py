import time
import requests

# --- CONFIGURATION ---
BASE_URL = "http://localhost:8080"
# Choosing an endpoint that we know is cached (@Cacheable in CompanyServiceImpl)
# Note: You'll need to use a valid company ID from your database
COMPANY_ID = 1 
ENDPOINT = f"/companies/{COMPANY_ID}"

def measure_request():
    start_time = time.perf_counter()
    try:
        response = requests.get(f"{BASE_URL}{ENDPOINT}")
        end_time = time.perf_counter()
        duration_ms = (end_time - start_time) * 1000
        return response.status_code, duration_ms
    except Exception as e:
        print(f"Error: {e}")
        return None, 0

def run_benchmark():
    print(f"🚀 Benchmarking Cache for: {BASE_URL}{ENDPOINT}")
    
    # 1. COLD START (Expect Cache Miss or First Load)
    print("\n[1/2] Fetching COLD (First request)...")
    status, cold_time = measure_request()
    if status != 200:
        print(f"⚠️  Request failed with status {status}. Make sure the server is running and ID {COMPANY_ID} exists.")
        return

    print(f"⏱️  Cold Response Time: {cold_time:.2f} ms")

    # 2. WARM START (Expect Cache Hit)
    print("\n[2/2] Fetching WARM (Second request - Cached)...")
    status, warm_time = measure_request()
    print(f"⏱️  Warm Response Time: {warm_time:.2f} ms")

    # 3. CALCULATION
    if cold_time > 0:
        reduction = (cold_time - warm_time) / cold_time * 100
        print("\n" + "="*40)
        print("📊 RESULTS:")
        print(f"🔹 Absolute Gain: {cold_time - warm_time:.2f} ms")
        print(f"🔥 Cache Reduction: {reduction:.2f}%")
        print("="*40)
        
        print("\n👉 Formula used: (Cold - Warm) / Cold * 100%")
    else:
        print("Could not calculate reduction.")

if __name__ == "__main__":
    run_benchmark()
