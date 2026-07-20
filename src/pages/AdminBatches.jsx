// src/pages/AdminBatches.jsx
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
  Users,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

export default function AdminBatches() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAssignTeachers, setShowAssignTeachers] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState([]);

  const [form, setForm] = useState({
    batch_name: "",
    batch_no: "",
  });

  const [addStudentForm, setAddStudentForm] = useState({
    studentId: "",
  });

  useEffect(() => {
    fetchBatches();
    fetchStudents();
    fetchTeachers();
  }, [page]);

  const fetchBatches = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/batches?page=${page}&limit=${limit}`);
      setBatches(res.data?.batches || []);
      setTotal(res.data?.total || 0);
    } catch {
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students/list");
      setStudents(res.data?.students || []);
    } catch { }
  };

  const fetchTeachers = async () => {
    try {
      const res = await API.get("/teachers/list");
      setTeachers(res.data?.teachers || []);
    } catch { }
  };

  const openAssignTeachers = (batch) => {
    setSelectedBatch(batch);
    const currentIds = (batch.teachers || []).map((t) => t._id || t);
    setSelectedTeacherIds(currentIds);
    setShowAssignTeachers(true);
  };

  const handleSaveTeachers = async (e) => {
    e.preventDefault();
    if (!selectedBatch) return;
    try {
      await API.put(`/batches/${selectedBatch._id}/assign-teachers`, {
        teacherIds: selectedTeacherIds,
      });
      toast.success("Teachers assigned to batch successfully!");
      setShowAssignTeachers(false);
      fetchBatches();
    } catch {
      toast.error("Failed to assign teachers to batch");
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.batch_name || !form.batch_no) {
      toast.error("Batch name and number are required");
      return;
    }
    try {
      await API.post("/batches/create", form);
      toast.success("Batch created");
      resetForm();
      setShowCreate(false);
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Batch already exists");
    }
  };

  const openEdit = (batch) => {
    setSelectedBatch(batch);
    setForm(batch);
    setShowEdit(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/batches/${selectedBatch._id}`, form);
      toast.success("Updated");
      resetForm();
      setShowEdit(false);
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete batch?")) return;
    try {
      await API.delete(`/batches/${id}`);
      toast.success("Deleted");
      fetchBatches();
    } catch {
      toast.error("Delete failed");
    }
  };

  const openAddStudent = (batch) => {
    setSelectedBatch(batch);
    setShowAddStudent(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!addStudentForm.studentId) {
      toast.error("Select student");
      return;
    }
    try {
      await API.put(`/batches/${selectedBatch._id}/add-student`, addStudentForm);
      toast.success("Added");
      setShowAddStudent(false);
      fetchBatches();
    } catch {
      toast.error("Failed");
    }
  };

  const resetForm = () => {
    setForm({ batch_name: "", batch_no: "" });
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.batch_name.toLowerCase().includes(search.toLowerCase()) ||
      String(b.batch_no).includes(search)
  );

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const stats = {
    total: batches.length,
    totalStudents: batches.reduce((s, b) => s + (b.students?.length || 0), 0),
    avgStudents:
      batches.length > 0
        ? Math.round(
          batches.reduce((s, b) => s + (b.students?.length || 0), 0) /
          batches.length
        )
        : 0,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-[20px] font-bold text-[#1B2B4B]">Batches</h1>
          <p className="text-[13px] text-[#64748B]">
            Manage batch information and students
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchBatches}
            className="bg-white border border-[#E2E8F0] px-3 py-2 rounded-lg hover:bg-[#F8FAFC]"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-sm hover:bg-[#1E40AF] transition-colors cursor-pointer"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Batches", value: stats.total },
          { label: "Total Students", value: stats.totalStudents },
          { label: "Avg Students / Batch", value: stats.avgStudents },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-extrabold text-[#1B2B4B] mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by batch name or number..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm bg-[#F8FAFC]"
          />
        </div>
      </div>

      {/* Table & Mobile Card View */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        {/* Desktop View */}
        <div className="hidden md:block">
          <table className="w-full">
            <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
              <tr>
                <th className="px-6 py-3.5 text-left font-bold">Batch</th>
                <th className="px-6 py-3.5 text-left font-bold">No</th>
                <th className="px-6 py-3.5 text-left font-bold">Students</th>
                <th className="px-6 py-3.5 text-left font-bold">Assigned Teachers</th>
                <th className="px-6 py-3.5 text-right font-bold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                    No batches found.
                  </td>
                </tr>
              ) : (
                filteredBatches.map((b) => (
                  <tr key={b._id} className="hover:bg-slate-50/50 transition duration-150">
                    <td className="px-6 py-4 text-[13px] font-bold text-[#2563EB] cursor-pointer hover:underline" onClick={() => navigate(`/admin/project-tracking/batch/${b._id}`)}>
                      {b.batch_name}
                    </td>
                    <td className="px-6 py-4 text-[13px] text-[#64748B]">#{b.batch_no}</td>
                    <td className="px-6 py-4 text-[13px] text-[#64748B] font-semibold">
                      {b.students?.length || 0} students
                    </td>
                    <td className="px-6 py-4 text-[13px]">
                      {b.teachers && b.teachers.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {b.teachers.map((t) => (
                            <span key={t._id || t} className="bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full text-[11px] font-medium">
                              {t.name || "Teacher"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[#94A3B8] text-xs italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => openAssignTeachers(b)}
                          className="bg-indigo-50 text-indigo-600 hover:bg-indigo-100 border border-indigo-200 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                          title="Assign Teachers to Batch"
                        >
                          <Users size={13} /> Assign Teachers
                        </button>
                        <button onClick={() => openEdit(b)} className="text-[#2563EB] border border-[#EFF6FF] hover:bg-[#EFF6FF] p-1.5 rounded-lg transition cursor-pointer" title="Edit Batch"> <Edit2 size={14} /> </button>
                        <button onClick={() => handleDelete(b._id)} className="text-[#EF4444] border border-[#FEE2E2] hover:bg-[#FEE2E2] p-1.5 rounded-lg transition cursor-pointer" title="Delete Batch"> <Trash2 size={14} /> </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-slate-100 p-4 space-y-4 bg-slate-50/50">
          {filteredBatches.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-slate-500">
              No batches found.
            </div>
          ) : (
            filteredBatches.map((b) => (
              <div key={b._id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-sm first:mt-0">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <button
                      onClick={() => navigate(`/admin/project-tracking/batch/${b._id}`)}
                      className="text-sm font-bold text-[#2563EB] hover:underline text-left block cursor-pointer border-none bg-transparent"
                    >
                      {b.batch_name}
                    </button>
                    <span className="text-[11px] text-[#64748B] block mt-0.5 font-medium">Batch No: #{b.batch_no}</span>
                  </div>
                  <span className="bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                    {b.students?.length || 0} Enrolled
                  </span>
                </div>
                <div className="text-xs text-[#64748B]">
                  <strong>Assigned Teachers:</strong>{" "}
                  {b.teachers && b.teachers.length > 0
                    ? b.teachers.map((t) => t.name || "Teacher").join(", ")
                    : "None"}
                </div>
                <div className="flex gap-2 pt-2.5 border-t border-slate-100">
                  <button
                    onClick={() => openAssignTeachers(b)}
                    className="flex-1 py-2 px-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-100 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Users size={14} /> Assign Teachers
                  </button>
                  <button
                    onClick={() => openEdit(b)}
                    className="py-2 px-2.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-lg hover:bg-blue-100 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(b._id)}
                    className="py-2 px-2.5 bg-red-50 border border-red-200 text-[#EF4444] rounded-lg hover:bg-red-100 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer shrink-0"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Create Batch</h2>
              <button onClick={() => setShowCreate(false)} className="text-[#94A3B8]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
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
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch Number</label>
                <input
                  required
                  type="text"
                  value={form.batch_no}
                  onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
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

      {/* Edit Batch Modal */}
      {showEdit && selectedBatch && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-md w-full">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-[18px] font-bold text-[#1B2B4B]">Edit Batch</h2>
              <button onClick={() => setShowEdit(false)} className="text-[#94A3B8]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
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
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch Number</label>
                <input
                  required
                  type="text"
                  value={form.batch_no}
                  onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
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

      {/* Assign Teachers Modal */}
      {showAssignTeachers && selectedBatch && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full border border-[#E2E8F0] shadow-2xl">
            <div className="flex justify-between items-center mb-4 border-b border-[#E2E8F0] pb-3">
              <div>
                <h2 className="text-base font-bold text-[#1B2B4B]">Assign Teachers to Batch</h2>
                <p className="text-xs text-[#64748B]">{selectedBatch.batch_name} (#{selectedBatch.batch_no})</p>
              </div>
              <button onClick={() => setShowAssignTeachers(false)} className="text-[#94A3B8] hover:text-[#1B2B4B]">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTeachers} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase mb-2">Select Teachers</label>
                <div className="max-h-60 overflow-y-auto border border-[#E2E8F0] rounded-lg p-2 bg-slate-50 space-y-1">
                  {teachers.length === 0 ? (
                    <p className="text-xs text-slate-400 p-2">No teachers found</p>
                  ) : (
                    teachers.map((t) => {
                      const isChecked = selectedTeacherIds.includes(t._id);
                      return (
                        <label key={t._id} className="flex items-center gap-3 p-2 rounded hover:bg-white transition cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedTeacherIds([...selectedTeacherIds, t._id]);
                              } else {
                                setSelectedTeacherIds(selectedTeacherIds.filter((id) => id !== t._id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                          />
                          <div>
                            <p className="font-bold text-[#1B2B4B]">{t.name}</p>
                            <p className="text-[10px] text-[#64748B]">{t.email}</p>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignTeachers(false)}
                  className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg text-xs font-semibold hover:bg-[#F8FAFC]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-xs font-semibold hover:bg-[#1D4ED8]"
                >
                  Save Allocation
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