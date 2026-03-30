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
  ChevronRight,
} from "lucide-react";

/* ─────────────────────────────────────────────
   MAIN COMPONENT
───────────────────────────────────────────── */
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [teacherId]);

  /* ── fetch teacher + progress ── */
  const fetchAll = async () => {
    try {
      setLoading(true);

      // Step 1: fetch basic teacher profile (always works if teacher exists)
      const teacherRes = await API.get(`/teachers/${teacherId}`);
      const t = teacherRes.data.teacher;
      setTeacher(t);
      setError(null);

      // Step 2: fetch progress (may return empty if no topics assigned yet)
      try {
        const progressRes = await API.get(`/teachers/${teacherId}/progress`);
        const { topicStats: ts, syllabusBreakdown: sb } = progressRes.data;
        setTopicStats(ts);
        setSyllabusBreakdown(sb);
        calcAchievements(ts, sb);
      } catch (progressErr) {
        console.warn("Progress fetch failed (no topics yet?):", progressErr?.response?.data?.message || progressErr.message);
        // Not fatal — teacher profile still shows, stats remain at 0
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || "Failed to load teacher profile";
      console.error("Teacher fetch failed:", msg);
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  /* ── achievements ── */
  const calcAchievements = (ts, sb) => {
    const list = [];
    if (ts.completed >= 1)
      list.push({ id: 1, title: "First Steps", desc: "Completed first topic", icon: <Star size={18} />, color: "from-emerald-400 to-teal-500" });
    if (ts.completed >= 10)
      list.push({ id: 2, title: "Topic Master", desc: "Completed 10 topics", icon: <Target size={18} />, color: "from-blue-400 to-indigo-500" });
    if (ts.completed >= 50)
      list.push({ id: 3, title: "Teaching Expert", desc: "Completed 50 topics", icon: <Trophy size={18} />, color: "from-purple-400 to-pink-500" });
    if (ts.completionRate === 100 && ts.total > 0)
      list.push({ id: 4, title: "Perfect Score", desc: "100% completion rate", icon: <Award size={18} />, color: "from-yellow-400 to-orange-500" });
    if (sb.length >= 3)
      list.push({ id: 5, title: "Multi-Subject Hero", desc: "Teaching 3+ subjects", icon: <Users size={18} />, color: "from-orange-400 to-red-500" });
    if (ts.completionRate >= 80 && ts.total >= 5)
      list.push({ id: 6, title: "Consistent Teacher", desc: "Maintained 80%+ rate", icon: <Zap size={18} />, color: "from-cyan-400 to-blue-500" });
    setAchievements(list);
  };

  /* ── photo upload ── */
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    if (file.size > 1_000_000) {
      toast.error("Image must be under 1 MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const base64 = ev.target.result;
      try {
        setUploadingPhoto(true);
        const res = await API.patch(`/teachers/${teacherId}/photo`, {
          photo: base64,
        });
        setTeacher((prev) => ({ ...prev, profilePhoto: res.data.profilePhoto }));
        toast.success("Photo updated!");
      } catch (err) {
        toast.error(err?.response?.data?.message || "Photo upload failed");
      } finally {
        setUploadingPhoto(false);
      }
    };
    reader.readAsDataURL(file);
  };

  /* ────────── LOADING ────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm font-medium">Loading profile…</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-800 font-semibold mb-1">Could not load profile</p>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 font-mono">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchAll}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition"
            >
              Retry
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const avatarLetter = teacher.name?.charAt(0).toUpperCase() ?? "T";

  /* ────────── MAIN UI ────────── */
  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-indigo-600 transition group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Teachers
        </button>
        <button
           onClick={fetchAll}
           disabled={loading}
           className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
           title="Refresh"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-5">

        {/* ─── HERO CARD ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          {/* gradient banner */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 relative z-0">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")" }}
            />
          </div>

          <div className="px-8 pb-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-14 mb-6">

              {/* AVATAR */}
              <div className="relative flex-shrink-0">
                <div className="w-28 h-28 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-indigo-600 flex items-center justify-center">
                  {teacher.profilePhoto ? (
                    <img
                      src={teacher.profilePhoto}
                      alt={teacher.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl font-bold text-white">
                      {avatarLetter}
                    </span>
                  )}
                </div>

                {/* Camera upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-60"
                  title="Upload photo"
                >
                  {uploadingPhoto ? (
                    <RefreshCw size={13} className="animate-spin" />
                  ) : (
                    <Camera size={13} />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              {/* NAME + META */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-100 leading-tight">
                      {teacher.name}
                    </h1>
                    <p className="h=100 text-sm text-gray-100 mt-0.5 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-indigo-500" />
                      Teacher • Educator
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold self-start sm:self-auto ${
                      teacher.isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-orange-50 text-orange-700 border border-orange-200"
                    }`}
                  >
                    {teacher.isActive ? (
                      <CheckCircle2 size={12} />
                    ) : (
                      <AlertCircle size={12} />
                    )}
                    {teacher.isActive ? "Active" : "Pending Approval"}
                  </span>
                </div>

                {/* info pills */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <InfoPill icon={<Mail size={13} />} label={teacher.email} />
                  <InfoPill
                    icon={<Phone size={13} />}
                    label={teacher.phone || "No phone"}
                    muted={!teacher.phone}
                  />
                  <InfoPill
                    icon={<Calendar size={13} />}
                    label={`Joined ${new Date(teacher.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}`}
                  />
                </div>

                {/* subject tags */}
                {teacher.subjects?.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {teacher.subjects.map((s, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-medium"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── STATS ROW ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { label: "Total Topics", value: topicStats.total, icon: <BookOpen size={18} />, from: "from-indigo-500", to: "to-violet-500" },
            { label: "Completed", value: topicStats.completed, icon: <CheckCircle2 size={18} />, from: "from-emerald-500", to: "to-teal-500" },
            { label: "In Progress", value: topicStats.inProgress, icon: <Clock size={18} />, from: "from-amber-500", to: "to-orange-500" },
            { label: "Pending", value: topicStats.pending, icon: <AlertCircle size={18} />, from: "from-red-400", to: "to-pink-500" },
            { label: "Completion", value: `${topicStats.completionRate}%`, icon: <TrendingUp size={18} />, from: "from-cyan-500", to: "to-blue-600" },
          ].map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${s.from} ${s.to} flex items-center justify-center text-white mb-3`}>
                {s.icon}
              </div>
              <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5 font-medium">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* ─── SYLLABUS PROGRESS BREAKDOWN ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
        >
          <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
              <BookOpen size={15} className="text-indigo-600" />
            </div>
            Subject Progress Breakdown
          </h2>

          {syllabusBreakdown.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen size={36} className="mx-auto text-gray-300 mb-2" />
              <p className="text-gray-500 text-sm">No topics assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syllabusBreakdown.map((sb, i) => (
                <motion.div
                  key={sb.syllabusId}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.25 + i * 0.07 }}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-100"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-indigo-500" />
                      <span className="font-semibold text-gray-800 text-sm">
                        {sb.syllabusName}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 rounded-full px-2.5 py-0.5">
                      {sb.completionRate}%
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sb.completionRate}%` }}
                      transition={{ delay: 0.3 + i * 0.07, duration: 0.7, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                    />
                  </div>

                  {/* Mini stats */}
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 size={11} />
                      {sb.completed} done
                    </span>
                    <span className="flex items-center gap-1 text-amber-600">
                      <Clock size={11} />
                      {sb.inProgress} in progress
                    </span>
                    <span className="flex items-center gap-1 text-gray-500">
                      <AlertCircle size={11} />
                      {sb.pending} pending
                    </span>
                    <span className="ml-auto text-gray-400">
                      {sb.total} total
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* ─── ACHIEVEMENTS ─── */}
        <AnimatePresence>
          {achievements.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
            >
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2 mb-5">
                <div className="w-7 h-7 bg-yellow-50 rounded-lg flex items-center justify-center">
                  <Trophy size={15} className="text-yellow-500" />
                </div>
                Achievements
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {achievements.map((a, i) => (
                  <motion.div
                    key={a.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.35 + i * 0.06 }}
                    className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50"
                  >
                    <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${a.color} flex items-center justify-center text-white flex-shrink-0`}>
                      {a.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{a.title}</p>
                      <p className="text-xs text-gray-500">{a.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── OVERALL BAR ─── */}
        {topicStats.total > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <div className="w-7 h-7 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <TrendingUp size={15} className="text-emerald-600" />
                </div>
                Overall Completion
              </h2>
              <span className="text-2xl font-bold text-indigo-600">
                {topicStats.completionRate}%
              </span>
            </div>

            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${topicStats.completionRate}%` }}
                transition={{ delay: 0.5, duration: 0.9, ease: "easeOut" }}
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500"
              />
            </div>

            <div className="flex justify-between mt-2 text-xs text-gray-400">
              <span>{topicStats.completed} of {topicStats.total} topics completed</span>
              <span>{topicStats.pending} remaining</span>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}

/* ── HELPERS ── */
function InfoPill({ icon, label, muted = false }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border ${
        muted
          ? "bg-gray-50 text-gray-400 border-gray-200"
          : "bg-white text-gray-600 border-gray-200 shadow-sm"
      }`}
    >
      <span className="text-indigo-400">{icon}</span>
      {label}
    </span>
  );
}
