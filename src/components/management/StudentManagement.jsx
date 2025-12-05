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
} from "lucide-react";

export default function StudentManagement() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Forms
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

      console.log(studentsRes);
      setStudents(studentsRes.data?.students || []);
      setBatches(batchesRes.data?.batches || batchesRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // CREATE
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

  // UPDATE
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

  // DELETE
  const handleDeleteStudent = async (studentId) => {
    if (!confirm("Are you sure you want to delete this student?")) return;

    try {
      await API.delete(`/students/delete/${studentId}`);
      toast.success("Student deleted successfully!");
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to delete student");
    }
  };

  // APPROVE
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

  // REJECT
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

  // Filter and search
  const getFilteredStudents = () => {
    let filtered = [...students];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.batch_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
                <Users size={36} />
                Student Management
              </h1>
              <p className="text-blue-100">
                Manage all students, approvals, and batch assignments
              </p>
            </div>

            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchData}
                disabled={loading}
                className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-xl transition flex items-center gap-2"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
                Refresh
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowAddModal(true)}
                className="bg-white text-blue-600 hover:bg-gray-100 px-4 py-2 rounded-xl font-semibold transition flex items-center gap-2"
              >
                <Plus size={18} />
                Add Student
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            label="Total Students"
            value={stats.total}
            icon={<Users size={20} />}
            color="from-blue-500 to-cyan-500"
          />
          <StatCard
            label="Active Students"
            value={stats.active}
            icon={<CheckCircle size={20} />}
            color="from-green-500 to-emerald-500"
          />
          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={<AlertCircle size={20} />}
            color="from-orange-500 to-amber-500"
          />
        </div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by name, email, or batch..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
              />
            </div>

            {/* Status Filter */}
            <div className="relative w-full md:w-48">
              <Filter
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full pl-12 pr-10 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none appearance-none"
              >
                <option value="all">All Students</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Only</option>
              </select>
              <ChevronDown
                size={18}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              />
            </div>
          </div>
        </motion.div>

        {/* Student List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Users size={20} className="text-blue-600" />
              Students List ({filteredStudents.length})
            </h3>

            {loading ? (
              <LoadingBlock />
            ) : filteredStudents.length === 0 ? (
              <EmptyState searchTerm={searchTerm} filterStatus={filterStatus} />
            ) : (
              <div className="space-y-3">
                {filteredStudents.map((student, index) => (
                  <StudentCard
                    key={student._id}
                    student={student}
                    index={index}
                    onEdit={() => openEditModal(student)}
                    onDelete={() => handleDeleteStudent(student._id)}
                    onApprove={() => handleApproveStudent(student._id)}
                    onReject={() => handleRejectStudent(student._id)}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
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
                icon={<User size={18} />}
              />

              <InputField
                label="Email"
                type="email"
                value={addForm.email}
                onChange={(e) =>
                  setAddForm({ ...addForm, email: e.target.value })
                }
                required
                icon={<Mail size={18} />}
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

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Batch Name"
                  type="text"
                  value={addForm.batch_name}
                  onChange={(e) =>
                    setAddForm({ ...addForm, batch_name: e.target.value })
                  }
                  required
                />

                <InputField
                  label="Batch Number"
                  type="text"
                  value={addForm.batch_no}
                  onChange={(e) =>
                    setAddForm({ ...addForm, batch_no: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
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
                icon={<User size={18} />}
              />

              <InputField
                label="Email"
                type="email"
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                required
                icon={<Mail size={18} />}
              />

              <div className="grid grid-cols-2 gap-3">
                <InputField
                  label="Batch Name"
                  type="text"
                  value={editForm.batch_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch_name: e.target.value })
                  }
                  required
                />

                <InputField
                  label="Batch Number"
                  type="text"
                  value={editForm.batch_no}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch_no: e.target.value })
                  }
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold hover:from-blue-700 hover:to-indigo-700 transition"
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

function StatCard({ label, value, icon, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className={`bg-gradient-to-br ${color} rounded-2xl shadow-lg p-6 text-white`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-white/80 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <div className="bg-white/20 p-3 rounded-xl">{icon}</div>
      </div>
    </motion.div>
  );
}

function LoadingBlock() {
  return (
    <div className="py-20 flex flex-col items-center justify-center">
      <RefreshCw className="animate-spin text-blue-600 mb-4" size={40} />
      <p className="text-gray-600">Loading students...</p>
    </div>
  );
}

function EmptyState({ searchTerm, filterStatus }) {
  return (
    <div className="py-16 text-center">
      <div className="bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
        <Users size={48} className="text-blue-600" />
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">
        No Students Found
      </h3>
      <p className="text-gray-600">
        {searchTerm
          ? `No students match "${searchTerm}"`
          : filterStatus !== "all"
          ? `No ${filterStatus} students found`
          : "No students have been added yet"}
      </p>
    </div>
  );
}

function StudentCard({
  student,
  index,
  onEdit,
  onDelete,
  onApprove,
  onReject,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-gradient-to-br from-white to-gray-50 border-2 border-gray-100 rounded-xl p-4 hover:shadow-lg transition-all"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-500 p-3 rounded-xl">
            <User size={24} className="text-white" />
          </div>

          <div className="flex-1">
            <h4 className="font-bold text-gray-800 text-lg">{student.name}</h4>
            <p className="text-sm text-gray-600 flex items-center gap-2">
              <Mail size={14} />
              {student.email}
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-lg font-semibold flex items-center gap-1">
                <BookOpen size={12} />
                {student.batch_name} #{student.batch_no}
              </span>
              <span
                className={`text-xs px-2 py-1 rounded-lg font-semibold ${
                  student.isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
                }`}
              >
                {student.isActive ? "Active" : "Pending"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!student.isActive && (
            <button
              onClick={onApprove}
              className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition"
              title="Approve Student"
            >
              <Check size={18} />
            </button>
          )}

          {student.isActive && (
            <button
              onClick={onReject}
              className="p-2 rounded-lg bg-orange-50 text-orange-600 hover:bg-orange-100 transition"
              title="Deactivate Student"
            >
              <XCircle size={18} />
            </button>
          )}

          <button
            onClick={onEdit}
            className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition"
            title="Edit Student"
          >
            <Edit2 size={18} />
          </button>

          <button
            onClick={onDelete}
            className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
            title="Delete Student"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition"
          >
            <X size={24} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function InputField({ label, type, value, onChange, required, icon }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          className={`w-full ${
            icon ? "pl-12" : "pl-4"
          } pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none`}
        />
      </div>
    </div>
  );
}
