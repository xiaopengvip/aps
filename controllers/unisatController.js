const axios = require('axios');
const BASE_URL = 'https://open-api-fractal.unisat.io';

// ------------------ 无需 API 密钥的 API 控制器 ------------------

// 获取 Fractal 流通供应量
exports.getFractalSupply = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/public/fractal/supply`);
    res.json(response.data);
  } catch (error) {
    console.error('获取 Fractal 流通供应量时出错:', error.message);
    res.status(500).json({ error: '无法获取 Fractal 流通供应量' });
  }
};

// 获取 Fractal 总供应量
exports.getFractalTotalSupply = async (req, res) => {
  try {
    const response = await axios.get(`${BASE_URL}/v1/public/fractal/total-supply`);
    res.json(response.data);
  } catch (error) {
    console.error('获取 Fractal 总供应量时出错:', error.message);
    res.status(500).json({ error: '无法获取 Fractal 总供应量' });
  }
};

// ------------------ 需要 API 密钥的 API 控制器 ------------------

const headers = {
  'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`,  // 使用环境变量中的 API 密钥
};

// 获取铭文信息
exports.getInscriptionInfo = async (req, res) => {
  const { inscriptionId } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/inscription/info/${inscriptionId}`, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('获取铭文信息时出错:', error.message);
    res.status(500).json({ error: '无法获取铭文信息' });
  }
};

// 获取铭文内容
exports.getInscriptionContent = async (req, res) => {
  const { inscriptionId } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/inscription/content/${inscriptionId}`, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('获取铭文内容时出错:', error.message);
    res.status(500).json({ error: '无法获取铭文内容' });
  }
};

// 获取 BRC-20 代币信息
exports.getBRC20TokenInfo = async (req, res) => {
  const { ticker } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/brc20/${ticker}/info`, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('获取 BRC-20 代币信息时出错:', error.message);
    res.status(500).json({ error: '无法获取 BRC-20 代币信息' });
  }
};

// 获取 BRC-20 代币持有者
exports.getBRC20TokenHolders = async (req, res) => {
  const { ticker } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/brc20/${ticker}/holders`, { headers });
    res.json(response.data);
  } catch (error) {
    console.error('获取 BRC-20 代币持有者时出错:', error.message);
    res.status(500).json({ error: '无法获取 BRC-20 代币持有者' });
  }
};

// 获取交易详情
exports.getTransactionDetails = async (req, res) => {
  const { txid } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/tx/${txid}`, {
      headers: {
        'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(`获取交易 ID ${txid} 的详情时出错:`, error.message);
    res.status(500).json({ error: '无法获取交易详情' });
  }
};

// 获取交易输入信息
exports.getTransactionInputs = async (req, res) => {
  const { txid } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/tx/${txid}/ins`, {
      headers: {
        'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(`获取交易 ID ${txid} 的输入信息时出错:`, error.message);
    res.status(500).json({ error: '无法获取交易输入信息' });
  }
};

// 获取交易输出信息
exports.getTransactionOutputs = async (req, res) => {
  const { txid } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/tx/${txid}/outs`, {
      headers: {
        'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`
      }
    });
    res.json(response.data);
  } catch (error) {
    console.error(`获取交易 ID ${txid} 的输出信息时出错:`, error.message);
    res.status(500).json({ error: '无法获取交易输出信息' });
  }
};

// 获取地址余额
exports.getAddressBalance = async (req, res) => {
  const { address } = req.params;
  try {
    const response = await axios.get(`${BASE_URL}/v1/indexer/address/${address}/balance`, {
      headers: {
        'Authorization': `Bearer ${process.env.UNISAT_API_KEY}`,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error(`获取地址 ${address} 的余额时出错:`, error.message);
    res.status(500).json({ error: '无法获取地址余额' });
  }
};

