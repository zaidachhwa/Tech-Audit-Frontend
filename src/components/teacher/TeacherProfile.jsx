import { useState, useEffect } from "react";
import { API } from "../../api/axios";
import toast, { Toaster } from "react-hot-toast";
import {
  Mail, Phone, MapPin, Calendar, Award, BookOpen,
  TrendingUp, Edit, Save, X, ArrowLeft, Shield, Lock,
  Eye, EyeOff, CheckCircle2, Clock, Target, Star, Trophy,
  Zap, Users, GraduationCap, MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
  input: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#1B2B4B", width: "100%", outline: "none", fontFamily: "'DM Sans', sans-serif", boxSizing: "border-box" },
};

export default function TeacherProfile() {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({});
  const [stats, setStats] = useState({ totalTopics: 0, completedTopics: 0, inProgressTopics: 0, totalBatches: 0, totalStudents: 0, completionRate: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", phone: "", location: "", bio: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [showPasswords, setShowPasswords] = useState({ current: false, new: false, confirm: false });
  const [achievements, setAchievements] = useState([]);
  const [activity, setActivity] = useState([]);

  useEffect(() => { fetchProfileData(); fetchStats(); fetchActivity(); }, []);

  const fetchActivity = async () => {
    try {
      const res = await API.get("/teachers/activity");
      setActivity(res.data?.activity || []);
    } catch (err) { 
      console.error("Activity fetch failed:", err);
      setActivity([]);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await API.get("/teachers/profile");
      setProfileData(res.data.user);
      setEditForm({ name: res.data.user.name || "", phone: res.data.user.phone || "", location: res.data.user.location || "", bio: res.data.user.bio || "" });
    } catch (err) { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const res = await API.get("/teachers/stats");
      const d = res.data;
      setStats({ totalTopics: d.totalTopics || 0, completedTopics: d.completedTopics || 0, inProgressTopics: d.inProgressTopics || 0, totalBatches: d.totalBatches || 0, totalStudents: d.totalStudents || 0, completionRate: d.completionRate || 0 });
      const list = [];
      if (d.completedTopics >= 1) list.push({ id: 1, title: "First Steps", desc: "Completed your first topic", icon: <Star size={15} />, tint: "#ECFDF5", color: "#065F46" });
      if (d.completedTopics >= 10) list.push({ id: 2, title: "Topic Master", desc: "Completed 10 topics", icon: <Target size={15} />, tint: "#EFF6FF", color: "#1E40AF" });
      if (d.completedTopics >= 50) list.push({ id: 3, title: "Teaching Expert", desc: "Completed 50 topics", icon: <Trophy size={15} />, tint: "#F5F3FF", color: "#6D28D9" });
      if (d.completionRate === 100 && d.totalTopics > 0) list.push({ id: 4, title: "Perfect Score", desc: "100% completion rate", icon: <Award size={15} />, tint: "#ECFDF5", color: "#065F46" });
      if (d.totalBatches >= 3) list.push({ id: 5, title: "Multi-Batch Hero", desc: "Teaching 3+ batches", icon: <Users size={15} />, tint: "#FEF3C7", color: "#92400E" });
      if (d.completionRate >= 80 && d.totalTopics >= 5) list.push({ id: 6, title: "Consistent Teacher", desc: "Maintained 80%+ rate", icon: <Zap size={15} />, tint: "#FEF3C7", color: "#92400E" });
      setAchievements(list);
    } catch (err) { console.error("Stats fetch failed:", err); }
  };

  const handleUpdateProfile = async () => {
    try {
      await API.patch("/teachers/profile", editForm);
      toast.success("Profile updated!");
      setIsEditing(false);
      fetchProfileData();
    } catch (err) { toast.error(err?.response?.data?.message || "Update failed"); }
  };

  const teacherName = profileData?.name || "";
  const teacherRole = profileData?.role || profileData?.designation || "";

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) { toast.error("Passwords do not match!"); return; }
    if (passwordForm.newPassword.length < 6) { toast.error("Min 6 characters required"); return; }
    try {
      await API.patch("/teachers/change-password", { currentPassword: passwordForm.currentPassword, newPassword: passwordForm.newPassword });
      toast.success("Password changed!");
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) { toast.error(err?.response?.data?.message || "Password change failed"); }
  };

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F8FAFC", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif" }}>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <p style={{ color: "#64748B", fontSize: 13 }}>Loading profile...</p>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Topics", value: stats.totalTopics, icon: <BookOpen size={17} />, tint: "#EFF6FF", ic: "#2563EB" },
    { label: "Completed", value: stats.completedTopics, icon: <CheckCircle2 size={17} />, tint: "#ECFDF5", ic: "#10B981" },
    { label: "In Progress", value: stats.inProgressTopics, icon: <Clock size={17} />, tint: "#FEF3C7", ic: "#F59E0B" },
    { label: "Batches", value: stats.totalBatches, icon: <Users size={17} />, tint: "#EFF6FF", ic: "#2563EB" },
    { label: "Students", value: stats.totalStudents, icon: <GraduationCap size={17} />, tint: "#ECFDF5", ic: "#10B981" },
    { label: "Completion", value: `${stats.completionRate}%`, icon: <TrendingUp size={17} />, tint: "#EFF6FF", ic: "#2563EB" },
  ];

  const infoFields = [
    { icon: <Mail size={13} />, label: "Email", value: profileData?.email, field: null },
    { icon: <Phone size={13} />, label: "Phone", value: isEditing ? editForm.phone : (profileData?.phone || "Not provided"), field: "phone" },
    { icon: <MapPin size={13} />, label: "Location", value: isEditing ? editForm.location : (profileData?.location || "Not provided"), field: "location" },
    { icon: <Calendar size={13} />, label: "Member Since", value: profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : "N/A", field: null },
  ];

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
        .tp-wrap { max-width: 860px; margin: 0 auto; }
        .tp-toprow { display:flex; align-items:center; justify-content:space-between; margin-top:16px; margin-bottom:20px; flex-wrap:wrap; gap:12px; }
        .tp-namerow { display:flex; align-items:flex-end; gap:14px; }
        .tp-info { display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:16px; }
        .tp-stats { display:grid; grid-template-columns:repeat(6,1fr); gap:14px; margin-bottom:20px; }
        .tp-ach { display:grid; grid-template-columns:repeat(3,1fr); gap:12px; }
        @media(max-width:860px){.tp-stats{grid-template-columns:repeat(3,1fr)!important}.tp-ach{grid-template-columns:repeat(2,1fr)!important}}
        @media(max-width:560px){.tp-stats{grid-template-columns:repeat(2,1fr)!important}.tp-info{grid-template-columns:1fr!important}.tp-ach{grid-template-columns:1fr!important}.tp-toprow{flex-direction:column;align-items:flex-start}}
      `}</style>

      <div className="tp-wrap">
        {/* Back */}
        <div style={{ marginBottom: 20 }}>
          <Link to="/teacher/dashboard" style={{ textDecoration: "none" }}>
            <button style={S.secondaryBtn}><ArrowLeft size={13} /> Back to Dashboard</button>
          </Link>
        </div>

        {/* ── PROFILE CARD ── */}
        <div style={{ ...S.card, marginBottom: 20, overflow: "hidden" }}>
          {/* Banner */}
         
<div style={{ height: 96, background: "linear-gradient(135deg,#1B2B4B 0%,#2563EB 100%)", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
            <div style={{ position: "absolute", bottom: -40, left: 240, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              </div>
          <div style={{ padding: "0 24px 24px" }}>

            <div className="tp-toprow">
              <div className="tp-namerow">
                {/* Avatar */}
                <div style={{ position: "relative", width: 92, height: 68, flexShrink: 0 }}>
                  <div style={{ position: "absolute", left: 0, top: 24, width: 92, height: 22, borderRadius: 999, background: "#DCFCE7", zIndex: 0 }} />
                  <div style={{ position: "relative", width: 68, height: 68, borderRadius: 14, background: "#2563EB", border: "3px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 800, color: "#fff", boxShadow: "0 4px 14px rgba(37,99,235,0.35)", zIndex: 1 }}>
                    {(teacherName || "T").charAt(0).toUpperCase()}
                  </div>
                </div>
                <div style={{ paddingBottom: 4 }}>
                  {isEditing ? (
                    <input value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} style={{ ...S.input, fontSize: 16, fontWeight: 700, padding: "6px 10px", width: 200 }} />
                  ) : (
                    <p style={{ fontWeight: 800, color: "#1B2B4B", fontSize: 18, margin: "0 0 3px", letterSpacing: "-0.02em" }}>
                      {teacherName || "Teacher"}
                    </p>
                  )}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    <GraduationCap size={12} color="#2563EB" />
                    <span style={{ color: "#64748B", fontSize: 12 }}>Teacher • {teacherRole || "Educator"}</span>
                    <span style={{ background: "#ECFDF5", color: "#065F46", borderRadius: 20, padding: "1px 8px", fontSize: 11, fontWeight: 600 }}>Active</span>
                  </div>
                </div>
              </div>
              {/* Edit/Save buttons */}
              <div style={{ display: "flex", gap: 8 }}>
                {!isEditing ? (
                  <button style={S.primaryBtn} onClick={() => setIsEditing(true)}><Edit size={13} /> Edit Profile</button>
                ) : (
                  <>
                    <button style={S.secondaryBtn} onClick={() => { setIsEditing(false); setEditForm({ name: profileData?.name || "", phone: profileData?.phone || "", location: profileData?.location || "", bio: profileData?.bio || "" }); }}>
                      <X size={13} /> Cancel
                    </button>
                    <button style={S.primaryBtn} onClick={handleUpdateProfile}><Save size={13} /> Save</button>
                  </>
                )}
              </div>
            </div>

            {/* Info fields */}
            <div className="tp-info">
              {infoFields.map((item) => (
                <div key={item.label} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "11px 14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6, color: "#2563EB" }}>
                    {item.icon}<span style={S.label}>{item.label}</span>
                  </div>
                  {isEditing && item.field ? (
                    <input value={item.value} onChange={(e) => setEditForm((p) => ({ ...p, [item.field]: e.target.value }))} style={{ ...S.input, padding: "7px 10px" }} />
                  ) : (
                    <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: 0 }}>{item.value}</p>
                  )}
                </div>
              ))}
            </div>

            {/* Bio */}
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <MessageSquare size={13} color="#2563EB" />
                <span style={S.label}>Bio</span>
              </div>
              {isEditing ? (
                <textarea value={editForm.bio} onChange={(e) => setEditForm((p) => ({ ...p, bio: e.target.value }))} rows={3} placeholder="Tell students about yourself..." style={{ ...S.input, resize: "vertical" }} />
              ) : (
                <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "11px 14px" }}>
                  <p style={{ color: "#64748B", fontSize: 13, margin: 0, lineHeight: 1.6 }}>{profileData?.bio || "No bio added yet."}</p>
                </div>
              )}
            </div>

            {/* Change Password row */}
            <button onClick={() => setShowPasswordModal(true)}
              style={{ width: "100%", background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "11px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#F1F5F9")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#F8FAFC")}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={14} color="#2563EB" />
                <span style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13 }}>Change Password</span>
              </div>
              <Lock size={13} color="#94A3B8" />
            </button>
          </div>
        </div>

        {/* ── STAT CARDS ── */}
        <div className="tp-stats">
          {statCards.map((s) => (
            <div key={s.label} style={{ ...S.card, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <p style={S.label}>{s.label}</p>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.ic }}>{s.icon}</div>
              </div>
              <p style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* ── ACHIEVEMENTS ── */}
        {achievements.length > 0 && (
          <div style={{ ...S.card, padding: "20px 22px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
              <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Achievements</p>
            </div>
            <div className="tp-ach">
              {achievements.map((a) => (
                <div key={a.id} style={{ background: a.tint, border: "1.5px solid rgba(0,0,0,0.06)", borderRadius: 10, padding: "13px 15px" }}>
                  <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8, color: a.color }}>{a.icon}</div>
                  <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: "0 0 2px" }}>{a.title}</p>
                  <p style={{ color: "#64748B", fontSize: 11, margin: 0 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── RECENT ACTIVITY ── */}
        <div style={{ ...S.card, padding: "20px 22px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <div style={{ width: 4, height: 16, background: "#2563EB", borderRadius: 4 }} />
            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 }}>Recent Activity</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {activity.length > 0 ? activity.map((a, i) => (
              <div key={i} style={{ background: a.tint, border: `1.5px solid ${a.border}`, borderRadius: 8, padding: "11px 14px", display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 30, height: 30, borderRadius: 7, background: "#fff", border: "1.5px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{a.icon}</div>
                <div>
                  <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: "0 0 1px" }}>{a.title}</p>
                  <p style={{ color: "#94A3B8", fontSize: 11, margin: 0 }}>{a.time}</p>
                </div>
              </div>
            )) : (
              <p style={{ color: "#94A3B8", fontSize: 13, margin: 0, textAlign: "center", padding: "20px" }}>No recent activity</p>
            )}
          </div>
        </div>
      </div>

      {/* ── PASSWORD MODAL ── */}
      {showPasswordModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.35)", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "#fff", borderRadius: 12, width: "100%", maxWidth: 420, border: "1.5px solid #E2E8F0", boxShadow: "0 20px 60px rgba(0,0,0,0.15)", fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ background: "#1B2B4B", padding: "16px 20px", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Shield size={14} color="#fff" />
                <p style={{ fontWeight: 700, color: "#fff", fontSize: 14, margin: 0 }}>Change Password</p>
              </div>
              <button onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                style={{ background: "rgba(255,255,255,0.12)", border: "none", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#fff" }}>
                <X size={13} />
              </button>
            </div>
            <div style={{ padding: 20, display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Current Password", field: "currentPassword", vis: "current" },
                { label: "New Password", field: "newPassword", vis: "new" },
                { label: "Confirm New Password", field: "confirmPassword", vis: "confirm" },
              ].map((f) => (
                <div key={f.field}>
                  <label style={{ ...S.label, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPasswords[f.vis] ? "text" : "password"} value={passwordForm[f.field]}
                      onChange={(e) => setPasswordForm((p) => ({ ...p, [f.field]: e.target.value }))}
                      style={{ ...S.input, paddingRight: 38 }} />
                    <button type="button" onClick={() => setShowPasswords((p) => ({ ...p, [f.vis]: !p[f.vis] }))}
                      style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#94A3B8" }}>
                      {showPasswords[f.vis] ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              ))}
              <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
                <button onClick={() => { setShowPasswordModal(false); setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }}
                  style={{ flex: 1, background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Cancel
                </button>
                <button onClick={handleChangePassword}
                  style={{ flex: 1, background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}