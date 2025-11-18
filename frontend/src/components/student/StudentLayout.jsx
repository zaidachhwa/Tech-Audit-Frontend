import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Toaster } from "react-hot-toast";
import StudentSidebar from "./sidebar/StudentSidebar";
import { useAuth } from "../../context/AuthContext";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50">
      <Toaster position="top-right" />

      {/* Sidebar */}
      <StudentSidebar
        currentPath={location.pathname}
        onNavigate={navigate}
        user={user}
      />

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
        className="flex-1 overflow-y-auto"
      >
        <Outlet />
      </motion.main>
    </div>
  );
}
