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
  Upload,
  Download,
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
  const [approvalConfirm, setApprovalConfirm] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    batch_name: "",
    batch_no: "",
  });

  // Bulk Import States
  const [showImport, setShowImport] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importCourse, setImportCourse] = useState("");
  const [importBatch, setImportBatch] = useState("");
  const [coursesList, setCoursesList] = useState([]);
  const [batchesList, setBatchesList] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  // Fetch courses list for dropdown
  const fetchCoursesList = async () => {
    try {
      const res = await API.get("/batches/names");
      setCoursesList(res.data || []);
    } catch (err) {
      toast.error("Failed to load courses");
    }
  };

  // Fetch batches for selected course
  const fetchBatchesList = async (courseName) => {
    try {
      const res = await API.get(`/batches/numbers?batch_name=${encodeURIComponent(courseName)}`);
      setBatchesList(res.data || []);
    } catch (err) {
      toast.error("Failed to load batches");
    }
  };

  useEffect(() => {
    if (showImport) {
      fetchCoursesList();
      setImportFile(null);
      setImportCourse("");
      setImportBatch("");
      setImportResult(null);
      setBatchesList([]);
    }
  }, [showImport]);

  const handleCourseChange = (course) => {
    setImportCourse(course);
    setImportBatch("");
    setBatchesList([]);
    if (course) {
      fetchBatchesList(course);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a valid CSV file (.csv)");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("File size exceeds 2 MB limit");
      return;
    }

    setImportFile(file);
  };

  const downloadTemplate = () => {
    const headers = ["name", "email", "phone"];
    const rows = [
      ["Aayush Sharma", "aayush.sharma@example.com", "9876543210"],
      ["Riya Verma", "riya.verma@example.com", "9876543211"]
    ];
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportSubmit = async (e) => {
    e.preventDefault();
    if (!importCourse || !importBatch) {
      toast.error("Please select a Course and a Batch");
      return;
    }
    if (!importFile) {
      toast.error("Please select a CSV file");
      return;
    }

    setImporting(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const csvData = event.target.result;
        const res = await API.post("/students/bulk-import", {
          batch_name: importCourse,
          batch_no: importBatch,
          csvData
        });

        setImportResult(res.data);
        if (res.data.successCount > 0) {
          toast.success(`Successfully imported ${res.data.successCount} students!`);
          fetchStudents();
        } else {
          toast.error("Failed to import students. Check row-wise errors.");
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Import failed. Please try again.");
      } finally {
        setImporting(false);
      }
    };
    reader.onerror = () => {
      toast.error("Error reading file");
      setImporting(false);
    };
    reader.readAsText(importFile);
  };

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

  const toggleApproval = (studentId, currentStatus, name) => {
    setApprovalConfirm({ studentId, currentStatus, name });
  };

  const executeToggleApproval = async (studentId, currentStatus) => {
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
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <Plus size={14} /> Add Student
          </button>

          <button
            onClick={() => setShowImport(true)}
            className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
          >
            <Upload size={14} /> Bulk Import
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
                  <Link to={`/admin/student/${s._id}`} className="text-[14px] text-[#2563EB] font-bold hover:underline">
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
                      onClick={() => toggleApproval(s._id, s.isActive, s.name)}
                      className="text-[#10B981] hover:bg-[#ECFDF5] p-2 rounded"
                    >
                      <Check size={14} />
                    </button>
                  )}
                  {s.isActive && (
                    <button 
                      onClick={() => toggleApproval(s._id, s.isActive, s.name)}
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

      {/* Approval Confirmation Modal */}
      {approvalConfirm && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-sm w-full">
            <div className="flex justify-center mb-4">
              <div className={`w-12 h-12 ${
                approvalConfirm.currentStatus ? "bg-[#FEF3C7] text-[#D97706]" : "bg-[#ECFDF5] text-[#10B981]"
              } rounded-full flex items-center justify-center`}>
                <AlertCircle size={24} />
              </div>
            </div>

            <h2 className="text-[18px] font-bold text-[#1B2B4B] text-center mb-2">
              {approvalConfirm.currentStatus ? "Deactivate Student?" : "Approve Student?"}
            </h2>
            <p className="text-[14px] text-[#64748B] text-center mb-6">
              Are you sure you want to {approvalConfirm.currentStatus ? "deactivate" : "approve"}{" "}
              <span className="font-bold text-[#1B2B4B]">{approvalConfirm.name}</span>?
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setApprovalConfirm(null)}
                className="flex-1 px-4 py-2 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg font-medium hover:bg-[#F8FAFC]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const { studentId, currentStatus } = approvalConfirm;
                  setApprovalConfirm(null);
                  await executeToggleApproval(studentId, currentStatus);
                }}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium ${
                  approvalConfirm.currentStatus 
                    ? "bg-[#D97706] hover:bg-[#B45309]" 
                    : "bg-[#10B981] hover:bg-[#059669]"
                }`}
              >
                {approvalConfirm.currentStatus ? "Deactivate" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Import Modal */}
      {showImport && (
        <div className="fixed inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Upload size={20} />
                </div>
                <div>
                  <h2 className="text-[18px] font-bold text-[#1B2B4B]">Bulk Student Import</h2>
                  <p className="text-[12px] text-[#64748B]">Upload student details using a CSV file</p>
                </div>
              </div>
              <button 
                onClick={() => setShowImport(false)} 
                className="text-[#94A3B8] hover:text-[#64748B] transition-colors"
                disabled={importing}
              >
                <X size={20} />
              </button>
            </div>

            {!importResult ? (
              <form onSubmit={handleImportSubmit} className="space-y-6">
                
                {/* Course and Batch Dropdowns */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5 flex items-center gap-1">
                      <BookOpen size={14} className="text-[#64748B]" /> Course
                    </label>
                    <select
                      required
                      value={importCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm text-[#1B2B4B]"
                    >
                      <option value="">-- Select Course --</option>
                      {coursesList.map((course) => (
                        <option key={course} value={course}>
                          {course}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-[#1B2B4B] mb-1.5 flex items-center gap-1">
                      <Hash size={14} className="text-[#64748B]" /> Batch
                    </label>
                    <select
                      required
                      disabled={!importCourse}
                      value={importBatch}
                      onChange={(e) => setImportBatch(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-white border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm text-[#1B2B4B] disabled:bg-[#F8FAFC] disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!importCourse ? "Select Course first" : "-- Select Batch --"}
                      </option>
                      {batchesList.map((batchNo) => (
                        <option key={batchNo} value={batchNo}>
                          Batch {batchNo}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CSV Template Download */}
                <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-lg p-4 flex justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                      <Download size={16} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1E40AF]">CSV Template</h4>
                      <p className="text-[11px] text-[#60A5FA]">Includes mandatory headers: name, email, phone</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={downloadTemplate}
                    className="bg-white hover:bg-blue-50 text-blue-600 border border-blue-200 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Download
                  </button>
                </div>

                {/* Drag and Drop Zone */}
                <div>
                  <label className="block text-sm font-semibold text-[#1B2B4B] mb-2">
                    Upload CSV File
                  </label>
                  <div 
                    onClick={() => document.getElementById("csvFilePicker").click()}
                    className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all ${
                      importFile 
                        ? "border-[#10B981] bg-[#ECFDF5]" 
                        : "border-[#E2E8F0] hover:border-[#2563EB] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    <input
                      id="csvFilePicker"
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    
                    {importFile ? (
                      <>
                        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                          <Check size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-[#065F46] max-w-xs truncate">
                            {importFile.name}
                          </p>
                          <p className="text-xs text-[#047857]">
                            {(importFile.size / 1024).toFixed(1)} KB • Click to change
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-12 h-12 bg-[#F1F5F9] text-[#64748B] rounded-full flex items-center justify-center">
                          <Upload size={24} />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-semibold text-[#1B2B4B]">
                            Click to upload CSV
                          </p>
                          <p className="text-xs text-[#64748B]">
                            Strictly CSV format (.csv) • Max 2 MB
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex gap-3 pt-4 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowImport(false)}
                    disabled={importing}
                    className="flex-1 px-4 py-2.5 border border-[#E2E8F0] text-[#1B2B4B] rounded-lg text-sm font-semibold hover:bg-[#F8FAFC] disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importFile || !importCourse || !importBatch}
                    className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:bg-[#94A3B8] disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    {importing ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" /> Importing...
                      </>
                    ) : (
                      "Import Students"
                    )}
                  </button>
                </div>

              </form>
            ) : (
              
              /* Results Dashboard */
              <div className="space-y-6">
                
                {/* Result Hero */}
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-6 text-center">
                  <div className="flex justify-center gap-6 mb-4">
                    <div className="text-center bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl px-6 py-4 min-w-[120px]">
                      <span className="block text-[32px] font-extrabold text-[#2E7D32]">
                        {importResult.successCount}
                      </span>
                      <span className="text-xs font-semibold text-[#4CAF50] uppercase tracking-wider">
                        Success
                      </span>
                    </div>

                    <div className="text-center bg-[#FFEBEE] border border-[#FFCDD2] rounded-xl px-6 py-4 min-w-[120px]">
                      <span className="block text-[32px] font-extrabold text-[#C62828]">
                        {importResult.failedCount}
                      </span>
                      <span className="text-xs font-semibold text-[#EF5350] uppercase tracking-wider">
                        Failed
                      </span>
                    </div>
                  </div>

                  <h3 className="text-base font-bold text-[#1B2B4B] mb-1">Import Completed</h3>
                  <p className="text-xs text-[#64748B]">
                    Students have been assigned to Course <strong className="text-[#1B2B4B]">{importCourse}</strong>, Batch <strong className="text-[#1B2B4B]">#{importBatch}</strong>
                  </p>
                </div>

                {/* Error Lists */}
                {importResult.errors && importResult.errors.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-[#EF5350] uppercase tracking-wider mb-2">
                      Failed Records ({importResult.failedCount})
                    </label>
                    <div className="border border-[#FEE2E2] rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead className="bg-[#FEF2F2] text-[#991B1B] text-[11px] font-bold uppercase sticky top-0 border-b border-[#FEE2E2]">
                          <tr>
                            <th className="px-4 py-2.5 w-16">Row</th>
                            <th className="px-4 py-2.5">Failure Reason</th>
                          </tr>
                        </thead>
                        <tbody>
                          {importResult.errors.map((err, index) => (
                            <tr key={index} className="border-b border-[#FEE2E2] last:border-b-0 hover:bg-[#FEF2F2]/50 bg-white">
                              <td className="px-4 py-2.5 font-bold text-[#991B1B]">#{err.row}</td>
                              <td className="px-4 py-2.5 text-[#7F1D1D] font-medium">{err.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {importResult.successCount > 0 && importResult.failedCount === 0 && (
                  <div className="bg-[#E8F5E9] border border-[#C8E6C9] rounded-xl p-4 flex items-center gap-3 text-[#2E7D32]">
                    <CheckCircle size={20} />
                    <span className="text-xs font-bold">Awesome! All students imported successfully without any errors.</span>
                  </div>
                )}

                {/* Actions */}
                <div className="pt-4 border-t border-[#F1F5F9] flex justify-end">
                  <button
                    onClick={() => setShowImport(false)}
                    className="px-6 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-lg text-sm font-semibold shadow-sm transition-all cursor-pointer"
                  >
                    Done
                  </button>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}