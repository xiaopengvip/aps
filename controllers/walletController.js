const bip39 = require('bip39');
const bip32 = require('bip32');  // 直接使用 bip32，无需 .default
const bitcoin = require('bitcoinjs-lib');
const crypto = require('crypto');

// 从私钥生成 WIF
function privateKeyToWIF(privateKeyHex) {
  try {
    const privateKeyBuffer = Buffer.from(privateKeyHex, 'hex');
    const extendedKey = Buffer.concat([Buffer.from([0x80]), privateKeyBuffer, Buffer.from([0x01])]); // 压缩标志
    const checksum = crypto.createHash('sha256').update(crypto.createHash('sha256').update(extendedKey).digest()).digest().slice(0, 4);
    return bitcoin.address.toBase58Check(Buffer.concat([extendedKey, checksum]), 0x80);
  } catch (error) {
    console.error('Error in privateKeyToWIF:', error.message);
    return null;
  }
}

// 从公钥生成 P2PKH 地址 (Legacy)
function publicKeyToP2PKHAddress(publicKeyBuffer) {
  try {
    return bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer }).address;
  } catch (error) {
    console.error('Error in publicKeyToP2PKHAddress:', error.message);
    return null;
  }
}

// 从公钥生成 P2SH 地址 (Nested SegWit)
function publicKeyToP2SHAddress(publicKeyBuffer) {
  try {
    const p2wpkh = bitcoin.payments.p2wpkh({ pubkey: publicKeyBuffer });
    const p2sh = bitcoin.payments.p2sh({ redeem: p2wpkh });
    return p2sh.address;
  } catch (error) {
    console.error('Error in publicKeyToP2SHAddress:', error.message);
    return null;
  }
}

// 从公钥生成 Bech32 地址 (Native SegWit)
function publicKeyToBech32Address(publicKeyBuffer) {
  try {
    return bitcoin.payments.p2wpkh({ pubkey: publicKeyBuffer }).address;
  } catch (error) {
    console.error('Error in publicKeyToBech32Address:', error.message);
    return null;
  }
}

// 从种子生成 Taproot 地址 (BIP86)
function publicKeyToTaprootAddressFromBip86(seedBuffer) {
  try {
    const node = bip32.fromSeed(seedBuffer);
    const { address } = bitcoin.payments.p2tr({
      internalPubkey: node.derivePath("m/86'/0'/0'/0/0").publicKey.slice(1, 33)
    });
    return address;
  } catch (error) {
    console.error('Error in publicKeyToTaprootAddressFromBip86:', error.message);
    return null;
  }
}

// 生成钱包
function generateWallet() {
  try {
    const mnemonic = bip39.generateMnemonic();  // 生成助记词
    const seed = bip39.mnemonicToSeedSync(mnemonic);  // 生成种子
    const root = bip32.fromSeed(seed);

    const account = root.derivePath("m/86'/0'/0'");  // BIP86路径
    const keyPair = account.derive(0).derive(0);
    const privateKeyHex = keyPair.privateKey.toString('hex');
    const publicKeyBuffer = keyPair.publicKey;

    // 地址生成
    const legacyAddress = publicKeyToP2PKHAddress(publicKeyBuffer);
    const nestedSegwitAddress = publicKeyToP2SHAddress(publicKeyBuffer);
    const nativeSegwitAddress = publicKeyToBech32Address(publicKeyBuffer);
    const taprootAddress = publicKeyToTaprootAddressFromBip86(seed);

    // 转换私钥为 WIF 格式
    const privateKeyWIF = privateKeyToWIF(privateKeyHex);

    return {
      mnemonic,  // 将助记词返回
      privateKeyHex,
      privateKeyWIF,
      legacyAddress,
      nestedSegwitAddress,
      nativeSegwitAddress,
      taprootAddress,
    };
  } catch (error) {
    console.error('Error generating wallet:', error.message);
    return null;
  }
}

// API 端点：生成钱包
exports.generateWallets = (req, res) => {
  try {
    const numWallets = parseInt(req.query.num_wallets) || 10; // 根据请求的数量生成钱包
    const wallets = [];

    for (let i = 0; i < numWallets; i++) {
      const wallet = generateWallet();
      if (wallet) {
        wallets.push(wallet);
      } else {
        console.error('Failed to generate wallet');
      }
    }

    res.status(200).json({ wallets });
  } catch (error) {
    console.error('Error in generateWallets endpoint:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
