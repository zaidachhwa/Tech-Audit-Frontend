import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../shared/DashboardLayout";
import {
  LayoutDashboard,
  Layers,
  BarChart2,
  User,
  ClipboardList,
  Megaphone,
  CalendarCheck,
  LibraryBig,
  Fingerprint,
  Award,
} from "lucide-react";

const STUDENT_SIDEBAR_ITEMS = [
  { name: "Dashboard",         path: "/student/dashboard",         icon: LayoutDashboard },
  { name: "My Homework",       path: "/student/assignments",       icon: ClipboardList },
  { name: "Exam Results",      path: "/student/exams",             icon: Award },
  { name: "Lecture Scheduler", path: "/student/lecture-scheduler", icon: CalendarCheck },
  { name: "My Attendance",     path: "/student/attendance",        icon: Fingerprint },
  { name: "Announcements",     path: "/student/announcements",     icon: Megaphone },
  { name: "LMS",               path: "/student/lms",               icon: LibraryBig },
  { name: "Projects",          path: "/student/projects",          icon: Layers },
  { name: "Reports",           path: "/student/reports",           icon: BarChart2 },
  { name: "Profile",           path: "/student/profile",           icon: User },
];

const PAGE_LABELS = {
  "/student/dashboard":         "Dashboard",
  "/student/assignments":       "My Homework",
  "/student/exams":             "Exam Results",
  "/student/exam-results":      "Exam Results",
  "/student/results":           "Exam Results",
  "/student/lecture-scheduler": "Lecture Schedule",
  "/student/attendance":        "My Attendance",
  "/student/announcements":     "Announcements",
  "/student/lms":               "Learning Resources",
  "/student/projects":          "My Projects",
  "/student/reports":           "My Reports",
  "/student/profile":           "My Profile",
};

export default function StudentLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <DashboardLayout
        role="student"
        menuItems={STUDENT_SIDEBAR_ITEMS}
        user={user}
        logout={logout}
        pageLabelMap={PAGE_LABELS}
      >
        <Outlet />
      </DashboardLayout>
    </>
  );
}
