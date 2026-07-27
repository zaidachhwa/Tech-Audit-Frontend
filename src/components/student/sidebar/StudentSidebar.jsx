import { useState } from "react";
import { LayoutDashboard, Layers, BarChart2, User, LogOut, Menu, Mail, BookOpen, ClipboardList, Megaphone, CalendarCheck, X, Download } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { usePWAInstall } from "../../../hooks/usePWAInstall";

const navLinks = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Homework", path: "/student/assignments", icon: ClipboardList },
  { name: "Lecture Scheduler", path: "/student/lecture-scheduler", icon: CalendarCheck },
  { name: "Announcements", path: "/student/announcements", icon: Megaphone },
  { name: "Projects", path: "/student/projects", icon: Layers },
  { name: "Reports", path: "/student/reports", icon: BarChart2 },
  { name: "Profile", path: "/student/profile", icon: User },
];

export default function StudentSidebar({ currentPath, onNavigate, user, collapsed: collapsedProp, onCollapsedChange }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsedInternal, setCollapsedInternal] = useState(false);
  const auth = useAuth();
  const { isInstallable, installPWA } = usePWAInstall();

  // Use controlled prop if provided, otherwise internal state
  const collapsed = collapsedProp !== undefined ? collapsedProp : collapsedInternal;
  const setCollapsed = (val) => {
    setCollapsedInternal(val);
    onCollapsedChange?.(val);
  };

  const handleNavigate = (path) => { onNavigate(path); setMobileOpen(false); };

  const handleLogout = () => {
    auth?.logout?.();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onNavigate("/student/login");
  };

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 30 }} onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile toggle button */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        style={{ position: "fixed", top: 12, left: 12, zIndex: 50, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: 8, cursor: "pointer", display: "none" }}
        className="mobile-menu-btn"
      >
        <Menu size={18} color="#0F3C8A" />
      </button>

      <aside
        style={{
          width: collapsed ? 64 : 256,
          minWidth: collapsed ? 64 : 256,
          height: "100vh",
          backgroundColor: "#FFFFFF",
          borderRight: "1.5px solid #F1F5F9",
          display: "flex",
          flexDirection: "column",
          position: "fixed",
          top: 0,
          left: 0,
          transition: "width 0.3s, min-width 0.3s",
          overflow: "hidden",
          fontFamily: "'DM Sans', sans-serif",
          zIndex: 40,
          boxShadow: collapsed ? "none" : "0 4px 20px rgba(15, 30, 54, 0.05)",
        }}
        className={`student-sidebar${mobileOpen ? " mobile-open" : ""}`}
      >
        {/* LOGO & BRANDING SECTION */}
        {!collapsed ? (
          <div className="p-5 border-b border-[#F1F5F9] relative flex flex-col items-center shrink-0">
            <img src="/logo.png" alt="Nexcore logo" className="h-20 w-20 object-cover mb-3" />
            <h2 className="text-center font-extrabold text-xs tracking-tight text-[#0F3C8A] px-2 leading-snug uppercase">
              Nexcore Institute of Technology
            </h2>
            <span
              style={{
                marginTop: 6,
                background: "linear-gradient(90deg, #7C3AED, #9333EA)",
                color: "#fff",
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              Student Panel
            </span>
            <button
              onClick={() => setCollapsed(true)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition hidden lg:block"
            >
              <Menu size={16} />
            </button>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition lg:hidden"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center border-b border-[#F1F5F9] cursor-pointer shrink-0" onClick={() => setCollapsed(false)}>
            <img src="/logo.png" alt="Nexcore logo" className="h-10 w-10 object-contain hover:scale-105 transition duration-200" />
          </div>
        )}

        {/* User info */}
        {!collapsed && (
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
                  fontSize: 14,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {(user?.name || "S")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "#1E293B", fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Student"}
                </p>
                <p style={{ color: "#64748B", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.email || ""}
                </p>
              </div>
            </div>
            {user?.batch_name && (
              <div className="flex gap-2 mt-3">
                <div className="flex-1 bg-white border border-slate-100 rounded-lg py-1 px-2 flex items-center gap-1.5 justify-center">
                  <BookOpen size={11} color="#94A3B8" />
                  <span className="text-slate-500 text-[10px] font-bold">{user.batch_name}</span>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg py-1 px-2 flex items-center justify-center">
                  <span className="text-slate-500 text-[10px] font-bold">#{user.batch_no}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <nav style={{ flex: 1, padding: "14px 8px", overflowY: "auto" }}>
          {!collapsed && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Menu</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navLinks.map(({ name, path, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <button
                  key={path}
                  onClick={() => handleNavigate(path)}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group font-semibold text-xs border-none cursor-pointer"
                  style={{
                    backgroundColor: isActive ? "#EFF6FF" : "transparent",
                    color: isActive ? "#0F3C8A" : "#64748B",
                    borderLeft: isActive ? "4px solid #FF6B00" : "4px solid transparent",
                    justifyContent: collapsed ? "center" : "flex-start",
                    width: "100%",
                    fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  <Icon size={20} className="shrink-0 transition-colors duration-200" style={{ color: isActive ? "#FF6B00" : "#94A3B8" }} />
                  {!collapsed && <span>{name}</span>}

                  {collapsed && (
                    <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
                      {name}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[#F1F5F9] shrink-0 flex flex-col gap-2">
          {isInstallable && (
            <button
              onClick={installPWA}
              className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-indigo-600 hover:bg-indigo-50 transition-all duration-200 font-semibold text-xs cursor-pointer border-none bg-transparent"
              style={{
                justifyContent: collapsed ? "center" : "flex-start",
                fontFamily: "'DM Sans', sans-serif",
              }}
            >
              <Download size={20} className="shrink-0" />
              {!collapsed && <span>Install App</span>}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 font-semibold text-xs cursor-pointer border-none bg-transparent"
            style={{
              justifyContent: collapsed ? "center" : "flex-start",
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            <LogOut size={20} className="shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      <style>{`
        @media (max-width: 768px) {
          .student-sidebar { position: fixed !important; left: -256px !important; }
          .student-sidebar.mobile-open { left: 0 !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </>
  );
}