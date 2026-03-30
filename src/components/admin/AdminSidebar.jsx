import { NavLink, useLocation } from "react-router-dom";
import { Menu, GraduationCap, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminSidebarItems } from "./sidebarItems";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 z-40 ${
        sidebarOpen ? "w-64 " : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* HEADER */}
        <div className="h-40 flex items-center justify-between px-4 border-b border-gray-400">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <img src="/logo.png" alt="Logo" className="w-auto h-40 object-contain" />
              <span className="font-bold text-gray-900 text-lg tracking-tight"></span>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition hidden lg:block"
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <div className="space-y-1">
            {adminSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                    isActive
                      ? "bg-indigo-50 text-indigo-600"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon
                    size={20}
                    className={isActive ? "text-indigo-600" : "text-gray-500"}
                  />

                  {sidebarOpen && (
                    <span className="font-medium text-sm">{item.name}</span>
                  )}

                  {isActive && (
                    <div className="absolute right-0 w-1 h-full bg-indigo-600 rounded-l-full" />
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="border-t border-gray-200 p-4">
          <button
            onClick={logout}
            className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition group"
          >
            <LogOut
              size={20}
              className="text-gray-500 group-hover:text-red-600"
            />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}
