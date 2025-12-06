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
import { useAuth } from "../../../context/AuthContext";

const navLinks = [
  {
    name: "Dashboard",
    path: "/student/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Projects",
    path: "/student/projects",
    icon: Layers,
  },
  {
    name: "Reports",
    path: "/student/reports",
    icon: BarChart2,
  },
  {
    name: "Profile",
    path: "/student/profile",
    icon: User,
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
        className="md:hidden fixed top-6 left-6 z-50 bg-white border-2 border-gray-200 text-gray-700 p-3 rounded-lg shadow-sm cursor-pointer hover:border-emerald-500"
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
            className="md:hidden fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: mobileOpen || window.innerWidth >= 768 ? 0 : -280 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={clsx(
          "fixed md:sticky top-0 h-screen w-72 bg-white border-r border-gray-200 flex flex-col z-40",
          "md:translate-x-0"
        )}
      >
        {/* Header Section */}
        <div className="border-b border-gray-200 p-6">
          {/* Logo & Title */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center">
              <GraduationCap size={24} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-lg font-bold text-gray-900">
                Student Portal
              </h1>
            </div>
          </motion.div>

          {/* User Info Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-gray-50 rounded-lg p-4 border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center">
                <User size={18} className="text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">
                  {user?.name || "Student"}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500 truncate mt-0.5">
                  <Mail size={10} />
                  {user?.email || "student@example.com"}
                </div>
              </div>
            </div>

            {/* Batch Info */}
            {user?.batch_name && (
              <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                <div className="flex-1 bg-white border border-gray-200 rounded-md px-3 py-1.5">
                  <div className="flex items-center gap-1.5">
                    <BookOpen size={12} className="text-gray-500" />
                    <span className="text-xs font-medium text-gray-700">
                      {user.batch_name}
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-md px-3 py-1.5">
                  <span className="text-xs font-semibold text-gray-700">
                    #{user.batch_no}
                  </span>
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-3">
            Menu
          </div>

          {navLinks.map(({ name, path, icon: Icon }, index) => {
            const isActive = currentPath === path;
            return (
              <motion.button
                key={path}
                onClick={() => handleNavigate(path)}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ x: 4 }}
                whileTap={{ scale: 0.98 }}
                className={clsx(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all cursor-pointer",
                  isActive
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "text-gray-700 hover:bg-gray-50 border border-transparent"
                )}
              >
                {/* Icon */}
                <Icon
                  size={18}
                  className={isActive ? "text-emerald-600" : "text-gray-500"}
                />

                {/* Text */}
                <span className="flex-1 text-left text-sm font-medium">
                  {name}
                </span>

                {/* Active Indicator */}
                {isActive && (
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                )}
              </motion.button>
            );
          })}
        </nav>

        {/* Logout Section */}
        <div className="p-4 border-t border-gray-200">
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-medium transition-all cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
}