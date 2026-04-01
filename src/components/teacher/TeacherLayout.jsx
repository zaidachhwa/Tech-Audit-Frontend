import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main content — shifts right to make room for sidebar */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Mobile topbar — only shows hamburger on small screens */}
        <div className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
          <span className="ml-3 font-semibold text-gray-900">
            Teacher Portal
          </span>
        </div>

        {/* Page content rendered here */}
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}