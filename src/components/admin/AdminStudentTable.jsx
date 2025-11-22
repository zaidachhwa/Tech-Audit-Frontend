// AdminStudentTable.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Ban, Pencil, Trash2 } from "lucide-react";

export default function AdminStudentTable({ onRefresh, batches = [] }) {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [batchFilter, setBatchFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Load students
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

  // -------------------------
  // ✅ Generate Batch List From Props Instead of Students
  // -------------------------
  const batchOptions = batches.map((b) => `${b.batch_name}#${b.batch_no}`);

  // ---------------- Filtering ----------------
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

    // ---------------- Sorting ----------------
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

  // ---------------- Approve / Reject / Delete ----------------

  const approveStudent = async (id) => {
    try {
      await API.patch(`/admin/approve-student/${id}`);
      toast.success("Student approved");

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: true } : s))
      );

      if (onRefresh) onRefresh();
    } catch {
      toast.error("Approval failed");
    }
  };

  const rejectStudent = async (id) => {
    try {
      await API.patch(`/admin/reject-student/${id}`);
      toast.success("Student rejected");

      setStudents((prev) =>
        prev.map((s) => (s._id === id ? { ...s, isActive: false } : s))
      );

      if (onRefresh) onRefresh();
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

      if (onRefresh) onRefresh();
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl"
    >
      {/* ----------------- FILTER BAR ----------------- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-3 mb-4">
        {/* Search Field */}
        <div className="flex items-center gap-3 w-full md:w-1/2">
          <input
            type="text"
            placeholder="Search students..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/30 shadow outline-0 w-full"
          />
        </div>

        {/* Right Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Batch Filter */}
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

          {/* Sort Filter */}
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

          {/* Refresh */}
          <button
            onClick={fetchStudents}
            className="cursor-pointer outline-0 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-xl shadow"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* ----------------- TABLE ----------------- */}
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
                    <div className="font-medium text-gray-800">{s.name}</div>
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
                      {/* Approve / Reject */}
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

                      {/* Edit */}
                      <button
                        onClick={() => toast("Edit feature coming soon")}
                        className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl"
                      >
                        <Pencil size={16} />
                      </button>

                      {/* Delete */}
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
    </motion.div>
  );
}
