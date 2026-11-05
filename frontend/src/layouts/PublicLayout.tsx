import { Outlet } from "react-router-dom";

/** Public shell for login / register (Figma 00.3, 00.4). The pages render their own brand header. */
export function PublicLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
}
