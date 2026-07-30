// src/pages/TeacherStudents.jsx
import React, { useEffect, useState } from "react";
import { fileToCleanCSV } from "../utils/excelToCSV";
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

export default function TeacherStudents() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
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
    parentEmail: "",
    parentPhoneNo: "",
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

    const name = file.name.toLowerCase();
    const isValid = name.endsWith(".xlsx") || name.endsWith(".xls") || name.endsWith(".csv");
    if (!isValid) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV (.csv) file");
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
      toast.error("Please select a file");
      return;
    }

    setImporting(true);
    setImportResult(null);

    try {
      const csvData = await fileToCleanCSV(importFile);

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
      toast.error(err.response?.data?.message || err.message || "Import failed. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchBatches();
  }, [page, search, batchFilter]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      let url = `/students/list?page=${page}&limit=${limit}&search=${encodeURIComponent(search)}`;
      if (batchFilter !== "all") {
        const selectedB = batches.find((b) => b._id === batchFilter);
        if (selectedB) {
          url += `&batchName=${encodeURIComponent(selectedB.batch_name)}&batchNumber=${encodeURIComponent(selectedB.batch_no)}`;
        }
      }
      const res = await API.get(url);
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
      parentEmail: student.parentEmail || "",
      parentPhoneNo: student.parentPhoneNo || "",
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
      setForm({ name: "", email: "", password: "", batch_name: "", batch_no: "", parentEmail: "", parentPhoneNo: "" });
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
    <div className="space-y-6">

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
            onClick={() => setShowImport(true)}
            className="bg-[#10B981] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-[#059669] cursor-pointer"
          >
            <Upload size={14} /> Bulk Add
          </button>
          
          <button
            onClick={() => setShowCreate(true)}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 hover:bg-[#1D4ED8] cursor-pointer"
          >
            <Plus size={14} /> Add Student
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Students", value: total },
          { label: "Active Students", value: status?.totalActive },
          { label: "Pending Approvals", value: status?.totalPending },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 shadow-sm">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-extrabold text-[#1B2B4B] mt-1">{s.value || 0}</p>
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
            placeholder="Search by student name or email..."
            className="w-full pl-9 pr-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm bg-[#F8FAFC]"
          />
        </div>

        <select
          value={batchFilter}
          onChange={(e) => { setBatchFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm bg-white cursor-pointer"
        >
          <option value="all">All Batches</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.batch_name} (#{b.batch_no})
            </option>
          ))}
        </select>

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

      {/* Table (Desktop View) */}
      <div className="hidden md:block bg-white border border-[#E2E8F0] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full">
          <thead className="bg-[#F8FAFC] text-[#64748B] text-[11px] uppercase tracking-wider border-b border-[#E2E8F0]">
            <tr>
              <th className="px-6 py-3.5 text-left font-bold">Student</th>
              <th className="px-6 py-3.5 text-left font-bold">Email</th>
              <th className="px-6 py-3.5 text-left font-bold">Batch</th>
              <th className="px-6 py-3.5 text-left font-bold">Status</th>
              <th className="px-6 py-3.5 text-right font-bold">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-500">
                  No students found.
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, i) => (
                <tr key={s._id} className="hover:bg-slate-50/50 transition duration-150">
                  <td className="px-6 py-4 flex items-center gap-3">
                    <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm">
                      {s.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <Link to={`/teacher/student/${s._id}`} className="text-[13px] text-[#2563EB] font-bold hover:underline block truncate">
                        {s.name}
                      </Link>
                      <span className="text-[10px] text-slate-400 block truncate">ID: {s._id}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-[#64748B] text-[13px] truncate max-w-[200px]">{s.email}</td>

                  <td className="px-6 py-4 text-[#64748B] text-[13px] font-medium">
                    {s.batch_name} #{s.batch_no}
                  </td>

                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-[3px] rounded-full text-[11px] font-bold ${
                      s.isActive
                        ? "bg-[#ECFDF5] text-[#065F46]"
                        : "bg-[#EFF6FF] text-[#1E40AF]"
                    }`}>
                      {s.isActive ? "Active" : "Pending"}
                    </span>
                  </td>

                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button 
                        onClick={() => toggleApproval(s._id, s.isActive, s.name)}
                        className={`p-1.5 rounded-lg border transition cursor-pointer ${
                          s.isActive 
                            ? "text-[#F59E0B] border-[#FEF3C7] hover:bg-[#FEF3C7]"
                            : "text-[#10B981] border-[#ECFDF5] hover:bg-[#ECFDF5]"
                        }`}
                        title={s.isActive ? "Deactivate Account" : "Approve Account"}
                      >
                        {s.isActive ? <XCircle size={14} /> : <Check size={14} />}
                      </button>
                      <button 
                        onClick={() => handleEditClick(s)}
                        className="text-[#2563EB] border border-[#EFF6FF] hover:bg-[#EFF6FF] p-1.5 rounded-lg transition cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => setDeleteConfirm(s._id)}
                        className="text-[#EF4444] border border-[#FEE2E2] hover:bg-[#FEE2E2] p-1.5 rounded-lg transition cursor-pointer"
                        title="Delete Student"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Table (Mobile Card View) */}
      <div className="block md:hidden space-y-4">
        {filteredStudents.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 text-center text-sm text-slate-500 shadow-sm">
            No students found.
          </div>
        ) : (
          filteredStudents.map((s) => (
            <div key={s._id} className="bg-white border border-[#E2E8F0] rounded-xl p-4 space-y-3 shadow-sm">
              <div className="flex justify-between items-start gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 bg-[#EFF6FF] text-[#2563EB] rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                    {s.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <Link to={`/teacher/student/${s._id}`} className="text-sm font-bold text-[#2563EB] hover:underline block truncate">
                      {s.name}
                    </Link>
                    <span className="text-[10px] text-slate-400 block truncate">ID: {s._id}</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                  s.isActive
                    ? "bg-[#ECFDF5] text-[#065F46]"
                    : "bg-[#EFF6FF] text-[#1E40AF]"
                }`}>
                  {s.isActive ? "Active" : "Pending"}
                </span>
              </div>

              <div className="text-xs space-y-1.5 text-slate-600 border-t border-slate-100 pt-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Email:</span>
                  <span className="font-semibold text-slate-700 truncate max-w-[200px]">{s.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-medium">Batch:</span>
                  <span className="font-semibold text-slate-700">{s.batch_name} #{s.batch_no}</span>
                </div>
              </div>

              <div className="flex gap-2 pt-2 border-t border-slate-100">
                <button
                  onClick={() => toggleApproval(s._id, s.isActive, s.name)}
                  className={`flex-1 py-2 px-2.5 rounded-lg border text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                    s.isActive
                      ? "bg-rose-50 border-rose-200 text-[#EF4444] hover:bg-rose-100"
                      : "bg-emerald-50 border-emerald-200 text-[#10B981] hover:bg-emerald-100"
                  }`}
                >
                  {s.isActive ? (
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
                  onClick={() => handleEditClick(s)}
                  className="flex-1 py-2 px-2.5 bg-blue-50 border border-blue-200 text-[#2563EB] rounded-lg hover:bg-blue-100 transition text-xs font-bold flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 size={14} /> Edit
                </button>
                <button
                  onClick={() => setDeleteConfirm(s._id)}
                  className="p-2 bg-red-50 border border-red-200 text-[#EF4444] rounded-lg hover:bg-red-100 transition flex items-center justify-center cursor-pointer shrink-0"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6 rounded-xl shadow-sm">
          <div className="flex flex-1 justify-between sm:hidden">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 cursor-pointer"
            >
              Next
            </button>
          </div>
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-xs text-slate-700">
                Showing page <span className="font-semibold">{page}</span> of{" "}
                <span className="font-semibold">{totalPages}</span> (Total <span className="font-semibold">{total}</span> students)
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                {[...Array(totalPages).keys()].map((n) => {
                  const pNum = n + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setPage(pNum)}
                      className={`relative inline-flex items-center px-4 py-2 text-xs font-semibold focus:z-20 cursor-pointer ${
                        pNum === page
                          ? "z-10 bg-[#2563EB] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                          : "text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:outline-offset-0"
                      }`}
                    >
                      {pNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 cursor-pointer"
                >
                  <ChevronRight size={16} />
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Parent's Email (Optional)</label>
                <input
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Parent's Phone No (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={form.parentPhoneNo}
                  onChange={(e) => setForm({ ...form, parentPhoneNo: e.target.value })}
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

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch</label>
                <select
                  required
                  value={form.batch_name && form.batch_no ? `${form.batch_name}#${form.batch_no}` : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setForm({ ...form, batch_name: "", batch_no: "" });
                      return;
                    }
                    const [batch_name, batch_no] = val.split("#");
                    setForm({ ...form, batch_name, batch_no });
                  }}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm bg-white cursor-pointer"
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={`${b.batch_name}#${b.batch_no}`}>
                      {b.batch_name} (Batch {b.batch_no})
                    </option>
                  ))}
                </select>
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
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Parent's Email (Optional)</label>
                <input
                  type="email"
                  value={form.parentEmail}
                  onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Parent's Phone No (WhatsApp)</label>
                <input
                  type="text"
                  placeholder="+919876543210"
                  value={form.parentPhoneNo}
                  onChange={(e) => setForm({ ...form, parentPhoneNo: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB]"
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

              <div>
                <label className="block text-sm font-medium text-[#1B2B4B] mb-1">Batch</label>
                <select
                  required
                  value={form.batch_name && form.batch_no ? `${form.batch_name}#${form.batch_no}` : ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (!val) {
                      setForm({ ...form, batch_name: "", batch_no: "" });
                      return;
                    }
                    const [batch_name, batch_no] = val.split("#");
                    setForm({ ...form, batch_name, batch_no });
                  }}
                  className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563EB] text-sm bg-white cursor-pointer"
                >
                  <option value="">-- Select Batch --</option>
                  {batches.map((b) => (
                    <option key={b._id} value={`${b.batch_name}#${b.batch_no}`}>
                      {b.batch_name} (Batch {b.batch_no})
                    </option>
                  ))}
                </select>
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
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-[#F1F5F9] flex justify-between items-center">
              <div>
                <h2 className="text-[18px] font-bold text-[#1B2B4B] flex items-center gap-2">
                  <Upload size={20} className="text-[#2563EB]" /> Bulk Import Students
                </h2>
                <p className="text-xs text-[#64748B] mt-1">Upload a CSV file to add multiple students to a batch instantly</p>
              </div>
              <button 
                onClick={() => setShowImport(false)}
                className="text-[#94A3B8] hover:bg-[#F1F5F9] p-2 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleImportSubmit} className="space-y-6">
                
                {/* Course & Batch Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1B2B4B] mb-2">Select Course</label>
                    <select
                      required
                      value={importCourse}
                      onChange={(e) => handleCourseChange(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB]"
                    >
                      <option value="">-- Choose Course --</option>
                      {coursesList.map((c, i) => (
                        <option key={i} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1B2B4B] mb-2">Select Batch</label>
                    <select
                      required
                      disabled={!importCourse}
                      value={importBatch}
                      onChange={(e) => setImportBatch(e.target.value)}
                      className="w-full px-3 py-2 border border-[#E2E8F0] rounded-lg text-sm focus:outline-none focus:border-[#2563EB] disabled:opacity-50 disabled:bg-[#F8FAFC]"
                    >
                      <option value="">-- Choose Batch --</option>
                      {batchesList.map((b, i) => (
                        <option key={i} value={b}>Batch #{b}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* CSV File Upload Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <label className="block text-xs font-bold text-[#1B2B4B]">Upload Excel or CSV File</label>
                    <button
                      type="button"
                      onClick={downloadTemplate}
                      className="text-xs text-[#2563EB] font-bold flex items-center gap-1 hover:underline"
                    >
                      <Download size={14} /> Download Template
                    </button>
                  </div>
                  
                  <div className="border-2 border-dashed border-[#CBD5E1] rounded-xl p-8 text-center bg-[#FAFBFC] hover:bg-[#F1F5F9] transition-colors relative">
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={32} className="mx-auto text-[#94A3B8] mb-3" />
                    {importFile ? (
                      <p className="text-sm font-bold text-[#10B981]">{importFile.name}</p>
                    ) : (
                      <>
                        <p className="text-sm font-bold text-[#1B2B4B]">Click or drag to upload Excel / CSV</p>
                        <p className="text-xs text-[#64748B] mt-1">.xlsx, .xls, .csv — Maximum file size: 2MB</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#F1F5F9]">
                  <button
                    type="button"
                    onClick={() => setShowImport(false)}
                    className="px-5 py-2.5 border border-[#E2E8F0] text-[#475569] rounded-lg text-sm font-bold hover:bg-[#F8FAFC]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={importing || !importFile || !importCourse || !importBatch}
                    className="px-5 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-bold hover:bg-[#1D4ED8] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {importing ? <RefreshCw size={16} className="animate-spin" /> : <Upload size={16} />}
                    {importing ? "Importing..." : "Start Import"}
                  </button>
                </div>
              </form>

              {/* Import Results Box */}
              {importResult && (
                <div className="mt-6 border-t border-[#F1F5F9] pt-6">
                  <h3 className="text-sm font-bold text-[#1B2B4B] mb-4">Import Results</h3>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-[#ECFDF5] border border-[#A7F3D0] p-4 rounded-lg text-center">
                      <p className="text-2xl font-black text-[#059669]">{importResult.successCount}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#065F46] mt-1">Successfully Imported</p>
                    </div>
                    <div className="bg-[#FEF2F2] border border-[#FECACA] p-4 rounded-lg text-center">
                      <p className="text-2xl font-black text-[#DC2626]">{importResult.errorCount}</p>
                      <p className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B] mt-1">Failed Records</p>
                    </div>
                  </div>

                  {importResult.errors && importResult.errors.length > 0 && (
                    <div className="bg-[#FFF7ED] border border-[#FFEDD5] rounded-lg p-4">
                      <p className="text-xs font-bold text-[#9A3412] mb-2 flex items-center gap-1.5">
                        <AlertCircle size={14} /> Error Details (First 5 shown)
                      </p>
                      <ul className="space-y-1.5">
                        {importResult.errors.slice(0, 5).map((err, i) => (
                          <li key={i} className="text-[11px] text-[#9A3412] font-medium font-mono bg-white/50 p-2 rounded">
                            Row {err.row}: {err.error} (Email: {err.email || "N/A"})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <Toaster position="top-right" />
    </div>
  );
}
