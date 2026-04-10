import { useState } from "react";
import { LayoutDashboard, Layers, BarChart2, User, LogOut, Menu, Mail, BookOpen, ClipboardList, Megaphone } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";

const navLinks = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { name: "My Tasks", path: "/student/assignments", icon: ClipboardList },
  { name: "Announcements", path: "/student/announcements", icon: Megaphone },
  { name: "Projects", path: "/student/projects", icon: Layers },
  { name: "Reports", path: "/student/reports", icon: BarChart2 },
  { name: "Profile", path: "/student/profile", icon: User },
];

export default function StudentSidebar({ currentPath, onNavigate, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const auth = useAuth();

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
        style={{ position: "fixed", top: 16, left: 16, zIndex: 50, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: 8, cursor: "pointer", display: "none" }}
        className="mobile-menu-btn"
      >
        <Menu size={20} color="#1B2B4B" />
      </button>

      <aside style={{
        width: collapsed ? 64 : 256,
        minWidth: collapsed ? 64 : 256,
        height: "100vh",
        background: "#1B2B4B",
        display: "flex",
        flexDirection: "column",
        position: "sticky",
        top: 0,
        transition: "width 0.3s, min-width 0.3s",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
        zIndex: 40,
      }}
        className={`student-sidebar${mobileOpen ? " mobile-open" : ""}`}
      >
        {/* Header */}
        <div style={{ borderBottom: "1px solid #243452", flexShrink: 0 }}>
          {!collapsed ? (
            <div>

              {/* Menu toggle row */}
              <div style={{ display: "flex", justifyContent: "flex-end", padding: "4px 8px" }}>
                <button onClick={() => setCollapsed(!collapsed)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6 }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#243452")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                  <Menu size={18} color="#94A3B8" />
                </button>
              </div>
            </div>
          ) : (
            /* Collapsed — just the toggle button */
            <div style={{ height: 80, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <button onClick={() => setCollapsed(!collapsed)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 8, borderRadius: 8 }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#243452")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                <Menu size={20} color="#94A3B8" />
              </button>
            </div>
          )}
        </div>

        {/* User info */}
        {!collapsed && (
          <div style={{ padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#2563EB,#60A5FA)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {(user?.name || "S")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ color: "#E2E8F0", fontWeight: 600, fontSize: 13, margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {user?.name || "Student"}
                </p>
                <p style={{ color: "#64748B", fontSize: 11, margin: 0, display: "flex", alignItems: "center", gap: 3 }}>
                  <Mail size={10} /> {user?.email || ""}
                </p>
              </div>
            </div>
            {user?.batch_name && (
              <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px", display: "flex", alignItems: "center", gap: 5 }}>
                  <BookOpen size={11} color="#94A3B8" />
                  <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 500 }}>{user.batch_name}</span>
                </div>
                <div style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "5px 8px" }}>
                  <span style={{ color: "#94A3B8", fontSize: 11, fontWeight: 600 }}>#{user.batch_no}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Nav */}
        <nav style={{ flex: 1, padding: "14px 8px", overflowY: "auto" }}>
          {!collapsed && (
            <p style={{ color: "#475569", fontSize: 10, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "0 8px 8px", margin: 0 }}>Menu</p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {navLinks.map(({ name, path, icon: Icon }) => {
              const isActive = currentPath === path;
              return (
                <button key={path} onClick={() => handleNavigate(path)}
                  style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "9px" : "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: isActive ? "#2563EB" : "transparent", justifyContent: collapsed ? "center" : "flex-start", transition: "background 0.15s", width: "100%", fontFamily: "'DM Sans', sans-serif" }}
                  onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = "#243452"; }}
                  onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
                  <Icon size={18} color={isActive ? "#fff" : "#94A3B8"} style={{ flexShrink: 0 }} />
                  {!collapsed && <span style={{ color: isActive ? "#fff" : "#94A3B8", fontWeight: isActive ? 600 : 500, fontSize: 13 }}>{name}</span>}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", padding: "10px 8px", flexShrink: 0 }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, padding: collapsed ? "9px" : "9px 12px", borderRadius: 8, border: "none", cursor: "pointer", background: "transparent", width: "100%", justifyContent: collapsed ? "center" : "flex-start", fontFamily: "'DM Sans', sans-serif", transition: "background 0.15s" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(239,68,68,0.12)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
            <LogOut size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
            {!collapsed && <span style={{ color: "#94A3B8", fontWeight: 500, fontSize: 13 }}>Logout</span>}
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