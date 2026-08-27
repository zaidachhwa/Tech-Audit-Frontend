import {
  LayoutDashboard,
  BarChart3,
  User,
  ClipboardList,
  CalendarCheck,
  Megaphone,
  TrendingUp,
  BookOpen,
  Notebook,
  FileText,
  FolderGit2,
  GraduationCap,
  LibraryBig,
  Fingerprint,
  Calendar,
  Trophy,
  Award
} from "lucide-react";

export const teacherSidebarItems = [
  {
    name: "Dashboard",
    icon: LayoutDashboard,
    path: "/teacher/dashboard",
  },
  {
    name: "Students",
    icon: GraduationCap,
    path: "/teacher/student-management",
  },
  {
    name: "Lecture Progress",
    icon: BarChart3,
    path: "/teacher/performance",
  },
  {
    name: "Attendance",
    icon: CalendarCheck,
    path: "/teacher/attendance",
  },
  {
    name: "Student Attendance",
    icon: Fingerprint,
    path: "/teacher/student-attendance",
  },
  {
    name: "Lecture Scheduler",
    icon: CalendarCheck,
    path: "/teacher/lecture-scheduler",
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
    name: "Assign Homework",
    icon: ClipboardList,
    path: "/teacher/assign-task",
  },
  {
    name: "LMS",
    icon: LibraryBig,
    path: "/teacher/lms",
  },
  {
    name: "Assign Project",
    icon: FolderGit2,
    path: "/teacher/assign-project",
  },
  {
    name: "Project Tracking",
    icon: FolderGit2,
    path: "/teacher/project-tracking",
  },
  {
    name: "Assign Syllabus",
    icon: BookOpen,
    path: "/teacher/assign-syllabus",
  },
  {
    name: "Add Reports",
    icon: Notebook,
    path: "/teacher/add-reports",
  },
  {
    name: "Performance Reports",
    icon: TrendingUp,
    path: "/teacher/performance-reports",
  },
  {
    name: "Drafts",
    icon: FileText,
    path: "/teacher/drafts",
  },
  {
    name: "Exam Schedule",
    icon: Calendar,
    path: "/teacher/exam-schedule",
  },
  {
    name: "Exam Results",
    icon: Award,
    path: "/teacher/exam-results",
  },
  {
    name: "Leaderboard",
    icon: Trophy,
    path: "/teacher/leaderboard",
  },
  {
    name: "Profile",
    icon: User,
    path: "/teacher/profile",
  },
];
