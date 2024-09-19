#!/bin/bash

set -e

# 项目名称
PROJECT_NAME="bip32-ts-library"

# 检查目录是否存在
if [ -d "$PROJECT_NAME" ]; then
  echo "目录 $PROJECT_NAME 已存在。是否要删除并重新创建？ (y/n)"
  read answer
  if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    rm -rf $PROJECT_NAME
    echo "已删除现有目录 $PROJECT_NAME。"
  else
    echo "请修改脚本中的 PROJECT_NAME 或手动处理现有目录。"
    exit 1
  fi
fi

# 创建项目目录并进入
mkdir $PROJECT_NAME
cd $PROJECT_NAME

echo "初始化 npm 项目..."
npm init -y

echo "安装生产依赖..."
npm install bip32 tiny-secp256k1 bip39 bitcoinjs-lib

echo "安装开发依赖..."
npm install --save-dev typescript ts-node @types/node prettier eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin jest ts-jest @types/jest husky lint-staged

echo "初始化 TypeScript 配置..."
cat > tsconfig.json <<EOL
{
  "compilerOptions": {
    "target": "ES6",
    "module": "CommonJS",
    "declaration": true,
    "outDir": "./dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "**/__tests__/*"]
}
EOL

echo "初始化 ESLint 配置..."
cat > .eslintrc.js <<EOL
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier' // 确保 Prettier 的规则在最后
  ],
  rules: {
    // 根据需要自定义规则
  }
};
EOL

echo "初始化 Prettier 配置..."
cat > .prettierrc <<EOL
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "trailingComma": "es5"
}
EOL

echo "创建 .prettierignore 文件..."
cat > .prettierignore <<EOL
node_modules
dist
EOL

echo "创建 .eslintignore 文件..."
cat > .eslintignore <<EOL
node_modules
dist
EOL

echo "配置 package.json 脚本..."
npx json -I -f package.json -e '
this.scripts.build = "tsc";
this.scripts.start = "node dist/index.js";
this.scripts.dev = "ts-node src/index.ts";
this.scripts.lint = "eslint \"src/**/*.{ts,js}\"";
this.scripts.format = "prettier --write \"src/**/*.{ts,js,json,md}\"";
this.scripts.test = "jest";
this.scripts.prepare = "husky install";
'

echo "配置 Husky 预提交钩子..."
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"

echo "配置 lint-staged..."
npx json -I -f package.json -e '
this["lint-staged"] = {
  "src/**/*.{ts,js,json,md}": [
    "prettier --write",
    "eslint --fix"
  ]
}
'

echo "初始化 Jest 配置..."
npx ts-jest config:init

echo "创建 src 目录和示例代码..."
mkdir src
cat > src/index.ts <<EOL
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

// 生成子节点 (例如：m/44'/0'/0'/0/0)
const child: BIP32Interface = root.derivePath("m/44'/0'/0'/0/0");

// 获取子节点的私钥和公钥
const { privateKey, publicKey } = child;

// 创建比特币地址
const { address } = bitcoin.payments.p2pkh({ pubkey: publicKey });
console.log('比特币地址:', address);
EOL

echo "创建测试目录和示例测试..."
mkdir __tests__
cat > __tests__/index.test.ts <<EOL
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
EOL

echo "创建 GitHub Actions 工作流..."
mkdir -p .github/workflows
cat > .github/workflows/ci.yml <<EOL
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build:

    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]

    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js \${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: \${{ matrix.node-version }}
    - run: npm install
    - run: npm run lint
    - run: npm run build
    - run: npm test
EOL

echo "初始化 Git 仓库并提交初始代码..."
git init
git add .
git commit -m "chore: initial commit with TypeScript BIP32 library setup"

echo "设置完成！"

echo "运行以下命令将代码推送到 GitHub 仓库："
echo "1. 创建 GitHub 仓库： https://github.com/new"
echo "2. 将远程仓库添加为 origin："
echo "   git remote add origin https://github.com/<您的用户名>/$PROJECT_NAME.git"
echo "3. 推送代码："
echo "   git push -u origin main"
