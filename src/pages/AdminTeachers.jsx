// src/pages/AdminTeachers.jsx
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
  Filter,
  GraduationCap,
} from "lucide-react";

export default function AdminTeachers() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modals
  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

  // ⭐ Added phone field
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    subjects: "",
    phone: "",
  });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teachers/list");
      setTeachers(res.data?.teachers || []);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email, and password are required");
      return;
    }
    try {
      const subjects = form.subjects
        ? form.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await API.post("/teachers/register", {
        name: form.name,
        email: form.email,
        password: form.password,
        subjects,
        phone: form.phone, // ⭐ Added
      });

      toast.success("Teacher created successfully");
      resetForm();
      setShowCreate(false);
      fetchTeachers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create teacher");
    }
  };

  const openEdit = (teacher) => {
    setEditTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: "",
      subjects: teacher.subjects?.join(", ") || "",
      phone: teacher.phone || "", // ⭐ Added
    });
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const subjects = form.subjects
        ? form.subjects
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [];

      await API.patch(`/teachers/update/${editTeacher._id}`, {
        name: form.name,
        email: form.email,
        subjects,
        phone: form.phone, // ⭐ Added
      });

      toast.success("Teacher updated successfully");
      resetForm();
      setShowEdit(false);
      setEditTeacher(null);
      fetchTeachers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update teacher");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this teacher? This action cannot be undone.")) return;
    try {
      await API.delete(`/teachers/delete/${id}`);
      toast.success("Teacher deleted successfully");
      fetchTeachers();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete teacher");
    }
  };

  const handleApprove = async (id) => {
    try {
      await API.patch(`/admin/approve-teacher/${id}`);
      toast.success("Teacher approved");
      fetchTeachers();
    } catch (err) {
      toast.error("Failed to approve teacher");
    }
  };

  const handleReject = async (id) => {
    try {
      await API.patch(`/admin/reject-teacher/${id}`);
      toast.success("Teacher deactivated");
      fetchTeachers();
    } catch (err) {
      toast.error("Failed to deactivate teacher");
    }
  };

  const resetForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      subjects: "",
      phone: "", // ⭐ reset phone
    });
  };

  const getFilteredTeachers = () => {
    let filtered = [...teachers];

    if (search) {
      filtered = filtered.filter(
        (t) =>
          t.name.toLowerCase().includes(search.toLowerCase()) ||
          t.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (statusFilter === "active") {
      filtered = filtered.filter((t) => t.isActive === true);
    } else if (statusFilter === "pending") {
      filtered = filtered.filter((t) => t.isActive === false);
    }

    return filtered;
  };

  const filteredTeachers = getFilteredTeachers();

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.isActive).length,
    pending: teachers.filter((t) => !t.isActive).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* HEADER */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Teachers</h1>
              <p className="text-sm text-gray-500">
                Manage teacher accounts and permissions
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchTeachers}
                disabled={loading}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer"
              >
                <Plus size={18} />
                Add Teacher
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* STATS */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* Total */}
          <StatCard
            label="Total Teachers"
            value={stats.total}
            icon={<GraduationCap className="text-purple-600" size={20} />}
            bg="bg-purple-50"
          />

          {/* Active */}
          <StatCard
            label="Active"
            value={stats.active}
            icon={<CheckCircle className="text-green-600" size={20} />}
            bg="bg-green-50"
          />

          {/* Pending */}
          <StatCard
            label="Pending Approval"
            value={stats.pending}
            icon={<AlertCircle className="text-orange-600" size={20} />}
            bg="bg-orange-50"
          />
        </div>

        {/* FILTERS */}
        <Filters
          search={search}
          setSearch={setSearch}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
        />

        {/* TEACHER TABLE */}
        <TeacherTable
          loading={loading}
          teachers={filteredTeachers}
          onApprove={handleApprove}
          onReject={handleReject}
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <Modal
          title="Add New Teacher"
          onClose={() => {
            setShowCreate(false);
            resetForm();
          }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
            <FormField
              label="Full Name"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <FormField
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />
            <FormField
              label="Password"
              type="password"
              required
              value={form.password}
              onChange={(v) => setForm({ ...form, password: v })}
            />

            {/* ⭐ Phone Field */}
            <FormField
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
              placeholder="9876543210"
            />

            <FormField
              label="Subjects (comma-separated)"
              value={form.subjects}
              onChange={(v) => setForm({ ...form, subjects: v })}
            />

            <ModalActions
              onCancel={() => {
                setShowCreate(false);
                resetForm();
              }}
              submitLabel="Add Teacher"
            />
          </form>
        </Modal>
      )}

      {/* EDIT MODAL */}
      {showEdit && editTeacher && (
        <Modal
          title="Edit Teacher"
          onClose={() => {
            setShowEdit(false);
            setEditTeacher(null);
            resetForm();
          }}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
            <FormField
              label="Full Name"
              required
              value={form.name}
              onChange={(v) => setForm({ ...form, name: v })}
            />
            <FormField
              label="Email Address"
              type="email"
              required
              value={form.email}
              onChange={(v) => setForm({ ...form, email: v })}
            />

            {/* ⭐ Phone Field */}
            <FormField
              label="Phone Number"
              value={form.phone}
              onChange={(v) => setForm({ ...form, phone: v })}
            />

            <FormField
              label="Subjects (comma-separated)"
              value={form.subjects}
              onChange={(v) => setForm({ ...form, subjects: v })}
            />

            <ModalActions
              onCancel={() => {
                setShowEdit(false);
                setEditTeacher(null);
                resetForm();
              }}
              submitLabel="Update Teacher"
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* ------------------------------------------
   UI COMPONENTS (UNCHANGED EXCEPT WHAT NEEDED)
------------------------------------------- */

function StatCard({ label, value, icon, bg }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="text-2xl font-semibold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${bg}`}>{icon}</div>
      </div>
    </div>
  );
}

function Filters({ search, setSearch, statusFilter, setStatusFilter }) {
  return (
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
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
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
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg bg-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="pending">Pending Only</option>
          </select>
        </div>
      </div>
    </div>
  );
}

function TeacherTable({
  loading,
  teachers,
  onApprove,
  onReject,
  onEdit,
  onDelete,
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Teacher
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Phone Number
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Subjects
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
              Status
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <RefreshCw
                  className="animate-spin mx-auto text-gray-400 mb-2"
                  size={24}
                />
                <p className="text-sm text-gray-500">Loading teachers...</p>
              </td>
            </tr>
          ) : teachers.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-12 text-center">
                <GraduationCap
                  className="mx-auto text-gray-300 mb-2"
                  size={32}
                />
                <p className="text-sm text-gray-500">No teachers found</p>
              </td>
            </tr>
          ) : (
            teachers.map((teacher) => (
              <tr key={teacher._id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-purple-600">
                        {teacher.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      {teacher.name}
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4 text-sm text-gray-600">
                  {teacher.email}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {teacher.phone || "Not Added"}
                </td>

                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects?.length > 0 ? (
                      teacher.subjects.slice(0, 2).map((s, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-md border border-purple-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-gray-400">No subjects</span>
                    )}

                    {teacher.subjects?.length > 2 && (
                      <span className="text-xs text-gray-500">
                        +{teacher.subjects.length - 2}
                      </span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                      teacher.isActive
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {teacher.isActive ? (
                      <CheckCircle size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {teacher.isActive ? "Active" : "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4">
                  <div className="flex justify-end gap-2">
                    {!teacher.isActive && (
                      <button
                        onClick={() => onApprove(teacher._id)}
                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md"
                      >
                        <Check size={16} />
                      </button>
                    )}

                    {teacher.isActive && (
                      <button
                        onClick={() => onReject(teacher._id)}
                        className="p-1.5 text-orange-600 hover:bg-orange-50 rounded-md"
                      >
                        <XCircle size={16} />
                      </button>
                    )}

                    <button
                      onClick={() => onEdit(teacher)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md"
                    >
                      <Edit2 size={16} />
                    </button>

                    <button
                      onClick={() => onDelete(teacher._id)}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-md"
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
    </div>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitLabel }) {
  return (
    <div className="flex gap-3 pt-2">
      <button
        type="button"
        onClick={onCancel}
        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
      >
        Cancel
      </button>
      <button
        type="submit"
        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {submitLabel}
      </button>
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
      <label className="block text-sm font-medium mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}
