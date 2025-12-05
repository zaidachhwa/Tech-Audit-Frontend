// src/pages/AdminStudents.jsx
import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  X,
  Check,
  XCircle,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [status, setStatus] = useState({});

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch_name: "",
    batch_no: "",
  });

  useEffect(() => {
    fetchStudents();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get(
        `/students/list?page=${page}&limit=${limit}&search=${encodeURIComponent(
          search
        )}`
      );
      setStudents(res.data?.students || []);
      setTotal(res.data?.total || 0);
      setStatus({
        totalActive: res.data?.totalActive,
        totalPending: res.data?.totalPending,
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.password ||
      !form.batch_name ||
      !form.batch_no
    ) {
      toast.error("All fields are required");
      return;
    }
    try {
      await API.post("/students/register", {
        ...form,
        batch_no: Number(form.batch_no),
      });
      toast.success("Student created successfully");
      resetForm();
      setShowCreate(false);
      fetchStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create student");
    }
  };

  const openEdit = (student) => {
    setEditStudent(student);
    setForm({
      name: student.name,
      email: student.email,
      password: "",
      batch_name: student.batch_name,
      batch_no: student.batch_no,
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/students/update/${editStudent._id}`, {
        name: form.name,
        email: form.email,
        batch_name: form.batch_name,
        batch_no: Number(form.batch_no),
      });
      toast.success("Student updated successfully");
      resetForm();
      setShowEdit(false);
      setEditStudent(null);
      fetchStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update student");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this student? This action cannot be undone.")) return;
    try {
      await API.delete(`/students/delete/${id}`);
      toast.success("Student deleted successfully");
      fetchStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete student");
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/approve-student/${id}`);
      toast.success("Student approved");
      fetchStudents();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to approve student");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.patch(`/admin/reject-student/${id}`);
      toast.success("Student deactivated");
      fetchStudents();
    } catch (err) {
      toast.error(
        err?.response?.data?.message || "Failed to deactivate student"
      );
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      batch_name: "",
      batch_no: "",
    });
  };

  const getFilteredStudents = () => {
    if (statusFilter === "all") return students;
    if (statusFilter === "active") return students.filter((s) => s.isActive);
    if (statusFilter === "pending") return students.filter((s) => !s.isActive);
    return students;
  };

  const filteredStudents = getFilteredStudents();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Students</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage student accounts and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchStudents}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer font-medium"
              >
                <Plus size={18} />
                Add Student
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {total}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <AlertCircle className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Active</p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {status?.totalActive}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="text-green-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Pending Approval
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {status?.totalPending}
                </p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <AlertCircle className="text-orange-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="relative">
              <Filter
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="pending">Pending Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <RefreshCw
                      className="animate-spin mx-auto text-gray-400 mb-2"
                      size={24}
                    />
                    <p className="text-sm text-gray-500">Loading students...</p>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <AlertCircle
                      className="mx-auto text-gray-300 mb-2"
                      size={32}
                    />
                    <p className="text-sm text-gray-500">No students found</p>
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {student.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {student.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600">{student.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900">
                        {student.batch_name} #{student.batch_no}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          student.isActive
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-orange-50 text-orange-700 border border-orange-200"
                        }`}
                      >
                        {student.isActive ? (
                          <>
                            <CheckCircle size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            Pending
                          </>
                        )}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!student.isActive && (
                          <button
                            onClick={() => handleApprove(student._id)}
                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors cursor-pointer"
                            title="Approve"
                          >
                            <Check size={16} />
                          </button>
                        )}
                        {student.isActive && (
                          <button
                            onClick={() => handleReject(student._id)}
                            className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md transition-colors cursor-pointer"
                            title="Deactivate"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(student)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(student._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {!loading && filteredStudents.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} students
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm font-medium text-gray-700">
                  Page {page} of {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <Modal
          title="Add New Student"
          onClose={() => {
            setShowCreate(false);
            resetForm();
          }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              placeholder="John Doe"
              required
            />
            <FormField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              placeholder="john@example.com"
              required
            />
            <FormField
              label="Password"
              type="password"
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
              placeholder="••••••••"
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Batch Name"
                value={form.batch_name}
                onChange={(v) => setForm({ ...form, batch_name: v })}
                placeholder="Morning Batch"
                required
              />
              <FormField
                label="Batch Number"
                type="number"
                value={form.batch_no}
                onChange={(v) => setForm({ ...form, batch_no: v })}
                placeholder="101"
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowCreate(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Student
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && editStudent && (
        <Modal
          title="Edit Student"
          onClose={() => {
            setShowEdit(false);
            setEditStudent(null);
            resetForm();
          }}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField
              label="Full Name"
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
              required
            />
            <FormField
              label="Email Address"
              type="email"
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
              required
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label="Batch Name"
                value={form.batch_name}
                onChange={(v) => setForm({ ...form, batch_name: v })}
                required
              />
              <FormField
                label="Batch Number"
                type="number"
                value={form.batch_no}
                onChange={(v) => setForm({ ...form, batch_no: v })}
                required
              />
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEdit(false);
                  setEditStudent(null);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Update Student
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

// ============ UI Components ============

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function FormField({
  label,
  type = "text",
  value,
  onChange,
  placeholder,
  required,
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}
