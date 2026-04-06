import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import TeacherSidebar from "./TeacherSidebar";

export default function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#F8FAFC",
        fontFamily: "'DM Sans', sans-serif",
        display: "flex",
      }}
    >
      {/* Google Font import via style tag */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>

      <TeacherSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

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
        {/* Mobile topbar */}
        <div
          style={{
            background: "#fff",
            borderBottom: "1.5px solid #E2E8F0",
            height: 56,
            display: "flex",
            alignItems: "center",
            padding: "0 16px",
            position: "sticky",
            top: 0,
            zIndex: 20,
          }}
          className="lg:hidden"
        >

          <span
            style={{
              marginLeft: 12,
              fontWeight: 700,
              color: "#1B2B4B",
              fontSize: 15,
            }}
          >
            NexCore Teacher
          </span>
        </div>

        <main style={{ flex: 1 }}>
          <Outlet />
        </main>
      </div>

      {/* Responsive override */}
      <style>{`
        @media (max-width: 1023px) {
          .teacher-main-content {
            margin-left: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}