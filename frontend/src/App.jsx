import { Navigate, Route, Routes } from "react-router-dom";

import StudentLogin from "./components/student/StudentLogin";
import AdminLogin from "./components/admin/AdminLogin";
import { AuthProvider, useAuth } from "./context/AuthContext";

// 🧩 New layout & pages
import StudentLayout from "./components/student/StudentLayout";
import Dashboard from "./components/student/Dashboard";
import Projects from "./components/student/Projects";
import Reports from "./components/student/Reports";

// Existing admin components
import AdminDashboard from "./components/admin/AdminDashboard";
import AddReport from "./components/admin/AddReport";
import ProjectTracking from "./components/admin/ProjectTracking";

export default function App() {
  function PrivateRoute({ children, role }) {
    const { user } = useAuth();
    if (!user) return <Navigate to={`/${role}/login`} replace />;
    return children;
  }

  return (
    <AuthProvider>
      <Routes>
        {/* ---------------- STUDENT ROUTES ---------------- */}
        <Route path="/student/login" element={<StudentLogin />} />

        <Route
          path="/student"
          element={
            <PrivateRoute role="student">
              <StudentLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* ---------------- ADMIN ROUTES ---------------- */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/project-tracking"
          element={
            <PrivateRoute role="admin">
              <ProjectTracking />
            </PrivateRoute>
          }
        />

        <Route
          path="/admin/add-reports"
          element={
            <PrivateRoute role="admin">
              <AddReport />
            </PrivateRoute>
          }
        />

        {/* ---------------- DEFAULT REDIRECT ---------------- */}
        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
