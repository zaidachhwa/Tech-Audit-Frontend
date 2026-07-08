import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";

import AdminSidebar from "./AdminSidebar";

const PAGE_LABELS = {
  "/admin/dashboard": "Dashboard",
  "/admin/teachers": "Manage Teachers",
  "/admin/students": "Manage Students",
  "/admin/batches": "Batch Management",
  "/admin/syllabus": "Syllabus Tracker",
  "/admin/analytics": "Analytics",
};

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const { user, logout } = useAuth();
  const location = useLocation();

  const pageLabel = Object.entries(PAGE_LABELS).find(([key]) =>
    location.pathname.startsWith(key)
  )?.[1] || "Admin Panel";

  const userName = user?.name || "Admin";
  const initials = userName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>
      <Toaster position="top-right" />

      {/* Sidebar */}
      <AdminSidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* MAIN WRAPPER */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-20"
        }`}
      >
        {/* ─── TOP HEADER BAR (ALL SCREENS) ─── */}
        <header
          style={{
            backgroundColor: "#FFFFFF",
            borderBottom: "1.5px solid #E2E8F0",
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            gap: 12,
          }}
        >
          {/* Left: Mobile menu + Panel + Page */}
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

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "#E2E8F0" }} />

            {/* Panel badge */}
            <span
              style={{
                background: "linear-gradient(90deg, #0F3C8A, #1E57C8)",
                color: "#fff",
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                padding: "3px 10px",
                borderRadius: 99,
              }}
            >
              Admin Panel
            </span>

            {/* Divider */}
            <div style={{ width: 1, height: 24, background: "#E2E8F0" }} className="hidden sm:block" />

            {/* Current page */}
            <span
              className="hidden sm:block"
              style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B" }}
            >
              {pageLabel}
            </span>
          </div>

          {/* Right: User info + Logout */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* User name & role */}
            <div className="hidden sm:block" style={{ textAlign: "right" }}>
              <p style={{ fontSize: 13, fontWeight: 700, color: "#1B2B4B", margin: 0, lineHeight: 1.2 }}>
                {userName}
              </p>
              <p style={{ fontSize: 10, fontWeight: 600, color: "#FF6B00", margin: 0, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Administrator
              </p>
            </div>

            {/* Avatar */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #0F3C8A, #FF6B00)",
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

            {/* Logout */}
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

        {/* ⭐ ALL ADMIN PAGES RENDER HERE */}
        <main className="p-6" style={{ backgroundColor: "#F8FAFC" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}