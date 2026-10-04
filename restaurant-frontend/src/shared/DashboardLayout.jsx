import { useState } from "react";
import { Menu } from "lucide-react";
import SideBar from "./SideBar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = user.role || "customer";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar — always visible on md+, drawer on mobile */}
      <div className="hidden md:block">
        <SideBar role={role} />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div
            className="fixed inset-0 bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
          <SideBar role={role} onClose={() => setSidebarOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 md:ml-64 flex flex-col">
        {/* Top bar — mobile only */}
        <header className="md:hidden flex items-center gap-3 bg-white px-4 py-3 shadow-sm">
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-red-950" />
          </button>
          <span className="text-lg font-bold text-red-950">Liyu</span>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
