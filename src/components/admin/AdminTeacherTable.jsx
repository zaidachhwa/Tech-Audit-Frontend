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
      className="p-6 rounded-3xl mt-10"
      style={{
        backgroundColor: "#FFFFFF",
        border: "1.5px solid #E2E8F0",
        borderRadius: "12px",
        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        {/* Search */}
        <input
          type="text"
          placeholder="Search teachers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-lg w-full md:w-1/3 outline-none transition"
          style={{
            backgroundColor: "#FFFFFF",
            border: "1.5px solid #E2E8F0",
            borderRadius: "8px",
            color: "#1B2B4B",
            fontSize: "14px",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#2563EB";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#E2E8F0";
          }}
        />

        {/* Filters */}
        <div className="flex gap-3 w-full md:w-auto">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-3 rounded-lg outline-none transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
              color: "#1B2B4B",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          >
            <option value="all">All</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="p-3 rounded-lg outline-none transition cursor-pointer"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
              color: "#1B2B4B",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="approved">Approved First</option>
            <option value="pending">Pending First</option>
          </select>

          <button
            onClick={fetchTeachers}
            className="cursor-pointer text-white px-4 py-2 rounded-lg transition"
            style={{
              backgroundColor: "#2563EB",
              borderRadius: "8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1E40AF";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#2563EB";
            }}
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg">
        <table className="min-w-full">
          <thead>
            <tr style={{ backgroundColor: "#F8FAFC" }}>
              <th
                className="p-3 text-left"
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Name
              </th>
              <th
                className="p-3 text-left"
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Email
              </th>
              <th
                className="p-3 text-left"
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Subjects
              </th>
              <th
                className="p-3 text-left"
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Status
              </th>
              <th
                className="p-3 text-left"
                style={{
                  color: "#64748B",
                  fontSize: "11px",
                  fontWeight: "600",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #F1F5F9",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                  style={{ color: "#64748B", backgroundColor: "#F8FAFC" }}
                >
                  Loading...
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="p-6 text-center"
                  style={{ color: "#64748B", backgroundColor: "#F8FAFC" }}
                >
                  No teachers found.
                </td>
              </tr>
            ) : (
              filtered.map((t, idx) => (
                <tr
                  key={t._id}
                  style={{
                    backgroundColor: idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC",
                    borderBottom: "1px solid #F1F5F9",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#F1F5F9";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = idx % 2 === 0 ? "#FFFFFF" : "#F8FAFC";
                  }}
                >
                  <td className="p-3 font-medium" style={{ color: "#1B2B4B", fontSize: "14px" }}>
                    {t.name}
                  </td>
                  <td className="p-3" style={{ color: "#1B2B4B", fontSize: "14px" }}>
                    {t.email}
                  </td>
                  <td className="p-3" style={{ color: "#1B2B4B", fontSize: "14px" }}>
                    {t.subjects?.length ? t.subjects.join(", ") : "—"}
                  </td>

                  <td className="p-3">
                    {t.isActive ? (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                        style={{
                          backgroundColor: "#ECFDF5",
                          color: "#065F46",
                          borderRadius: "20px",
                          padding: "3px 12px",
                          fontSize: "12px",
                        }}
                      >
                        Active
                      </span>
                    ) : (
                      <span
                        className="px-3 py-1 rounded-full text-xs font-medium inline-block"
                        style={{
                          backgroundColor: "#EFF6FF",
                          color: "#1E40AF",
                          borderRadius: "20px",
                          padding: "3px 12px",
                          fontSize: "12px",
                        }}
                      >
                        Pending
                      </span>
                    )}
                  </td>

                  <td className="p-3">
                    <div className="flex gap-2">
                      {!t.isActive ? (
                        <button
                          onClick={() => approveTeacher(t._id)}
                          className="cursor-pointer text-white p-2 rounded-lg transition"
                          style={{
                            backgroundColor: "#10B981",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#059669";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#10B981";
                          }}
                          title="Approve"
                        >
                          <CheckCircle2 size={16} />
                        </button>
                      ) : (
                        <button
                          onClick={() => rejectTeacher(t._id)}
                          className="cursor-pointer text-white p-2 rounded-lg transition"
                          style={{
                            backgroundColor: "#EF4444",
                            borderRadius: "8px",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#DC2626";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#EF4444";
                          }}
                          title="Reject"
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