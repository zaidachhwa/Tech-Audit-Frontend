import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, LogOut } from "lucide-react";
import StudentSidebar from "./sidebar/StudentSidebar";
import { useAuth } from "../../context/AuthContext";

const PAGE_LABELS = {
  "/student/dashboard": "Dashboard",
  "/student/assignments": "My Homework",
  "/student/lecture-scheduler": "Lecture Schedule",
  "/student/announcements": "Announcements",
  "/student/projects": "My Projects",
  "/student/reports": "My Reports",
  "/student/profile": "My Profile",
};

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const pageLabel = Object.entries(PAGE_LABELS).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || "Student Panel";

  const userName = user?.name || "Student";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  const handleLogout = () => {
    logout();
    navigate("/student/login");
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <Toaster position="top-right" />

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <StudentSidebar currentPath={location.pathname} onNavigate={navigate} user={user} />

        <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
          {/* ─── TOP HEADER BAR ─── */}
          <header
            style={{
              background: "#fff",
              borderBottom: "1.5px solid #E2E8F0",
              height: 60,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "0 20px",
              position: "sticky",
              top: 0,
              zIndex: 20,
              gap: 12,
              flexShrink: 0,
            }}
          >
            {/* Left: Panel badge + Page name */}
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

              {/* Panel badge — purple for Student */}
              <span
                style={{
                  background: "linear-gradient(90deg, #7C3AED, #9333EA)",
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
              >
                Student Panel
              </span>

              <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

              <span style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B" }}>
                {pageLabel}
              </span>
            </div>

            {/* Right: User info + Avatar + Logout */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ textAlign: "right" }} className="hidden sm:block">
                <p style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", margin: 0, lineHeight: 1.2 }}>
                  {userName}
                </p>
                <p style={{ fontSize: 10, fontWeight: 600, color: "#7C3AED", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Student
                </p>
              </div>

              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #7C3AED, #FF6B00)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: 800,
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>

              <button
                onClick={handleLogout}
                title="Logout"
                style={{
                  background: "transparent",
                  border: "1.5px solid #E2E8F0",
                  padding: "6px 10px",
                  borderRadius: 8,
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "#64748B",
                  fontSize: 11,
                  fontWeight: 700,
                  fontFamily: "'DM Sans', sans-serif",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#FEF2F2";
                  e.currentTarget.style.borderColor = "#FECACA";
                  e.currentTarget.style.color = "#DC2626";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "#E2E8F0";
                  e.currentTarget.style.color = "#64748B";
                }}
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </header>

          <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}