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
  ClipboardList,
  CalendarDays,
  LibraryBig,
  Fingerprint,
  Settings,
  Megaphone,
  Calendar,
  Trophy,
  Award,
  TrendingUp
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
    name: "Lecture Scheduler",
    path: "/admin/lecture-scheduler",
    icon: CalendarDays,
  },
  {
    name: "Student Attendance",
    path: "/admin/student-attendance",
    icon: Fingerprint,
  },
  {
    name: "Assign Homework",
    path: "/admin/assign-task",
    icon: ClipboardList,
  },
  {
    name: "LMS",
    path: "/admin/lms",
    icon: LibraryBig,
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
    name: "Performance Reports",
    path: "/admin/performance-reports",
    icon: BarChart3,
  },
  {
    name: "Drafts",
    path: "/admin/drafts",
    icon: FileText,
  },
  {
    name: "Exam Schedule",
    path: "/admin/exam-schedule",
    icon: Calendar,
  },
  {
    name: "Exam Results",
    path: "/admin/exam-results",
    icon: Award,
  },
  {
    name: "Exam Report",
    path: "/admin/student-exam-report",
    icon: TrendingUp,
  },
  {
    name: "Leaderboard",
    path: "/admin/leaderboard",
    icon: Trophy,
  },
  {
    name: "Analytics",
    path: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "All Reports",
    path: "/admin/all-reports",
    icon: Notebook,
  },
  {
    name: "Institute Settings",
    path: "/admin/settings",
    icon: Settings,
  },
  {
    name: "Announcements",
    path: "/admin/announcements",
    icon: Megaphone,
  },
];
