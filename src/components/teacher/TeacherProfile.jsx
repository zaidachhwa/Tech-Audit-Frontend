// src/components/teacher/TeacherProfile.jsx

import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  Edit,
  Save,
  X,
  ArrowLeft,
  Camera,
  Shield,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  Target,
  Star,
  Trophy,
  Zap,
  Users,
  GraduationCap,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TeacherProfile() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);
  const [stats, setStats] = useState({
    totalTopics: 0,
    completedTopics: 0,
    inProgressTopics: 0,
    totalBatches: 0,
    totalStudents: 0,
    completionRate: 0,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
  });

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    fetchProfileData();
    fetchStats();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      // ✅ FIXED: Using correct teacher profile endpoint
      const res = await API.get("/teacher/profile");
      setProfileData(res.data.user);
      setEditForm({
        name: res.data.user.name || "",
        phone: res.data.user.phone || "",
        location: res.data.user.location || "",
        bio: res.data.user.bio || "",
      });
    } catch (err) {
      console.error("Failed to fetch profile:", err);
      toast.error("Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // ✅ FIXED: Using correct teacher stats endpoint
      const res = await API.get("/teacher/stats");
      const data = res.data;

      setStats({
        totalTopics: data.totalTopics || 0,
        completedTopics: data.completedTopics || 0,
        inProgressTopics: data.inProgressTopics || 0,
        totalBatches: data.totalBatches || 0,
        totalStudents: data.totalStudents || 0,
        completionRate: data.completionRate || 0,
      });

      calculateAchievements(data);
    } catch (err) {
      console.error("Failed to fetch stats:", err);
      toast.error("Failed to load statistics");
    }
  };

  const calculateAchievements = (data) => {
    const newAchievements = [];

    if (data.completedTopics >= 1) {
      newAchievements.push({
        id: 1,
        title: "First Steps",
        description: "Completed your first topic",
        icon: <Star size={20} />,
        color: "bg-yellow-50 border-yellow-200 text-yellow-700",
      });
    }

    if (data.completedTopics >= 10) {
      newAchievements.push({
        id: 2,
        title: "Topic Master",
        description: "Completed 10 topics",
        icon: <Target size={20} />,
        color: "bg-blue-50 border-blue-200 text-blue-700",
      });
    }

    if (data.completedTopics >= 50) {
      newAchievements.push({
        id: 3,
        title: "Teaching Expert",
        description: "Completed 50 topics",
        icon: <Trophy size={20} />,
        color: "bg-purple-50 border-purple-200 text-purple-700",
      });
    }

    if (data.completionRate === 100 && data.totalTopics > 0) {
      newAchievements.push({
        id: 4,
        title: "Perfect Score",
        description: "Achieved 100% completion",
        icon: <Award size={20} />,
        color: "bg-green-50 border-green-200 text-green-700",
      });
    }

    if (data.totalBatches >= 3) {
      newAchievements.push({
        id: 5,
        title: "Multi-Batch Hero",
        description: "Teaching 3+ batches",
        icon: <Users size={20} />,
        color: "bg-indigo-50 border-indigo-200 text-indigo-700",
      });
    }

    if (data.completionRate >= 80 && data.totalTopics >= 5) {
      newAchievements.push({
        id: 6,
        title: "Consistent Teacher",
        description: "Maintained 80%+ completion",
        icon: <Zap size={20} />,
        color: "bg-orange-50 border-orange-200 text-orange-700",
      });
    }

    setAchievements(newAchievements);
  };

  const handleUpdateProfile = async () => {
    try {
      // ✅ FIXED: Using correct teacher profile update endpoint
      // Only send fields that teacher can update (not email)
      await API.patch("/teacher/profile", editForm);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      fetchProfileData();
    } catch (err) {
      console.error("Failed to update profile:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords don't match!");
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters!");
      return;
    }

    try {
      // ✅ FIXED: Using correct teacher change password endpoint
      await API.patch("/teacher/change-password", {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully!");
      setShowPasswordModal(false);
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error("Failed to change password:", err);
      toast.error(
        err?.response?.data?.message || "Failed to change password"
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-indigo-600 mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <Toaster position="top-right" />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <Link to="/teacher/dashboard">
            <button className="flex items-center gap-2 bg-white hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm border border-gray-200 font-medium text-gray-700 transition">
              <ArrowLeft size={18} />
              Back to Dashboard
            </button>
          </Link>
        </div>

        {/* PROFILE CARD */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {/* Cover */}
          <div className="h-32 bg-gradient-to-r from-indigo-600 to-purple-600"></div>

          {/* Profile Content */}
          <div className="px-6 md:px-8 pb-8">
            {/* Avatar */}
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6 -mt-16 mb-6">
              <div className="relative">
                <div className="w-32 h-32 bg-indigo-600 rounded-lg shadow-xl flex items-center justify-center text-white text-5xl font-bold border-4 border-white">
                  {profileData?.name?.charAt(0).toUpperCase() || "T"}
                </div>
                {/* <button className="absolute bottom-0 right-0 bg-white p-2 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 transition">
                  <Camera size={16} className="text-gray-600" />
                </button> */}
              </div>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">
                      {profileData?.name}
                    </h1>
                    <p className="text-gray-600 font-medium flex items-center gap-2">
                      <GraduationCap size={18} className="text-indigo-600" />
                      Teacher • {profileData?.role || "Educator"}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    {!isEditing ? (
                      <button
                        onClick={() => setIsEditing(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg font-medium transition"
                      >
                        <Edit size={18} />
                        Edit Profile
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setIsEditing(false);
                            setEditForm({
                              name: profileData?.name || "",
                              phone: profileData?.phone || "",
                              location: profileData?.location || "",
                              bio: profileData?.bio || "",
                            });
                          }}
                          className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-5 py-2 rounded-lg font-medium transition"
                        >
                          <X size={18} />
                          Cancel
                        </button>
                        <button
                          onClick={handleUpdateProfile}
                          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition"
                        >
                          <Save size={18} />
                          Save
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <InfoCard
                icon={<Mail size={18} />}
                label="Email"
                value={profileData?.email}
                isEditing={false}
                type="email"
              />
              <InfoCard
                icon={<Phone size={18} />}
                label="Phone"
                value={
                  isEditing
                    ? editForm.phone
                    : profileData?.phone || "Not provided"
                }
                isEditing={isEditing}
                onChange={(val) =>
                  setEditForm((prev) => ({ ...prev, phone: val }))
                }
              />
              <InfoCard
                icon={<MapPin size={18} />}
                label="Location"
                value={
                  isEditing
                    ? editForm.location
                    : profileData?.location || "Not provided"
                }
                isEditing={isEditing}
                onChange={(val) =>
                  setEditForm((prev) => ({ ...prev, location: val }))
                }
              />
              <InfoCard
                icon={<Calendar size={18} />}
                label="Member Since"
                value={
                  profileData?.createdAt
                    ? new Date(profileData.createdAt).toLocaleDateString(
                        "en-US",
                        { year: "numeric", month: "long" }
                      )
                    : "N/A"
                }
                isEditing={false}
              />
            </div>

            {/* Bio */}
            <div className="mb-6">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                <MessageSquare size={16} className="text-indigo-600" />
                Bio
              </label>
              {isEditing ? (
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none resize-none"
                  placeholder="Tell us about yourself..."
                />
              ) : (
                <div className="bg-gray-50 border border-gray-200 px-5 py-4 rounded-lg">
                  <p className="text-gray-700 leading-relaxed">
                    {profileData?.bio || "No bio added yet."}
                  </p>
                </div>
              )}
            </div>

            {/* Security */}
            <button
              onClick={() => setShowPasswordModal(true)}
              className="w-full bg-gray-100 hover:bg-gray-200 border border-gray-300 px-6 py-4 rounded-lg flex items-center justify-between font-medium text-gray-700 transition"
            >
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-gray-600" />
                <span>Change Password</span>
              </div>
              <Lock size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <StatBox
            icon={<BookOpen size={20} />}
            label="Total Topics"
            value={stats.totalTopics}
            color="bg-blue-50 text-blue-700 border-blue-200"
          />
          <StatBox
            icon={<CheckCircle2 size={20} />}
            label="Completed"
            value={stats.completedTopics}
            color="bg-green-50 text-green-700 border-green-200"
          />
          <StatBox
            icon={<Clock size={20} />}
            label="In Progress"
            value={stats.inProgressTopics}
            color="bg-orange-50 text-orange-700 border-orange-200"
          />
          <StatBox
            icon={<Users size={20} />}
            label="Batches"
            value={stats.totalBatches}
            color="bg-purple-50 text-purple-700 border-purple-200"
          />
          <StatBox
            icon={<GraduationCap size={20} />}
            label="Students"
            value={stats.totalStudents}
            color="bg-indigo-50 text-indigo-700 border-indigo-200"
          />
          <StatBox
            icon={<TrendingUp size={20} />}
            label="Completion"
            value={`${stats.completionRate}%`}
            color="bg-rose-50 text-rose-700 border-rose-200"
          />
        </div>

        {/* ACHIEVEMENTS */}
        {achievements.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Trophy size={24} className="text-yellow-600" />
              Achievements
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        )}

        {/* ACTIVITY SUMMARY */}
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 md:p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <TrendingUp size={24} className="text-indigo-600" />
            Recent Activity
          </h2>

          <div className="space-y-3">
            <ActivityItem
              icon={<CheckCircle2 size={18} className="text-green-600" />}
              title="Completed 5 topics this week"
              time="2 days ago"
              color="bg-green-50 border-green-200"
            />
            <ActivityItem
              icon={<MessageSquare size={18} className="text-blue-600" />}
              title="Added remarks to 3 topics"
              time="3 days ago"
              color="bg-blue-50 border-blue-200"
            />
            <ActivityItem
              icon={<Users size={18} className="text-purple-600" />}
              title="Joined 2 new batches"
              time="1 week ago"
              color="bg-purple-50 border-purple-200"
            />
          </div>
        </div>
      </div>

      {/* PASSWORD CHANGE MODAL */}
      {showPasswordModal && (
        <PasswordModal
          passwordForm={passwordForm}
          setPasswordForm={setPasswordForm}
          showPasswords={showPasswords}
          setShowPasswords={setShowPasswords}
          onClose={() => {
            setShowPasswordModal(false);
            setPasswordForm({
              currentPassword: "",
              newPassword: "",
              confirmPassword: "",
            });
          }}
          onSubmit={handleChangePassword}
        />
      )}
    </div>
  );
}

/* HELPER COMPONENTS */

function InfoCard({ icon, label, value, isEditing, onChange, type = "text" }) {
  return (
    <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
      <div className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
        <div className="text-indigo-600">{icon}</div>
        {label}
      </div>
      {isEditing && onChange ? (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
        />
      ) : (
        <p className="text-gray-900 font-medium">{value}</p>
      )}
    </div>
  );
}

function StatBox({ icon, label, value, color }) {
  return (
    <div className={`${color} border rounded-lg p-4`}>
      <div className="mb-3">{icon}</div>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <div className="text-sm font-medium">{label}</div>
    </div>
  );
}

function AchievementCard({ achievement }) {
  return (
    <div className={`${achievement.color} border rounded-lg p-5`}>
      <div className="mb-3">{achievement.icon}</div>
      <h3 className="font-bold text-lg mb-1">{achievement.title}</h3>
      <p className="text-sm opacity-90">{achievement.description}</p>
    </div>
  );
}

function ActivityItem({ icon, title, time, color }) {
  return (
    <div className={`${color} border p-4 rounded-lg flex items-start gap-4`}>
      <div className="bg-white p-2 rounded-lg border border-gray-200">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{time}</p>
      </div>
    </div>
  );
}

function PasswordModal({
  passwordForm,
  setPasswordForm,
  showPasswords,
  setShowPasswords,
  onClose,
  onSubmit,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-xl">
        <div className="bg-indigo-600 px-6 py-4 flex justify-between items-center rounded-t-lg">
          <div className="flex items-center gap-3">
            <Shield size={24} className="text-white" />
            <h3 className="text-xl font-bold text-white">Change Password</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-indigo-700 p-2 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.current ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    current: !prev.current,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.new ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.new ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold mb-2 text-gray-700">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }))
                }
                className="w-full px-4 py-2.5 pr-12 rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 outline-none"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() =>
                  setShowPasswords((prev) => ({
                    ...prev,
                    confirm: !prev.confirm,
                  }))
                }
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.confirm ? (
                  <EyeOff size={18} />
                ) : (
                  <Eye size={18} />
                )}
              </button>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}