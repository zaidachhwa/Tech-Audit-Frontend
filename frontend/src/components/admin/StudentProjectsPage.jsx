// src/components/admin/StudentProjectsPage.jsx
import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useLocation, useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, RefreshCcw } from "lucide-react";
import StudentProjectCard from "./StudentProjectCard";

/**
 * StudentProjectsPage
 * - Route: /admin/project-tracking/student/:studentId
 * - Tries to use location.state.batchId (if coming from batch screen)
 * - If no batchId in state, it finds student's batch by fetching students or batches
 * - Then fetches projects for that batch and filters by student
 */
export default function StudentProjectsPage() {
  const { studentId } = useParams();
  const loc = useLocation();
  const [student, setStudent] = useState(null);
  const [batchId, setBatchId] = useState(loc.state?.batchId || null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);

  // fetch student basic info
  const fetchStudent = async () => {
    try {
      // fallback: fetch all students and find the one we need
      const { data } = await API.get("/students/list");
      const list = data?.students || data || [];
      const s = list.find((x) => x._id === studentId) || null;
      setStudent(s);
      return s;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load student info");
      return null;
    }
  };

  // fetch batches and find batch id by batch_name & batch_no when student has batch_name/no
  const findBatchIdForStudent = async (s) => {
    try {
      const { data } = await API.get("/batches");
      const list = data?.batches || data || [];
      if (!s) return null;
      const found = list.find(
        (b) =>
          b.batch_name === s.batch_name &&
          Number(b.batch_no) === Number(s.batch_no)
      );
      if (found) return found._id;
      // if not found, maybe API returns nested; attempt flexible match:
      return list[0]?._id ?? null;
    } catch (err) {
      console.error(err);
      toast.error("Failed to load batches");
      return null;
    }
  };

  const fetchProjectsFor = async (bId, sId) => {
    if (!bId) {
      setProjects([]);
      return;
    }
    try {
      setLoading(true);
      const { data } = await API.get(`/projects/batch/${bId}`);
      const list = Array.isArray(data) ? data : data.projects || data;
      // normalize assignedTo id when populated vs not
      const filtered = list.filter(
        (p) =>
          (p.assignedTo?._id || p.assignedTo || "").toString() ===
          sId.toString()
      );
      setProjects(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch projects");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // main flow: attempt to use provided batchId; otherwise determine from student -> batches
    (async () => {
      let s = await fetchStudent();
      if (loc.state?.batchId) {
        setBatchId(loc.state.batchId);
        await fetchProjectsFor(loc.state.batchId, studentId);
      } else {
        // find batch id
        const bId = await findBatchIdForStudent(s);
        setBatchId(bId);
        await fetchProjectsFor(bId, studentId);
      }
    })();
  }, [studentId]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 max-w-6xl mx-auto"
    >
      <div className="bg-white/90 rounded-3xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/project-tracking"
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800"
            >
              <ArrowLeft /> Back
            </Link>

            <div>
              <h3 className="text-lg font-semibold text-slate-800">
                {student?.name || "Student Projects"}
              </h3>
              <div className="text-sm text-slate-500">
                {student?.email ?? ""} •{" "}
                <span className="font-medium">
                  {student?.batch_name} #{student?.batch_no}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchProjectsFor(batchId, studentId)}
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700"
            >
              <RefreshCcw /> Refresh
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-slate-500 py-8">Loading...</div>
          ) : projects.length === 0 ? (
            <div className="text-center text-slate-500 py-8">
              No projects found.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map((p) => (
                <StudentProjectCard
                  key={p._id}
                  project={p}
                  compact={false}
                  onApprove={() =>
                    (async () => {
                      try {
                        await API.patch(`/projects/${p._id}/approve`);
                        toast.success("Project approved");
                        fetchProjectsFor(batchId, studentId);
                      } catch {
                        toast.error("Approve failed");
                      }
                    })()
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
