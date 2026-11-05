"""
EduBranch-AI — demo data seed for local development and the midterm demo.

Creates, through the public API (so every business rule still applies):
  - one lecturer and one student account (emails and password from backend/.env:
    DEV_LOGIN_LECTURER_EMAIL, DEV_LOGIN_STUDENT_EMAIL, DEMO_PASSWORD),
  - one course with one generated DOCX teaching material,
  - one generated Branching Study case, moved DRAFT -> REVIEWED -> APPROVED -> PUBLISHED.
Idempotent: existing accounts are reused and a course with the same code is not duplicated.
Never prints the password.

Usage (backend, AI service and infrastructure running):
    ai-service/.venv/Scripts/python scripts/seed-demo.py            # Windows
    ai-service/.venv/bin/python scripts/seed-demo.py                # macOS/Linux
Requires python-docx (already in ai-service requirements).
"""

from __future__ import annotations

import io
import json
import os
import sys
import urllib.error
import urllib.request
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
BASE = os.environ.get("SEED_API_BASE", "http://localhost:8080/api/v1")
COURSE_CODE = "DEMO-PM101"


def load_env(path: Path) -> dict[str, str]:
    env: dict[str, str] = {}
    if path.exists():
        for line in path.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, v = line.split("=", 1)
                env[k.strip()] = v.strip()
    return env


def call(method: str, path: str, token: str | None = None, body=None, raw: bytes | None = None, ctype: str | None = None):
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(BASE + path, data=data, method=method)
    if data is not None:
        req.add_header("Content-Type", ctype or "application/json")
    if token:
        req.add_header("Authorization", f"Bearer {token}")
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            payload = json.loads(r.read() or b"null")
            return r.status, (payload.get("data", payload) if isinstance(payload, dict) else payload)
    except urllib.error.HTTPError as e:
        return e.code, (e.read() or b"")[:300].decode("utf-8", "replace")


def ensure_account(email: str, password: str, full_name: str, role: str) -> str:
    status, _ = call("POST", "/auth/register", body={"email": email, "password": password, "fullName": full_name, "role": role})
    if status not in (201, 409):
        sys.exit(f"register {role} failed: HTTP {status}")
    status, data = call("POST", "/auth/login", body={"email": email, "password": password})
    if status != 200:
        sys.exit(f"login {role} failed: HTTP {status} (does DEMO_PASSWORD match the existing account?)")
    return data["accessToken"]


def demo_docx() -> bytes:
    import docx  # python-docx

    d = docx.Document()
    d.add_heading("Quản lý xung đột trong nhóm dự án phần mềm", 1)
    for p in [
        "Xung đột trong nhóm dự án phần mềm thường xuất hiện khi các thành viên có mục tiêu, ưu tiên hoặc cách làm việc khác nhau.",
        "Trưởng nhóm cần lắng nghe đầy đủ các bên trước khi đưa ra quyết định, để tránh thiên lệch và giữ được niềm tin của nhóm.",
        "Có năm chiến lược xử lý xung đột phổ biến: né tránh, nhượng bộ, cạnh tranh, thỏa hiệp và hợp tác.",
        "Chiến lược hợp tác tốn nhiều thời gian hơn nhưng thường tạo ra giải pháp bền vững và tăng cam kết của các thành viên.",
        "Khi thời hạn bàn giao đến gần, thỏa hiệp có thể giúp nhóm tiến lên, nhưng các đánh đổi đã chấp nhận cần được ghi nhận rõ ràng.",
        "Việc ghi lại lý do của từng quyết định giúp nhóm rút kinh nghiệm trong buổi retrospective cuối sprint.",
    ]:
        d.add_paragraph(p)
    buf = io.BytesIO()
    d.save(buf)
    return buf.getvalue()


def multipart(field: str, filename: str, content: bytes, mime: str) -> tuple[bytes, str]:
    boundary = "----seed" + uuid.uuid4().hex
    head = (
        f"--{boundary}\r\nContent-Disposition: form-data; name=\"{field}\"; filename=\"{filename}\"\r\n"
        f"Content-Type: {mime}\r\n\r\n"
    ).encode()
    return head + content + f"\r\n--{boundary}--\r\n".encode(), f"multipart/form-data; boundary={boundary}"


def main() -> None:
    env = load_env(ROOT / "backend" / ".env")
    lect = env.get("DEV_LOGIN_LECTURER_EMAIL") or os.environ.get("DEV_LOGIN_LECTURER_EMAIL")
    stud = env.get("DEV_LOGIN_STUDENT_EMAIL") or os.environ.get("DEV_LOGIN_STUDENT_EMAIL")
    password = env.get("DEMO_PASSWORD") or os.environ.get("DEMO_PASSWORD")
    if not (lect and stud and password):
        sys.exit("Set DEV_LOGIN_LECTURER_EMAIL, DEV_LOGIN_STUDENT_EMAIL and DEMO_PASSWORD in backend/.env first.")

    lt = ensure_account(lect, password, "Giảng viên Demo", "LECTURER")
    ensure_account(stud, password, "Sinh viên Demo", "STUDENT")
    print(f"accounts ready: {lect} (LECTURER), {stud} (STUDENT)")

    status, courses = call("GET", "/courses", lt)
    course = next((c for c in (courses or []) if c.get("course_code") == COURSE_CODE), None) if status == 200 else None
    if course is None:
        status, course = call(
            "POST", "/courses", lt,
            {"name": "Quản lý dự án phần mềm (Demo)", "description": "Khoá học mẫu cho buổi review giữa kỳ.", "courseCode": COURSE_CODE},
        )
        if status != 201:
            sys.exit(f"create course failed: HTTP {status}")
    cid = course["id"]
    print(f"course: {course['name']} ({cid})")

    status, mats = call("GET", f"/courses/{cid}/materials", lt)
    mat = next((m for m in (mats or []) if m.get("processing_status") == "COMPLETED"), None)
    if mat is None:
        raw, ct = multipart("file", "quan-ly-xung-dot.docx", demo_docx(),
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document")
        status, mat = call("POST", f"/courses/{cid}/materials", lt, raw=raw, ctype=ct)
        if status != 201:
            sys.exit(f"upload material failed: HTTP {status}")
    print(f"material: {mat['original_filename']} status={mat['processing_status']} chunks={mat.get('chunk_count')}")

    status, cases = call("GET", f"/courses/{cid}/cases", lt)
    case = next((c for c in (cases or []) if c.get("status") == "PUBLISHED"), None) if status == 200 else None
    if case is None:
        status, case = call("POST", "/cases/generate", lt,
                            {"courseId": cid, "materialIds": [mat["id"]], "topicHint": "Xử lý xung đột trong nhóm dự án phần mềm", "numNodes": 5})
        if status != 201:
            sys.exit(f"generate case failed: HTTP {status} {case}")
        for st in ("REVIEWED", "APPROVED", "PUBLISHED"):
            s2, _ = call("PATCH", f"/cases/{case['id']}/status", lt, {"status": st})
            if s2 != 200:
                sys.exit(f"status -> {st} failed: HTTP {s2}")
    print(f"published case: {case['title']}")
    print(f"student link: http://localhost:5173/student/cases/{case['id']}/branching-play")


if __name__ == "__main__":
    main()
