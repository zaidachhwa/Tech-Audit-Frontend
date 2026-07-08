import { NavLink, useLocation } from "react-router-dom";
import { LogOut, X } from "lucide-react";
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
      <div
        className={`fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity duration-300 ${sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
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
          backgroundColor: "#FFFFFF",
          borderRight: "1.5px solid #F1F5F9",
          fontFamily: "'DM Sans', sans-serif",
          boxShadow: sidebarOpen ? "0 4px 20px rgba(15, 30, 54, 0.05)" : "none",
        }}
      >
        {/* LOGO & BRANDING SECTION */}
        {sidebarOpen ? (
          <div className="p-5 border-b border-[#F1F5F9] relative flex flex-col items-center">
            <img src="/logo.png" alt="Nexcore logo" className="h-20 w-20 object-cover mb-3" />
            <h2 className="text-center font-extrabold text-xs tracking-tight text-[#0F3C8A] px-2 leading-snug uppercase">
              Nexcore Institute of Technology
            </h2>
            {/* <p className="text-center text-[9px] font-black uppercase tracking-widest text-[#FF6B00] mt-1">
              Syllabus Tracker
            </p> */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition lg:hidden"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div className="h-24 flex items-center justify-center border-b border-[#F1F5F9] cursor-pointer" onClick={() => setSidebarOpen(true)}>
            <img src="/logo.png" alt="Nexcore logo" className="h-10 w-10 object-contain hover:scale-105 transition duration-200" />
          </div>
        )}

        {/* NAVIGATION LINKS */}
        <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1">
          {adminSidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => window.innerWidth < 1024 && setSidebarOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative group font-semibold text-xs"
                style={{
                  backgroundColor: isActive ? "#EFF6FF" : "transparent",
                  color: isActive ? "#0F3C8A" : "#64748B",
                  borderLeft: isActive ? "4px solid #FF6B00" : "4px solid transparent",
                }}
              >
                <Icon size={20} className="shrink-0 transition-colors duration-200" style={{ color: isActive ? "#FF6B00" : "#94A3B8" }} />

                <span className={`transition-opacity duration-200 ${sidebarOpen ? "opacity-100" : "opacity-0 lg:hidden"
                  }`}>
                  {item.name}
                </span>

                {!sidebarOpen && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded opacity-0 group-hover:opacity-100 transition duration-150 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* LOGOUT SECTION */}
        <div className="p-4 border-t border-[#F1F5F9]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 font-semibold text-xs cursor-pointer"
          >
            <LogOut size={20} className="shrink-0" />
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>
    </>
  );
}