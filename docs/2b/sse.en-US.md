---
toc: content
group: Development Scenarios
order: 30
---
# Technology Selection for Communication in High Concurrency Scenarios

## Background
E-commerce flash sale scenarios are typical high concurrency scenarios. When users open the flash sale page, we need to display a countdown. To ensure absolute fairness, this time needs to use server time, i.e., broadcast by the server.

After users click, we also need to synchronize inventory status. If the product is very popular, we also need to display flash sale results. If the flash sale is successful and the server introduces a queuing mechanism for stability reasons, we also need to display queuing status.
There are also other statuses, such as rate limiting status notifications.

Generally, it's mainly server-to-client communication.

## Technology Selection
Main choices include:
- SSE: Server-Sent Events, lightweight communication technology based on TCP
- Websocket: Bidirectional real-time communication based on TCP
- QUIC: Bidirectional real-time communication based on UDP

QUIC requires newer kernels and clients. When Websocket reaches millions/second, it may exhaust CPU resources due to frequent handshakes.
SSE, as a lightweight communication technology, has great advantages in handshake count, memory consumption (connection state), CPU consumption, and compatibility.

If only server communication is needed, prioritize SSE. If there are real-time bidding, dynamic price increases, team flash sales, etc., then Websocket should be used.

## SSE-based Scenario
Example of displaying countdown, inventory, flash sale results, and queue status.

### Server-side Logic
```js
const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

// Simulate inventory and queue
let stock = 100; // Initial inventory
const queue = []; // Queue
const clients = new Set(); // Store all SSE clients

// Middleware: Parse JSON
app.use(express.json());

// 1. Handle flash sale requests (HTTP POST)
app.post('/api/seckill', (req, res) => {
  const userId = req.body.userId;
  if (!userId) return res.status(400).json({ error: 'Missing userId' });

  // Add to queue
  const position = queue.length + 1;
  queue.push({ userId, position });
  res.json({ status: 'queued', position });

  // Simulate async processing (can use Redis/Kafka in practice)
  setTimeout(processQueue, 1000);
});

// 2. SSE connection endpoint
app.get('/sse-updates', (req, res) => {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers immediately

  // Store client connection
  const clientId = Date.now();
  clients.add(res);

  // Initial push inventory and countdown
  sendToClient(res, 'stock', { stock });
  sendToClient(res, 'countdown', { endTime: Date.now() + 30000 }); // 30-second countdown

  // Cleanup when client disconnects
  req.on('close', () => {
    clients.delete(res);
    console.log(`Client ${clientId} disconnected`);
  });
});

// 3. Handle queue consumption
function processQueue() {
  if (queue.length === 0 || stock <= 0) return;

  const { userId } = queue.shift();
  stock--;

  // Broadcast inventory update
  broadcast('stock', { stock });

  // Notify flash sale result
  const result = stock >= 0 ? 'success' : 'sold_out';
  const targetClient = [...clients].find(client => 
    client.locals?.userId === userId
  );
  if (targetClient) {
    sendToClient(targetClient, 'result', { result, stock });
  }

  // Continue processing queue
  setTimeout(processQueue, 500);
}

// Utility function: Send SSE message
function sendToClient(res, event, data) {
  res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
}

// Broadcast message to all clients
function broadcast(event, data) {
  clients.forEach(client => {
    sendToClient(client, event, data);
  });
}

// Start server
app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
```

### Client-side Logic
```js
<!DOCTYPE html>
<html>
<head>
  <title>SSE Flash Sale System</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
    #countdown, #stock, #position, #result { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
    button { padding: 10px 15px; background: #f80; color: white; border: none; cursor: pointer; }
  </style>
</head>
<body>
  <h1>Product Flash Sale</h1>
  <div id="countdown">Countdown: 30 seconds</div>
  <div id="stock">Remaining inventory: 100</div>
  <div id="position">Queue position: -</div>
  <div id="result">Flash sale result: -</div>
  <button id="seckill-btn">Flash Sale Now</button>

  <script>
    const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
    let es;

    // 1. Initialize SSE connection
    function connectSSE() {
      es = new EventSource('http://localhost:3000/sse-updates');

      // Listen for inventory updates
      es.addEventListener('stock', (e) => {
        const { stock } = JSON.parse(e.data);
        document.getElementById('stock').textContent = `Remaining inventory: ${stock}`;
      });

      // Listen for countdown
      es.addEventListener('countdown', (e) => {
        const { endTime } = JSON.parse(e.data);
        updateCountdown(endTime);
      });

      // Listen for flash sale results
      es.addEventListener('result', (e) => {
        const { result } = JSON.parse(e.data);
        document.getElementById('result').textContent = `Flash sale result: ${result}`;
      });
    }

    // 2. Countdown logic
    function updateCountdown(endTime) {
      const timer = setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        document.getElementById('countdown').textContent = `Countdown: ${remaining} seconds`;
        if (remaining <= 0) clearInterval(timer);
      }, 1000);
    }

    // 3. Flash sale button click
    document.getElementById('seckill-btn').addEventListener('click', async () => {
      const res = await fetch('http://localhost:3000/api/seckill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const { status, position } = await res.json();
      if (status === 'queued') {
        document.getElementById('position').textContent = `Queue position: ${position}`;
      }
    });

    // Initialize
    connectSSE();
  </script>
</body>
</html>
```

## Websocket-based Scenario
Implement bidding functionality based on websocket.

### Server-side Logic
```js
const WebSocket = require('ws');
const redis = require('redis');
const express = require('express');

// Initialize Redis (for real-time price caching)
const redisClient = redis.createClient();
redisClient.on('error', (err) => console.log('Redis error:', err));

// Simulate product data
const items = {
  'item_1': { name: 'iPhone 15', currentPrice: 5000, bids: [] }
};

// Create WebSocket server
const wss = new WebSocket.Server({ port: 8080 });
const app = express();
app.use(express.static('public')); // Static file service
app.listen(3000, () => console.log('HTTP server running on 3000'));

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New client connected');

  // 1. Send initial product information
  ws.send(JSON.stringify({
    type: 'init',
    item: items['item_1'],
    countdown: Date.now() + 300000 // 5-minute countdown
  }));

  // 2. Handle client messages
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

  // 3. Disconnect cleanup
  ws.on('close', () => console.log('Client disconnected'));
});

// Handle bidding logic
function handleBid(ws, userId, bidAmount) {
  const item = items['item_1'];
  
  // Validate bid effectiveness
  if (bidAmount <= item.currentPrice) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Bid must be higher than current price'
    }));
    return;
  }

  // Update price and bid records
  item.currentPrice = bidAmount;
  item.bids.push({ userId, amount: bidAmount, time: Date.now() });

  // Broadcast new price to all clients
  broadcast({
    type: 'price_update',
    currentPrice: bidAmount,
    leadingUser: userId
  });

  // Store to Redis (for production environment)
  redisClient.set('current_price', bidAmount);
}

// Broadcast message to all clients
function broadcast(message) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(message));
    }
  });
}
```

### Client-side Logic
```js
<!DOCTYPE html>
<html>
<head>
  <title>Real-time Bidding Flash Sale</title>
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
    <h2 id="item-name">Product loading...</h2>
    <div>Current price: ¥<span id="current-price">-</span></div>
    <div>Leader: <span id="leading-user">-</span></div>
    <div>Time remaining: <span id="countdown">-</span></div>
  </div>

  <div id="bid-form">
    <input type="number" id="bid-amount" placeholder="Enter bid" min="0">
    <button id="bid-btn">Bid</button>
  </div>

  <h3>Bid History</h3>
  <div id="bid-history"></div>

  <script>
    const userId = `user_${Math.random().toString(36).substr(2, 8)}`;
    let ws;
    let endTime;

    // 1. Initialize WebSocket connection
    function connectWebSocket() {
      ws = new WebSocket('ws://localhost:8080');

      ws.onopen = () => {
        console.log('Connected to WebSocket');
        document.getElementById('item-name').textContent = 'Connecting...';
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
        setTimeout(connectWebSocket, 1000); // Auto-reconnect
      };
    }

    // 2. Handle initialization data
    function handleInit(data) {
      document.getElementById('item-name').textContent = data.item.name;
      document.getElementById('current-price').textContent = data.item.currentPrice;
      endTime = data.countdown;
      startCountdown();
    }

    // 3. Update price display
    function updatePrice(data) {
      document.getElementById('current-price').textContent = data.currentPrice;
      document.getElementById('leading-user').textContent = data.leadingUser;
      
      // Add to history
      const historyDiv = document.getElementById('bid-history');
      const bidEntry = document.createElement('div');
      bidEntry.className = 'bid';
      bidEntry.textContent = `User ${data.leadingUser} bid ¥${data.currentPrice}`;
      historyDiv.prepend(bidEntry);
    }

    // 4. Countdown logic
    function startCountdown() {
      setInterval(() => {
        const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
        document.getElementById('countdown').textContent = `${remaining} seconds`;
      }, 1000);
    }

    // 5. Bid form submission
    document.getElementById('bid-btn').addEventListener('click', () => {
      const amount = parseInt(document.getElementById('bid-amount').value);
      if (!amount || amount <= 0) {
        alert('Please enter valid bid');
        return;
      }
      
      ws.send(JSON.stringify({
        type: 'bid',
        userId,
        bidAmount: amount
      }));
    });

    // Initialize connection
    connectWebSocket();
  </script>
</body>
</html>
```
