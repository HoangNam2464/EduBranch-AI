// EduBranch Live MCP Bridge — Figma Plugin Core
// Listens to WebSocket events routed through ui.html and executes Figma Plugin API commands

figma.showUI(__html__, { width: 300, height: 160, title: "EduBranch MCP Bridge" });

function hexToRgb(hex) {
  hex = hex.replace('#', '');
  return {
    r: parseInt(hex.substring(0, 2), 16) / 255,
    g: parseInt(hex.substring(2, 4), 16) / 255,
    b: parseInt(hex.substring(4, 6), 16) / 255
  };
}

function rgbToHex(c) {
  const r = Math.round(c.r * 255).toString(16).padStart(2, '0');
  const g = Math.round(c.g * 255).toString(16).padStart(2, '0');
  const b = Math.round(c.b * 255).toString(16).padStart(2, '0');
  return ('#' + r + g + b).toLowerCase();
}

const COLOR_MAP = {
  '#f8fafc': '#f9fafb',
  '#f7f9fc': '#f9fafb',
  '#f1f5f9': '#f3f4f6',
  '#edf6ff': '#eff6ff',
  '#0f172a': '#111827',
  '#020617': '#111827',
  '#17243b': '#111827',
  '#64748b': '#4b5563',
  '#475569': '#4b5563',
  '#94a3b8': '#9ca3af',
  '#cbd5e1': '#e5e7eb',
  '#e2e8f0': '#e5e7eb',
  '#1674c9': '#2563eb',
  '#1d4ed8': '#1d4ed8',
  '#2563eb': '#2563eb'
};

async function executePolishPage1() {
  if (figma.editorType === 'dev') {
    return {
      success: false,
      error: "⚠️ Figma đang ở Dev Mode (chế độ chỉ đọc). Vui lòng nhấn 'Shift + D' trên bàn phím để chuyển sang Design Mode rồi thử lại!"
    };
  }

  try {
    await figma.loadFontAsync({ family: "Inter", style: "Regular" });
    await figma.loadFontAsync({ family: "Inter", style: "Medium" });
    await figma.loadFontAsync({ family: "Inter", style: "SemiBold" });
    await figma.loadFontAsync({ family: "Inter", style: "Bold" });
  } catch (e) {
    console.warn("Could not preload all Inter styles:", e);
  }

  let targetPage = figma.root.children.find(p => p.name === "Page 1");
  if (!targetPage) targetPage = figma.currentPage;

  let updatedFills = 0;
  let updatedStrokes = 0;
  let updatedFonts = 0;
  let updatedRadius = 0;
  let framesProcessed = 0;

  function polishNode(node) {
    if (node.fills && Array.isArray(node.fills)) {
      let fillsChanged = false;
      const newFills = node.fills.map(fill => {
        if (fill.type === 'SOLID' && fill.color) {
          const hex = rgbToHex(fill.color);
          if (COLOR_MAP[hex]) {
            fillsChanged = true;
            updatedFills++;
            return Object.assign({}, fill, { color: hexToRgb(COLOR_MAP[hex]) });
          }
        }
        return fill;
      });
      if (fillsChanged) node.fills = newFills;
    }

    if (node.strokes && Array.isArray(node.strokes)) {
      let strokesChanged = false;
      const newStrokes = node.strokes.map(stroke => {
        if (stroke.type === 'SOLID' && stroke.color) {
          const hex = rgbToHex(stroke.color);
          if (COLOR_MAP[hex]) {
            strokesChanged = true;
            updatedStrokes++;
            return Object.assign({}, stroke, { color: hexToRgb(COLOR_MAP[hex]) });
          }
        }
        return stroke;
      });
      if (strokesChanged) node.strokes = newStrokes;
    }

    if (typeof node.cornerRadius === 'number' && node.cornerRadius > 0 && node.cornerRadius < 999) {
      if (node.cornerRadius === 4 || node.cornerRadius === 5 || node.cornerRadius === 7) {
        node.cornerRadius = 6;
        updatedRadius++;
      } else if (node.cornerRadius === 9 || node.cornerRadius === 10) {
        node.cornerRadius = 8;
        updatedRadius++;
      }
    }

    if (node.type === 'TEXT') {
      try {
        if (node.fontName && typeof node.fontName === 'object') {
          const style = node.fontName.style;
          if (style === 'ExtraBold' || style === 'Black') {
            node.fontName = { family: node.fontName.family || 'Inter', style: 'SemiBold' };
            updatedFonts++;
          } else if (style === 'Bold' && (node.fontSize <= 14 || node.name.toLowerCase().includes('nút') || node.name.toLowerCase().includes('nhãn'))) {
            node.fontName = { family: node.fontName.family || 'Inter', style: 'Medium' };
            updatedFonts++;
          }
        }
      } catch (fontErr) {}
    }

    if (node.children) {
      for (const child of node.children) polishNode(child);
    }
  }

  for (const child of targetPage.children) {
    if (child.type === 'FRAME' || child.type === 'SECTION') {
      framesProcessed++;
      polishNode(child);
    }
  }

  // Create Frame 43: Sinh viên · AI Challenge Support (Vòng 1 & 2) if missing
  let frame43Created = false;
  if (!targetPage.children.find(c => c.name.includes("AI Challenge Support"))) {
    const f43 = figma.createFrame();
    f43.name = "Sinh viên · AI Challenge Support (Vòng 1 & 2)";
    f43.resize(1440, 1024);
    f43.fills = [{ type: 'SOLID', color: hexToRgb('f9fafb') }];
    f43.layoutMode = 'VERTICAL';
    f43.itemSpacing = 24;
    f43.x = 1500 * (targetPage.children.length % 6);
    f43.y = 1100 * Math.floor(targetPage.children.length / 6);

    // Header
    const hdr = figma.createFrame();
    hdr.name = "Thanh điều hướng đỉnh";
    hdr.resize(1440, 56);
    hdr.layoutMode = 'HORIZONTAL';
    hdr.primaryAxisAlignItems = 'SPACE_BETWEEN';
    hdr.counterAxisAlignItems = 'CENTER';
    hdr.paddingLeft = 24;
    hdr.paddingRight = 24;
    hdr.fills = [{ type: 'SOLID', color: hexToRgb('ffffff') }];
    hdr.strokes = [{ type: 'SOLID', color: hexToRgb('e5e7eb') }];
    hdr.strokeWeight = 1;
    hdr.layoutAlign = 'STRETCH';

    const brand = figma.createText();
    brand.characters = "EduBranch AI  /  BUS301 · Chi nhánh cà phê nhượng quyền";
    brand.fontName = { family: 'Inter', style: 'SemiBold' };
    brand.fontSize = 15;
    brand.fills = [{ type: 'SOLID', color: hexToRgb('111827') }];
    hdr.appendChild(brand);

    const user = figma.createText();
    user.characters = "Sinh viên: Alex Morgan (alex.morgan@univ.edu)";
    user.fontName = { family: 'Inter', style: 'Medium' };
    user.fontSize = 13;
    user.fills = [{ type: 'SOLID', color: hexToRgb('4b5563') }];
    hdr.appendChild(user);
    f43.appendChild(hdr);

    // Column
    const col = figma.createFrame();
    col.name = "Cột nội dung chính (768px)";
    col.resize(768, 700);
    col.layoutMode = 'VERTICAL';
    col.itemSpacing = 16;
    col.layoutAlign = 'CENTER';
    col.fills = [];

    const back = figma.createText();
    back.characters = "← Quay lại Journey Review";
    back.fontName = { family: 'Inter', style: 'Medium' };
    back.fontSize = 14;
    back.fills = [{ type: 'SOLID', color: hexToRgb('2563eb') }];
    col.appendChild(back);

    const title = figma.createText();
    title.characters = "AI Reasoning & Challenge Support  [Vòng 1 / 2 - Tối đa 2 vòng]";
    title.fontName = { family: 'Inter', style: 'SemiBold' };
    title.fontSize = 18;
    title.fills = [{ type: 'SOLID', color: hexToRgb('111827') }];
    col.appendChild(title);

    const sub = figma.createText();
    sub.characters = "Câu hỏi phản biện Socratic giúp đào sâu các giả định và đánh đổi logic. AI không chấm điểm.";
    sub.fontName = { family: 'Inter', style: 'Regular' };
    sub.fontSize = 14;
    sub.fills = [{ type: 'SOLID', color: hexToRgb('4b5563') }];
    col.appendChild(sub);

    // Question card
    const card = figma.createFrame();
    card.name = "Thẻ câu hỏi phản biện Socratic";
    card.layoutMode = 'VERTICAL';
    card.itemSpacing = 8;
    card.paddingLeft = 20;
    card.paddingRight = 20;
    card.paddingTop = 16;
    card.paddingBottom = 16;
    card.cornerRadius = 8;
    card.fills = [{ type: 'SOLID', color: hexToRgb('ffffff') }];
    card.strokes = [{ type: 'SOLID', color: hexToRgb('e5e7eb') }];
    card.strokeWeight = 1;
    card.layoutAlign = 'STRETCH';

    const cardTitle = figma.createText();
    cardTitle.characters = "CÂU HỎI PHẢN BIỆN · VÒNG 1 (AI GENERATED)";
    cardTitle.fontName = { family: 'Inter', style: 'SemiBold' };
    cardTitle.fontSize = 12;
    cardTitle.fills = [{ type: 'SOLID', color: hexToRgb('2563eb') }];
    card.appendChild(cardTitle);

    const cardBody = figma.createText();
    cardBody.characters = "Nếu bên chuyển nhượng kiên quyết từ chối gia hạn thêm thời gian thẩm định, những căn cứ pháp lý hoặc dữ liệu định giá tối thiểu nào sẽ đủ để ban giám đốc ra quyết định ngay trước thời hạn?";
    cardBody.fontName = { family: 'Inter', style: 'Regular' };
    cardBody.fontSize = 14;
    cardBody.fills = [{ type: 'SOLID', color: hexToRgb('111827') }];
    card.appendChild(cardBody);
    col.appendChild(card);

    f43.appendChild(col);
    targetPage.appendChild(f43);
    frame43Created = true;
  }

  const resultMsg = `Đã tinh chỉnh ${framesProcessed} frame trên Page 1: Đổi ${updatedFills} màu nền/chữ, ${updatedStrokes} viền, ${updatedFonts} font weight. Khởi tạo thêm: ${frame43Created ? 'Có (Frame 43)' : 'Đã có'}.`;
  figma.notify("✅ MCP Bridge: " + resultMsg, { timeout: 5000 });

  return {
    success: true,
    message: resultMsg,
    stats: {
      framesProcessed,
      updatedFills,
      updatedStrokes,
      updatedFonts,
      updatedRadius,
      frame43Created
    }
  };
}

figma.ui.onmessage = async (msg) => {
  const { id, action, code } = msg;

  if (action === 'get_status') {
    figma.ui.postMessage({
      id,
      success: true,
      result: {
        editorType: figma.editorType,
        documentName: figma.root.name,
        currentPage: figma.currentPage.name,
        childrenCount: figma.currentPage.children.length
      }
    });
    return;
  }

  if (action === 'polish_page1') {
    const res = await executePolishPage1();
    figma.ui.postMessage({ id, success: res.success, result: res });
    return;
  }

  if (action === 'execute_code') {
    if (figma.editorType === 'dev') {
      figma.ui.postMessage({
        id,
        success: false,
        error: "Figma đang ở Dev Mode. Vui lòng bấm Shift + D để chuyển sang Design Mode."
      });
      return;
    }
    try {
      const fn = new Function('figma', code);
      const output = await fn(figma);
      figma.ui.postMessage({ id, success: true, result: output });
    } catch (err) {
      figma.ui.postMessage({ id, success: false, error: err.message });
    }
    return;
  }

  figma.ui.postMessage({ id, success: false, error: "Hành động không xác định: " + action });
};
