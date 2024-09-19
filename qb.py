import csv
import time
import sys
from bip_utils import Bip39MnemonicGenerator, Bip39SeedGenerator, Bip86, Bip86Coins, Bip44Changes
from ecdsa import SECP256k1, SigningKey
import hashlib
from Crypto.Hash import RIPEMD160
import os
import bech32
import base58
from concurrent.futures import ThreadPoolExecutor, as_completed
from tqdm import tqdm
from colorama import Fore, Style, init

# 初始化 colorama
init(autoreset=True)

# 定义颜色渐变函数
def get_color_gradient(progress):
    """根据进度返回不同颜色，进度从 0 到 1"""
    if progress < 0.33:
        return Fore.BLUE  # 蓝色
    elif progress < 0.66:
        return Fore.YELLOW  # 黄色
    else:
        return Fore.GREEN  # 绿色

def ripemd160_hash(data):
    """计算 RIPEMD-160 哈希值"""
    h = RIPEMD160.new()
    h.update(data)
    return h.digest()

def private_key_to_public_key(private_key_bytes, compressed=True):
    """从私钥生成压缩公钥"""
    sk = SigningKey.from_string(private_key_bytes, curve=SECP256k1)
    vk = sk.get_verifying_key()
    if compressed:
        public_key_bytes = b'\x02' + vk.to_string()[:32] if vk.to_string()[-1] % 2 == 0 else b'\x03' + vk.to_string()[:32]
    else:
        public_key_bytes = b'\x04' + vk.to_string()
    return public_key_bytes

def public_key_to_p2pkh_address(public_key_bytes):
    """从公钥生成 Legacy (P2PKH) 地址"""
    sha256_hash = hashlib.sha256(public_key_bytes).digest()
    ripemd160_hash_value = ripemd160_hash(sha256_hash)
    return base58.b58encode_check(b'\x00' + ripemd160_hash_value).decode('utf-8')

def public_key_to_p2sh_address(public_key_bytes):
    """从公钥生成 Nested SegWit (P2SH-P2WPKH) 地址"""
    sha256_hash = hashlib.sha256(public_key_bytes).digest()
    ripemd160_hash_value = ripemd160_hash(sha256_hash)
    redeem_script = b'\x00\x14' + ripemd160_hash_value
    redeem_script_hash = hashlib.sha256(redeem_script).digest()
    redeem_script_hash_ripemd160 = ripemd160_hash(redeem_script_hash)
    return base58.b58encode_check(b'\x05' + redeem_script_hash_ripemd160).decode('utf-8')

def public_key_to_bech32_address(public_key_bytes):
    """从公钥生成 Native SegWit (P2WPKH) 地址"""
    sha256_hash = hashlib.sha256(public_key_bytes).digest()
    ripemd160_hash_value = ripemd160_hash(sha256_hash)
    return bech32.encode('bc', 0, ripemd160_hash_value)

def public_key_to_taproot_address_from_bip86(seed_bytes):
    """使用BIP86生成Taproot (P2TR) 地址"""
    bip86_ctx = Bip86.FromSeed(seed_bytes, Bip86Coins.BITCOIN)
    bip86_acc = bip86_ctx.Purpose().Coin().Account(0).Change(Bip44Changes.CHAIN_EXT).AddressIndex(0)
    return bip86_acc.PublicKey().ToAddress()

def private_key_to_wif_algo1(private_key_hex):
    """使用算法 1 将私钥转换为 WIF"""
    private_key_bytes = bytes.fromhex(private_key_hex)
    extended_key = b'\x80' + private_key_bytes + b'\x01'  # 添加压缩标志
    checksum = hashlib.sha256(hashlib.sha256(extended_key).digest()).digest()[:4]
    return base58.b58encode(extended_key + checksum).decode()

def generate_wallet():
    """生成一个钱包"""
    mnemonic = Bip39MnemonicGenerator().FromWordsNumber(12)
    seed_bytes = Bip39SeedGenerator(mnemonic).Generate()
    bip86_ctx = Bip86.FromSeed(seed_bytes, Bip86Coins.BITCOIN)
    bip86_acc = bip86_ctx.Purpose().Coin().Account(0).Change(Bip44Changes.CHAIN_EXT).AddressIndex(0)
    
    private_key_bytes = bip86_acc.PrivateKey().Raw().ToBytes()
    private_key_hex = private_key_bytes.hex()
    
    # 使用提供的算法转换私钥为 WIF
    private_key_wif = private_key_to_wif_algo1(private_key_hex)

    public_key_bytes = bip86_acc.PublicKey().RawCompressed().ToBytes()
    legacy_address = public_key_to_p2pkh_address(public_key_bytes)
    nested_segwit_address = public_key_to_p2sh_address(public_key_bytes)
    native_segwit_address = public_key_to_bech32_address(public_key_bytes)
    taproot_address = bip86_acc.PublicKey().ToAddress()
    
    return {
        'private_key_hex': private_key_hex,
        'private_key_wif': private_key_wif,
        'native_segwit_address': native_segwit_address,
        'nested_segwit_address': nested_segwit_address,
        'taproot_address': taproot_address,
        'legacy_address': legacy_address
    }

def print_wallet_info(wallet, wallet_number):
    """打印钱包信息，并用不同颜色标注"""
    print(f"{Fore.YELLOW}钱包 {wallet_number}:{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}私钥 (Hex): {wallet['private_key_hex']}{Style.RESET_ALL}")
    print("-" * 40)
    print(f"{Fore.GREEN}转换后的 WIF: {wallet['private_key_wif']}{Style.RESET_ALL}")
    print("-" * 40)
    print(f"{Fore.BLUE}Native SegWit (P2WPKH) 地址: {wallet['native_segwit_address']}{Style.RESET_ALL}")
    print("-" * 40)
    print(f"{Fore.YELLOW}Nested SegWit (P2SH-P2WPKH) 地址: {wallet['nested_segwit_address']}{Style.RESET_ALL}")
    print("-" * 40)
    print(f"{Fore.RED}Taproot (P2TR) 地址: {wallet['taproot_address']}{Style.RESET_ALL}")
    print("-" * 40)
    print(f"{Fore.GREEN}Legacy (P2PKH) 地址: {wallet['legacy_address']}{Style.RESET_ALL}")
    print("-" * 40)
    print()

def save_wallets_to_csv(wallets, filename="wallets.csv"):
    """将钱包信息保存到 CSV 文件中"""
    with open(filename, mode='w', newline='') as file:
        writer = csv.writer(file)
        writer.writerow(["Wallet Number", "Private Key (Hex)", "Private Key (WIF)", "Native SegWit (P2WPKH) Address", "Nested SegWit (P2SH-P2WPKH) Address", "Taproot (P2TR) Address", "Legacy (P2PKH) Address"])
        for i, wallet in enumerate(wallets, start=1):
            writer.writerow([i, wallet['private_key_hex'], wallet['private_key_wif'], wallet['native_segwit_address'], wallet['nested_segwit_address'], wallet['taproot_address'], wallet['legacy_address']])

def generate_wallets_in_parallel(num_wallets, num_threads):
    """并行生成钱包，并使用带颜色渐变的进度条显示进度"""
    wallets = []
    with ThreadPoolExecutor(max_workers=num_threads) as executor:
        futures = [executor.submit(generate_wallet) for _ in range(num_wallets)]
        
        with tqdm(total=num_wallets, desc="生成钱包进度", ncols=100) as pbar:
            for i, future in enumerate(as_completed(futures)):
                wallets.append(future.result())
                progress = i / num_wallets
                color = get_color_gradient(progress)
                pbar.set_description(f"{color}生成钱包进度{Style.RESET_ALL}")
                pbar.update(1)
    return wallets

def main():
    num_wallets = 1000  # 生成 1000 个钱包以测试
    num_threads = 64  # 使用 64 核处理器

    start_time = time.time()  # 开始计时
    wallets = generate_wallets_in_parallel(num_wallets, num_threads)
    end_time = time.time()  # 结束计时

    print(f"{Fore.BLUE}生成 {num_wallets} 个钱包用时: {end_time - start_time:.2f} 秒{Style.RESET_ALL}")
    save_wallets_to_csv(wallets)

if __name__ == "__main__":
    main()
