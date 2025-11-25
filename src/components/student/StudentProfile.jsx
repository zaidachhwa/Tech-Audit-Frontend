// src/components/student/StudentProfile.jsx
import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../context/AuthContext";

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
      toast.success("Profile updated");
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
    return <div className="p-6 text-center text-gray-500">Loading...</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-md rounded-3xl p-6 shadow-lg border border-white/30"
      >
        <h3 className="text-lg font-semibold mb-4">Profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-2">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">Email</label>
            <input
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full p-3 rounded-xl border border-gray-200"
            />
          </div>

          <div>
            <label className="text-sm font-medium block mb-2">
              Change Password (optional)
            </label>
            <input
              type="password"
              placeholder="Current password"
              value={form.currentPassword}
              onChange={(e) =>
                setForm({ ...form, currentPassword: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-200 mb-2"
            />
            <input
              type="password"
              placeholder="New password"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-gray-200"
            />
          </div>

          <div className="flex gap-3">
            <button
              disabled={loading}
              type="submit"
              className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700"
            >
              Save
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
