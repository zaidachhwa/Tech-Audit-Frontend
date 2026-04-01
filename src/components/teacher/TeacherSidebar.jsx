import { NavLink, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { teacherSidebarItems } from "./teacherSidebarItems";

export default function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen
            ? "w-64"
            : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* HEADER */}
          <div className="h-20 flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-white font-bold text-sm">T</span>
                </div>
                <span className="font-bold text-gray-900 text-lg tracking-tight whitespace-nowrap">
                  Teacher
                </span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition hidden lg:block ml-auto"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className="space-y-1">
              {teacherSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative ${
                      isActive
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={`shrink-0 ${isActive ? "text-emerald-600" : "text-gray-500"}`}
                    />
                    {sidebarOpen && (
                      <span className="font-medium text-sm whitespace-nowrap">
                        {item.name}
                      </span>
                    )}
                    {isActive && (
                      <div className="absolute right-0 top-1 bottom-1 w-1 bg-emerald-600 rounded-l-full" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* LOGOUT */}
          <div className="border-t border-gray-200 p-4 shrink-0">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition group cursor-pointer"
            >
              <LogOut
                size={20}
                className="shrink-0 text-gray-500 group-hover:text-red-600"
              />
              {sidebarOpen && (
                <span className="font-medium text-sm">Logout</span>
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}