import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { CheckCircle2, Ban, RefreshCw } from "lucide-react";

export default function AdminTeacherTable() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  // Load teachers
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teachers/list");
      setTeachers(res.data?.teachers || []);
    } catch (err) {
      toast.error("Failed to load teachers");
    } finally {
      setLoading(false);
    }
  };

  // Approve teacher
  const approveTeacher = async (id) => {
    try {
      await API.patch(`/admin/approve-teacher/${id}`);
      toast.success("Teacher approved");

      setTeachers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: true } : t))
      );
    } catch {
      toast.error("Approval failed");
    }
  };

  // Reject teacher
  const rejectTeacher = async (id) => {
    try {
      await API.patch(`/admin/reject-teacher/${id}`);
      toast.success("Teacher rejected");

      setTeachers((prev) =>
        prev.map((t) => (t._id === id ? { ...t, isActive: false } : t))
      );
    } catch {
      toast.error("Rejection failed");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Filtering
  const filtered = teachers
    .filter((t) => {
      const matchesSearch =
        t.name.toLowerCase().includes(search.toLowerCase()) ||
        t.email.toLowerCase().includes(search.toLowerCase());

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "approved"
          ? t.isActive
          : !t.isActive;

      return matchesSearch && matchesFilter;
    })

    // Sorting
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/60 backdrop-blur-xl p-6 rounded-3xl shadow-xl mt-10"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-xl bg-white/70 border border-white/30 shadow outline-0 w-full md:w-1/3"
        />

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/30 shadow outline-0"
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 rounded-xl bg-white/70 border border-white/30 shadow outline-0"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="approved">Approved First</option>
            <option value="pending">Pending First</option>
          </select>

          <button
            onClick={fetchTeachers}
            className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl shadow"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl">
        <table className="min-w-full">
          <thead className="bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Subjects</th>
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
                  No teachers found.
                </td>
              </tr>
            ) : (
              filtered.map((t) => (
                <tr key={t._id} className="border-b border-white/30">
                  <td className="p-3 font-medium text-gray-800">{t.name}</td>
                  <td className="p-3">{t.email}</td>
                  <td className="p-3">
                    {t.subjects?.length ? t.subjects.join(", ") : "—"}
                  </td>

                  <td className="p-3">
                    {t.isActive ? (
                      <span className="bg-green-200 text-green-800 px-3 py-1 rounded-full text-xs">
                        Approved
                      </span>
                    ) : (
                      <span className="bg-yellow-200 text-yellow-800 px-3 py-1 rounded-full text-xs">
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      {!t.isActive ? (
                        <button
                          onClick={() => approveTeacher(t._id)}
                          className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-500 text-white p-2 rounded-xl"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => rejectTeacher(t._id)}
                          className="cursor-pointer bg-gradient-to-r from-red-600 to-rose-500 text-white p-2 rounded-xl"
                        >
                          <Ban size={16} />
                        </button>
                      )}
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
