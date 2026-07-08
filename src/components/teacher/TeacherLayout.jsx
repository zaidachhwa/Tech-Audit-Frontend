import { useState, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, LogOut } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import TeacherSidebar from "./TeacherSidebar";

const PAGE_LABELS = {
  "/teacher/dashboard": "Dashboard",
  "/teacher/homework": "Homework Management",
  "/teacher/lectures": "Lecture Schedule",
  "/teacher/students": "My Students",
  "/teacher/syllabus": "Syllabus",
  "/teacher/batches": "Batch Management",
};

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageLabel = Object.entries(PAGE_LABELS).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || "Teacher Panel";

  const userName = user?.teacher?.name || user?.name || "Teacher";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <TeacherSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          transition: "margin-left 0.3s",
          marginLeft: sidebarOpen ? 256 : 64,
        }}
        className="teacher-main-content"
      >
        {/* ─── TOP HEADER BAR (ALL SCREENS) ─── */}
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
          }}
        >
          {/* Left: Toggle + Panel badge + Page name */}
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{
                background: "transparent",
                border: "none",
                padding: 6,
                borderRadius: 8,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Menu size={20} color="#94A3B8" />
            </button>

            <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

            {/* Panel badge — green for Teacher */}
            <span
              style={{
                background: "linear-gradient(90deg, #047857, #059669)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              Teacher Panel
            </span>

            <div style={{ width: 1, height: 24, background: "#E2E8F0", display: "none" }} className="sm-divider" />

            <span
              style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", display: "none" }}
              className="sm-page-label"
            >
              {pageLabel}
            </span>
          </div>

          {/* Right: User info + Avatar + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div className="hidden sm:block" style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", margin: 0, lineHeight: 1.2 }}>
                {userName}
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#047857", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Teacher
              </p>
            </div>

            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #047857, #FF6B00)",
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
              onClick={logout}
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

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
          duration: 3000,
        }}
      />

      <style>{`
        @media (max-width: 1023px) {
          .teacher-main-content { margin-left: 0 !important; }
        }
        @media (min-width: 640px) {
          .sm-divider { display: block !important; }
          .sm-page-label { display: block !important; }
        }
      `}</style>
    </div>
  );
}
