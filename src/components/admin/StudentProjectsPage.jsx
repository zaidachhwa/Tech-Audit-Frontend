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

  const fetchStudent = async () => {
    try {
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
    (async () => {
      let s = await fetchStudent();
      if (loc.state?.batchId) {
        setBatchId(loc.state.batchId);
        await fetchProjectsFor(loc.state.batchId, studentId);
      } else {
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
      className="p-6 max-w-6xl mx-auto bg-[#F8FAFC] min-h-screen font-[DM_Sans]"
    >
      <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl shadow-sm p-6 transition-all hover:shadow-md">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link
              to="/admin/project-tracking"
              className="inline-flex items-center gap-2 text-[#1B2B4B] border border-[#E2E8F0] px-3 py-1 rounded-lg hover:bg-[#F8FAFC] text-sm font-medium"
            >
              <ArrowLeft size={16} />
              Back
            </Link>

            <div>
              <h3 className="text-[20px] font-bold text-[#1B2B4B]">
                {student?.name || "Student Projects"}
              </h3>
              <div className="text-[13px] text-[#64748B]">
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
              className="inline-flex items-center gap-2 bg-white border border-[#E2E8F0] text-[#1B2B4B] px-3 py-1 rounded-lg hover:bg-[#F8FAFC] text-sm font-medium"
            >
              <RefreshCcw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center text-[#64748B] py-8 text-sm">
              Loading...
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center text-[#64748B] py-8 text-sm">
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