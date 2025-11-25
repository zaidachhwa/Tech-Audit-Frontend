// src/components/student/StudentSidebar.jsx
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Layers,
  BarChart2,
  LogOut,
  User,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import { useAuth } from "../../../context/AuthContext";

const navLinks = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    name: "Projects",
    path: "/student/projects",
    icon: Layers,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    name: "Reports",
    path: "/student/reports",
    icon: BarChart2,
    gradient: "from-orange-500 to-amber-500",
  },
  {
    name: "Profile",
    path: "/student/profile",
    icon: User,
    gradient: "from-purple-600 to-indigo-600",
  },
];

export default function StudentSidebar({ currentPath, onNavigate, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  console.log(user);
  const auth = useAuth();

  const handleNavigate = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    auth?.logout?.();
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onNavigate("/student/login");
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg cursor-pointer"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: mobileOpen || window.innerWidth >= 768 ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={clsx(
          "fixed md:sticky top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl flex flex-col z-40",
          "md:translate-x-0"
        )}
      >
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600" />
          <div className="relative p-6 text-white">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
                <User size={28} className="text-white" />
              </div>
              <div className="flex-1">
                <h1 className="text-xl font-bold tracking-tight">
                  Student Portal
                </h1>
                <p className="text-xs text-purple-100 mt-0.5">Welcome back!</p>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
              <div className="text-sm font-semibold truncate">
                {user?.name || "Student"}
              </div>
              <div className="text-xs text-purple-100 truncate mt-1">
                {user?.email || ""}
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
            Navigation
          </div>

          {navLinks.map(({ name, path, icon: Icon, gradient }) => {
            const isActive = currentPath === path;
            return (
              <motion.button
                key={path}
                onClick={() => handleNavigate(path)}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group relative overflow-hidden cursor-pointer",
                  isActive
                    ? "text-white shadow-lg"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div
                  className={clsx(
                    "relative z-10 p-2 rounded-lg transition-all",
                    isActive
                      ? "bg-white/20"
                      : "bg-gray-100 group-hover:bg-gray-200"
                  )}
                >
                  <Icon size={18} />
                </div>
                <span className="relative z-10 flex-1 text-left text-sm">
                  {name}
                </span>
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10"
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-medium transition-all group cursor-pointer"
          >
            <LogOut
              size={18}
              className="group-hover:rotate-12 transition-transform"
            />{" "}
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
