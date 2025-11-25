import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  LogOut,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  Edit,
  RefreshCw,
  MessageSquare,
  Check,
} from "lucide-react";

export default function TeacherSyllabusDashboard() {
  const { user, logout } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [remarkText, setRemarkText] = useState("");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showRemark, setShowRemark] = useState(false);

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line
  }, []);

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/my-topics");
      setTopics(res.data?.topics || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch topics");
    } finally {
      setLoading(false);
    }
  };

  const markComplete = async (topicId) => {
    try {
      await API.patch(`/syllabus/topic/${topicId}/complete`);
      toast.success("Marked complete");
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to mark complete");
    }
  };

  const addRemark = async () => {
    if (!selectedTopic) return;
    try {
      await API.patch(`/syllabus/topic/${selectedTopic._id}/remark`, {
        remark: remarkText,
      });
      toast.success("Remark saved");
      setShowRemark(false);
      setRemarkText("");
      fetchTopics();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save remark");
    }
  };

  const stats = {
    total: topics.length,
    completed: topics.filter((t) => t.completionStatus === "Completed").length,
    inProgress: topics.filter((t) => t.completionStatus === "In Progress")
      .length,
    pending: topics.filter((t) => t.completionStatus === "Pending").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-purple-100 text-gray-900 p-6">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-6 text-white flex items-center justify-between shadow">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-xl">
              <BookOpen size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
              <p className="text-sm text-purple-100">
                Welcome, {user?.name || "Teacher"}
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3">
            <button
              onClick={fetchTopics}
              className="bg-white/20 px-6 py-2 cursor-pointer rounded-md flex items-center gap-2 hover:bg-white/30"
            >
              <RefreshCw className={loading ? "animate-spin" : ""} />
              <span className="hidden md:block">Refresh</span>
            </button>

            <button
              onClick={logout}
              className="bg-white px-6 py-2 cursor-pointer rounded-lg text-purple-700 font-medium hover:bg-white/90"
            >
              <div className="flex items-center gap-2">
                <LogOut />
                <span className="hidden md:block">Logout</span>
              </div>
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <SmallStat label="Total" value={stats.total} icon={<BookOpen />} />
          <SmallStat
            label="Completed"
            value={stats.completed}
            icon={<CheckCircle2 />}
          />
          <SmallStat
            label="In Progress"
            value={stats.inProgress}
            icon={<Clock />}
          />
          <SmallStat
            label="Pending"
            value={stats.pending}
            icon={<AlertCircle />}
          />
        </div>

        {/* Topics list */}
        <div className="bg-white/90 rounded-3xl p-6 shadow">
          <h2 className="text-lg font-semibold mb-4">My Assigned Topics</h2>

          {loading ? (
            <div className="py-8 text-center">
              <RefreshCw
                className="animate-spin mx-auto text-purple-600"
                size={28}
              />
            </div>
          ) : topics.length === 0 ? (
            <div className="py-8 text-center text-gray-600">
              No topics assigned
            </div>
          ) : (
            <div className="space-y-4">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="border rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-2 rounded-lg text-white">
                        <BookOpen />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">
                          {topic.title}
                        </div>
                        <div className="text-sm text-gray-600">
                          {topic.syllabus?.subject || "—"}
                        </div>
                      </div>
                    </div>

                    {topic.description && (
                      <p className="text-sm text-gray-600 mt-2">
                        {topic.description}
                      </p>
                    )}

                    <div className="mt-2 text-sm text-gray-600 flex items-center gap-3">
                      <Calendar />
                      <span>
                        Due:{" "}
                        {topic.dueDate
                          ? new Date(topic.dueDate).toLocaleDateString()
                          : "N/A"}
                      </span>
                      {topic.completionStatus !== "Completed" &&
                        topic.dueDate &&
                        new Date(topic.dueDate) < new Date() && (
                          <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                            Overdue
                          </span>
                        )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {topic.completionStatus !== "Completed" && (
                      <button
                        onClick={() => markComplete(topic._id)}
                        className="bg-gradient-to-r from-green-600 to-emerald-500 text-white px-4 py-2 rounded-xl"
                      >
                        <Check size={16} /> Mark Complete
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedTopic(topic);
                        setRemarkText(topic.remarks || "");
                        setShowRemark(true);
                      }}
                      className="bg-white border px-4 py-2 rounded-xl text-purple-700 hover:bg-purple-50"
                    >
                      <Edit size={16} />{" "}
                      {topic.remarks ? "Edit Remark" : "Add Remark"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Remark modal */}
      {showRemark && selectedTopic && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">{selectedTopic.title}</h3>
              <button
                onClick={() => setShowRemark(false)}
                className="text-gray-600"
              >
                Close
              </button>
            </div>

            <textarea
              value={remarkText}
              onChange={(e) => setRemarkText(e.target.value)}
              rows={6}
              className="w-full border rounded-lg p-3"
            />

            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => setShowRemark(false)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={addRemark}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg"
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

function SmallStat({ label, value, icon }) {
  return (
    <div className="bg-white/90 rounded-xl p-4 shadow flex items-center gap-4">
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-lg text-white">
        {icon}
      </div>
      <div>
        <div className="text-sm text-gray-600">{label}</div>
        <div className="text-xl font-semibold text-gray-800">{value}</div>
      </div>
    </div>
  );
}
