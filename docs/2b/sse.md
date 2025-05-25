---
toc: content
group: 开发场景
order: 2
---
# 高并发场景下通信的技术选型
## 背景
电商的抢购场景是典型的高并发场景。当用户点开抢购页面时，我们需要显示倒计时。为了保证绝对的公平，这个时间需要使用服务器时间，即由服务器来广播。

在用户点击后，我们还需要同步库存状态，如果产品很热门，我们还需要显示抢购结果。如果抢购成功，且服务器因为稳定性原因，引入排队机制，还需要显示排队的状态。
还有一些其他的状态，比如限流状态的通知。

一般情况下，主要是服务器向客户端通信。

## 技术选型
主要的选择有：
- SSE：Server-Sent Events，基于TCP的轻量级通信技术
- Websocket: 基于TCP的双向实时通信
- QUIC：基于UDP的双向实时通信

QUIC需要较新的内核和客户端。Websocket百万/秒时，可能因频繁握手耗尽CPU资源。
而SSE作为轻量级的通信技术，在握手次数、内存消耗（连接态）、CPU消耗及兼容性等方面都有极大的优势。

如果只有服务器通信需求，优先使用SSE。如果有实时竞价、动态加价、组队抢购等需求则应该使用Websocket。

## 基于SSE场景
显示倒计时、库存、抢购结果及随队情况的示例。
### 服务器端逻辑
```js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// 模拟库存和队列
let stock = 100; // 初始库存
const queue = []; // 排队队列
const clients = new Set(); // 存储所有SSE客户端

// 中间件：解析JSON
app.use(express.json());

// 1. 处理抢购请求（HTTP POST）
app.post('/api/seckill', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  // 加入队列
  const position = queue.length + 1;
  queue.push({ userId, position });
  res.json({ status: 'queued', position });

  // 模拟异步处理（实际可用Redis/Kafka）
  setTimeout(processQueue, 1000);
});

// 2. SSE连接端点
app.get('/sse-updates', (req, res) => {
  // 设置SSE头部
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // 立即发送头部

  // 存储客户端连接
  const clientId = Date.now();
  clients.add(res);

  // 初始推送库存和倒计时
  sendToClient(res, 'stock', { stock });
  sendToClient(res, 'countdown', { endTime: Date.now() + 30000 }); // 30秒倒计时

  // 客户端断开时清理
  req.on('close', () => {
    clients.delete(res);
    console.log(`Client ${clientId} disconnected`);
  });
});

// 3. 处理队列消费
function processQueue() {
  if (queue.length === 0 || stock <= 0) return;

  const { userId } = queue.shift();
  stock--;

  // 广播库存更新
  broadcast('stock', { stock });

  // 通知抢购结果
  const result = stock >= 0 ? 'success' : 'sold_out';
  const targetClient = [...clients].find(client => 
    client.locals?.userId === userId
  );
  if (targetClient) {
    sendToClient(targetClient, 'result', { result, stock });
  }

  // 继续处理队列
  setTimeout(processQueue, 500);
}

// 工具函数：发送SSE消息
function sendToClient(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// 广播消息给所有客户端
function broadcast(event, data) {
  clients.forEach(client => {
    sendToClient(client, event, data);
  });
}

// 启动服务器
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```
### 客户端逻辑
```js
<!DOCTYPE html>
<html>
<head>
  <title>SSE抢购系统</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    #countdown, #stock, #position, #result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    button { padding: 10px 15px; background: #f80; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h1>商品抢购</h1>
  <div id="countdown">倒计时: 30秒</div>
  <div id="stock">剩余库存: 100</div>
  <div id="position">排队位置: -</div>
  <div id="result">抢购结果: -</div>
  <button id="seckill-btn">立即抢购</button>

  <script>
    const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
    let es;

    // 1. 初始化SSE连接
    function connectSSE() {
      es = new EventSource('http://localhost:3000/sse-updates');

      // 监听库存更新
      es.addEventListener('stock', (e) => {
        const { stock } = JSON.parse(e.data);
        document.getElementById('stock').textContent = `剩余库存: ${stock}`;
      });

      // 监听倒计时
      es.addEventListener('countdown', (e) => {
        const { endTime } = JSON.parse(e.data);
        updateCountdown(endTime);
      });

      // 监听抢购结果
      es.addEventListener('result', (e) => {
        const { result } = JSON.parse(e.data);
        document.getElementById('result').textContent = `抢购结果: ${result}`;
      });
    }

    // 2. 倒计时逻辑
    function updateCountdown(endTime) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000);
        document.getElementById('countdown').textContent = `倒计时: ${remaining}秒`;
        if (remaining <= 0) clearInterval(timer);
      }, 1000);
    }

    // 3. 抢购按钮点击
    document.getElementById('seckill-btn').addEventListener('click', async () => {
      const res = await fetch('http://localhost:3000/api/seckill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const { status, position } = await res.json();
      if (status === 'queued') {
        document.getElementById('position').textContent = `排队位置: ${position}`;
      }
    });

    // 初始化
    connectSSE();
  </script>
</body>
</html>
```
## 基于Websocket的场景
基于websockt实现竞价功能。
## 服务端逻辑
```js
const WebSocket = require('ws');
const redis = require('redis');
const express = require('express');

// 初始化Redis（用于实时价格缓存）
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis error:', err));

// 模拟商品数据
const items = {
  'item_1': { name: 'iPhone 15', currentPrice: 5000, bids: [] }
};

// 创建WebSocket服务器
const wss = new WebSocket.Server({ port: 8080 });
const app = express();
app.use(express.static('public')); // 静态文件服务
app.listen(3000, () => console.log('HTTP server running on 3000'));

// WebSocket连接处理
wss.on('connection', (ws) => {
  console.log('New client connected');

  // 1. 发送初始商品信息
  ws.send(JSON.stringify({
    type: 'init',
    item: items['item_1'],
    countdown: Date.now() + 300000 // 5分钟倒计时
  }));

  // 2. 处理客户端消息
  ws.on('message', (message) => {
    try {
      const { type, userId, bidAmount } = JSON.parse(message);
      
      if (type === 'bid') {
        handleBid(ws, userId, bidAmount);
      }
    } catch (err) {
      console.error('Message parse error:', err);
    }
  });

  // 3. 断开连接清理
  ws.on('close', () => console.log('Client disconnected'));
});

// 处理竞价逻辑
function handleBid(ws, userId, bidAmount) {
  const item = items['item_1'];
  
  // 验证出价有效性
  if (bidAmount <= item.currentPrice) {
    ws.send(JSON.stringify({
      type: 'error',
      message: '出价必须高于当前价格'
    }));
    return;
  }

  // 更新价格和出价记录
  item.currentPrice = bidAmount;
  item.bids.push({ userId, amount: bidAmount, time: Date.now() });

  // 广播新价格给所有客户端
  broadcast({
    type: 'price_update',
    currentPrice: bidAmount,
    leadingUser: userId
  });

  // 存储到Redis（生产环境用）
  redisClient.set('current_price', bidAmount);
}

// 广播消息给所有客户端
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```
### 客户端逻辑
```js
<!DOCTYPE html>
<html>
<head>
  <title>实时竞价抢购</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    #item-info { background: #f5f5f5; padding: 15px; margin-bottom: 20px; }
    #bid-form { display: flex; gap: 10px; margin-bottom: 20px; }
    #bid-history { max-height: 300px; overflow-y: auto; border: 1px solid #ddd; padding: 10px; }
    .bid { margin: 5px 0; padding: 5px; background: #f9f9f9; }
    #countdown { color: red; font-weight: bold; }
  </style>
</head>
<body>
  <div id="item-info">
    <h2 id="item-name">商品加载中...</h2>
    <div>当前价格: ¥<span id="current-price">-</span></div>
    <div>领先者: <span id="leading-user">-</span></div>
    <div>剩余时间: <span id="countdown">-</span></div>
  </div>

  <div id="bid-form">
    <input type="number" id="bid-amount" placeholder="输入出价" min="0">
    <button id="bid-btn">出价</button>
  </div>

  <h3>出价记录</h3>
  <div id="bid-history"></div>

  <script>
    const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
    let ws;
    let endTime;

    // 1. 初始化WebSocket连接
    function connectWebSocket() {
      ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        document.getElementById('item-name').textContent = '正在连接...';
      };

      ws.onmessage = (e) => {
        const data = JSON.parse(e.data);
        switch (data.type) {
          case 'init':
            handleInit(data);
            break;
          case 'price_update':
            updatePrice(data);
            break;
          case 'error':
            alert(data.message);
            break;
        }
      };

      ws.onclose = () => {
        console.log('Disconnected from WebSocket');
        setTimeout(connectWebSocket, 1000); // 自动重连
      };
    }

    // 2. 处理初始化数据
    function handleInit(data) {
      document.getElementById('item-name').textContent = data.item.name;
      document.getElementById('current-price').textContent = data.item.currentPrice;
      endTime = data.countdown;
      startCountdown();
    }

    // 3. 更新价格显示
    function updatePrice(data) {
      document.getElementById('current-price').textContent = data.currentPrice;
      document.getElementById('leading-user').textContent = data.leadingUser;
      
      // 添加到历史记录
      const historyDiv = document.getElementById('bid-history');
      const bidEntry = document.createElement('div');
      bidEntry.className = 'bid';
      bidEntry.textContent = `用户 ${data.leadingUser} 出价 ¥${data.currentPrice}`;
      historyDiv.prepend(bidEntry);
    }

    // 4. 倒计时逻辑
    function startCountdown() {
      setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        document.getElementById('countdown').textContent = `${remaining}秒`;
      }, 1000);
    }

    // 5. 出价表单提交
    document.getElementById('bid-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('bid-amount').value);
      if (!amount || amount <= 0) {
        alert('请输入有效出价');
        return;
      }
      
      ws.send(JSON.stringify({
        type: 'bid',
        userId,
        bidAmount: amount
      }));
    });

    // 初始化连接
    connectWebSocket();
  </script>
</body>
</html>
```
