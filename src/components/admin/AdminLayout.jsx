import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, RefreshCw } from "lucide-react";

import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN WRAPPER */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* TOP BAR - Mobile Only */}
        <header
          className="lg:hidden h-16 flex items-center justify-between px-6 sticky top-0 z-30"
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1.5px solid #E2E8F0",
          }}
        >
          <div className="flex items-center gap-4">
            {/* Mobile toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg transition"
              style={{
                backgroundColor: "transparent",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#E2E8F0";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <Menu size={20} style={{ color: "#94A3B8" }} />
            </button>
            <h1 className="font-semibold" style={{ color: "#0F3C8A", fontSize: "18px", fontWeight: "700" }}>
              Admin Panel
            </h1>
          </div>
        </header>

        {/* ⭐ ALL ADMIN PAGES RENDER HERE */}
        <main className="p-6" style={{ backgroundColor: "#F8FAFC" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}