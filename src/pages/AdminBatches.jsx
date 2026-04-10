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
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  const [showCreate, setShowCreate] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState(null);

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
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans] space-y-6">

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
            className="bg-[#2563EB] text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 whitespace-nowrap shadow-sm hover:bg-[#1E40AF] transition-colors"
          >
            <Plus size={16} strokeWidth={3} />
            <span>Create</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Batches", value: stats.total },
          { label: "Students", value: stats.totalStudents },
          { label: "Avg/Batch", value: stats.avgStudents },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4">
            <p className="text-[11px] uppercase text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-extrabold text-[#1B2B4B]">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase">
            <tr>
              <th className="px-6 py-3 text-left">Batch</th>
              <th className="px-6 py-3 text-left">No</th>
              <th className="px-6 py-3 text-left">Students</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {filteredBatches.map((b, i) => (
              <tr key={b._id} className={`${i % 2 === 0 ? "" : "bg-[#F8FAFC]"}`}>
                <td className="px-6 py-4 text-[14px] font-bold text-[#2563EB] cursor-pointer hover:underline" onClick={() => navigate(`/admin/project-tracking/batch/${b._id}`)}>
                  {b.batch_name}
                </td>
                <td className="px-6 py-4 text-[14px] text-[#64748B]">#{b.batch_no}</td>
                <td className="px-6 py-4 text-[14px] text-[#64748B]">
                  {b.students?.length || 0}
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(b)} className="text-[#2563EB] hover:bg-[#EFF6FF] p-2 rounded"> <Edit2 size={14} /> </button>
                  <button onClick={() => handleDelete(b._id)} className="text-[#EF4444] hover:bg-[#FEE2E2] p-2 rounded"> <Trash2 size={14} /> </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

      <Toaster position="top-right" />
    </div>
  );
}