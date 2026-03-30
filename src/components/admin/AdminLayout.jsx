// AdminLayout.jsx
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, RefreshCw } from "lucide-react";

import AdminSidebar from "./AdminSidebar";

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-white flex">
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
        <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            {/* Mobile toggle */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Admin Panel</h1>
          </div>
        </header>

        {/* ⭐ ALL ADMIN PAGES RENDER HERE */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
