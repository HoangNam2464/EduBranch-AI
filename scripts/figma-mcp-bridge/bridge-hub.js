const { WebSocketServer } = require('ws');
const http = require('http');

const WS_PORT = 28211;
const HTTP_PORT = 28212;

let activeWs = null;
const pendingRequests = new Map();
let reqCounter = 0;

// 1. WebSocket Server for Figma Desktop Plugin
const wss = new WebSocketServer({ port: WS_PORT });

wss.on('connection', (ws) => {
  activeWs = ws;
  console.log(`[Bridge Hub] Figma plugin connected on ws://127.0.0.1:${WS_PORT}`);

  ws.on('message', (message) => {
    try {
      const data = JSON.parse(message.toString());
      if (data.id && pendingRequests.has(data.id)) {
        const { resolve } = pendingRequests.get(data.id);
        pendingRequests.delete(data.id);
        resolve(data);
      }
    } catch (err) {
      console.error('[Bridge Hub] Error parsing message from Figma:', err.message);
    }
  });

  ws.on('close', () => {
    if (activeWs === ws) activeWs = null;
    console.log('[Bridge Hub] Figma plugin disconnected');
  });
});

wss.on('error', (err) => {
  console.error('[Bridge Hub] WebSocket error:', err.message);
});

// Helper to send action to Figma
function sendToFigma(action, payload = {}, timeoutMs = 25000) {
  return new Promise((resolve) => {
    if (!activeWs || activeWs.readyState !== 1) {
      return resolve({
        success: false,
        error: "Figma Desktop chưa kết nối với MCP Bridge. Hãy mở file Figma -> Plugins -> Development -> 'EduBranch Live MCP Bridge' để kết nối!"
      });
    }

    const id = 'req_' + (++reqCounter) + '_' + Date.now();
    const timeout = setTimeout(() => {
      pendingRequests.delete(id);
      resolve({
        success: false,
        error: `Quá thời gian chờ phản hồi từ Figma (${timeoutMs}ms).`
      });
    }, timeoutMs);

    pendingRequests.set(id, {
      resolve: (data) => {
        clearTimeout(timeout);
        resolve(data);
      }
    });

    activeWs.send(JSON.stringify({ id, action, ...payload }));
  });
}

// 2. HTTP Server for MCP / CLI commands
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');

  if (req.method === 'GET' && req.url === '/status') {
    if (!activeWs || activeWs.readyState !== 1) {
      res.writeHead(200);
      return res.end(JSON.stringify({
        connected: false,
        message: "Chờ Figma kết nối..."
      }));
    }
    const result = await sendToFigma('get_status', {}, 5000);
    res.writeHead(200);
    return res.end(JSON.stringify({ connected: true, ...result }));
  }

  if (req.method === 'POST' && req.url === '/execute') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', async () => {
      try {
        const parsed = JSON.parse(body || '{}');
        const action = parsed.action || 'get_status';
        const result = await sendToFigma(action, parsed.payload || {}, 35000);
        res.writeHead(200);
        res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(400);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(HTTP_PORT, '127.0.0.1', () => {
  console.log(`[Bridge Hub] Ready! WebSocket on ws://127.0.0.1:${WS_PORT}, HTTP on http://127.0.0.1:${HTTP_PORT}`);
});
