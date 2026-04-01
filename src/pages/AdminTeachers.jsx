// src/pages/AdminTeachers.jsx

import React, { useEffect, useState } from "react";
import { API } from "../api/axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  RefreshCw,
  Check,
  XCircle,
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

  const handleDelete = async (id) => {
    try {
      await API.delete(`/teachers/${id}`);
      toast.success("Teacher deleted");
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error("Delete failed");
    }
  };

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

  const handleCreate = async () => {
    try {
      await API.post("/teachers/create", {
        ...form,
        subjects: form.subjects.split(",").map((s) => s.trim()),
      });
      toast.success("Teacher created");
      setShowCreate(false);
      await fetchTeachers();
    } catch (error) {
      console.log(error);
      toast.error("Create failed");
    }
  };

  const filteredTeachers = teachers.filter((t) => {
    if (
      search &&
      !t.name.toLowerCase().includes(search.toLowerCase()) &&
      !t.email.toLowerCase().includes(search.toLowerCase())
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
    <div className="bg-[#F8FAFC] min-h-screen p-6 space-y-6">

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
            className="bg-white border px-3 py-2 rounded-lg"
          >
            <RefreshCw size={14} />
          </button>

          <button
            onClick={() => {
              setForm({ name: "", email: "", password: "", subjects: "", phone: "" });
              setShowCreate(true);
            }}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm flex items-center gap-1"
          >
            <Plus size={14} /> Add Teacher
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Pending", value: stats.pending },
        ].map((s, i) => (
          <div key={i} className="bg-white border rounded-xl p-4">
            <p className="text-[11px] text-[#64748B]">{s.label}</p>
            <p className="text-[28px] font-bold">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white border rounded-xl p-4 flex gap-3">
        <div className="flex-1 relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full pl-9 pr-3 py-2 border rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border rounded-lg"
        >
          <option value="all">All</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
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
              <tr key={t._id} className={i % 2 ? "bg-gray-50" : ""}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                      {t.name.charAt(0)}
                    </div>
                    <button
                      onClick={() => navigate(`/admin/teacher/${t._id}`)}
                      className="font-medium"
                    >
                      {t.name}
                    </button>
                  </div>
                </td>

                <td className="px-6 py-4">{t.email}</td>
                <td className="px-6 py-4">{t.phone || "—"}</td>
                <td className="px-6 py-4">{t.subjects?.slice(0, 2).join(", ") || "—"}</td>

                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs ${
                    t.isActive ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                  }`}>
                    {t.isActive ? "Active" : "Pending"}
                  </span>
                </td>

                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    {!t.isActive && (
                      <button onClick={() => handleToggleStatus(t._id)} className="text-green-600">
                        <Check size={14} />
                      </button>
                    )}
                    {t.isActive && (
                      <button onClick={() => handleToggleStatus(t._id)} className="text-yellow-500">
                        <XCircle size={14} />
                      </button>
                    )}
                    <button onClick={() => handleEdit(t)} className="text-blue-600">
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => handleDelete(t._id)} className="text-red-600">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-[#1B2B4B]">Add Teacher</h2>

            {["name", "email", "password", "phone"].map((field) => (
              <input
                key={field}
                type={field === "password" ? "password" : "text"}
                placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            ))}

            <input
              placeholder="Subjects (comma separated)"
              value={form.subjects}
              onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowCreate(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-bold text-[#1B2B4B]">Edit Teacher</h2>

            {["name", "email", "password", "phone"].map((field) => (
              <input
                key={field}
                type={field === "password" ? "password" : "text"}
                placeholder={field === "password" ? "New Password (leave blank to keep)" : field.charAt(0).toUpperCase() + field.slice(1)}
                value={form[field]}
                onChange={(e) => setForm({ ...form, [field]: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg text-sm"
              />
            ))}

            <input
              placeholder="Subjects (comma separated)"
              value={form.subjects}
              onChange={(e) => setForm({ ...form, subjects: e.target.value })}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowEdit(false)}
                className="px-4 py-2 border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  try {
                    await API.put(`/teachers/${editTeacher._id}`, {
                      ...form,
                      subjects: form.subjects.split(",").map((s) => s.trim()),
                    });
                    toast.success("Teacher updated");
                    setShowEdit(false);
                    await fetchTeachers();
                  } catch (error) {
                    console.log(error);
                    toast.error("Update failed");
                  }
                }}
                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}