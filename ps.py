import requests

# API 基础 URL
BASE_URL = "https://open-api-fractal.unisat.io"

# 多个 API 密钥列表，按照实际需要替换
API_KEYS = [
    "203240ba549241e80b68b95c67a36de1a10e52adafaa242eccc2d3d8f295e60b",  # API fx-gyp100888密钥 1
    "1f4706af3fb71755f9c142326072930883a49557deedc6047aad9da01267878e",  # APIXIAO2027 密钥 2
    "d579162074e51cc03416945c52908aedb97122f71461cf69fd4544da11199903",  # APIxrps 密钥 3

]

def test_api_key(api_key):
    """使用特定的 API 密钥进行测试"""
    headers = {
        'Authorization': f'Bearer {api_key}'
    }
    endpoint = "/v1/indexer/blockchain/info"  # 使用需要 API 密钥的简单 API 端点
    url = f"{BASE_URL}{endpoint}"
    
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        print(f"✅ API 密钥有效: {api_key}")
        print("Response:", response.json())
    else:
        print(f"❌ API 密钥无效或连接失败: {api_key}, 状态码: {response.status_code}")
        print("Response:", response.text)

# 轮询测试多个 API 密钥
for api_key in API_KEYS:
    test_api_key(api_key)
