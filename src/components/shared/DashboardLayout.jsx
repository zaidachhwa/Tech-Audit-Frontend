import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { LogOut, X, Menu, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import usePushNotifications from "../../hooks/usePushNotifications";

export default function DashboardLayout({
  role,
  menuItems,
  user,
  logout,
  pageLabelMap = {},
  children,
}) {
  const location = useLocation();
  
  // Register for push notifications
  usePushNotifications();
  
  // Sidebar open/close state for mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);
  
  // Collapsed state for tablet/desktop sidebar
  const [collapsed, setCollapsed] = useState(false);

  // Auto collapse on tablet view on mount/resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setMobileOpen(false);
      } else if (window.innerWidth < 1280) {
        setCollapsed(true);
      } else {
        setCollapsed(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Determine current page label
  const pageLabel =
    Object.entries(pageLabelMap).find(([key]) =>
      location.pathname.startsWith(key)
    )?.[1] || "NIT Syllabus Tracker";

  const userName = user?.name || user?.teacher?.name || "User";
  const userEmail = user?.email || user?.teacher?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  // Setup theme attributes based on role
  let roleLabel = "";
  let badgeGradient = "";
  let themeColorClass = "";
  let activeBgColor = "";
  let activeTextColor = "";
  let activeBorderColor = "";
  let avatarGradient = "";

  switch (role) {
    case "admin":
      roleLabel = "Administrator";
      badgeGradient = "linear-gradient(90deg, #0F3C8A, #1E57C8)";
      themeColorClass = "text-[#0F3C8A]";
      activeBgColor = "#EFF6FF";
      activeTextColor = "#0F3C8A";
      activeBorderColor = "#FF6B00";
      avatarGradient = "linear-gradient(135deg, #0F3C8A, #FF6B00)";
      break;
    case "teacher":
      roleLabel = "Teacher";
      badgeGradient = "linear-gradient(90deg, #047857, #059669)";
      themeColorClass = "text-[#047857]";
      activeBgColor = "#ECFDF5";
      activeTextColor = "#047857";
      activeBorderColor = "#FF6B00";
      avatarGradient = "linear-gradient(135deg, #047857, #FF6B00)";
      break;
    case "student":
      roleLabel = "Student";
      badgeGradient = "linear-gradient(90deg, #7C3AED, #9333EA)";
      themeColorClass = "text-[#7C3AED]";
      activeBgColor = "#F5F3FF";
      activeTextColor = "#7C3AED";
      activeBorderColor = "#FF6B00";
      avatarGradient = "linear-gradient(135deg, #7C3AED, #FF6B00)";
      break;
    default:
      roleLabel = "User";
      badgeGradient = "linear-gradient(90deg, #64748B, #475569)";
      themeColorClass = "text-[#475569]";
      activeBgColor = "#F1F5F9";
      activeTextColor = "#1E293B";
      activeBorderColor = "#64748B";
      avatarGradient = "linear-gradient(135deg, #64748B, #475569)";
  }

  const renderSidebarContent = (isMobileView = false) => {
    const isCollapsed = !isMobileView && collapsed;
    return (
      <div className="h-full flex flex-col bg-white select-none">
        {/* LOGO & BRANDING SECTION */}
        <div className="relative pt-2 pb-3 px-4 border-b border-slate-100 flex flex-col items-center shrink-0">
          <img
            src="/logo.png"
            alt="NIT logo"
            className={`${isCollapsed ? "h-10 w-10" : "h-28 w-auto max-w-[170px] -mt-2 -mb-2 scale-110"} object-contain transition-all duration-300 hover:scale-115`}
          />
          {!isCollapsed && (
            <>
              <h2 className="text-center font-extrabold text-[11px] tracking-tight text-slate-800 px-1 leading-snug uppercase mt-0.5">
                Nexcore Institute of Technology
              </h2>
              <span
                style={{
                  marginTop: 4,
                  background: badgeGradient,
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 800,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                {roleLabel} Panel
              </span>
            </>
          )}

          {/* X button for mobile view */}
          {isMobileView && (
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-2 right-2 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* User profile details box (hidden in collapsed view) */}
        {!isCollapsed && (
          <div className="py-2.5 px-3.5 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-3">
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: avatarGradient,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 800,
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                {initials}
              </div>
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="text-xs font-bold text-slate-800 truncate m-0 leading-tight">
                  {userName}
                </p>
                <p className="text-[10px] text-slate-400 truncate m-0 mt-0.5 leading-none">
                  {userEmail}
                </p>
              </div>
            </div>

            {/* Student metadata */}
            {role === "student" && user?.batch_name && (
              <div className="flex gap-1.5 mt-3">
                <div className="flex-1 bg-white border border-slate-100 rounded-lg py-1 px-1.5 flex items-center gap-1 justify-center truncate">
                  <BookOpen size={10} className="text-slate-400 shrink-0" />
                  <span className="text-slate-600 text-[9px] font-bold truncate">
                    {user.batch_name}
                  </span>
                </div>
                <div className="bg-white border border-slate-100 rounded-lg py-1 px-2 flex items-center justify-center shrink-0">
                  <span className="text-slate-600 text-[9px] font-bold">
                    #{user.batch_no}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-0.5 scrollbar-thin">
          {!isCollapsed && (
            <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest px-3 mb-2">
              Menu
            </p>
          )}
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => isMobileView && setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 relative group font-semibold text-[13px]"
                style={{
                  backgroundColor: isActive ? activeBgColor : "transparent",
                  color: isActive ? activeTextColor : "#64748B",
                  borderLeft: isActive
                    ? `3px solid ${activeBorderColor}`
                    : "3px solid transparent",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                }}
              >
                <Icon
                  size={18}
                  className="shrink-0 transition-colors duration-200"
                  style={{ color: isActive ? activeBorderColor : "#94A3B8" }}
                />

                {!isCollapsed && <span className="truncate">{item.name}</span>}

                {/* Collapsed Tooltip */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition-all duration-150 pointer-events-none whitespace-nowrap z-50 shadow-md">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT BUTTON AT THE BOTTOM */}
        <div className="p-4 border-t border-slate-100 shrink-0">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 font-semibold text-[13px] cursor-pointer border-none bg-transparent"
            style={{ justifyContent: isCollapsed ? "center" : "flex-start" }}
          >
            <LogOut size={18} className="shrink-0" />
            {!isCollapsed && <span>Logout</span>}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen flex text-slate-800 bg-[#F8FAFC]"
      style={{
        height: "100vh",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .scrollbar-thin::-webkit-scrollbar { width: 4px; }
        .scrollbar-thin::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 2px; }
      `}</style>

      {/* 1. MOBILE DRAWER OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* 2. MOBILE DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white z-50 md:hidden transition-transform duration-300 ease-in-out shadow-2xl ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent(true)}
      </aside>

      {/* 3. DESKTOP/TABLET SIDEBAR */}
      <aside
        className={`hidden md:flex flex-col border-r border-slate-150 h-screen bg-white transition-all duration-300 z-30 shrink-0 ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {renderSidebarContent(false)}
      </aside>

      {/* 4. MAIN WORKSPACE */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden min-w-0">
        
        {/* TOP FIXED HEADER */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shrink-0 sticky top-0 z-20 gap-4">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileOpen(true)}
              className="p-2 -ml-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>

            {/* Desktop collapse trigger */}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition hidden md:flex items-center justify-center cursor-pointer border border-slate-100"
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className="h-5 w-[1px] bg-slate-200 hidden md:block" />

            <div className="flex items-center gap-2">
              <span
                style={{
                  background: badgeGradient,
                  color: "#fff",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  padding: "3px 10px",
                  borderRadius: 99,
                }}
                className="hidden sm:inline-block shrink-0 shadow-sm"
              >
                {roleLabel}
              </span>
              <div className="h-5 w-[1px] bg-slate-200 hidden sm:block" />
              <h1 className="text-sm sm:text-base font-extrabold text-slate-800 truncate max-w-[150px] sm:max-w-xs md:max-w-md">
                {pageLabel}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {/* User profile label */}
            <div className="hidden sm:block text-right">
              <p className="text-xs font-extrabold text-slate-800 m-0 leading-tight truncate max-w-[120px]">
                {userName}
              </p>
              <p className={`text-[9px] font-extrabold m-0 mt-0.5 uppercase tracking-wider ${themeColorClass}`}>
                {roleLabel}
              </p>
            </div>

            {/* Avatar circle */}
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: avatarGradient,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#fff",
                fontSize: 12,
                fontWeight: 800,
                flexShrink: 0,
              }}
              className="shadow-sm"
            >
              {initials}
            </div>

            {/* Logout button */}
            <button
              onClick={logout}
              title="Logout"
              className="border border-slate-200 hover:border-rose-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 px-3 py-1.5 rounded-xl transition text-[12px] font-bold flex items-center gap-1.5 cursor-pointer shadow-sm shrink-0"
            >
              <LogOut size={13} />
              <span className="hidden md:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT VIEWPORT */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 bg-[#F8FAFC]">
          <div className="p-4 sm:p-6 md:p-8">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center min-h-[50vh]">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-800" />
                </div>
              }
            >
              {children}
            </React.Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
