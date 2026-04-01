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
                    <button className="text-[#10B981]">
                      <Check size={14} />
                    </button>
                  )}
                  {s.isActive && (
                    <button className="text-[#F59E0B]">
                      <XCircle size={14} />
                    </button>
                  )}
                  <button className="text-[#2563EB]">
                    <Edit2 size={14} />
                  </button>
                  <button className="text-[#EF4444]">
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}