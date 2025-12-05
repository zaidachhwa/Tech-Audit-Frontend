// src/components/student/StudentProfile.jsx
import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import {
  User,
  Mail,
  Lock,
  Save,
  RefreshCw,
  Shield,
  Key,
  CheckCircle2,
} from "lucide-react";

export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);

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
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
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
      // update global user, if your AuthContext stores it
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 flex items-center justify-center p-6">
        <div className="text-center">
          <RefreshCw className="animate-spin text-purple-600 mx-auto mb-4" size={40} />
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border-2 border-white/30 shadow-lg">
              <User size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">Profile Settings</h1>
              <p className="text-purple-100 text-sm">
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
          className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-3 rounded-xl text-white shadow-md">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Account Information
              </h3>
              <p className="text-sm text-gray-500">
                Update your personal details
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <User size={16} className="text-purple-600" />
                Full Name
              </label>
              <div className="relative">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition bg-white"
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <Mail size={16} className="text-purple-600" />
                Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition bg-white"
                />
              </div>
            </div>

            {/* Batch Information Display */}
            {profile.batch_name && (
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-4 border border-purple-100">
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-purple-600" />
                  Batch Information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-xl p-3 border border-purple-100">
                    <div className="text-xs text-gray-500 mb-1">Batch Name</div>
                    <div className="text-sm font-semibold text-gray-800">
                      {profile.batch_name}
                    </div>
                  </div>
                  <div className="bg-white rounded-xl p-3 border border-purple-100">
                    <div className="text-xs text-gray-500 mb-1">Batch No</div>
                    <div className="text-sm font-semibold text-gray-800">
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
          className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-3 rounded-xl text-white shadow-md">
              <Shield size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-800">
                Security Settings
              </h3>
              <p className="text-sm text-gray-500">
                Change your password (optional)
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <Key size={16} className="text-orange-600" />
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition bg-white"
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2 flex items-center gap-2">
                <Key size={16} className="text-orange-600" />
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
                  className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 outline-none transition bg-white"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
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
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            onClick={handleSubmit}
            className="w-full px-6 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-lg shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {loading ? (
              <>
                <RefreshCw size={22} className="animate-spin" />
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={22} />
                Save Changes
              </>
            )}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}