import { Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PwaUpdatePrompt from './components/shared/PwaUpdatePrompt';

/* AUTH / SHARED */
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicOnlyRoute from './components/auth/PublicOnlyRoute';
import Unauthorized from './components/auth/Unauthorized';
import ForgotPassword from './components/auth/ForgotPassword';
import PolicyPage from './pages/PolicyPage';
import LandingPage from './pages/LandingPage';

/* STUDENT */
import Login from './pages/Login';
import StudentSignup from './components/student/StudentSignup';
import StudentLayout from './components/student/StudentLayout';
import StudentDashboard from './components/student/StudentDashboard';
import Projects from './components/student/Projects';
import Reports from './components/student/Reports';
import StudentProfile from './components/student/StudentProfile';
import StudentAssignments from './components/student/StudentAssignments';
import StudentAnnouncements from './components/student/StudentAnnouncements';
import StudentAttendancePunch from './components/student/StudentAttendancePunch';

/* ADMIN */

import AdminLayout from './components/admin/AdminLayout';
import AdminDashboard from './components/admin/AdminDashboard';
import ProjectTracking from './components/admin/ProjectTracking';
import AdminBatchDetail from './components/admin/AdminBatchDetail';
import StudentProjectsView from './components/admin/StudentProjectsView';
import AdminSyllabusManagement from './components/admin/AdminSyllabusManagement';
import AllReports from './components/admin/AllReports';
import AddReport2 from './components/admin/AddReport2';
import TeacherPerformanceReports from './pages/TeacherPerformanceReports';
import AdminPerformanceReports from './pages/AdminPerformanceReports';
import Drafts from './components/admin/Drafts';
import AdminStudents from './pages/AdminStudents';
import AdminBatches from './pages/AdminBatches';
import AdminTeachers from './pages/AdminTeachers';
import TeacherProfileView from './components/admin/TeacherProfileView';
import StudentProfileView from './components/admin/StudentProfileView';
import AdminAnalytics from './pages/AdminAnalytics';
import LectureSchedule from './pages/LectureSchedule';
import ExamSchedule from './pages/ExamSchedule';
import ExamResults from './pages/ExamResults';
import Leaderboard from './pages/Leaderboard';
import AdminStudentAttendance from './components/admin/AdminStudentAttendance';
import AdminInstituteSettings from './components/admin/AdminInstituteSettings';
import AdminAnnouncements from './components/admin/AdminAnnouncements';

/* TEACHER */

import TeacherRegister from './components/teacher/TeacherRegister';
import TeacherLayout from './components/teacher/TeacherLayout';
import TeacherSyllabusDashboard from './components/teacher/TeacherSyllabusDashboard';
import TeacherProfile from './components/teacher/TeacherProfile';
import TeacherStudentProgress from './components/teacher/TeacherStudentProgress';
import AssignTask from './components/teacher/AssignTask';
import AssignProject from './components/teacher/AssignProject';
import TeacherAttendance from './components/teacher/TeacherAttendance';
import TeacherGrades from './components/teacher/TeacherGrades';
import TeacherAnnouncements from './components/teacher/TeacherAnnouncements';
import AssignSyllabus from './components/teacher/AssignSyllabus';
import AssignSyllabusDetail from './components/teacher/AssignSyllabusDetail';
import TeacherStudents from './pages/TeacherStudents';
import TeacherStudentAttendance from './components/teacher/TeacherStudentAttendance';

/* LMS */
import LMSManagement from './pages/LMSManagement';
import StudentLMS from './pages/StudentLMS';

export default function App() {
  return (
    <AuthProvider>
      <PwaUpdatePrompt />
      <Routes>
        {/* ─── PUBLIC ─────────────────────────────────────────────────────── */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="/private-policy" element={<PolicyPage />} />

        {/* ─── STUDENT AUTH ────────────────────────────────────────────────── */}
        <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
        <Route path="/student/signup" element={<PublicOnlyRoute><StudentSignup /></PublicOnlyRoute>} />

        {/* ─── STUDENT PROTECTED ───────────────────────────────────────────── */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="announcements" element={<StudentAnnouncements />} />
          <Route path="lms" element={<StudentLMS />} />
          <Route path="projects" element={<Projects />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<StudentProfile />} />
          <Route path="lecture-scheduler" element={<LectureSchedule />} />
          <Route path="attendance" element={<StudentAttendancePunch />} />
        </Route>

        {/* ─── ADMIN AUTH ──────────────────────────────────────────────────── */}


        {/* ─── ADMIN PROTECTED ─────────────────────────────────────────────── */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="student-management" element={<AdminStudents />} />
          <Route path="student management" element={<TeacherStudents />} />
          <Route path="students" element={<AdminStudents />} />
          <Route path="teacher-management" element={<AdminTeachers />} />
          <Route path="batch-management" element={<AdminBatches />} />
          <Route path="project-tracking" element={<ProjectTracking />} />
          <Route path="project-tracking/batch/:batchId" element={<AdminBatchDetail />} />
          <Route path="project-tracking/student/:studentId" element={<StudentProjectsView />} />
          <Route path="add-reports" element={<AddReport2 />} />
          <Route path="performance-reports" element={<AdminPerformanceReports />} />
          <Route path="all-reports" element={<AllReports />} />
          <Route path="lms" element={<LMSManagement />} />
          <Route path="syllabus" element={<AdminSyllabusManagement />} />
          <Route path="assign-task" element={<AssignTask />} />
          <Route path="all-reports" element={<AllReports />} />
          <Route path="drafts" element={<Drafts />} />
          <Route path="analytics" element={<AdminAnalytics />} />
          <Route path="lecture-scheduler" element={<LectureSchedule />} />
          <Route path="exam-schedule" element={<ExamSchedule />} />
          <Route path="exam-results" element={<ExamResults />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="teacher/:teacherId" element={<TeacherProfileView />} />
          <Route path="student/:studentId" element={<StudentProfileView />} />
          <Route path="student-attendance" element={<AdminStudentAttendance />} />
          <Route path="settings" element={<AdminInstituteSettings />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
        </Route>

        {/* ─── TEACHER AUTH ────────────────────────────────────────────────── */}

        <Route path="/teacher/register" element={<PublicOnlyRoute><TeacherRegister /></PublicOnlyRoute>} />

        {/* ─── TEACHER PROTECTED ───────────────────────────────────────────── */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<TeacherSyllabusDashboard />} />
          <Route path="performance" element={<TeacherStudentProgress />} />
          <Route path="profile" element={<TeacherProfile />} />
          <Route path="assign-task" element={<AssignTask />} />
          <Route path="lms" element={<LMSManagement />} />
          <Route path="assign-project" element={<AssignProject />} />
          <Route path="assign-syllabus" element={<AssignSyllabus />} />
          <Route path="assign-syllabus/:batchId" element={<AssignSyllabusDetail />} />
          <Route path="add-reports" element={<AddReport2 />} />
          <Route path="performance-reports" element={<TeacherPerformanceReports />} />
          <Route path="drafts" element={<Drafts />} />
          <Route path="student-management" element={<TeacherStudents />} />
          <Route path="student management" element={<TeacherStudents />} />
          <Route path="students" element={<TeacherStudents />} />
          <Route path="student/:studentId" element={<StudentProfileView />} />
          <Route path="project-tracking" element={<ProjectTracking />} />
          <Route path="project-tracking/batch/:batchId" element={<AdminBatchDetail />} />
          <Route path="project-tracking/student/:studentId" element={<StudentProjectsView />} />
          <Route path="attendance" element={<TeacherAttendance />} />
          <Route path="student-attendance" element={<TeacherStudentAttendance />} />
          <Route path="grades" element={<TeacherGrades />} />
          <Route path="announcements" element={<TeacherAnnouncements />} />
          <Route path="lecture-scheduler" element={<LectureSchedule />} />
          <Route path="exam-schedule" element={<ExamSchedule />} />
          <Route path="exam-results" element={<ExamResults />} />
          <Route path="leaderboard" element={<Leaderboard />} />
        </Route>

        {/* ─── FALLBACK ────────────────────────────────────────────────────── */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AuthProvider>
  );
}
