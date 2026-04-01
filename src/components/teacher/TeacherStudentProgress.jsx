import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  RefreshCw,
} from "lucide-react";

export default function TeacherStudentProgress() {
  const [batchesWithSyllabi, setBatchesWithSyllabi] = useState([]);
  const [batches, setBatches] = useState([]);
  const [selectedBatchId, setSelectedBatchId] = useState("");
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingTopics, setLoadingTopics] = useState(false);

  useEffect(() => {
    fetchBatchesWithSyllabi();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selectedBatchId) {
      fetchTopicsForSelectedBatch(selectedBatchId);
    } else {
      setTopics([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBatchId]);

  async function fetchBatchesWithSyllabi() {
    try {
      setLoading(true);
      const res = await API.get("/syllabus/assigned-syllabi");
      const fetched = res.data?.batches || [];
      setBatchesWithSyllabi(fetched);

      const simple = fetched.map((batch) => ({
        _id: batch._id,
        name: batch.batch_name || batch.batch_no || "Batch",
        studentsCount: batch.students?.length || 0,
      }));
      setBatches(simple);
      if (simple.length === 1) {
        setSelectedBatchId(simple[0]._id);
      }
    } catch (err) {
      console.error("Failed to load student progress batches:", err);
      toast.error("Unable to load assigned batches");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTopicsForSelectedBatch(batchId) {
    const batchObj = batchesWithSyllabi.find((batch) => String(batch._id) === String(batchId));
    if (!batchObj) {
      setTopics([]);
      return;
    }

    const assigned = batchObj.assignedSyllabi || [];
    const firstSyllabus = assigned[0];
    const syllabusTemplateId = firstSyllabus
      ? typeof firstSyllabus.syllabus === "object"
        ? firstSyllabus.syllabus._id || firstSyllabus.syllabus
        : firstSyllabus.syllabus
      : "";

    if (!syllabusTemplateId) {
      setTopics([]);
      return;
    }

    try {
      setLoadingTopics(true);
      const res = await API.get(
        `/syllabus/batch-topics-teacher?batchId=${encodeURIComponent(batchId)}&syllabusId=${encodeURIComponent(
          syllabusTemplateId
        )}`
      );
      setTopics(res.data?.topics || []);
    } catch (err) {
      console.error("Failed to load batch topics:", err);
      toast.error("Unable to load student progress data");
      setTopics([]);
    } finally {
      setLoadingTopics(false);
    }
  }

  const completedTopics = topics.filter((topic) => topic.completionStatus === "Completed").length;
  const inProgressTopics = topics.filter((topic) => topic.completionStatus === "In Progress").length;
  const pendingTopics = topics.filter((topic) => topic.completionStatus === "Pending").length;
  const totalTopics = topics.length;
  const completionRate = totalTopics ? Math.round((completedTopics / totalTopics) * 100) : 0;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Toaster position="top-right" />

      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between mb-6">
        <div>
          <p className="text-sm text-emerald-600 font-semibold uppercase tracking-wide">
            Teacher tools
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">Student Progress</h1>
          <p className="mt-2 text-sm text-gray-600 max-w-2xl">
            Review the latest batch progress and topic completion for students assigned to you.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (selectedBatchId) fetchTopicsForSelectedBatch(selectedBatchId);
          }}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
        >
          <RefreshCw size={16} />
          Refresh progress
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Assigned Batches</p>
            <Users size={20} className="text-emerald-500" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{batches.length}</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Students in Selected Batch</p>
            <Users size={20} className="text-blue-500" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">
            {batches.find((batch) => batch._id === selectedBatchId)?.studentsCount ?? "-"}
          </p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Completion Rate</p>
            <BarChart3 size={20} className="text-indigo-500" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{completionRate}%</p>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-500">Topics Completed</p>
            <CheckCircle2 size={20} className="text-emerald-500" />
          </div>
          <p className="mt-5 text-3xl font-semibold text-gray-900">{completedTopics}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[350px_1fr]">
        <section className="space-y-5 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Batch selection</h2>
              <p className="mt-1 text-sm text-gray-500">
                Choose a batch to inspect student progress and topic status.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                Loading batches…
              </div>
            ) : batches.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500">
                No assigned batches found.
              </div>
            ) : (
              <select
                value={selectedBatchId}
                onChange={(event) => setSelectedBatchId(event.target.value)}
                className="w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-100"
              >
                <option value="">Select a batch</option>
                {batches.map((batch) => (
                  <option key={batch._id} value={batch._id}>
                    {batch.name} ({batch.studentsCount} students)
                  </option>
                ))}
              </select>
            )}
          </div>
        </section>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Current progress</h2>
              <p className="mt-1 text-sm text-gray-500">
                Topic status for the selected batch.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">
                {totalTopics} topics tracked
              </div>
            </div>
          </div>

          <div className="mt-6">
            {loadingTopics ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                Loading progress details…
              </div>
            ) : totalTopics === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm text-gray-500">
                Pick a batch to view topic progress.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="rounded-3xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Completed</p>
                    <p className="mt-3 text-2xl font-semibold text-gray-900">{completedTopics}</p>
                  </div>
                  <div className="rounded-3xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">In Progress</p>
                    <p className="mt-3 text-2xl font-semibold text-gray-900">{inProgressTopics}</p>
                  </div>
                  <div className="rounded-3xl border border-gray-200 p-4">
                    <p className="text-sm text-gray-500">Pending</p>
                    <p className="mt-3 text-2xl font-semibold text-gray-900">{pendingTopics}</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-3xl border border-gray-200">
                  <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 font-semibold text-gray-500">Topic</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Status</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Due date</th>
                        <th className="px-4 py-3 font-semibold text-gray-500">Batch</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {topics.map((topic) => (
                        <tr key={topic._id}>
                          <td className="px-4 py-4 text-gray-900">{topic.title || topic.name}</td>
                          <td className="px-4 py-4">
                            <span
                              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                                topic.completionStatus === "Completed"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : topic.completionStatus === "In Progress"
                                  ? "bg-amber-100 text-amber-700"
                                  : "bg-slate-100 text-slate-700"
                              }`}
                            >
                              {topic.completionStatus || "Unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {topic.dueDate ? new Date(topic.dueDate).toLocaleDateString() : "—"}
                          </td>
                          <td className="px-4 py-4 text-gray-600">
                            {batches.find((batch) => batch._id === selectedBatchId)?.name ?? "Batch"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
