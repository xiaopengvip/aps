// __tests__/index.test.ts
import BIP32Factory, { BIP32Interface } from 'bip32';
import * as ecc from 'tiny-secp256k1';
import * as bip39 from 'bip39';
import * as bitcoin from 'bitcoinjs-lib';

describe('BIP32 Library', () => {
  it('should generate a valid Bitcoin address', () => {
    const bip32 = BIP32Factory(ecc);
    const mnemonic: string = 'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const seed: Buffer = bip39.mnemonicToSeedSync(mnemonic);
    const root: BIP32Interface = bip32.fromSeed(seed);
    const child: BIP32Interface = root.derivePath("m/44'/0'/0'/0/0");
    const { publicKey } = child;
    const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });
    expect(address).toBe('1LqBGSKuX8Gk6oNKEV7uNPLqax5iC5S7Ne');
  });
});
