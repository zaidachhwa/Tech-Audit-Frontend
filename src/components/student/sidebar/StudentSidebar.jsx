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
  GraduationCap,
  Mail,
  BookOpen,
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";
import  useAuth  from "../../../context/AuthContext";

const navLinks = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
    gradient: "from-blue-500 to-cyan-500",
    description: "Overview & Stats",
  },
  {
    name: "Projects",
    path: "/student/projects",
    icon: Layers,
    gradient: "from-purple-500 to-pink-500",
    description: "Track Progress",
  },
  {
    name: "Reports",
    path: "/student/reports",
    icon: BarChart2,
    gradient: "from-orange-500 to-amber-500",
    description: "Performance",
  },
  {
    name: "Profile",
    path: "/student/profile",
    icon: User,
    gradient: "from-purple-600 to-indigo-600",
    description: "Settings",
  },
];

export default function StudentSidebar({ currentPath, onNavigate, user }) {
  const [mobileOpen, setMobileOpen] = useState(false);
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
      {/* Mobile Menu Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-6 left-6 z-50 bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-3 rounded-2xl shadow-2xl cursor-pointer backdrop-blur-sm border-2 border-white/20"
      >
        {mobileOpen ? <X size={24} /> : <Menu size={24} />}
      </motion.button>

      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-md z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: mobileOpen || window.innerWidth >= 768 ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={clsx(
          "fixed md:sticky top-0 h-screen w-80 bg-gradient-to-b from-white/95 to-purple-50/95 backdrop-blur-2xl border-r border-purple-100/50 shadow-2xl flex flex-col z-40",
          "md:translate-x-0"
        )}
      >
        {/* Header Section with Enhanced Design */}
        <div className="relative overflow-hidden">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-purple-300 rounded-full blur-3xl"></div>
            </div>
          </div>

          <div className="relative p-6 text-white">
            {/* Logo & Title */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-4 mb-6"
            >
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-white/30 to-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/40 shadow-xl">
                  <GraduationCap size={32} className="text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg">
                  Student Portal
                </h1>
                <p className="text-xs text-purple-100 mt-0.5 font-medium">
                  Welcome back! 👋
                </p>
              </div>
            </motion.div>

            {/* Enhanced User Info Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white/15 backdrop-blur-xl rounded-2xl p-4 border-2 border-white/30 shadow-xl"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-xl flex items-center justify-center shadow-lg">
                  <User size={24} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate drop-shadow">
                    {user?.name || "Student"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-purple-100 truncate mt-0.5">
                    <Mail size={10} />
                    {user?.email || "student@example.com"}
                  </div>
                </div>
              </div>

              {/* Batch Info Badge */}
              {user?.batch_name && (
                <div className="flex items-center gap-2 pt-3 border-t border-white/20">
                  <div className="flex-1 bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-purple-200" />
                      <span className="text-xs font-semibold">
                        {user.batch_name}
                      </span>
                    </div>
                  </div>
                  <div className="bg-white/10 rounded-lg px-3 py-2 backdrop-blur-sm">
                    <span className="text-xs font-bold">#{user.batch_no}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-5 space-y-2 overflow-y-auto">
          <div className="flex items-center justify-between px-3 mb-4">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Navigation
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-purple-200 to-transparent ml-3"></div>
          </div>

          {navLinks.map(({ name, path, icon: Icon, gradient, description }, index) => {
            const isActive = currentPath === path;
            return (
              <motion.button
                key={path}
                onClick={() => handleNavigate(path)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.03, x: 6 }}
                whileTap={{ scale: 0.97 }}
                className={clsx(
                  "w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl font-medium transition-all group relative overflow-hidden cursor-pointer",
                  isActive
                    ? "text-white shadow-xl"
                    : "text-gray-700 hover:bg-white/60 hover:shadow-md"
                )}
              >
                {/* Active Background with Animation */}
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className={`absolute inset-0 bg-gradient-to-r ${gradient} shadow-lg`}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}

                {/* Icon Container */}
                <div
                  className={clsx(
                    "relative z-10 p-2.5 rounded-xl transition-all shadow-md",
                    isActive
                      ? "bg-white/25 shadow-lg"
                      : "bg-white group-hover:bg-purple-50"
                  )}
                >
                  <Icon size={20} className={isActive ? "text-white" : "text-gray-700"} />
                </div>

                {/* Text Content */}
                <div className="relative z-10 flex-1 text-left">
                  <div className="text-sm font-semibold">{name}</div>
                  <div className={clsx(
                    "text-xs mt-0.5",
                    isActive ? "text-white/80" : "text-gray-500"
                  )}>
                    {description}
                  </div>
                </div>

                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative z-10 bg-white/30 p-1.5 rounded-lg"
                  >
                    <ChevronRight size={18} />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-5 border-t border-purple-100/50 bg-gradient-to-t from-purple-50/50 to-transparent">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 hover:from-red-100 hover:to-pink-100 text-red-600 font-semibold transition-all group cursor-pointer shadow-md hover:shadow-lg border-2 border-red-100"
          >
            <LogOut
              size={20}
              className="group-hover:rotate-12 transition-transform"
            />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}