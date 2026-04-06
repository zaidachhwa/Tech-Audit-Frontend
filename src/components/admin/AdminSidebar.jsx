import { NavLink, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { adminSidebarItems } from "./sidebarItems";

export default function AdminSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
          }`}
        style={{
          backgroundColor: "#1B2B4B",
          borderRight: "1px solid #ffffff",
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: "0px 20px 20px 0px",
        }}
      >
        <div className="flex flex-col h-full">
          {/* LOGO HEADER SECTION */}
          <div
            className="flex flex-col border-b"
            style={{ borderColor: "#243452" }}
          >
            {sidebarOpen ? (
              <div>
                {/* Independent White Div for Logo */}


                {/* Small bar for the Menu Toggle when open */}
                <div className="flex justify-end px-2 py-1">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 rounded-md transition hidden lg:block hover:bg-[#243452]"
                  >
                    <Menu size={18} style={{ color: "#94A3B8" }} />
                  </button>
                </div>
              </div>

            ) : (
              /* Collapsed State Logo/Menu Area */
              <div className="h-20 flex items-center justify-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="p-2 rounded-lg transition hidden lg:block"
                  style={{ backgroundColor: "transparent" }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#243452")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
                >
                  <Menu size={20} style={{ color: "#94A3B8" }} />
                </button>
              </div>
            )}
          </div>

          {/* NAVIGATION */}
          <nav className="flex-1 py-4 px-3 overflow-y-auto">
            <div className="space-y-1">
              {adminSidebarItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative"
                    style={{
                      backgroundColor: isActive ? "#2563EB" : "transparent",
                      color: isActive ? "#FFFFFF" : "#94A3B8",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "#243452";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <Icon
                      size={20}
                      style={{
                        color: isActive ? "#FFFFFF" : "#94A3B8",
                      }}
                    />

                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}

                    {isActive && (
                      <div
                        className="absolute right-0 w-1 h-full rounded-l-full"
                        style={{
                          backgroundColor: "#FFFFFF",
                        }}
                      />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          {/* LOGOUT */}
          <div
            className="p-4"
            style={{
              borderTop: "1px solid #243452",
            }}
          >
            <button
              onClick={logout}
              className="w-full cursor-pointer flex items-center gap-3 px-3 py-2.5 rounded-lg transition group"
              style={{
                color: "#94A3B8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#243452";
                e.currentTarget.style.color = "#EF4444";
                const svg = e.currentTarget.querySelector("svg");
                if (svg) svg.style.color = "#EF4444";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "#94A3B8";
                const svg = e.currentTarget.querySelector("svg");
                if (svg) svg.style.color = "#94A3B8";
              }}
            >
              <LogOut
                size={20}
                style={{
                  color: "#94A3B8",
                }}
              />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}