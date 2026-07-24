import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../shared/DashboardLayout";
import { teacherSidebarItems } from "./TeacherSidebarItems";

const PAGE_LABELS = {
  "/teacher/dashboard":         "Dashboard",
  "/teacher/student-management":"My Students",
  "/teacher/performance":       "Lecture Progress",
  "/teacher/attendance":        "Attendance",
  "/teacher/student-attendance": "Student Attendance",
  "/teacher/lecture-scheduler": "Lecture Scheduler",
  "/teacher/grades":            "Grades",
  "/teacher/announcements":     "Announcements",
  "/teacher/assign-task":       "Assign Homework",
  "/teacher/lms":               "LMS",
  "/teacher/assign-project":    "Assign Project",
  "/teacher/project-tracking":  "Project Tracking",
  "/teacher/assign-syllabus":   "Assign Syllabus",
  "/teacher/add-reports":       "Add Reports",
  "/teacher/drafts":            "Drafts",
  "/teacher/profile":           "Profile",
};

export default function TeacherLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          style: { fontFamily: "'DM Sans', sans-serif", fontSize: 13 },
          duration: 3000,
        }}
      />
      <DashboardLayout
        role="teacher"
        menuItems={teacherSidebarItems}
        user={user}
        logout={logout}
        pageLabelMap={PAGE_LABELS}
      >
        <Outlet />
      </DashboardLayout>
    </>
  );
}
