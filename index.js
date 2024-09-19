require('dotenv').config(); // 加载环境变量配置
const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api'); // 引入 API 路由
const swaggerUi = require('swagger-ui-express'); // 引入 Swagger UI
const swaggerJsdoc = require('swagger-jsdoc'); // 引入 Swagger JSDoc

const app = express();
const PORT = process.env.PORT || 59010;

app.use(cors()); // 允许跨域请求
app.use(express.json()); // 解析 JSON 请求

// Swagger 配置
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'XIAO2027集成UniSat Wallet - OpenAPI', // API 文档的标题
      version: '1.0.0',
      description: 'XIAO2027提供的集成 UniSat Wallet API 文档，包括 Fractal 流通供应量、地址查询接口、以及钱包生成功能。',
      contact: {
        name: 'XIAO2027 开发团队',
        url: 'https://x.api.x2027.xyz',
        email: 'xrps@qq.com',
      },
      license: {
        name: 'Apache 2.0',
        url: 'https://www.apache.org/licenses/LICENSE-2.0.html',
      },
    },
    servers: [
      {
        url: 'https://x.api.x2027.xyz', // API 的基础 URL
        description: '生产环境服务器',
      },
    ],
    tags: [
      {
        name: 'Fractal API',
        description: '与 Fractal 网络相关的 API 接口',
      },
      {
        name: '地址查询 API',
        description: '与地址相关的查询接口',
      },
      {
        name: '钱包 API',
        description: '钱包生成相关的 API 接口',
      },
      {
        name: '消息功能 API',
        description: '未来预留的消息发送、通知功能',
      },
    ],
  },
  apis: ['./routes/*.js'], // 从 routes 文件夹生成 API 文档
};

// 初始化 Swagger 文档
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs, { explorer: true }));

// 注册 API 路由
app.use('/api', apiRoutes);

// 启动服务器并监听指定端口
app.listen(PORT, () => {
  console.log(`服务器已启动，监听端口 ${PORT}`);
});

// ========== 预留未来扩展功能 ==========

// TODO: 消息功能 API 预留
// 未来可能会扩展消息发送和通知功能，用于推送相关通知（如交易成功、钱包生成完成等）。
// 例如：
// app.post('/api/send-notification', (req, res) => {
//   const { message, recipient } = req.body;
//   // 实现消息发送逻辑
//   res.json({ success: true, message: `消息已发送给 ${recipient}` });
// });

// app.get('/api/notifications', (req, res) => {
//   // 返回所有消息
//   res.json({ notifications: [...] });
// });
