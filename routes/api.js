const express = require('express');
const router = express.Router();
const unisatController = require('../controllers/unisatController');
const walletController = require('../controllers/walletController');

/**
 * @swagger
 * /generate-wallets:
 *   get:
 *     summary: 生成指定数量的钱包
 *     description: 生成包含 Legacy, Nested SegWit, Native SegWit, Taproot 地址的钱包
 *     tags:
 *       - Wallet API
 *     parameters:
 *       - name: num_wallets
 *         in: query
 *         required: false
 *         description: 生成的钱包数量 (默认 10)
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 返回生成的钱包信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 wallets:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       privateKeyHex:
 *                         type: string
 *                       privateKeyWIF:
 *                         type: string
 *                       legacyAddress:
 *                         type: string
 *                       nestedSegwitAddress:
 *                         type: string
 *                       nativeSegwitAddress:
 *                         type: string
 *                       taprootAddress:
 *                         type: string
 */
// 生成钱包 API 路由
router.get('/wallets/generate', walletController.generateWallets);



/**
 * @swagger
 * /api/fractal/supply:
 *   get:
 *     summary: 获取 Fractal 流通供应量FB
 *     description: 通过与 UniSat API 交互获取 Fractal 网络中的流通供应量。
 *     tags:
 *       - Fractal API
 *     responses:
 *       200:
 *         description: 成功获取流通供应量
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: 响应代码，0 表示成功
 *                 msg:
 *                   type: string
 *                   description: 响应消息
 *                 data:
 *                   type: object
 *                   properties:
 *                     blocks:
 *                       type: integer
 *                       description: 区块数量
 *                     supply:
 *                       type: integer
 *                       description: Fractal 的当前流通供应量
 * 
 */
router.get('/fractal/supply', unisatController.getFractalSupply);

/**
 * @swagger
 * /fractal/total-supply:
 *   get:
 *     summary: 获取 Fractal 总供应量FB
 *     description: 获取 Fractal 网络中的总供应量FB
 *     tags:
 *       - Fractal API
 *     responses:
 *       200:
 *         description: 返回 Fractal 总供应量FB
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: 响应代码，通常为 0 表示成功
 *                 msg:
 *                   type: string
 *                   description: 响应消息
 *                 data:
 *                   type: object
 *                   properties:
 *                     totalSupply:
 *                       type: string
 *                       description: Fractal 网络中的总供应量FB
 *                     blocks:
 *                       type: integer
 *                       description: 当前块高
 *       500:
 *         description: 服务器内部错误
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   description: 错误信息
 */
router.get('/fractal/total-supply', unisatController.getFractalTotalSupply);



/**
 * @swagger
 * /inscription/info/{inscriptionId}:
 *   get:
 *     summary: 获取铭文信息
 *     description: 根据铭文 ID 获取铭文的详细信息
 *     tags:
 *       - 铭文 API
 *     parameters:
 *       - name: inscriptionId
 *         in: path
 *         required: true
 *         description: 铭文 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回铭文信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inscriptionId:
 *                   type: string
 *                   description: 铭文 ID
 */
router.get('/inscription/info/:inscriptionId', unisatController.getInscriptionInfo);

/**
 * @swagger
 * /inscription/content/{inscriptionId}:
 *   get:
 *     summary: 获取铭文内容
 *     description: 根据铭文 ID 获取铭文的内容
 *     tags:
 *       - 铭文 API
 *     parameters:
 *       - name: inscriptionId
 *         in: path
 *         required: true
 *         description: 铭文 ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回铭文内容
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 content:
 *                   type: string
 *                   description: 铭文内容
 */
router.get('/inscription/content/:inscriptionId', unisatController.getInscriptionContent);

/**
 * @swagger
 * /brc20/{ticker}/info:
 *   get:
 *     summary: 获取 BRC-20 代币信息
 *     description: 根据 Ticker 获取 BRC-20 代币信息
 *     tags:
 *       - BRC-20 API
 *     parameters:
 *       - name: ticker
 *         in: path
 *         required: true
 *         description: 代币 Ticker
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回 BRC-20 代币信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ticker:
 *                   type: string
 *                   description: 代币名称
 */
router.get('/brc20/:ticker/info', unisatController.getBRC20TokenInfo);

/**
 * @swagger
 * /brc20/{ticker}/holders:
 *   get:
 *     summary: 获取 BRC-20 代币持有者
 *     description: 根据 Ticker 获取 BRC-20 代币持有者信息
 *     tags:
 *       - BRC-20 API
 *     parameters:
 *       - name: ticker
 *         in: path
 *         required: true
 *         description: 代币 Ticker
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回 BRC-20 代币持有者信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 holders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       address:
 *                         type: string
 *                         description: 持有者地址
 */
router.get('/brc20/:ticker/holders', unisatController.getBRC20TokenHolders);

/**
 * @swagger
 * /tx/{txid}:
 *   get:
 *     summary: 获取交易详情
 *     description: 根据交易哈希获取交易的详细信息
 *     tags:
 *       - 交易 API
 *     parameters:
 *       - name: txid
 *         in: path
 *         required: true
 *         description: 交易哈希
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回交易详情
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 txid:
 *                   type: string
 *                   description: 交易哈希
 */
router.get('/tx/:txid', unisatController.getTransactionDetails);

/**
 * @swagger
 * /tx/{txid}/ins:
 *   get:
 *     summary: 获取交易输入信息
 *     description: 根据交易哈希获取交易的输入信息
 *     tags:
 *       - 交易 API
 *     parameters:
 *       - name: txid
 *         in: path
 *         required: true
 *         description: 交易哈希
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回交易输入信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 inputs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 交易输入
 */
router.get('/tx/:txid/ins', unisatController.getTransactionInputs);

/**
 * @swagger
 * /tx/{txid}/outs:
 *   get:
 *     summary: 获取交易输出信息
 *     description: 根据交易哈希获取交易的输出信息
 *     tags:
 *       - 交易 API
 *     parameters:
 *       - name: txid
 *         in: path
 *         required: true
 *         description: 交易哈希
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: 返回交易输出信息
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 outputs:
 *                   type: array
 *                   items:
 *                     type: object
 *                     description: 交易输出
 */
router.get('/tx/:txid/outs', unisatController.getTransactionOutputs);


/**
 * @swagger
 * /api/address/{address}/balance:
 *   get:
 *     summary: 获取地址余额
 *     description: 通过提供的地址查询该地址的余额信息。
 *     tags:
 *       - 地址查询 API  // 使用 "地址查询 API" 标签
 *     parameters:
 *       - in: path
 *         name: address
 *         schema:
 *           type: string
 *           description: 区块链地址
 *         required: true
 *         description: 需要查询余额的区块链地址
 *     responses:
 *       200:
 *         description: 成功获取地址余额
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: integer
 *                   description: 响应代码，0 表示成功
 *                 msg:
 *                   type: string
 *                   description: 响应消息
 *                 data:
 *                   type: object
 *                   properties:
 *                     balance:
 *                       type: integer
 *                       description: 地址的当前余额
 */
router.get('/address/:address/balance', unisatController.getAddressBalance);


module.exports = router;
