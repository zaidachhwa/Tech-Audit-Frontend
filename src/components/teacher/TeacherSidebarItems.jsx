import { BookOpen, BarChart3, User,ClipboardList, LayoutDashboard } from "lucide-react";

export const teacherSidebarItems = [
    {
        name: "Dashboard",
        icon: BookOpen,
        path: "/teacher/dashboard",
    },
    {
        name: "Student Progress",
        icon: BarChart3,
        path: "/teacher/performance",
    },
    {
        name: "Profile",
        icon: User,
        path: "/teacher/profile",
    },
     {
    name: "Assign Task", // 👈 NEW
    path: "/teacher/assign-task",
    icon: ClipboardList,
  },
];