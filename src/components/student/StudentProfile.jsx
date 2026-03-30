// src/components/student/StudentProfile.jsx
import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { getReportsByStudent } from "../../api/report.api";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  User,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Shield,
  Key,
  CheckCircle2,
  BookOpen,
  BarChart2,
  FileText,
  Calendar,
  Award,
} from "lucide-react";

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportsLoading, setReportsLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    currentPassword: "",
    newPassword: "",
  });

  const fetch = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const s = res.student || res;
      setProfile(s);
      setForm((f) => ({ ...f, name: s.name || "", email: s.email || "" }));

      // Fetch Reports
      setReportsLoading(true);
      try {
        const reportRes = await getReportsByStudent(s._id);
        setReports(reportRes?.reports || []);
      } catch (rErr) {
        console.error("Failed to fetch reports for profile", rErr);
      } finally {
        setReportsLoading(false);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.newPassword) {
        payload.currentPassword = form.currentPassword;
        payload.newPassword = form.newPassword;
      }
      const res = await updateMe(payload);
      toast.success("Profile updated successfully! ✨");
      const updated = res.student || res;
      setProfile(updated);
      setUser?.(updated);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="animate-spin text-emerald-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-6 border border-gray-200"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 rounded-lg flex items-center justify-center border border-emerald-200">
              <User size={28} className="text-emerald-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">Profile Settings</h1>
              <p className="text-gray-600 text-sm">
                Manage your account information
              </p>
            </div>
          </div>
        </motion.div>

        {/* Profile Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <User size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Account Information
              </h3>
              <p className="text-sm text-gray-600">
                Update your personal details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <User size={16} className="text-gray-500" />
                Full Name
              </label>
              <div className="relative">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Mail size={16} className="text-gray-500" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white text-gray-900"
                />
              </div>
            </div>

            {/* Batch Information Display */}
            {profile.batch_name && (
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <BookOpen size={16} className="text-emerald-600" />
                  Batch Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Batch Name</div>
                    <div className="text-sm font-semibold text-gray-900">
                      {profile.batch_name}
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-xs text-gray-600 mb-1">Batch No</div>
                    <div className="text-sm font-semibold text-gray-900">
                      #{profile.batch_no}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </form>
        </motion.div>

        {/* Password Change Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
              <Shield size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">
                Security Settings
              </h3>
              <p className="text-sm text-gray-600">
                Change your password (optional)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Key size={16} className="text-gray-500" />
                Current Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={form.currentPassword}
                  onChange={(e) =>
                    setForm({ ...form, currentPassword: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white text-gray-900"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-2">
                <Key size={16} className="text-gray-500" />
                New Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={form.newPassword}
                  onChange={(e) =>
                    setForm({ ...form, newPassword: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-2.5 rounded-lg border border-gray-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 outline-none transition bg-white text-gray-900"
                />
              </div>
              <p className="text-xs text-gray-600 mt-2 flex items-center gap-1">
                <Shield size={12} />
                Leave blank if you don't want to change your password
              </p>
            </div>
          </div>
        </motion.div>

        {/* Save Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleSubmit}
            className="w-full px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={20} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={20} />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pb-12">
        {/* Performance Pie Chart */}
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.4 }}
           className="bg-white rounded-lg p-6 shadow-sm border border-gray-200"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-blue-50 p-2.5 rounded-lg border border-blue-200">
               <BarChart2 size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Overall Performance</h3>
              <p className="text-sm text-gray-600">Average Scores per Subject</p>
            </div>
          </div>

          <div className="h-64 w-full">
            {reportsLoading ? (
               <div className="h-full flex items-center justify-center">
                 <RefreshCw size={24} className="animate-spin text-gray-400" />
               </div>
            ) : pieData.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={pieData}
                     cx="50%"
                     cy="50%"
                     innerRadius={60}
                     outerRadius={80}
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
               <div className="h-full flex flex-col items-center justify-center text-center">
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
           transition={{ delay: 0.5 }}
           className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2.5 rounded-lg border border-orange-200">
                <FileText size={20} className="text-orange-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Recent Reports</h3>
                <p className="text-sm text-gray-600">Your latest evaluations</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar flex-1">
             {reportsLoading ? (
               <div className="py-8 flex justify-center">
                 <RefreshCw size={24} className="animate-spin text-gray-400" />
               </div>
             ) : reports.length > 0 ? (
               reports.map((r, idx) => {
                 const avg = r.parameters?.reduce((s, p) => s + Number(p.score || 0), 0) / (r.parameters?.length || 1);
                 return (
                   <div key={r._id || idx} className="p-4 border border-gray-100 bg-gray-50 rounded-lg flex items-center justify-between hover:bg-white transition-colors">
                     <div>
                       <h4 className="font-semibold text-gray-900 text-sm">Report #{reports.length - idx}</h4>
                       <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                          <Calendar size={12} />
                          {r.auditDate ? new Date(r.auditDate).toLocaleDateString() : "N/A"}
                       </div>
                     </div>
                     <div className="bg-white border border-gray-200 px-3 py-1.5 rounded-md text-center shadow-sm">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wide mb-0.5">Score</div>
                        <div className="text-sm font-bold text-gray-900">{avg.toFixed(1)}</div>
                     </div>
                   </div>
                 )
               })
             ) : (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                   <FileText size={40} className="text-gray-300 mb-2" />
                   <p className="text-gray-500 text-sm">No recent reports found.</p>
                </div>
             )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}