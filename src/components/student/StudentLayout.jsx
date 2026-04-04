import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import StudentSidebar from "./sidebar/StudentSidebar";
import { useAuth } from "../../context/AuthContext";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F8FAFC", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');`}</style>
      <Toaster position="top-right" />
      <StudentSidebar currentPath={location.pathname} onNavigate={navigate} user={user} />
      <main style={{ flex: 1, overflowY: "auto", overflowX: "hidden" }}>
        <Outlet />
      </main>
    </div>
  );
}