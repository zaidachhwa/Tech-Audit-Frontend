// src/pages/AdminTeachers.jsx

import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Check,
  XCircle,
  X,
} from "lucide-react";

export default function AdminTeachers() {
  const navigate = useNavigate();

  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editTeacher, setEditTeacher] = useState(null);

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
    } catch (error) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: was DELETE /teachers/${id}, backend expects DELETE /teachers/delete/:teacherId
  const handleDelete = async (id) => {
    if (!window.confirm("Delete teacher account?")) return;
    try {
      await API.delete(`/teachers/delete/${id}`);
      toast.success("Teacher deleted");
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

  // ✅ FIXED: was PATCH /teachers/toggle/${id}, backend route is correct but missing verifyToken — keeping same
  const handleToggleStatus = async (id) => {
    try {
      await API.patch(`/teachers/toggle/${id}`);
      toast.success("Status updated");
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error("Status update failed");
    }
  };

  const handleEdit = (teacher) => {
    setEditTeacher(teacher);
    setForm({
      name: teacher.name,
      email: teacher.email,
      password: "",
      subjects: teacher.subjects?.join(", ") || "",
      phone: teacher.phone || "",
    });
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/teachers/register", {
        ...form,
        subjects: form.subjects.split(",").map((s) => s.trim()),
      });
      toast.success("Teacher created");
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", subjects: "", phone: "" });
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Create failed");
    }
  };

  // ✅ FIXED: was PUT /teachers/${id}, backend expects PATCH /teachers/update/:teacherId
  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.patch(`/teachers/update/${editTeacher._id}`, {
        name: form.name,
        phone: form.phone,
        subjects: form.subjects.split(",").map((s) => s.trim()),
        ...(form.password ? { password: form.password } : {}),
      });
      toast.success("Teacher updated");
      setShowEdit(false);
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    const term = search.toLowerCase();
    if (
      search &&
      !t.name.toLowerCase().includes(term) &&
      !t.email.toLowerCase().includes(term)
    ) {
      return false;
    }
    if (statusFilter === "active") return t.isActive;
    if (statusFilter === "pending") return !t.isActive;
    return true;
  });

  const stats = {
    total: teachers.length,
    active: teachers.filter((t) => t.isActive).length,
    pending: teachers.filter((t) => !t.isActive).length,
  };

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans] space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] font-bold text-[#1B2B4B]">Teachers</h1>
          <p className="text-[13px] text-[#64748B]">
            Manage teacher accounts and permissions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={fetchTeachers}
            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#F8FAFC]"
          >
            <RefreshCw size={14} />
          </button>
          <button
            onClick={() => {
              setForm({ name: "", email: "", password: "", subjects: "", phone: "" });
              setShowCreate(true);
            }}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1"
          >
            <Plus size={14} /> Add Teacher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total",   value: stats.total },
          { label: "Active",  value: stats.active },
          { label: "Pending", value: stats.pending },
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
            placeholder="Search by name or email..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-[#64748B] text-sm">Loading...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] text-sm">No teachers found.</div>
        ) : (
          <table className="w-full">
            <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase">
              <tr>
                <th className="px-6 py-3 text-left">Teacher</th>
                <th className="px-6 py-3 text-left">Email</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Subjects</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((t, i) => (
                <tr key={t._id} className={`${i % 2 === 0 ? "" : "bg-[#F8FAFC]"} border-t border-[#F1F5F9]`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-sm font-bold">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <button
                        onClick={() => navigate(`/admin/teacher/${t._id}`)}
                        className="font-bold text-[#2563EB] hover:underline transition-colors"
                      >
                        {t.name}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#64748B] text-[14px]">{t.email}</td>
                  <td className="px-6 py-4 text-[#64748B] text-[14px]">{t.phone || "—"}</td>
                  <td className="px-6 py-4 text-[#64748B] text-[14px]">{t.subjects?.slice(0, 2).join(", ") || "—"}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-[3px] rounded-full text-[12px] font-semibold ${
                      t.isActive ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]"
                    }`}>
                      {t.isActive ? "Active" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Toggle active/pending */}
                      {!t.isActive ? (
                        <button
                          onClick={() => handleToggleStatus(t._id)}
                          title="Approve"
                          className="text-[#10B981] hover:bg-[#ECFDF5] p-2 rounded"
                        >
                          <Check size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleToggleStatus(t._id)}
                          title="Deactivate"
                          className="text-[#F59E0B] hover:bg-[#FEF3C7] p-2 rounded"
                        >
                          <XCircle size={14} />
                        </button>
                      )}
                      {/* Edit */}
                      <button
                        onClick={() => handleEdit(t)}
                        title="Edit"
                        className="text-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded"
                      >
                        <Edit2 size={14} />
                      </button>
                      {/* Delete */}
                      <button
                        onClick={() => handleDelete(t._id)}
                        title="Delete"
                        className="text-[#EF4444] hover:bg-[#FEE2E2] p-2 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Create Modal ── */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Add Teacher</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#94A3B8] hover:text-[#1B2B4B]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              {["name", "email", "password", "phone"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1 capitalize">{field}</label>
                  <input
                    required={field !== "phone"}
                    type={field === "password" ? "password" : "text"}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Subjects (comma separated)</label>
                <input
                  placeholder="e.g. React, Node.js"
                  value={form.subjects}
                  onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowCreate(false)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8]">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {showEdit && editTeacher && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full shadow-2xl border border-[#E2E8F0]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Edit Teacher</h2>
              <button onClick={() => setShowEdit(false)} className="text-[#94A3B8] hover:text-[#1B2B4B]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              {["name", "email", "password", "phone"].map((field) => (
                <div key={field}>
                  <label className="block text-sm font-medium text-[#1B2B4B] mb-1 capitalize">
                    {field === "password" ? "New Password (leave blank to keep)" : field}
                  </label>
                  <input
                    disabled={field === "email"}
                    type={field === "password" ? "password" : "text"}
                    value={form[field]}
                    onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                    className={`w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm ${
                      field === "email" ? "bg-[#F8FAFC] text-[#64748B] cursor-not-allowed" : ""
                    }`}
                  />
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Subjects (comma separated)</label>
                <input
                  value={form.subjects}
                  onChange={(e) => setForm({ ...form, subjects: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowEdit(false)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg font-medium hover:bg-[#1D4ED8]">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}