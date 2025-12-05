// src/components/admin/StudentManagement.jsx
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

      console.log("Students:", studentsRes.data);
      console.log("Batches:", batchesRes.data);

      setStudents(studentsRes.data?.students || []);
      setBatches(batchesRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // Get unique batch names
  const getUniqueBatchNames = () => {
    const uniqueNames = [...new Set(batches.map((b) => b.batch_name))];
    return uniqueNames.sort();
  };

  // Get batch numbers for selected batch name
  const getBatchNumbers = (batchName) => {
    if (!batchName) return [];
    const numbers = batches
      .filter((b) => b.batch_name === batchName)
      .map((b) => b.batch_no)
      .sort((a, b) => a - b);
    return numbers;
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/students/register", addForm);
      toast.success("Student added successfully!");
      setShowAddModal(false);
      setAddForm({
        name: "",
        email: "",
        password: "",
        batch_name: "",
        batch_no: "",
      });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to add student");
    }
  };

  const handleEditStudent = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/students/update/${selectedStudent._id}`, editForm);
      toast.success("Student updated successfully!");
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to update student");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (!window.confirm("Are you sure you want to delete this student?")) return;

    try {
      await API.delete(`/students/delete/${studentId}`);
      toast.success("Student deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete student");
    }
  };

  const handleApproveStudent = async (studentId) => {
    try {
      await API.patch(`/admin/approve-student/${studentId}`);
      toast.success("Student approved successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to approve student");
    }
  };

  const handleRejectStudent = async (studentId) => {
    try {
      await API.patch(`/admin/reject-student/${studentId}`);
      toast.success("Student rejected successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to reject student");
    }
  };

  const openEditModal = (student) => {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      email: student.email,
      batch_name: student.batch_name,
      batch_no: student.batch_no,
    });
    setShowEditModal(true);
  };

  const getFilteredStudents = () => {
    let filtered = [...students];

    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus === "active") {
      filtered = filtered.filter((s) => s.isActive === true);
    } else if (filterStatus === "pending") {
      filtered = filtered.filter((s) => s.isActive === false);
    }

    return filtered;
  };

  const filteredStudents = getFilteredStudents();

  const stats = {
    total: students.length,
    active: students.filter((s) => s.isActive).length,
    pending: students.filter((s) => !s.isActive).length,
  };

  return (
    <div className="min-h-screen bg-white flex">
      <Toaster position="top-right" />

      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-gray-50 border-r border-gray-200 transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-0 -translate-x-full lg:translate-x-0 lg:w-16"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <GraduationCap size={18} className="text-white" />
                </div>
                <span className="font-semibold text-gray-900">Admin Panel</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition hidden lg:block"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
          </div>

          <nav className="flex-1 py-6 px-3 overflow-y-auto">
            <div className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Icon
                      size={20}
                      className={isActive ? "text-indigo-600" : "text-gray-500"}
                    />
                    {sidebarOpen && (
                      <span className="font-medium text-sm">{item.name}</span>
                    )}
                    {isActive && (
                      <div className="absolute right-0 w-1 h-full bg-indigo-600 rounded-l-full" />
                    )}
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="border-t border-gray-200 p-4">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-600 transition group"
            >
              <LogOut size={20} className="text-gray-500 group-hover:text-red-600" />
              {sidebarOpen && <span className="font-medium text-sm">Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-64" : "lg:ml-16"
        }`}
      >
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-30">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition lg:hidden"
            >
              <Menu size={20} className="text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                Student Management
              </h1>
              <p className="text-sm text-gray-500">
                Manage students, approvals & batches
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-2 hover:bg-gray-100 rounded-lg transition"
              title="Refresh"
            >
              <RefreshCw
                size={18}
                className={`text-gray-600 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition shadow-sm"
            >
              <Plus size={18} />
              <span>Add Student</span>
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="p-6 max-w-7xl mx-auto space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              label="Total Students"
              value={stats.total}
              icon={Users}
              bgColor="bg-blue-50"
              textColor="text-blue-600"
            />
            <StatCard
              label="Active Students"
              value={stats.active}
              icon={CheckCircle}
              bgColor="bg-green-50"
              textColor="text-green-600"
            />
            <StatCard
              label="Pending Approval"
              value={stats.pending}
              icon={AlertCircle}
              bgColor="bg-yellow-50"
              textColor="text-yellow-600"
            />
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search by name, email, or batch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                />
              </div>

              <div className="relative w-full md:w-48">
                <Filter
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition"
                >
                  <option value="all">All Students</option>
                  <option value="active">Active Only</option>
                  <option value="pending">Pending Only</option>
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
            </div>
          </div>

          {/* Student List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Students List
                </h3>
                <span className="text-sm text-gray-500">
                  {filteredStudents.length} students
                </span>
              </div>

              {loading ? (
                <LoadingBlock />
              ) : filteredStudents.length === 0 ? (
                <EmptyState searchTerm={searchTerm} filterStatus={filterStatus} />
              ) : (
                <div className="space-y-3">
                  {filteredStudents.map((student) => (
                    <StudentCard
                      key={student._id}
                      student={student}
                      onEdit={() => openEditModal(student)}
                      onDelete={() => handleDeleteStudent(student._id)}
                      onApprove={() => handleApproveStudent(student._id)}
                      onReject={() => handleRejectStudent(student._id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <Modal title="Add New Student" onClose={() => setShowAddModal(false)}>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <InputField
                label="Name"
                type="text"
                value={addForm.name}
                onChange={(e) =>
                  setAddForm({ ...addForm, name: e.target.value })
                }
                required
              />

              <InputField
                label="Email"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                required
              />

              <InputField
                label="Password"
                type="password"
                value={addForm.password}
                onChange={(e) =>
                  setAddForm({ ...addForm, password: e.target.value })
                }
                required
              />

              {/* BATCH NAME DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={addForm.batch_name}
                    onChange={(e) => {
                      setAddForm({
                        ...addForm,
                        batch_name: e.target.value,
                        batch_no: "", // Reset batch number when batch name changes
                      });
                    }}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition"
                  >
                    <option value="">-- Select Batch Name --</option>
                    {getUniqueBatchNames().map((batchName) => (
                      <option key={batchName} value={batchName}>
                        {batchName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* BATCH NUMBER DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={addForm.batch_no}
                    onChange={(e) => {
                      setAddForm({ ...addForm, batch_no: e.target.value });
                    }}
                    required
                    disabled={!addForm.batch_name}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {addForm.batch_name
                        ? "-- Select Batch Number --"
                        : "-- Select Batch Name First --"}
                    </option>
                    {getBatchNumbers(addForm.batch_name).map((batchNo) => (
                      <option key={batchNo} value={batchNo}>
                        Batch #{batchNo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Add Student
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && selectedStudent && (
          <Modal title="Edit Student" onClose={() => setShowEditModal(false)}>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <InputField
                label="Name"
                type="text"
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                required
              />

              <InputField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
              />

              {/* BATCH NAME DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <BookOpen
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={editForm.batch_name}
                    onChange={(e) => {
                      setEditForm({
                        ...editForm,
                        batch_name: e.target.value,
                        batch_no: "", // Reset batch number when batch name changes
                      });
                    }}
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition"
                  >
                    <option value="">-- Select Batch Name --</option>
                    {getUniqueBatchNames().map((batchName) => (
                      <option key={batchName} value={batchName}>
                        {batchName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              {/* BATCH NUMBER DROPDOWN */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Batch Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <select
                    value={editForm.batch_no}
                    onChange={(e) => {
                      setEditForm({ ...editForm, batch_no: e.target.value });
                    }}
                    required
                    disabled={!editForm.batch_name}
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none appearance-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {editForm.batch_name
                        ? "-- Select Batch Number --"
                        : "-- Select Batch Name First --"}
                    </option>
                    {getBatchNumbers(editForm.batch_name).map((batchNo) => (
                      <option key={batchNo} value={batchNo}>
                        Batch #{batchNo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition"
                >
                  Update Student
                </button>
              </div>
            </form>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============ HELPER COMPONENTS ============

function StatCard({ label, value, icon: Icon, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition">
      <div className="flex items-center justify-between mb-4">
        <div className={`${bgColor} p-3 rounded-lg`}>
          <Icon size={24} className={textColor} />
        </div>
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}

function LoadingBlock() {
  return (
    <div className="py-12 flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mb-4" />
      <p className="text-gray-600">Loading students...</p>
    </div>
  );
}

function EmptyState({ searchTerm, filterStatus }) {
  return (
    <div className="py-12 text-center">
      <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
        <Users size={32} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-1">
        No Students Found
      </h3>
      <p className="text-sm text-gray-500">
        {searchTerm
          ? `No students match "${searchTerm}"`
          : filterStatus !== "all"
          ? `No ${filterStatus} students found`
          : "No students have been added yet"}
      </p>
    </div>
  );
}

function StudentCard({ student, onEdit, onDelete, onApprove, onReject }) {
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-indigo-200 hover:shadow-sm transition">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <User size={20} className="text-indigo-600" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-gray-900 truncate">
              {student.name}
            </h4>
            <p className="text-sm text-gray-500 truncate flex items-center gap-1">
              <Mail size={12} />
              {student.email}
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded font-medium inline-flex items-center gap-1">
                <BookOpen size={10} />
                {student.batch_name} #{student.batch_no}
              </span>
              <span
                className={`text-xs px-2 py-0.5 rounded font-medium ${
                  student.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {student.isActive ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          {!student.isActive && (
            <button
              onClick={onApprove}
              className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 transition"
              title="Approve"
            >
              <Check size={16} />
            </button>
          )}

          {student.isActive && (
            <button
              onClick={onReject}
              className="p-2 rounded-lg bg-yellow-100 text-yellow-700 hover:bg-yellow-200 transition"
              title="Deactivate"
            >
              <XCircle size={16} />
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
            title="Edit"
          >
            <Edit2 size={16} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 transition"
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl sticky top-0 z-10">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, type, value, onChange, required }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
      />
    </div>
  );
}