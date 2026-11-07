import { Outlet } from "react-router-dom";

export function PublicLayout() {
  return (
    <div className="min-h-screen w-full bg-white">
      <Outlet />
    </div>
  );
}
