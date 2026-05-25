// src/components/admin/AdminStudentTable.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Ban, Pencil, Trash2, X } from "lucide-react";
import {
  getAllStudents,
  updateStudent,
  deleteStudent as apiDeleteStudent,
} from "../../api/student.api";

export default function AdminStudentTable({ onRefresh, batches = [] }) {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [batchFilter, setBatchFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Edit modal
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    email: "",
    batch_name: "",
    batch_no: "",
  });
  const [editLoading, setEditLoading] = useState(false);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await API.get("/students/list");
      setStudents(res.data?.students || res.data || []);
    } catch (err) {
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const batchOptions = batches.map((b) => `${b.batch_name}#${b.batch_no}`);

  const filtered = students
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.email.toLowerCase().includes(search.toLowerCase());
      const studentBatch = `${s.batch_name}#${s.batch_no}`;
      const matchesBatch =
        batchFilter === "all" ? true : studentBatch === batchFilter;
      return matchesSearch && matchesBatch;
    })
    .sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      if (sortBy === "approved")
        return (b.isActive ? 1 : 0) - (a.isActive ? 1 : 0);
      if (sortBy === "pending")
        return (a.isActive ? 1 : 0) - (b.isActive ? 1 : 0);
      return 0;
    });

  // Approve / Reject / Delete
  const approveStudent = async (id) => {
    if (!window.confirm("Are you sure you want to approve this student?")) return;
    try {
      await API.patch(`/admin/approve-student/${id}`);
      toast.success("Student approved");
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: true } : s))
      );
      onRefresh?.();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectStudent = async (id) => {
    if (!window.confirm("Are you sure you want to reject this student?")) return;
    try {
      await API.patch(`/admin/reject-student/${id}`);
      toast.success("Student rejected");
      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: false } : s))
      );
      onRefresh?.();
    } catch {
      toast.error("Rejection failed");
    }
  };

  const deleteStudent = async (id) => {
    if (!confirm("Delete student permanently?")) return;
    try {
      await API.delete(`/students/delete/${id}`);
      toast.success("Student deleted");
      setStudents((prev) => prev.filter((s) => s._id !== id));
      onRefresh?.();
    } catch {
      toast.error("Delete failed");
    }
  };

  // Edit flow
  const openEdit = (s) => {
    setEditing(s);
    setEditForm({
      name: s.name || "",
      email: s.email || "",
      batch_name: s.batch_name || "",
      batch_no: s.batch_no || "",
    });
  };

  const submitEdit = async () => {
    try {
      setEditLoading(true);
      await API.patch(`/students/update/${editing._id}`, {
        name: editForm.name,
        email: editForm.email,
        batch_name: editForm.batch_name,
        batch_no: Number(editForm.batch_no),
      });
      toast.success("Student updated");
      setStudents((prev) =>
        prev.map((p) =>
          p._id === editing._id
            ? { ...p, ...editForm, batch_no: Number(editForm.batch_no) }
            : p
        )
      );
      setEditing(null);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/30 shadow outline-0 w-full"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={batchFilter}
            onChange={(e) => setBatchFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border outline-0 shadow cursor-pointer border-white/30"
          >
            <option value="all">All Batches</option>
            {batchOptions.map((b) => (
              <option key={b} value={b}>
                {b.replace("#", " #")}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border outline-0 shadow cursor-pointer border-white/30"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="approved">Approved First</option>
            <option value="pending">Pending First</option>
          </select>

          <button
            onClick={fetchStudents}
            className="cursor-pointer outline-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Batch</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-600">
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-gray-600">
                  No students found.
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="border-b border-white/30">
                  <td className="p-3">
                    <div 
                      className="font-bold text-[#2563EB] cursor-pointer hover:underline"
                      onClick={() => navigate(`/admin/student/${s._id}`)}
                    >
                      {s.name}
                    </div>
                    <div className="text-xs text-gray-500">ID: {s._id}</div>
                  </td>

                  <td className="p-3">{s.email}</td>

                  <td className="p-3">
                    {s.batch_name} #{s.batch_no}
                  </td>

                  <td className="p-3">
                    {s.isActive ? (
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs inline-block">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs inline-block">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      {!s.isActive ? (
                        <button
                          onClick={() => approveStudent(s._id)}
                          className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 text-white p-2 rounded-xl"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => rejectStudent(s._id)}
                          className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-700 hover:to-rose-600 text-white p-2 rounded-xl"
                        >
                          <Ban size={16} />
                        </button>
                      )}

                      <button
                        onClick={() => openEdit(s)}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl"
                      >
                        <Pencil size={16} />
                      </button>

                      <button
                        onClick={() => deleteStudent(s._id)}
                        className="cursor-pointer bg-red-600 hover:bg-red-700 text-white p-2 rounded-xl"
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

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Student</h3>
              <button onClick={() => setEditing(null)} className="p-2">
                <X />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editForm.name}
                onChange={(e) =>
                  setEditForm({ ...editForm, name: e.target.value })
                }
                className="w-full p-3 rounded-xl border"
                placeholder="Name"
              />
              <input
                value={editForm.email}
                onChange={(e) =>
                  setEditForm({ ...editForm, email: e.target.value })
                }
                className="w-full p-3 rounded-xl border"
                placeholder="Email"
              />
              <div className="flex gap-2">
                <input
                  value={editForm.batch_name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch_name: e.target.value })
                  }
                  className="flex-1 p-3 rounded-xl border"
                  placeholder="Batch name"
                />
                <input
                  type="number"
                  value={editForm.batch_no}
                  onChange={(e) =>
                    setEditForm({ ...editForm, batch_no: e.target.value })
                  }
                  className="w-28 p-3 rounded-xl border"
                  placeholder="No"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={submitEdit}
                  disabled={editLoading}
                  className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 px-4 py-3 rounded-xl border"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
