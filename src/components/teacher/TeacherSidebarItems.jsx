import {
  LayoutDashboard,
  BarChart3,
  User,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  TrendingUp,
  BookOpen,
} from "lucide-react";

export const teacherSidebarItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/teacher/dashboard",
  },
  {
    name: "Student Progress",
    icon: BarChart3,
    path: "/teacher/performance",
  },
  {
    name: "Attendance",
    icon: CalendarCheck,
    path: "/teacher/attendance",
  },
  {
    name: "Grades",
    icon: TrendingUp,
    path: "/teacher/grades",
  },
  {
    name: "Announcements",
    icon: Megaphone,
    path: "/teacher/announcements",
  },
  {
    name: "Assign Task",
    icon: ClipboardList,
    path: "/teacher/assign-task",
  },
  {
    name: "Assign Syllabus",
    icon: BookOpen,
    path: "/teacher/assign-syllabus",
  },
  {
    name: "Profile",
    icon: User,
    path: "/teacher/profile",
  },
];