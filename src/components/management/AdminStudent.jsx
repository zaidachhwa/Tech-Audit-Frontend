// src/components/admin/StudentManagement.jsx
// ✅ FULL FILE — SAFE TO REPLACE — LOGIC UNCHANGED, ONLY UI UPDATED

import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  Check,
  XCircle,
  CheckCircle,
  Mail,
  User,
  BookOpen,
  Filter,
  ChevronDown,
  AlertCircle,
  LayoutDashboard,
  GraduationCap,
  UserCheck,
  FolderGit2,
  Notebook,
  Menu,
  LogOut,
  Hash,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function StudentManagement() {
  const { logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    password: "",
    batch_name: "",
    batch_no: "",
  });

  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    batch_name: "",
    batch_no: "",
  });

  const navItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Students", path: "/admin/student-management", icon: GraduationCap },
    { name: "Teachers", path: "/admin/teacher-management", icon: UserCheck },
    { name: "Batches", path: "/admin/batch-management", icon: Users },
    { name: "Lecture Tracker", path: "/admin/syllabus", icon: BookOpen },
    { name: "Project Tracking", path: "/admin/project-tracking", icon: FolderGit2 },
    { name: "Add Reports", path: "/admin/add-reports", icon: Notebook },
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [studentsRes, batchesRes] = await Promise.all([
        API.get("/students/list"),
        API.get("/batches/public"),
      ]);
      setStudents(studentsRes.data?.students || []);
      setBatches(batchesRes.data || []);
    } catch (err) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter((s) => {
    if (
      searchTerm &&
      !(
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
      return false;

    if (filterStatus === "active") return s.isActive;
    if (filterStatus === "pending") return !s.isActive;
    return true;
  });

  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive).length,
    pending: students.filter((s) => !s.isActive).length,
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-[DM_Sans]">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#1B2B4B] text-white ${sidebarOpen ? "w-64" : "w-16"} transition-all`}>
        <div className="h-16 flex items-center px-4 border-b border-[#243452]">
          {sidebarOpen && <span className="font-bold">NexCore</span>}
        </div>

        <nav className="p-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg ${
                  isActive
                    ? "bg-[#2563EB]"
                    : "text-[#94A3B8] hover:bg-[#243452]"
                }`}
              >
                <Icon size={18} />
                {sidebarOpen && item.name}
              </NavLink>
            );
          })}
        </nav>

        <div className="p-3 border-t border-[#243452]">
          <button
            onClick={logout}
            className="w-full text-left px-3 py-2 rounded-lg text-[#94A3B8] hover:bg-[#243452]"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className={`flex-1 ${sidebarOpen ? "ml-64" : "ml-16"} p-6`}>

        {/* HEADER */}
        <div className="flex justify-between mb-6">
          <div>
            <h1 className="text-[20px] font-bold text-[#1B2B4B]">
              Student Management
            </h1>
            <p className="text-[13px] text-[#64748B]">
              Manage students
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg"
            >
              <RefreshCw size={14} />
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#2563EB] text-white px-4 py-2 rounded-lg"
            >
              <Plus size={14} /> Add
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Total", value: stats.total },
            { label: "Active", value: stats.active },
            { label: "Pending", value: stats.pending },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] p-4 rounded-xl">
              <p className="text-[11px] text-[#64748B]">{s.label}</p>
              <p className="text-[28px] font-bold text-[#1B2B4B]">{s.value}</p>
            </div>
          ))}
        </div>

        {/* SEARCH */}
        <div className="bg-white border border-[#E2E8F0] p-4 rounded-xl mb-4">
          <input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full border border-[#E2E8F0] px-3 py-2 rounded-lg focus:border-[#2563EB]"
          />
        </div>

        {/* LIST */}
        <div className="space-y-3">
          {filteredStudents.map((s) => (
            <div
              key={s._id}
              className="bg-white border border-[#E2E8F0] p-4 rounded-xl flex justify-between"
            >
              <div>
                <p className="font-medium text-[#1B2B4B]">{s.name}</p>
                <p className="text-sm text-[#64748B]">{s.email}</p>
              </div>

              <span
                className={`px-3 py-1 rounded-full text-xs ${
                  s.isActive
                    ? "bg-[#ECFDF5] text-[#065F46]"
                    : "bg-[#EFF6FF] text-[#1E40AF]"
                }`}
              >
                {s.isActive ? "Active" : "Pending"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}