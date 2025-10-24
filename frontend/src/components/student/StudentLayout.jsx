import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import StudentSidebar from "../student/sidebar/StudentSidebar";
import { Toaster } from "react-hot-toast";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-emerald-50 to-slate-100 text-gray-800">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <StudentSidebar currentPath={location.pathname} onNavigate={navigate} />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex-1 p-6 overflow-y-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
