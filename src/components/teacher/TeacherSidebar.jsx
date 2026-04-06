import { NavLink, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { teacherSidebarItems } from "./TeacherSidebarItems";

export default function TeacherSidebar({ sidebarOpen, setSidebarOpen }) {
  const location = useLocation();
  const { logout, user } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        style={{
          background: "#1B2B4B",
          fontFamily: "'DM Sans', sans-serif",
        }}
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-40 flex flex-col ${sidebarOpen
          ? "w-64"
          : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
          }`}
      >
        {/* HEADER */}
        <div
          className="flex flex-col border-b shrink-0"
          style={{ borderColor: "#243452" }}
        >
          {sidebarOpen ? (
            <div>
              
              {/* Menu toggle row */}
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
            /* Collapsed — just the toggle button */
            <div className="h-20 flex items-center justify-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg transition hidden lg:block"
                style={{ backgroundColor: "transparent" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#243452")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <Menu size={20} style={{ color: "#94A3B8" }} />
              </button>
            </div>
          )}
        </div>

        {/* Teacher mini-profile */}
        {sidebarOpen && (
          <div
            style={{
              padding: "14px 16px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg,#2563EB,#60A5FA)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#fff",
                }}
              >
                {(user?.teacher?.name || user?.name || "T")[0].toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    color: "#E2E8F0",
                    fontWeight: 600,
                    fontSize: 13,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.teacher?.name || user?.name || "Teacher"}
                </p>
                <p style={{ color: "#64748B", fontSize: 11 }}>
                  {user?.teacher?.email || user?.email || ""}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* NAVIGATION */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto">
          {sidebarOpen && (
            <p
              style={{
                color: "#475569",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "0 12px 8px",
              }}
            >
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
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: sidebarOpen ? "9px 12px" : "9px",
                    borderRadius: 8,
                    transition: "all 0.15s",
                    justifyContent: sidebarOpen ? "flex-start" : "center",
                    background: isActive ? "#2563EB" : "transparent",
                    position: "relative",
                    textDecoration: "none",
                  }}
                  className={!isActive ? "hover:bg-white/8" : ""}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "#243452";
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent";
                  }}
                >
                  <Icon
                    size={18}
                    color={isActive ? "#fff" : "#94A3B8"}
                    style={{ flexShrink: 0 }}
                  />
                  {sidebarOpen && (
                    <span
                      style={{
                        color: isActive ? "#fff" : "#94A3B8",
                        fontWeight: isActive ? 600 : 500,
                        fontSize: 13,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.name}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* LOGOUT */}
        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.08)",
            padding: "12px 8px",
            flexShrink: 0,
          }}
        >
          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: sidebarOpen ? "9px 12px" : "9px",
              borderRadius: 8,
              width: "100%",
              transition: "all 0.15s",
              justifyContent: sidebarOpen ? "flex-start" : "center",
              cursor: "pointer",
              background: "transparent",
              border: "none",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(239,68,68,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            <LogOut size={18} color="#94A3B8" style={{ flexShrink: 0 }} />
            {sidebarOpen && (
              <span
                style={{ color: "#94A3B8", fontWeight: 500, fontSize: 13 }}
              >
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}