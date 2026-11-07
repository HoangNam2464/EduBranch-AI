import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <Outlet />
    </div>
  );
}
