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
];

export default function StudentSidebar({ currentPath, onNavigate, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNavigate = (path) => {
    onNavigate(path);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    onNavigate("/student/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-xl shadow-lg cursor-pointer"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Overlay */}
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

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{
          x: mobileOpen || window.innerWidth >= 768 ? 0 : -280,
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={clsx(
          "fixed md:sticky top-0 h-screen w-72 bg-white/80 backdrop-blur-xl border-r border-white/30 shadow-2xl flex flex-col z-40",
          "md:translate-x-0"
        )}
      >
        {/* Header with User Info */}
        <div className="relative overflow-hidden">
          {/* Background Gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-indigo-600" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLW9wYWNpdHk9IjAuMSIgc3Ryb2tlLXdpZHRoPSIxIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20" />

          {/* Content */}
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

            {/* User Info Card */}
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

        {/* Navigation Links */}
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
                {/* Active Background Gradient */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute inset-0 bg-gradient-to-r ${gradient}`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon Container */}
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

                {/* Label */}
                <span className="relative z-10 flex-1 text-left text-sm">
                  {name}
                </span>

                {/* Arrow Icon */}
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

        {/* Stats Section */}
        <div className="p-4 border-t border-gray-100">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-4 border border-purple-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-gray-600">
                Quick Stats
              </span>
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-white rounded-lg p-2 border border-purple-100">
                <div className="text-lg font-bold text-purple-600">5</div>
                <div className="text-xs text-gray-500">Projects</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-indigo-100">
                <div className="text-lg font-bold text-indigo-600">12</div>
                <div className="text-xs text-gray-500">Tasks</div>
              </div>
              <div className="bg-white rounded-lg p-2 border border-blue-100">
                <div className="text-lg font-bold text-blue-600">8</div>
                <div className="text-xs text-gray-500">Reports</div>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button */}
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
            />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}
