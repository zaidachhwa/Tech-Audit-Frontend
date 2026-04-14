import { NavLink, useLocation } from "react-router-dom";
import { Menu, LogOut, X } from "lucide-react"; // Added X for close button
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

      {/* 1. MOBILE OVERLAY (Backdrop) */}
      {/* This darkens the background when the menu is open on mobile */}
      <div
        className={`fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* 2. SIDEBAR CONTAINER */}
      <aside
        className={`fixed left-0 top-0 h-screen transition-all duration-300 z-50 flex flex-col
          ${sidebarOpen
            ? "w-64 translate-x-0"
            : "w-20 -translate-x-full lg:translate-x-0"
          }`}
        style={{
          backgroundColor: "#1B2B4B",
          borderRight: "1px solid #243452",
          fontFamily: "'DM Sans', sans-serif",
          borderRadius: sidebarOpen ? "0px 20px 20px 0px" : "0px",
        }}
      >
        {/* LOGO & TOGGLE SECTION */}
        <div className="h-20 flex items-center justify-between px-4 border-b border-[#243452]">
          {sidebarOpen ? (
            <>
              <div className="text-white font-bold text-xl tracking-tight">DASHBOARD</div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-lg hover:bg-[#243452] text-[#94A3B8] transition"
              >
                <X size={20} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setSidebarOpen(true)}
              className="w-full flex justify-center p-2 rounded-lg text-[#94A3B8] hover:bg-[#243452] transition"
            >
              <Menu size={24} />
            </button>
          )}
        </div>

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto space-y-2">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                // Close sidebar on mobile after clicking a link
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group"
                style={{
                  backgroundColor: isActive ? "#2563EB" : "transparent",
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                }}
              >
                <Icon size={22} className="shrink-0" />

                {/* Text only shows when open OR on hover if you wanted tooltips */}
                <span className={`font-medium text-sm transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:hidden"
                  }`}>
                  {item.name}
                </span>

                {/* Active Indicator Line */}
                {isActive && sidebarOpen && (
                  <div className="absolute right-0 w-1 h-6 bg-white rounded-l-full" />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT SECTION */}
        <div className="p-4 border-t border-[#243452]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-[#94A3B8] hover:bg-red-500/10 hover:text-red-500 transition-colors group"
          >
            <LogOut size={22} className="shrink-0" />
            {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}