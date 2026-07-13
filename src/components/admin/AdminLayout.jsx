import { Outlet } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "../shared/DashboardLayout";
import { adminSidebarItems } from "./sidebarItems";

const PAGE_LABELS = {
  "/admin/dashboard":          "Dashboard",
  "/admin/student-management": "Manage Students",
  "/admin/teacher-management": "Manage Teachers",
  "/admin/batch-management":   "Batch Management",
  "/admin/project-tracking":   "Project Tracking",
  "/admin/add-reports":        "Add Reports",
  "/admin/assign-task":        "Assign Homework",
  "/admin/lms":                "LMS",
  "/admin/syllabus":           "Syllabus Tracker",
  "/admin/all-reports":        "All Reports",
  "/admin/drafts":             "Drafts",
  "/admin/analytics":          "Analytics",
  "/admin/lecture-scheduler":  "Lecture Scheduler",
};

export default function AdminLayout() {
  const { user, logout } = useAuth();

  return (
    <>
      <Toaster position="top-right" />
      <DashboardLayout
        role="admin"
        menuItems={adminSidebarItems}
        user={user}
        logout={logout}
        pageLabelMap={PAGE_LABELS}
      >
        <Outlet />
      </DashboardLayout>
    </>
  );
}
