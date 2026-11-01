#!/usr/bin/env node
const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const http = require('http');

function callHub(path, method = 'GET', body = null) {
  return new Promise((resolve) => {
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
          resolve({ error: data });
        }
      });
    });
    r.on('error', (err) => {
      resolve({
        success: false,
        error: "Bridge Hub chưa hoạt động hoặc Figma chưa kết nối. Lỗi: " + err.message
      });
    });
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

const server = new McpServer({
  name: 'edubranch-figma-bridge',
  version: '1.0.0'
});

server.tool(
  'figma_get_status',
  'Kiểm tra trạng thái kết nối của Figma Desktop, document hiện tại, và chế độ Design/Dev Mode',
  {},
  async () => {
    const res = await callHub('/status');
    return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
  }
);

server.tool(
  'figma_polish_page1',
  'Tự động tinh chỉnh 42 frame trên Page 1 và tạo 2 frame nghiệp vụ chuẩn học thuật',
  {},
  async () => {
    const res = await callHub('/execute', 'POST', { action: 'polish_page1' });
    return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
  }
);

server.tool(
  'figma_execute_code',
  'Thực thi JavaScript trên Figma Plugin API trong file hiện tại',
  { code: z.string().describe('Mã JavaScript chạy trong Figma Desktop') },
  async ({ code }) => {
    const res = await callHub('/execute', 'POST', { action: 'execute_code', payload: { code } });
    return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] };
  }
);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('[Figma MCP Bridge] Server ready on stdio.');
}

main().catch(err => {
  console.error('[Figma MCP Bridge] Fatal error:', err);
  process.exit(1);
});
