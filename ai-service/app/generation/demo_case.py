"""
EduBranch AI — Offline demo case builder.

Builds a small, valid branching case from the topic hint and retrieved material excerpts
when no LLM API key is configured. The output satisfies CaseGenerationOutput invariants
(reachable nodes, no cycles, at least one terminal path). All text is marked as demo content.
"""

from __future__ import annotations

import re
from typing import Any

DEMO_TAG = "[Demo offline]"


def _excerpts(chunks: list[str], n: int) -> list[str]:
    """Pick up to n short sentences from the retrieved chunks."""
    out: list[str] = []
    for chunk in chunks:
        for sent in re.split(r"(?<=[.!?])\s+", (chunk or "").strip()):
            sent = " ".join(sent.split())
            if 40 <= len(sent) <= 220 and sent not in out:
                out.append(sent)
            if len(out) >= n:
                return out
    return out


def build_demo_case(topic: str, chunks: list[str]) -> dict[str, Any]:
    topic = (topic or "Tình huống học tập").strip()
    ex = _excerpts(chunks, 4)
    ctx = lambda i: (f' Tài liệu môn học nêu: "{ex[i]}"' if i < len(ex) else "")

    nodes = [
        {  # 0 root
            "situation": f"{DEMO_TAG} Bạn phụ trách giải quyết vấn đề: {topic}. "
            f"Thời gian có hạn và các bên liên quan có kỳ vọng khác nhau.{ctx(0)}",
            "options": [
                {"text": "Thu thập thêm dữ liệu trước khi hành động",
                 "consequence": "Bạn có bức tranh đầy đủ hơn nhưng mất thêm thời gian; một số bên liên quan bắt đầu sốt ruột.",
                 "next_node_index": 1},
                {"text": "Hành động ngay theo phương án quen thuộc",
                 "consequence": "Bạn tạo được tiến độ sớm nhưng có rủi ro bỏ sót yếu tố quan trọng của bối cảnh mới.",
                 "next_node_index": 2},
            ],
        },
        {  # 1
            "situation": f"{DEMO_TAG} Dữ liệu mới cho thấy hai hướng đều có cơ sở và có điểm xung đột.{ctx(1)} "
            "Bạn cần chọn cách xử lý xung đột này.",
            "options": [
                {"text": "Tham vấn các bên liên quan để thống nhất tiêu chí",
                 "consequence": "Các bên hiểu rõ lý do quyết định hơn; quá trình kéo dài nhưng sự đồng thuận tăng.",
                 "next_node_index": 3},
                {"text": "Tự quyết dựa trên tiêu chí bạn cho là quan trọng nhất",
                 "consequence": "Quyết định nhanh và nhất quán, nhưng một số bên cảm thấy ý kiến của họ bị bỏ qua.",
                 "next_node_index": 4},
            ],
        },
        {  # 2
            "situation": f"{DEMO_TAG} Sau vài ngày, phương án quen thuộc bộc lộ một hạn chế chưa lường trước.{ctx(2)}",
            "options": [
                {"text": "Điều chỉnh phương án và công khai lý do điều chỉnh",
                 "consequence": "Bạn mất một phần tiến độ nhưng giữ được niềm tin nhờ minh bạch.",
                 "next_node_index": 3},
                {"text": "Giữ nguyên phương án và theo dõi thêm",
                 "consequence": "Tiến độ được giữ, nhưng hạn chế có thể lớn dần nếu không được xử lý.",
                 "next_node_index": 4},
            ],
        },
        {  # 3 terminal
            "situation": f"{DEMO_TAG} Kết thúc: quyết định được đưa ra với sự tham gia của nhiều góc nhìn.{ctx(3)} "
            "Hãy nhìn lại các giả định bạn đã dùng ở từng bước.",
            "options": [],
        },
        {  # 4 terminal
            "situation": f"{DEMO_TAG} Kết thúc: quyết định được đưa ra nhanh, với một số đánh đổi chưa được làm rõ. "
            "Hãy nhìn lại thông tin nào đã có thể thay đổi lựa chọn của bạn.",
            "options": [],
        },
    ]
    return {
        "title": f"{DEMO_TAG} {topic}"[:200],
        "description": f"{DEMO_TAG} Tình huống rẽ nhánh minh hoạ được dựng offline từ tài liệu môn học (chưa dùng mô hình AI thật).",
        "root_node_index": 0,
        "nodes": nodes,
    }
