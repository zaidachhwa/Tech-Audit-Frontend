// src/components/admin/TeacherProfileView.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Camera,
  Users,
  Award,
  Star,
  Target,
  Trophy,
  Zap,
  GraduationCap,
  RefreshCw,
  Trash2,
  Plus,
  X
} from "lucide-react";
// Syllabus assignment APIs removed as per user request

export default function TeacherProfileView() {
  const { teacherId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [teacher, setTeacher] = useState(null);
  const [error, setError] = useState(null);
  const [topicStats, setTopicStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    completionRate: 0,
  });
  const [syllabusBreakdown, setSyllabusBreakdown] = useState([]);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [achievements, setAchievements] = useState([]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchAll();
  }, [teacherId]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const teacherRes = await API.get(`/teachers/${teacherId}`);
      const t = teacherRes.data.teacher;
      setTeacher(t);
      setError(null);

      try {
        const progressRes = await API.get(`/teachers/${teacherId}/progress`);
        const { topicStats: ts, syllabusBreakdown: sb } = progressRes.data;
        setTopicStats(ts);
        setSyllabusBreakdown(sb);
        calcAchievements(ts, sb);
      } catch {}
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err.message ||
        "Failed to load teacher profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const calcAchievements = (ts, sb) => {
    const list = [];
    if (ts.completed >= 1)
      list.push({ id: 1, title: "First Steps", desc: "Completed first topic", icon: <Star size={18} /> });
    if (ts.completed >= 10)
      list.push({ id: 2, title: "Topic Master", desc: "Completed 10 topics", icon: <Target size={18} /> });
    if (ts.completed >= 50)
      list.push({ id: 3, title: "Teaching Expert", desc: "Completed 50 topics", icon: <Trophy size={18} /> });
    if (ts.completionRate === 100 && ts.total > 0)
      list.push({ id: 4, title: "Perfect Score", desc: "100% completion rate", icon: <Award size={18} /> });
    if (sb.length >= 3)
      list.push({ id: 5, title: "Multi-Subject Hero", desc: "Teaching 3+ subjects", icon: <Users size={18} /> });
    if (ts.completionRate >= 80 && ts.total >= 5)
      list.push({ id: 6, title: "Consistent Teacher", desc: "Maintained 80%+ rate", icon: <Zap size={18} /> });
    setAchievements(list);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        setUploadingPhoto(true);
        const res = await API.patch(`/teachers/${teacherId}/photo`, {
          photo: ev.target.result,
        });
        setTeacher((prev) => ({ ...prev, profilePhoto: res.data.profilePhoto }));
        toast.success("Photo updated!");
      } catch {
        toast.error("Photo upload failed");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#E2E8F0] border-t-[#2563EB] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-[#64748B] text-sm">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#1B2B4B] font-semibold mb-2">Could not load profile</p>
          {error && <p className="text-[#991B1B] text-sm mb-4">{error}</p>}
          <button
            onClick={fetchAll}
            className="bg-[#2563EB] text-white px-4 py-2 rounded-lg text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const avatarLetter = teacher.name?.charAt(0).toUpperCase() ?? "T";

  return (
    <div className="bg-[#F8FAFC] min-h-screen p-6 font-[DM_Sans]">
      <Toaster position="top-right" />

      {/* Header */}
      <div className="flex justify-between items-center mb-6 max-w-5xl mx-auto">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-[#1B2B4B] border border-[#E2E8F0] px-3 py-1 rounded-lg hover:bg-[#F8FAFC]"
        >
          <ArrowLeft size={14} /> Back
        </button>

        <button
          onClick={fetchAll}
          className="bg-white border border-[#E2E8F0] px-3 py-1 rounded-lg hover:bg-[#F8FAFC]"
        >
          <RefreshCw size={14} />
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-6">

        {/* Profile Card */}
        <div className="bg-white border-[1.5px] border-[#E2E8F0] rounded-xl p-6 shadow-sm">
          <div className="flex items-center gap-5">

            <div className="relative">
              <div className="w-24 h-24 rounded-xl bg-[#2563EB] text-white flex items-center justify-center text-2xl font-bold">
                {teacher.profilePhoto ? (
                  <img src={teacher.profilePhoto} className="w-full h-full object-cover rounded-xl" />
                ) : avatarLetter}
              </div>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 bg-[#2563EB] text-white p-1.5 rounded-full"
              >
                <Camera size={12} />
              </button>

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </div>

            <div>
              <h1 className="text-[20px] font-bold text-[#1B2B4B]">
                {teacher.name}
              </h1>
              <p className="text-[13px] text-[#64748B] flex items-center gap-2">
                <Mail size={12} /> {teacher.email}
              </p>

              <div className="flex gap-2 mt-2 flex-wrap">
                <span className={`px-3 py-[3px] rounded-full text-[12px] font-semibold ${
                  teacher.isActive
                    ? "bg-[#ECFDF5] text-[#065F46]"
                    : "bg-[#FEF3C7] text-[#92400E]"
                }`}>
                  {teacher.isActive ? "Active" : "Pending"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "Total", value: topicStats.total },
            { label: "Completed", value: topicStats.completed },
            { label: "In Progress", value: topicStats.inProgress },
            { label: "Pending", value: topicStats.pending },
            { label: "Completion", value: `${topicStats.completionRate}%` },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-[#E2E8F0] rounded-xl p-4 text-center">
              <div className="text-[28px] font-extrabold text-[#1B2B4B]">
                {s.value}
              </div>
              <div className="text-[11px] uppercase text-[#64748B] font-semibold">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Progress */}
        {topicStats.total > 0 && (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
            <div className="flex justify-between mb-2">
              <span className="text-[13px] text-[#64748B]">Progress</span>
              <span className="text-[13px] font-semibold text-[#1B2B4B]">
                {topicStats.completionRate}%
              </span>
            </div>

            <div className="h-2 bg-[#F1F5F9] rounded-full">
              <div
                className="h-2 bg-[#2563EB] rounded-full"
                style={{ width: `${topicStats.completionRate}%` }}
              />
            </div>
          </div>
        )}

        {/* Assigned Syllabus Breakdown */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#E2E8F0] flex justify-between items-center bg-[#F8FAFC]">
            <div>
              <h2 className="text-lg font-bold text-[#1B2B4B]">Assigned Syllabi</h2>
              <p className="text-sm text-[#64748B]">Topics progress per syllabus</p>
            </div>
          </div>

          <div className="p-6">
            {syllabusBreakdown.length === 0 ? (
              <div className="text-center py-8 text-[#64748B]">
                <BookOpen size={40} className="mx-auto mb-3 opacity-20" />
                <p>No syllabus assigned yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {syllabusBreakdown.map((sb, i) => (
                  <div key={i} className="border border-[#E2E8F0] rounded-lg p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-bold text-[#1B2B4B]">{sb.syllabusName}</h4>
                    </div>
                    
                    <div className="flex justify-between text-sm text-[#64748B] mb-2">
                      <span>Progress: {sb.completionRate}%</span>
                      <span>{sb.completed} / {sb.total} topics</span>
                    </div>

                    <div className="h-1.5 bg-[#F1F5F9] rounded-full mb-4">
                      <div
                        className="h-1.5 bg-[#10B981] rounded-full"
                        style={{ width: `${sb.completionRate}%` }}
                      />
                    </div>

                    <div className="flex justify-between mt-auto">
                      <div className="text-xs">
                        <span className="font-bold text-[#1B2B4B]">{sb.completed}</span> <span className="text-[#64748B]">Done</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#1B2B4B]">{sb.inProgress}</span> <span className="text-[#64748B]">In Progress</span>
                      </div>
                      <div className="text-xs">
                        <span className="font-bold text-[#1B2B4B]">{sb.pending}</span> <span className="text-[#64748B]">Pending</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}