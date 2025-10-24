import { motion } from "framer-motion";
import { LayoutDashboard, Layers, BarChart2, LogOut } from "lucide-react";
import clsx from "clsx";

const navLinks = [
  { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
  { name: "Projects", path: "/student/projects", icon: Layers },
  { name: "Reports", path: "/student/reports", icon: BarChart2 },
];

export default function StudentSidebar({ currentPath, onNavigate }) {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="w-fit md:w-64 bg-white/80 backdrop-blur-md border-r border-slate-100 shadow-lg flex flex-col"
    >
      {/* Header */}
      <div className="p-6 border-b border-slate-100 hidden md:block">
        <h1 className="text-xl font-bold text-emerald-700 tracking-tight">
          Student Panel
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your projects easily
        </p>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-2">
        {navLinks.map(({ name, path, icon: Icon }) => (
          <button
            key={path}
            onClick={() => onNavigate(path)}
            className={clsx(
              "w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              currentPath === path
                ? "bg-emerald-600 text-white shadow"
                : "text-slate-600 hover:bg-emerald-100 hover:text-emerald-700"
            )}
          >
            <Icon size={18} />
            <p className="hidden md:inline">{name}</p>
          </button>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-100">
        <button
          onClick={() => {
            localStorage.removeItem("token");
            onNavigate("/login");
          }}
          className="w-full flex items-center gap-2 text-slate-500 hover:text-rose-600 text-sm transition"
        >
          <LogOut size={16} />
          <p className="hidden md:block">Logout</p>
        </button>
      </div>
    </motion.aside>
  );
}
