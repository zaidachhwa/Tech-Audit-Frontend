// src/pages/AdminStudents.jsx
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  BookOpen,
  Hash,
  ChevronDown,
} from "lucide-react";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [status, setStatus] = useState({});

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editStudent, setEditStudent] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch_name: "",
    batch_no: "",
  });

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, [page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/students/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`);
      setStudents(res.data?.students || []);
      setTotal(res.data?.total || 0);
      setStatus({
        totalActive: res.data?.totalActive,
        totalPending: res.data?.totalPending,
      });
    } catch {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const fetchBatches = async () => {
    try {
      const res = await API.get("/batches/public");
      setBatches(res.data || []);
    } catch {}
  };

  const handleEditClick = (student) => {
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

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await API.delete(`/students/delete/${deleteConfirm}`);
      toast.success("Student deleted successfully");
      setDeleteConfirm(null);
      fetchStudents();
    } catch {
      toast.error("Failed to delete student");
    }
  };

  const toggleApproval = async (studentId, currentStatus) => {
    try {
      await API.patch(`/students/update/${studentId}`, {
        isActive: !currentStatus,
      });
      toast.success(currentStatus ? "Student deactivated" : "Student approved");
      fetchStudents();
    } catch {
      toast.error("Failed to update student status");
    }
  };

  const updateStudent = async (e) => {
    e.preventDefault();
    if (!editStudent) return;
    try {
      const updateData = { name: form.name, batch_name: form.batch_name, batch_no: form.batch_no };
      if (form.password) updateData.password = form.password;
      
      await API.patch(`/students/update/${editStudent._id}`, updateData);
      toast.success("Student updated successfully");
      setShowEdit(false);
      fetchStudents();
    } catch {
      toast.error("Failed to update student");
    }
  };

  const createStudent = async (e) => {
    e.preventDefault();
    try {
      await API.post("/students/register", form);
      toast.success("Student created successfully");
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", batch_name: "", batch_no: "" });
      fetchStudents();
    } catch {
      toast.error("Failed to create student");
    }
  };

  const filteredStudents =
    statusFilter === "active"
      ? students.filter((s) => s.isActive)
      : statusFilter === "pending"
      ? students.filter((s) => !s.isActive)
      : students;

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans] space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] font-bold text-[#1B2B4B]">Students</h1>
          <p className="text-[13px] text-[#64748B]">
            Manage student accounts and permissions
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchStudents}
            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#F8FAFC]"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Plus size={14} /> Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: total },
          { label: "Active", value: status?.totalActive },
          { label: "Pending", value: status?.totalPending },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-[11px] uppercase text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-extrabold text-[#1B2B4B]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Student</th>
              <th className="px-6 py-3 text-left">Email</th>
              <th className="px-6 py-3 text-left">Batch</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredStudents.map((s, i) => (
              <tr key={s._id} className={`${i % 2 === 0 ? "" : "bg-[#F8FAFC]"}`}>
                <td className="px-6 py-4 flex items-center gap-3">
                  <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-sm font-bold">
                    {s.name.charAt(0)}
                  </div>
                  <Link to={`/admin/student/${s._id}`} className="text-[14px] text-[#1B2B4B] font-medium">
                    {s.name}
                  </Link>
                </td>

                <td className="px-6 py-4 text-[#64748B] text-[14px]">{s.email}</td>

                <td className="px-6 py-4 text-[#64748B] text-[14px]">
                  {s.batch_name} #{s.batch_no}
                </td>

                <td className="px-6 py-4">
                  <span className={`px-3 py-[3px] rounded-full text-[12px] font-semibold ${
                    s.isActive
                      ? "bg-[#ECFDF5] text-[#065F46]"
                      : "bg-[#EFF6FF] text-[#1E40AF]"
                  }`}>
                    {s.isActive ? "Active" : "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  {!s.isActive && (
                    <button 
                      onClick={() => toggleApproval(s._id, s.isActive)}
                      className="text-[#10B981] hover:bg-[#ECFDF5] p-2 rounded"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {s.isActive && (
                    <button 
                      onClick={() => toggleApproval(s._id, s.isActive)}
                      className="text-[#F59E0B] hover:bg-[#FEF3C7] p-2 rounded"
                    >
                      <XCircle size={14} />
                    </button>
                  )}
                  <button 
                    onClick={() => handleEditClick(s)}
                    className="text-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => setDeleteConfirm(s._id)}
                    className="text-[#EF4444  ] hover:bg-[#FEE2E2] p-2 rounded"
                  >
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Student Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Add Student</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#94A3B8]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Email</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Password</label>
                <input
                  required
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch Name</label>
                  <input
                    required
                    type="text"
                    value={form.batch_name}
                    onChange={(e) => setForm({ ...form, batch_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch No</label>
                  <input
                    required
                    type="text"
                    value={form.batch_no}
                    onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8]"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEdit && editStudent && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Edit Student</h2>
              <button onClick={() => setShowEdit(false)} className="text-[#94A3B8]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={updateStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Name</label>
                <input
                  required
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Email</label>
                <input
                  disabled
                  type="email"
                  value={form.email}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg bg-[#F8FAFC] text-[#64748B]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Password (Leave empty to keep current)</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch Name</label>
                  <input
                    required
                    type="text"
                    value={form.batch_name}
                    onChange={(e) => setForm({ ...form, batch_name: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch No</label>
                  <input
                    required
                    type="text"
                    value={form.batch_no}
                    onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowEdit(false)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8]"
                >
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-[#FEE2E2] text-[#EF4444] rounded-full flex items-center justify-center">
                <AlertCircle size={24} />
              </div>
            </div>

            <h2 className="text-[18px] font-bold text-[#1B2B4B] text-center mb-2">Delete Student?</h2>
            <p className="text-[14px] text-[#64748B] text-center mb-6">
              This action cannot be undone. The student account will be permanently deleted.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2 bg-[#EF4444] text-white rounded-lg font-medium hover:bg-[#DC2626]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}