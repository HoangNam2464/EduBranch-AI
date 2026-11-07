import { useState } from "react";

export function AdminLogsPage() {
  const [searchLog, setSearchLog] = useState("");

  const logs = [
    {
      time: "22/10/2026 09:45",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "UPDATE_AI_CONFIG",
      target: "AiSettings (AI-01)",
      detail: '{"provider": "gemini", "enabled": true}',
      ip: "127.0.0.1",
    },
    {
      time: "22/10/2026 09:30",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "APPROVE_LECTURER",
      target: "User (GV-03)",
      detail: '{"status": "ACTIVE"}',
      ip: "127.0.0.1",
    },
    {
      time: "22/10/2026 09:30",
      avatar: "NA",
      actor: "Nguyễn Minh Anh",
      actorId: "GV-01",
      action: "CREATE_CASE",
      target: "Case (CS-01)",
      detail: '{"mode": "BRANCHING"}',
      ip: "192.168.1.24",
    },
    {
      time: "22/10/2026 09:22",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "TRANSFER_COURSE",
      target: "Course (KH-02)",
      detail: '{"to": "GV-02"}',
      ip: "127.0.0.1",
    },
    {
      time: "22/10/2026 09:10",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "LOCK_USER",
      target: "User (SV-02)",
      detail: '{"status": "LOCKED"}',
      ip: "127.0.0.1",
    },
    {
      time: "22/10/2026 08:56",
      avatar: "LH",
      actor: "Lê Thu Hà",
      actorId: "GV-02",
      action: "PUBLISH_CASE",
      target: "Case (CS-02)",
      detail: '{"status": "PUBLISHED"}',
      ip: "192.168.1.32",
    },
    {
      time: "22/10/2026 08:40",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "EXPORT_EVALUATIONS",
      target: "Evaluation (ALL)",
      detail: '{"format": "csv", "count": 16}',
      ip: "127.0.0.1",
    },
    {
      time: "22/10/2026 08:15",
      avatar: "QT",
      actor: "Quản trị viên",
      actorId: "AD-01",
      action: "ADMIN_LOGIN",
      target: "User (AD-01)",
      detail: "—",
      ip: "127.0.0.1",
    },
  ];

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.actor.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.target.toLowerCase().includes(searchLog.toLowerCase()) ||
      l.ip.includes(searchLog)
  );

  return (
    <div className="space-y-6">
      {/* ── Top Area: 4 Metric Cards + Events By Actor Chart ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: 4 Metric Cards in 2x2 grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* Metric 1 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1E3A8A]">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Sự kiện được ghi nhận</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">8</p>
            </div>
          </div>

          {/* Metric 2 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Thao tác quản trị</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">6</p>
            </div>
          </div>

          {/* Metric 3 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Thao tác giảng viên</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">2</p>
            </div>
          </div>

          {/* Metric 4 */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-700">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
                <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
                <line x1="6" y1="6" x2="6.01" y2="6" />
                <line x1="6" y1="18" x2="6.01" y2="18" />
              </svg>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-500">Địa chỉ IP</p>
              <p className="text-2xl font-bold text-slate-900 mt-0.5">3</p>
            </div>
          </div>
        </div>

        {/* Right: Sự kiện theo người thực hiện */}
        <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-2xs flex flex-col justify-between">
          <h3 className="text-xs font-bold text-slate-900">Sự kiện theo người thực hiện</h3>

          <div className="mt-3 flex items-end justify-between gap-4">
            {/* Bar Chart Area */}
            <div className="flex-1 h-28 flex items-end justify-around border-b border-slate-100 pb-1">
              {/* Quản trị viên */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#1E3A8A]">6</span>
                <div className="w-12 bg-[#1E3A8A] h-20 rounded-t-sm"></div>
                <span className="text-[10px] text-slate-600 font-medium">Quản trị viên</span>
              </div>

              {/* Nguyễn Minh Anh */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#0284C7]">1</span>
                <div className="w-12 bg-[#0284C7] h-6 rounded-t-sm"></div>
                <span className="text-[10px] text-slate-600 font-medium truncate max-w-[80px]">
                  Nguyễn Minh Anh
                </span>
              </div>

              {/* Lê Thu Hà */}
              <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] font-bold text-[#38BDF8]">1</span>
                <div className="w-12 bg-[#38BDF8] h-6 rounded-t-sm"></div>
                <span className="text-[10px] text-slate-600 font-medium">Lê Thu Hà</span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="w-48 pl-3 border-l border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#1E3A8A]"></span>
                  <span className="text-slate-700 font-medium text-[11px]">Quản trị viên</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-[11px]">6 sự kiện</span>
                  <span className="text-[9px] text-slate-400 font-mono">AD-01</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#0284C7]"></span>
                  <span className="text-slate-700 font-medium text-[11px]">Nguyễn Minh Anh</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-[11px]">1 sự kiện</span>
                  <span className="text-[9px] text-slate-400 font-mono">GV-01</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-[#38BDF8]"></span>
                  <span className="text-slate-700 font-medium text-[11px]">Lê Thu Hà</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 text-[11px]">1 sự kiện</span>
                  <span className="text-[9px] text-slate-400 font-mono">GV-02</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Bottom Section: Nhật ký bất biến ── */}
      <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-xs font-bold text-slate-900">Nhật ký bất biến</h3>
            <p className="text-[11px] text-slate-400">
              Audit log bảo mật được lưu vết tự động và không thể chỉnh sửa
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 w-64 shadow-2xs">
            <input
              type="text"
              placeholder="Tìm trong nhật ký..."
              value={searchLog}
              onChange={(e) => setSearchLog(e.target.value)}
              className="w-full bg-transparent outline-none placeholder-slate-400 text-xs"
            />
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 text-[10px] uppercase tracking-wider">
                <th className="pb-2 font-semibold">Thời gian</th>
                <th className="pb-2 font-semibold">Người thực hiện</th>
                <th className="pb-2 font-semibold">Hành động</th>
                <th className="pb-2 font-semibold">Đối tượng tác động</th>
                <th className="pb-2 font-semibold">Chi tiết</th>
                <th className="pb-2 font-semibold text-right">Địa chỉ IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredLogs.map((l, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50">
                  {/* Thời gian */}
                  <td className="py-3 text-slate-500 font-mono text-[11px]">
                    {l.time}
                  </td>

                  {/* Người thực hiện */}
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-[#1E3A8A] text-xs font-bold">
                        {l.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 leading-tight">
                          {l.actor}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono leading-tight mt-0.5">
                          ID: {l.actorId}
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Hành động */}
                  <td className="py-3">
                    <span className="font-mono text-xs font-semibold text-[#1E3A8A] px-2 py-0.5 rounded-md bg-blue-50/70 border border-blue-100/60">
                      {l.action}
                    </span>
                  </td>

                  {/* Đối tượng tác động */}
                  <td className="py-3 text-slate-800 font-medium">
                    {l.target}
                  </td>

                  {/* Chi tiết */}
                  <td className="py-3">
                    <code className="text-[11px] font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-100 max-w-xs truncate inline-block">
                      {l.detail}
                    </code>
                  </td>

                  {/* Địa chỉ IP */}
                  <td className="py-3 text-right font-mono text-slate-500 text-[11px]">
                    {l.ip}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span>Hiển thị</span>
            <select className="border border-slate-200 rounded px-1.5 py-0.5 text-xs">
              <option>10</option>
              <option>25</option>
            </select>
            <span>trên 8 bản ghi</span>
          </div>
          <div className="flex items-center gap-1">
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed">
              ‹
            </button>
            <span className="px-2.5 py-1 rounded bg-[#1E3A8A] text-white font-bold text-xs">
              1
            </span>
            <button className="px-2 py-1 rounded border border-slate-200 text-slate-400 cursor-not-allowed">
              ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
