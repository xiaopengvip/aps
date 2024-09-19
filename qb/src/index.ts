// src/index.ts
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

// 初始化 BIP32
const bip32 = BIP32Factory(ecc);

// 生成助记词
const mnemonic: string = bip39.generateMnemonic();
console.log('助记词:', mnemonic);

// 从助记词生成种子
const seed: Buffer = bip39.mnemonicToSeedSync(mnemonic);

// 创建 HD 节点
const root: BIP32Interface = bip32.fromSeed(seed);

// 导出主私钥和主公钥
const masterPrivateKey: string = root.toBase58();
const masterPublicKey: string = root.neutered().toBase58();
console.log('主私钥:', masterPrivateKey);
console.log('主公钥:', masterPublicKey);

// 生成子节点 (例如：m/0/0)
const child: BIP32Interface = root.derivePath("m/44'/0'/0'/0/0");

// 获取子节点的私钥和公钥
const { privateKey, publicKey } = child;

// 创建比特币地址
const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });
console.log('比特币地址:', address);
