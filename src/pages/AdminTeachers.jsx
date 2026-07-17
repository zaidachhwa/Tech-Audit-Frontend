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
    subjects: [], // Array of subjects selected
    phone: "",
  });

  const [availableSubjects, setAvailableSubjects] = useState([]);

  const fetchAvailableSubjects = async () => {
    try {
      const res = await API.get("/subjects");
      const syllabi = res.data?.syllabi || [];
      const subjects = syllabi.map(s => s.subject).filter(Boolean);
      setAvailableSubjects([...new Set(subjects)]);
    } catch (err) {
      console.error("Failed to load subjects:", err);
    }
  };

  useEffect(() => {
    fetchTeachers();
    fetchAvailableSubjects();
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
      subjects: teacher.subjects || [],
      phone: teacher.phone || "",
    });
    setShowEdit(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await API.post("/teachers/register", form);
      toast.success("Teacher created");
      setShowCreate(false);
      setForm({ name: "", email: "", password: "", subjects: [], phone: "" });
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
        subjects: form.subjects,
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
    <div className="space-y-6">

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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Teachers",   value: stats.total },
          { label: "Active Teachers",  value: stats.active },
          { label: "Pending Approvals", value: stats.pending },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-extrabold text-[#1B2B4B] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex flex-col sm:flex-row gap-3 shadow-sm">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by teacher name or email..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm bg-[#F8FAFC]"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white cursor-pointer"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active Only</option>
          <option value="pending">Pending Only</option>
        </select>
      </div>

      {/* Table & Mobile Card View */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="text-center py-12 text-[#64748B] text-sm">Loading...</div>
        ) : filteredTeachers.length === 0 ? (
          <div className="text-center py-12 text-[#64748B] text-sm">No teachers found.</div>
        ) : (
          <>
            {/* Desktop View */}
            <div className="hidden md:block">
              <table className="w-full">
                <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
                  <tr>
                    <th className="px-6 py-3.5 text-left font-bold">Teacher</th>
                    <th className="px-6 py-3.5 text-left font-bold">Email</th>
                    <th className="px-6 py-3.5 text-left font-bold">Phone</th>
                    <th className="px-6 py-3.5 text-left font-bold">Subjects</th>
                    <th className="px-6 py-3.5 text-left font-bold">Status</th>
                    <th className="px-6 py-3.5 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTeachers.map((t) => (
                    <tr key={t._id} className="hover:bg-slate-50/50 transition duration-150">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {t.name.charAt(0).toUpperCase()}
                          </div>
                          <button
                            onClick={() => navigate(`/admin/teacher/${t._id}`)}
                            className="font-bold text-[#2563EB] hover:underline transition-colors cursor-pointer border-none bg-transparent"
                          >
                            {t.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[#64748B] text-[13px]">{t.email}</td>
                      <td className="px-6 py-4 text-[#64748B] text-[13px]">{t.phone || "—"}</td>
                      <td className="px-6 py-4 text-[#64748B] text-[13px]">
                        <div className="flex flex-wrap gap-1">
                          {t.subjects?.map((sub, idx) => (
                            <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                              {sub}
                            </span>
                          )) || "—"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-[3px] rounded-full text-[11px] font-bold ${
                          t.isActive ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]"
                        }`}>
                          {t.isActive ? "Active" : "Pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleToggleStatus(t._id)}
                            title={t.isActive ? "Deactivate Account" : "Approve Account"}
                            className={`p-1.5 rounded-lg border transition cursor-pointer ${
                              t.isActive
                                ? "text-[#F59E0B] border-[#FEF3C7] hover:bg-[#FEF3C7]"
                                : "text-[#10B981] border-[#ECFDF5] hover:bg-[#ECFDF5]"
                            }`}
                          >
                            {t.isActive ? <XCircle size={14} /> : <Check size={14} />}
                          </button>
                          <button
                            onClick={() => handleEdit(t)}
                            title="Edit"
                            className="text-[#2563EB] border border-[#EFF6FF] hover:bg-[#EFF6FF] p-1.5 rounded-lg transition cursor-pointer"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(t._id)}
                            title="Delete"
                            className="text-[#EF4444] border border-[#FEE2E2] hover:bg-[#FEE2E2] p-1.5 rounded-lg transition cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4 bg-slate-50/50">
              {filteredTeachers.map((t) => (
                <div key={t._id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-sm first:mt-0">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                        {t.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <button
                          onClick={() => navigate(`/admin/teacher/${t._id}`)}
                          className="text-sm font-bold text-[#2563EB] hover:underline text-left block truncate cursor-pointer border-none bg-transparent"
                        >
                          {t.name}
                        </button>
                        <span className="text-[10px] text-slate-400 block truncate">ID: {t._id}</span>
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                      t.isActive ? "bg-[#ECFDF5] text-[#065F46]" : "bg-[#FEF3C7] text-[#92400E]"
                    }`}>
                      {t.isActive ? "Active" : "Pending"}
                    </span>
                  </div>

                  <div className="text-xs space-y-1.5 text-slate-600 border-t border-slate-100 pt-2.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Email:</span>
                      <span className="font-semibold text-slate-700 truncate max-w-[180px]">{t.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Phone:</span>
                      <span className="font-semibold text-slate-700">{t.phone || "—"}</span>
                    </div>
                    <div className="flex justify-between items-start">
                      <span className="text-slate-400 font-medium shrink-0">Subjects:</span>
                      <span className="font-semibold text-slate-700 text-right truncate max-w-[180px]">
                        {t.subjects?.join(", ") || "—"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleToggleStatus(t._id)}
                      className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                        t.isActive
                          ? "bg-rose-50 border-rose-200 text-[#EF4444] hover:bg-rose-100"
                          : "bg-emerald-50 border-emerald-200 text-[#10B981] hover:bg-emerald-100"
                      }`}
                    >
                      {t.isActive ? (
                        <>
                          <XCircle size={14} /> Deactivate
                        </>
                      ) : (
                        <>
                          <Check size={14} /> Approve
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(t)}
                      className="flex-1 py-2 px-2.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-lg hover:bg-blue-100 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t._id)}
                      className="p-2 bg-red-50 border border-red-200 text-[#EF4444] rounded-lg hover:bg-red-100 transition flex items-center justify-center cursor-pointer shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
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
                <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">
                  Assign Subjects
                </label>
                {availableSubjects.length === 0 ? (
                  <p className="text-xs text-[#64748B]">No subjects/syllabuses found in system.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-[#E2E8F0] p-3 rounded-lg bg-slate-50">
                    {availableSubjects.map((subject) => {
                      const isChecked = form.subjects.includes(subject);
                      return (
                        <label key={subject} className="flex items-center gap-2 text-xs text-[#1B2B4B] cursor-pointer hover:bg-white p-1 rounded transition select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, subjects: [...form.subjects, subject] });
                              } else {
                                setForm({
                                  ...form,
                                  subjects: form.subjects.filter((s) => s !== subject),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-[#2563EB]"
                          />
                          <span className="truncate">{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {form.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.subjects.map((sub) => (
                      <span key={sub} className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        {sub}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, subjects: form.subjects.filter(s => s !== sub) })}
                          className="hover:text-blue-800 text-[#94A3B8] font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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
                <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5">
                  Assign Subjects
                </label>
                {availableSubjects.length === 0 ? (
                  <p className="text-xs text-[#64748B]">No subjects/syllabuses found in system.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-[#E2E8F0] p-3 rounded-lg bg-slate-50">
                    {availableSubjects.map((subject) => {
                      const isChecked = form.subjects.includes(subject);
                      return (
                        <label key={subject} className="flex items-center gap-2 text-xs text-[#1B2B4B] cursor-pointer hover:bg-white p-1 rounded transition select-none">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setForm({ ...form, subjects: [...form.subjects, subject] });
                              } else {
                                setForm({
                                  ...form,
                                  subjects: form.subjects.filter((s) => s !== subject),
                                });
                              }
                            }}
                            className="w-4 h-4 text-[#2563EB] border-slate-300 rounded focus:ring-[#2563EB]"
                          />
                          <span className="truncate">{subject}</span>
                        </label>
                      );
                    })}
                  </div>
                )}
                {form.subjects.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {form.subjects.map((sub) => (
                      <span key={sub} className="bg-blue-50 text-[#2563EB] border border-blue-200 px-2 py-0.5 rounded-full text-xs font-semibold flex items-center gap-1">
                        {sub}
                        <button
                          type="button"
                          onClick={() => setForm({ ...form, subjects: form.subjects.filter(s => s !== sub) })}
                          className="hover:text-blue-800 text-[#94A3B8] font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
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