import { useEffect, useState } from "react";
import { getMe, updateMe } from "../../api/student.api";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import {
  User, Mail, Lock, Save, RefreshCw, Shield, Key, BookOpen,
} from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: 20 },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  input: { width: "100%", padding: "10px 14px", border: "1.5px solid #E2E8F0", borderRadius: 8, fontSize: 13, color: "#1B2B4B", fontFamily: "'DM Sans', sans-serif", outline: "none", background: "#fff", boxSizing: "border-box" },
  sectionTitle: { fontWeight: 700, color: "#1B2B4B", fontSize: 14, margin: 0 },
};


export default function StudentProfile() {
  const { user, setUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", currentPassword: "", newPassword: "" });

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getMe();
      const s = res.student || res;
      setProfile(s);
      setForm((f) => ({ ...f, name: s.name || "", email: s.email || "" }));

    } catch (err) { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e?.preventDefault();
    try {
      setLoading(true);
      const payload = {};
      if (form.name) payload.name = form.name;
      if (form.email) payload.email = form.email;
      if (form.newPassword) { payload.currentPassword = form.currentPassword; payload.newPassword = form.newPassword; }
      const res = await updateMe(payload);
      toast.success("Profile updated successfully!");
      const updated = res.student || res;
      setProfile(updated);
      setUser?.(updated);
      setForm((f) => ({ ...f, currentPassword: "", newPassword: "" }));
    } catch (err) { toast.error(err.response?.data?.message || "Update failed"); }
    finally { setLoading(false); }
  };



  if (!profile) {
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

  return (
    <div style={S.page}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <div style={{ maxWidth: 800, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>Profile Settings</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Manage your account information</p>
        </div>

        {/* Account Info */}
        <div style={S.card}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <User size={16} color="#2563EB" />
            </div>
            <div>
              <p style={S.sectionTitle}>Account Information</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Update your personal details</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <User size={11} /> Full Name
              </label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter your full name" style={S.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
            </div>
            <div>
              <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <Mail size={11} /> Email Address
              </label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Enter your email" style={S.input}
                onFocus={(e) => (e.target.style.borderColor = "#2563EB")} onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
            </div>
            {profile.batch_name && (
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "14px 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                  <BookOpen size={13} color="#2563EB" />
                  <span style={S.label}>Batch Information</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 4px" }}>Batch Name</p>
                    <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: 0 }}>{profile.batch_name}</p>
                  </div>
                  <div style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 12px" }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 4px" }}>Batch No</p>
                    <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: 0 }}>#{profile.batch_no}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Security */}
        <div style={S.card}>
          <div style={{ padding: "18px 22px", borderBottom: "1.5px solid #F1F5F9", background: "#F8FAFC", borderRadius: "12px 12px 0 0", display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={16} color="#2563EB" />
            </div>
            <div>
              <p style={S.sectionTitle}>Security Settings</p>
              <p style={{ fontSize: 12, color: "#64748B", margin: 0 }}>Change your password (optional)</p>
            </div>
          </div>
          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14 }}>
            {[
              { label: "Current Password", field: "currentPassword", placeholder: "Enter current password" },
              { label: "New Password", field: "newPassword", placeholder: "Enter new password" },
            ].map((f) => (
              <div key={f.field}>
                <label style={{ ...S.label, display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                  <Key size={11} /> {f.label}
                </label>
                <div style={{ position: "relative" }}>
                  <Lock size={14} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "#94A3B8" }} />
                  <input type="password" placeholder={f.placeholder} value={form[f.field]}
                    onChange={(e) => setForm({ ...form, [f.field]: e.target.value })}
                    style={{ ...S.input, paddingLeft: 36 }}
                    onFocus={(e) => (e.target.style.borderColor = "#2563EB")}
                    onBlur={(e) => (e.target.style.borderColor = "#E2E8F0")} />
                </div>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Leave blank if you don't want to change your password.</p>
          </div>
        </div>

        {/* Save Button */}
        <button disabled={loading} onClick={handleSubmit}
          style={{ width: "100%", background: loading ? "#93C5FD" : "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "12px", fontWeight: 700, fontSize: 14, cursor: loading ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, fontFamily: "'DM Sans', sans-serif", marginBottom: 20 }}>
          {loading
            ? <><RefreshCw size={16} style={{ animation: "spin 1s linear infinite" }} /> Saving...</>
            : <><Save size={16} /> Save Changes</>}
        </button>


      </div>
    </div>
  );
}