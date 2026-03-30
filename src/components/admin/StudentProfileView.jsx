// src/components/admin/StudentProfileView.jsx
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getStudent, uploadStudentPhoto } from "../../api/student.api";
import { getReportsByStudent } from "../../api/report.api";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowLeft,
  User,
  Mail,
  RefreshCw,
  BookOpen,
  BarChart2,
  FileText,
  Calendar,
  GraduationCap,
  Camera
} from "lucide-react";

export default function StudentProfileView() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getStudent(studentId);
      const s = res.student || res;
      setStudent(s);

      // Fetch Reports
      setReportsLoading(true);
      try {
        const reportRes = await getReportsByStudent(s._id);
        setReports(reportRes?.reports || []);
      } catch (rErr) {
        console.error("Failed to fetch reports:", rErr);
      } finally {
        setReportsLoading(false);
      }
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Failed to load student profile";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload a valid image file");
      return;
    }

    if (file.size > 700 * 1024) {
      toast.error("Image size should be less than 700KB");
      return;
    }

    try {
      setUploadingPhoto(true);
      const reader = new FileReader();

      reader.onloadend = async () => {
        try {
          const base64Photo = reader.result;
          const res = await uploadStudentPhoto(student._id, { photo: base64Photo });
          toast.success(res.message || "Photo updated successfully");
          setStudent((prev) => ({ ...prev, profilePhoto: res.profilePhoto }));
        } catch (err) {
          toast.error(err.response?.data?.message || "Failed to upload photo");
        } finally {
          setUploadingPhoto(false);
        }
      };

      reader.readAsDataURL(file);
    } catch (err) {
      toast.error("Failed to process image");
      setUploadingPhoto(false);
    }
  };

  // Calculate average per parameter overall
  const getPieData = () => {
    if (!reports.length) return [];
    const paramStats = {};
    reports.forEach((r) => {
      r.parameters?.forEach((p) => {
        if (!paramStats[p.name]) {
          paramStats[p.name] = { total: 0, count: 0 };
        }
        paramStats[p.name].total += Number(p.score) || 0;
        paramStats[p.name].count += 1;
      });
    });

    return Object.keys(paramStats).map((name) => ({
      name,
      value: Number((paramStats[name].total / paramStats[name].count).toFixed(2)),
    }));
  };

  const pieData = getPieData();
  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#f43f5e", "#14b8a6"];

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

  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-sm px-6">
          <GraduationCap size={48} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-800 font-semibold mb-1">Could not load student</p>
          {error && (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mb-4 font-mono">
              {error}
            </p>
          )}
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchData}
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

  const avatarLetter = student.name?.charAt(0).toUpperCase() ?? "S";

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full px-2 sm:px-4">
      {/* HEADER ROW */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-emerald-600 transition group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Back to Students
        </button>
        <button
           onClick={fetchData}
           disabled={loading || reportsLoading}
           className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
           title="Refresh"
        >
          <RefreshCw size={18} className={loading || reportsLoading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="space-y-6">
        
        {/* PROFILE HEADER CARD */}
        <motion.div
           initial={{ opacity: 0, y: 16 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
        >
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-600 relative opacity-90 z-0" />
          <div className="px-8 pb-8 relative z-10">
            <div className="flex flex-col sm:flex-row sm:items-end gap-5 -mt-12 mb-4">
              {/* AVATAR */}
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-emerald-600 flex items-center justify-center">
                  {student.profilePhoto ? (
                    <img src={student.profilePhoto} alt={student.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-4xl font-bold text-white">{avatarLetter}</span>
                  )}
                </div>

                {/* Camera upload button */}
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 border-2 border-white text-white rounded-full flex items-center justify-center shadow-lg transition disabled:opacity-60"
                  title="Upload photo"
                >
                  {uploadingPhoto ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Camera size={14} />
                  )}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoChange}
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                    <p className="text-sm text-gray-500 mt-0.5 flex items-center gap-1.5">
                      <GraduationCap size={14} className="text-emerald-500" />
                      Student Profile
                    </p>
                  </div>
                  <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 border border-gray-100 rounded-lg">
                    <div>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">BATCH NAME</p>
                      <p className="text-sm font-bold text-gray-900">{student.batch_name}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium tracking-wide">BATCH NO</p>
                      <p className="text-sm font-bold text-emerald-600">#{student.batch_no}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
               <Mail size={16} className="text-gray-400" />
               {student.email}
            </div>
          </div>
        </motion.div>

        {/* STATS & REPORTS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Performance Pie Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col h-[400px]"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                <BarChart2 size={20} className="text-emerald-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Overall Performance</h3>
                <p className="text-sm text-gray-600">Average Scores per Subject</p>
              </div>
            </div>

            <div className="flex-1 w-full relative">
              {reportsLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw size={24} className="animate-spin text-gray-400" />
                </div>
              ) : pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}/10`, 'Avg Score']} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <BarChart2 size={40} className="text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No report data yet.</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Latest Reports List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col h-[400px]"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200">
                  <FileText size={20} className="text-orange-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
                  <p className="text-sm text-gray-600">Past evaluation history</p>
                </div>
              </div>
              <div className="text-sm font-semibold px-2.5 py-1 bg-gray-100 rounded text-gray-600">
                 {reports.length} Total
              </div>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {reportsLoading ? (
                <div className="py-12 flex justify-center">
                  <RefreshCw size={24} className="animate-spin text-gray-400" />
                </div>
              ) : reports.length > 0 ? (
                reports.map((r, idx) => {
                  const avg = r.parameters?.reduce((s, p) => s + Number(p.score || 0), 0) / (r.parameters?.length || 1);
                  return (
                    <div key={r._id || idx} className="p-4 border border-gray-100 bg-gray-50 rounded-xl flex items-center justify-between hover:bg-white transition-colors">
                      <div>
                        <h4 className="font-semibold text-gray-900 text-sm">Report #{reports.length - idx}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <Calendar size={12} />
                            {r.auditDate ? new Date(r.auditDate).toLocaleDateString() : "N/A"}
                        </div>
                      </div>
                      <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-lg text-center shadow-sm min-w-[60px]">
                          <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Score</div>
                          <div className="text-sm font-bold text-gray-900">{avg.toFixed(1)}</div>
                      </div>
                    </div>
                  )
                })
              ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-center">
                    <FileText size={40} className="text-gray-300 mb-2" />
                    <p className="text-gray-500 text-sm">No recent reports found.</p>
                  </div>
              )}
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
