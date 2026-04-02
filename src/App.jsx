

import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";

/* FORGOT PASSWORD */
import ForgotPassword from "./components/auth/ForgotPassword";

/* STUDENT */
import StudentLogin from "./components/student/StudentLogin";
import StudentSignup from "./components/student/StudentSignup";
import StudentLayout from "./components/student/StudentLayout";
import Dashboard from "./components/student/Dashboard";
import Projects from "./components/student/Projects";
import Reports from "./components/student/Reports";
import StudentProfile from "./components/student/StudentProfile";

/* ADMIN */
import AdminLogin from "./components/admin/AdminLogin";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProjectTracking from "./components/admin/ProjectTracking";
import BatchStudentsView from "./components/admin/BatchStudentsView";
import StudentProjectsView from "./components/admin/StudentProjectsView";
import AdminSyllabusManagement from "./components/admin/AdminSyllabusManagement";
import AllReports from "./components/admin/AllReports";
import AddReport2 from "./components/admin/AddReport2";
import Drafts from "./components/admin/Drafts";
import AdminStudents from "./pages/AdminStudents";
import AdminBatches from "./pages/AdminBatches";
import AdminTeachers from "./pages/AdminTeachers";
import TeacherProfileView from "./components/admin/TeacherProfileView";
import StudentProfileView from "./components/admin/StudentProfileView";

/* TEACHER */
import TeacherLogin from "./components/teacher/TeacherLogin";
import TeacherRegister from "./components/teacher/TeacherRegister";
import TeacherLayout from "./components/teacher/TeacherLayout";
import TeacherSyllabusDashboard from "./components/teacher/TeacherSyllabusDashboard";
import TeacherProfile from "./components/teacher/TeacherProfile";
import TeacherStudentProgress from "./components/teacher/TeacherStudentProgress";
import AssignTask from "./components/teacher/AssignTask";
import AdminAnalytics from "./pages/AdminAnalytics";

/* PRIVATE ROUTE */
function PrivateRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to={`/${role}/login`} replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* FORGOT PASSWORD */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* STUDENT */}
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

        {/* ADMIN */}
        <Route path="/admin/login" element={<AdminLogin />} />

        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="student-management" element={<AdminStudents />} />
          <Route path="teacher-management" element={<AdminTeachers />} />
          <Route path="batch-management" element={<AdminBatches />} />
          <Route path="project-tracking" element={<ProjectTracking />} />
          <Route path="project-tracking/batch/:batchId" element={<BatchStudentsView />} />
          <Route path="project-tracking/student/:studentId" element={<StudentProjectsView />} />
          <Route path="add-reports" element={<AddReport2 />} />
          <Route path="syllabus" element={<AdminSyllabusManagement />} />
          <Route path="all-reports" element={<AllReports />} />
          <Route path="drafts" element={<Drafts />} />
          <Route path="teacher/:teacherId" element={<TeacherProfileView />} />
          <Route path="student/:studentId" element={<StudentProfileView />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>

        {/* TEACHER */}
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path="/teacher/register" element={<TeacherRegister />} />
        

        <Route
          path="/teacher"
          element={
            <PrivateRoute role="teacher">
              <TeacherLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherSyllabusDashboard />} />
          <Route path="performance" element={<TeacherStudentProgress />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="assign-task" element={<AssignTask />} />
        </Route>

        {/* DEFAULT */}
        <Route path="*" element={<Navigate to="/student/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}