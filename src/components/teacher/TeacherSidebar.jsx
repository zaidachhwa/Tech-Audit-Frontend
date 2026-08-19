import { NavLink, useLocation } from "react-router-dom";
import { LogOut, X, Download } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { teacherSidebarItems } from "./TeacherSidebarItems";
import { usePWAInstall } from "../../hooks/usePWAInstall";

export default function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();
  const { isInstallable, installPWA } = usePWAInstall();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          backgroundColor: "#FFFFFF",
          borderRight: "1.5px solid #F1F5F9",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: sidebarOpen ? "0 4px 20px rgba(15, 30, 54, 0.05)" : "none",
        }}
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 flex flex-col overflow-x-hidden ${sidebarOpen
          ? "translate-x-0 w-64"
          : "-translate-x-full w-64 lg:translate-x-0 lg:w-16"
          }`}
      >
        {/* LOGO & BRANDING SECTION */}
        {sidebarOpen ? (
          <div className="pt-2 pb-3 px-4 border-b border-[#F1F5F9] relative flex flex-col items-center shrink-0">
            <img src="/logo.png" alt="Nexcore logo" className="h-28 w-auto max-w-[170px] -mt-2 -mb-2 scale-90 object-contain" />
            
            <span
              style={{
                marginTop: 4,
                background: "linear-gradient(90deg, #047857, #059669)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "2px 8px",
                borderRadius: 99,
              }}
            >
              Teacher Panel
            </span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center border-b border-[#F1F5F9] cursor-pointer shrink-0" onClick={() => setSidebarOpen(true)}>
            <img src="/logo.png" alt="Nexcore logo" className="h-14 w-14 object-contain" />
          </div>
        )}

        {/* Teacher mini-profile */}
        {sidebarOpen && (
          <div className="p-4 border-b border-[#F1F5F9] bg-[#F8FAFC]">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #0F3C8A, #FF6B00)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                }}
              >
                {(user?.teacher?.name || user?.name || "T")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    color: "#1E293B",
                    fontWeight: 700,
                    fontSize: 13,
                    margin: 0,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.teacher?.name || user?.name || "Teacher"}
                </p>
                <p style={{ color: "#64748B", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.teacher?.email || user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
          {sidebarOpen && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
          )}
          <div className="space-y-1">
            {teacherSidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group font-semibold text-xs text-decoration-none"
                  style={{
                    backgroundColor: isActive ? "#EFF6FF" : "transparent",
                    color: isActive ? "#0F3C8A" : "#64748B",
                    borderLeft: isActive ? "4px solid #FF6B00" : "4px solid transparent",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                  }}
                >
                  <Icon
                    size={20}
                    className="shrink-0 transition-colors duration-200"
                    style={{ color: isActive ? "#FF6B00" : "#94A3B8" }}
                  />
                  {sidebarOpen && <span>{item.name}</span>}

                  {!sidebarOpen && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
                      {item.name}
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div className="p-4 border-t border-[#F1F5F9] shrink-0 flex flex-col gap-2">
          {isInstallable && (
            <button
              onClick={installPWA}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold text-xs cursor-pointer border-none bg-transparent"
            >
              <Download size={20} className="shrink-0" />
              {sidebarOpen && <span>Install App</span>}
            </button>
          )}
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 font-semibold text-xs cursor-pointer border-none bg-transparent"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}