import { Navigate, Route, Routes } from "react-router-dom";
import StudentLogin from "./components/student/StudentLogin";
import AdminLogin from "./components/admin/AdminLogin";
import { AuthProvider, useAuth } from "./context/AuthContext";
import StudentLayout from "./components/student/StudentLayout";
import Dashboard from "./components/student/Dashboard";
import Projects from "./components/student/Projects";
import Reports from "./components/student/Reports";
import AdminDashboard from "./components/admin/AdminDashboard";
import AddReport from "./components/admin/AddReport";
import ProjectTracking from "./components/admin/ProjectTracking";
import BatchStudentsView from "./components/admin/BatchStudentsView";
// import StudentProjectsView from "./components/admin/StudentProjectsView";
import StudentSignup from "./components/student/StudentSignup";
import StudentProjectsView from "./components/admin/StudentProjectsView";
import AdminSyllabusManagement from "./components/admin/AdminSyllabusManagement";
import TeacherLogin from "./components/teacher/TeacherLogin";
import TeacherSyllabusDashboard from "./components/teacher/TeacherSyllabusDashboard";
import TeacherRegister from "./components/teacher/TeacherRegister";
import StudentProfile from "./components/student/StudentProfile";
import StudentManagement from "./components/management/StudentManagement";
import AdminStudents from "./pages/AdminStudents";
import AdminBatches from "./pages/AdminBatches";
import AdminTeachers from "./pages/AdminTeachers";

export default function App() {
  function PrivateRoute({ children, role }) {
    const { user } = useAuth();
    if (!user) return <Navigate to={`/${role}/login`} replace />;
    return children;
  }

  return (
    <AuthProvider>
      <Routes>
        {/* STUDENT ROUTES */}
        <Route path="/student/login" element={<StudentLogin />} />
        <Route path="/student/signup" element={<StudentSignup />} />
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
          <Route path="profile" element={<StudentProfile />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute role="admin">
              <AdminDashboard />
            </PrivateRoute>
          }
        />

        {/* Management Routes */}

        <Route
          path="/admin/student-management"
          element={
            <PrivateRoute role="admin">
              <AdminStudents />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/teacher-management"
          element={
            <PrivateRoute role="admin">
              <AdminTeachers />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/batch-management"
          element={
            <PrivateRoute role="admin">
              <AdminBatches />
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
          path="/admin/project-tracking/batch/:batchId"
          element={
            <PrivateRoute role="admin">
              <BatchStudentsView />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/project-tracking/student/:studentId"
          element={
            <PrivateRoute role="admin">
              <StudentProjectsView />
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

        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />

        <Route
          path="/admin/syllabus"
          element={
            <PrivateRoute role="admin">
              <AdminSyllabusManagement />
            </PrivateRoute>
          }
        />

        <Route
          path="/teacher/dashboard"
          element={
            <PrivateRoute role="teacher">
              <TeacherSyllabusDashboard />
            </PrivateRoute>
          }
        />

        {/* DEFAULT REDIRECT */}
        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
