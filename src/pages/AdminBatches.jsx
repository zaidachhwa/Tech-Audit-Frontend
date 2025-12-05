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

export default function AdminBatches() {
  const [batches, setBatches] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);

  // Modals
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await API.get("/students/list");
      setStudents(res.data?.students || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.batch_name || !form.batch_no) {
      toast.error("Batch name and number are required");
      return;
    }
    try {
      await API.post("/batches/create", {
        batch_name: form.batch_name,
        batch_no: Number(form.batch_no),
      });
      toast.success("Batch created successfully");
      resetForm();
      setShowCreate(false);
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create batch");
    }
  };

  const openEdit = (batch) => {
    setSelectedBatch(batch);
    setForm({
      batch_name: batch.batch_name,
      batch_no: batch.batch_no,
    });
    setShowEdit(true);
  };

const handleUpdate = async (e) => {
  e.preventDefault();
  try {
    await API.put(`/batches/${selectedBatch._id}`, {
      batch_name: form.batch_name,
      batch_no: Number(form.batch_no),
    });

    toast.success("Batch updated successfully");
    resetForm();
    setShowEdit(false);
    setSelectedBatch(null);
    fetchBatches();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed to update batch"
    );
  }
};



const handleDelete = async (id) => {
  if (!window.confirm("Delete this batch? This action cannot be undone."))
    return;

  try {
    await API.delete(`/batches/${id}`);
    toast.success("Batch deleted successfully");
    fetchBatches();
  } catch (err) {
    toast.error(
      err?.response?.data?.message || "Failed to delete batch"
    );
  }
};



  const openAddStudent = (batch) => {
    setSelectedBatch(batch);
    setAddStudentForm({ studentId: "" });
    setShowAddStudent(true);
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    if (!addStudentForm.studentId) {
      toast.error("Please select a student");
      return;
    }
    try {
      await API.put(`/batches/${selectedBatch._id}/add-student`, {
        studentId: addStudentForm.studentId,
      });
      toast.success("Student added to batch");
      setShowAddStudent(false);
      setAddStudentForm({ studentId: "" });
      setSelectedBatch(null);
      fetchBatches();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add student");
    }
  };

  const resetForm = () => {
    setForm({ batch_name: "", batch_no: "" });
  };

  const getFilteredBatches = () => {
    if (!search) return batches;
    return batches.filter(
      (b) =>
        b.batch_name.toLowerCase().includes(search.toLowerCase()) ||
        String(b.batch_no).includes(search)
    );
  };

  const filteredBatches = getFilteredBatches();
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const stats = {
    total: batches.length,
    totalStudents: batches.reduce(
      (sum, b) => sum + (b.students?.length || 0),
      0
    ),
    avgStudents:
      batches.length > 0
        ? Math.round(
            batches.reduce((sum, b) => sum + (b.students?.length || 0), 0) /
              batches.length
          )
        : 0,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Batches</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Manage batch information and student assignments
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchBatches}
                disabled={loading}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <RefreshCw
                  size={18}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
              <button
                onClick={() => setShowCreate(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <Plus size={18} />
                Create Batch
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
                  Total Batches
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stats.total}
                </p>
              </div>
              <div className="p-3 bg-indigo-50 rounded-lg">
                <Layers className="text-indigo-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Total Students
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stats.totalStudents}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Users className="text-blue-600" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Avg Students/Batch
                </p>
                <p className="text-2xl font-semibold text-gray-900 mt-1">
                  {stats.avgStudents}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Users className="text-green-600" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
          <div className="relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by batch name or number..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Batch Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <RefreshCw
                      className="animate-spin mx-auto text-gray-400 mb-2"
                      size={24}
                    />
                    <p className="text-sm text-gray-500">Loading batches...</p>
                  </td>
                </tr>
              ) : filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center">
                    <Layers className="mx-auto text-gray-300 mb-2" size={32} />
                    <p className="text-sm text-gray-500">No batches found</p>
                  </td>
                </tr>
              ) : (
                filteredBatches.map((batch) => (
                  <tr
                    key={batch._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                          <Layers size={16} className="text-indigo-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">
                          {batch.batch_name}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        #{batch.batch_no}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {batch.students?.length || 0} students
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openAddStudent(batch)}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Add Student"
                        >
                          <Plus size={16} />
                        </button>
                        <button
                          onClick={() => openEdit(batch)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(batch._id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
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
          {!loading && filteredBatches.length > 0 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between bg-gray-50">
              <p className="text-sm text-gray-600">
                Showing {(page - 1) * limit + 1} to{" "}
                {Math.min(page * limit, total)} of {total} batches
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
          title="Create New Batch"
          onClose={() => {
            setShowCreate(false);
            resetForm();
          }}
        >
          <form onSubmit={handleCreate} className="space-y-4">
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
                Create Batch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Modal */}
      {showEdit && selectedBatch && (
        <Modal
          title="Edit Batch"
          onClose={() => {
            setShowEdit(false);
            setSelectedBatch(null);
            resetForm();
          }}
        >
          <form onSubmit={handleUpdate} className="space-y-4">
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
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowEdit(false);
                  setSelectedBatch(null);
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
                Update Batch
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Student Modal */}
      {showAddStudent && selectedBatch && (
        <Modal
          title={`Add Student to ${selectedBatch.batch_name}`}
          onClose={() => {
            setShowAddStudent(false);
            setSelectedBatch(null);
            setAddStudentForm({ studentId: "" });
          }}
        >
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Student <span className="text-red-500">*</span>
              </label>
              <select
                value={addStudentForm.studentId}
                onChange={(e) =>
                  setAddStudentForm({ studentId: e.target.value })
                }
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Choose a student...</option>
                {students
                  .filter((s) => !selectedBatch.students?.includes(s._id))
                  .map((student) => (
                    <option key={student._id} value={student._id}>
                      {student.name} - {student.email}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddStudent(false);
                  setSelectedBatch(null);
                  setAddStudentForm({ studentId: "" });
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
