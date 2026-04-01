import {
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  Users,
  BookOpen,
  FolderGit2,
  Notebook,
  FileText,
  BarChart3,
} from "lucide-react";

export const adminSidebarItems = [
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Students",
    path: "/admin/student-management",
    icon: GraduationCap,
  },
  {
    name: "Teachers",
    path: "/admin/teacher-management",
    icon: UserCheck,
  },
  {
    name: "Batches",
    path: "/admin/batch-management",
    icon: Users,
  },
  {
    name: "Syllabus Tracker",
    path: "/admin/syllabus",
    icon: BookOpen,
  },
  {
    name: "Project Tracking",
    path: "/admin/project-tracking",
    icon: FolderGit2,
  },
  {
    name: "Add Reports",
    path: "/admin/add-reports",
    icon: Notebook,
  },
  {
    name:"Drafts",
    path: "/admin/drafts",
    icon: FileText,
  },
  {
    name:"Analytics",
    path:"/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "All Reports",
    path: "/admin/all-reports",
    icon: Notebook,
  },
];
