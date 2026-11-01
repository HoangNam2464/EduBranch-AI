const http = require('http');

const cmd = process.argv[2] || 'status';
const arg = process.argv[3] || '';

function req(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const r = http.request({
      hostname: '127.0.0.1',
      port: 28212,
      path: path,
      method: method,
      headers: { 'Content-Type': 'application/json' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    r.on('error', (err) => {
      if (err.code === 'ECONNREFUSED') {
        resolve({
          success: false,
          error: "Bridge Hub chưa chạy. Vui lòng kiểm tra lại dịch vụ bridge-hub.js!"
        });
      } else {
        reject(err);
      }
    });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

async function main() {
  if (cmd === 'status') {
    const res = await req('/status');
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === 'polish') {
    console.log('Sending polish_page1 command to Figma via MCP Bridge...');
    const res = await req('/execute', 'POST', { action: 'polish_page1' });
    console.log(JSON.stringify(res, null, 2));
  } else if (cmd === 'exec') {
    console.log('Sending custom code execution to Figma...');
    const res = await req('/execute', 'POST', { action: 'execute_code', payload: { code: arg } });
    console.log(JSON.stringify(res, null, 2));
  } else {
    console.log('Usage: node cli.js [status|polish|exec "code"]');
  }
}

main();
