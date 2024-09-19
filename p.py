import requests

# 你的服务器基础 URL
BASE_URL = "https://x.api.x2027.xyz"

# 多个 API 密钥列表，按照实际需要替换
API_KEYS = [
    "203240ba549241e80b68b95c67a36de1a10e52adafaa242eccc2d3d8f295e60b",  # 密钥 1
   
]

# API 请求头设置
def get_headers(api_key):
    return {'Authorization': f'Bearer {api_key}'}

def test_api(endpoint, api_key, method="GET", data=None):
    """通用的 API 测试函数"""
    url = f"{BASE_URL}{endpoint}"
    headers = get_headers(api_key)
    
    if method == "GET":
        response = requests.get(url, headers=headers)
    elif method == "POST":
        response = requests.post(url, headers=headers, json=data)
    
    if response.status_code == 200:
        print(f"✅ {method} {endpoint} - Success")
        print("Response:", response.json())
    else:
        print(f"❌ {method} {endpoint} - Failed ({response.status_code})")
        print("Response:", response.text)

# 使用的测试数据
inscription_id = "82cef56252292d39ad5e7cc57dbf743651eaa964bf68abb0158773aacdefe049i0"
address = "bc1ppdz3s22q9a8peds8mpwhh64h7kytf6k7mgwjy2572ajztdf34zhqcrrfyz"
brc20_ticker = "icecream"
txid = "82cef56252292d39ad5e7cc57dbf743651eaa964bf68abb0158773aacdefe049"

# 开始测试
for api_key in API_KEYS:
    print(f"\nTesting with API Key: {api_key}")
    
    # 测试铭文相关的 API
    test_api(f"/api/inscription/info/{inscription_id}", api_key)
    test_api(f"/api/inscription/content/{inscription_id}", api_key)
    
    # 测试 BRC-20 相关的 API
    test_api(f"/api/brc20/{brc20_ticker}/info", api_key)
    test_api(f"/api/brc20/{brc20_ticker}/holders", api_key)
    
    # 测试交易相关的 API
    test_api(f"/api/tx/{txid}", api_key)
    test_api(f"/api/tx/{txid}/ins", api_key)
    test_api(f"/api/tx/{txid}/outs", api_key)

print("API 测试完成！")
