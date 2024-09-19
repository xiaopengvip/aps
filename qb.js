// qb.js

const bitcoin = require('bitcoinjs-lib');
const bip39 = require('bip39');
const tinysecp = require('tiny-secp256k1'); // 导入 tiny-secp256k1
const bip32 = require('bip32')(tinysecp);    // 使用 bip32@4.0.0 创建 BIP32 实例

// 生成钱包
function generateWallet() {
  try {
    // 生成助记词（默认 12 个单词）
    const mnemonic = bip39.generateMnemonic();
    console.log('助记词 (Mnemonic):', mnemonic);

    // 将助记词转换为种子
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    console.log('种子 (Seed):', seed.toString('hex'));

    // 从种子生成根密钥
    const root = bip32.fromSeed(seed, bitcoin.networks.bitcoin);

    // 派生账户路径 (BIP86: m/86'/0'/0')
    const account = root.derivePath("m/86'/0'/0'");

    // 派生第一个地址的密钥对 (m/86'/0'/0'/0/0)
    const keyPair = account.derive(0).derive(0);

    // 获取私钥（十六进制格式）
    const privateKeyHex = keyPair.privateKey.toString('hex');
    console.log('私钥 (Private Key):', privateKeyHex);

    // 获取公钥（Buffer 对象）
    const publicKeyBuffer = Buffer.from(keyPair.publicKey);

    // 生成各种类型的比特币地址
    const legacyAddress = bitcoin.payments.p2pkh({ pubkey: publicKeyBuffer, network: bitcoin.networks.bitcoin }).address;
    const nestedSegwitAddress = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({ pubkey: publicKeyBuffer, network: bitcoin.networks.bitcoin }),
      network: bitcoin.networks.bitcoin
    }).address;
    const nativeSegwitAddress = bitcoin.payments.p2wpkh({ pubkey: publicKeyBuffer, network: bitcoin.networks.bitcoin }).address;

    return {
      mnemonic,
      seed: seed.toString('hex'),
      privateKeyHex,
      legacyAddress,
      nestedSegwitAddress,
      nativeSegwitAddress
    };
  } catch (error) {
    console.error('生成钱包时出错:', error.message);
    return null;
  }
}

// 执行生成钱包并输出结果
const wallet = generateWallet();
if (wallet) {
  console.log('生成的钱包信息:');
  console.log(JSON.stringify(wallet, null, 2));
} else {
  console.log('未能生成钱包。');
}
