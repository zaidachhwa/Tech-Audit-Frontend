import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import toast, { Toaster } from "react-hot-toast";
import { AnimatePresence, motion } from "framer-motion";
import { Send, CheckCircle2, Clock, AlertCircle, Target, Award, GitBranch, ExternalLink, ChevronDown, ChevronUp, TrendingUp, Layers, RefreshCw, Calendar, User } from "lucide-react";

const S = {
  page: { minHeight: "100vh", background: "#F8FAFC", padding: "28px 32px", fontFamily: "'DM Sans', sans-serif" },
  card: { background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 12, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" },
  label: { fontSize: 11, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B" },
  primaryBtn: { background: "#2563EB", color: "#fff", border: "none", borderRadius: 8, padding: "9px 18px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
  secondaryBtn: { background: "#fff", color: "#1B2B4B", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "9px 16px", fontWeight: 600, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, fontFamily: "'DM Sans', sans-serif" },
};

const STATUS_BADGE = {
  Pending: { bg: "#FEF3C7", color: "#92400E" },
  "In Progress": { bg: "#EFF6FF", color: "#1E40AF" },
  Completed: { bg: "#ECFDF5", color: "#065F46" },
  Submitted: { bg: "#F5F3FF", color: "#6D28D9" },
  Approved: { bg: "#ECFDF5", color: "#065F46" },
};

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedProjects, setExpandedProjects] = useState(new Set());

  useEffect(() => { if (!user?.id) return; fetchProjects(); }, [user]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/projects/student/${user.id}`);
      setProjects(res.data?.projects || res.data || []);
    } catch (err) { toast.error("Failed to fetch projects"); }
    finally { setLoading(false); }
  };

  const toggleExpanded = (id) => {
    setExpandedProjects((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };

  const handleModuleToggle = async (project, moduleId, currentStatus) => {
    if (["Submitted", "Approved"].includes(project.overallStatus)) { toast.error("Cannot modify modules after submission/approval"); return; }
    const statusFlow = ["Pending", "In Progress", "Completed"];
    const nextStatus = statusFlow[(statusFlow.indexOf(currentStatus) + 1) % statusFlow.length];
    setProjects((prev) => prev.map((p) => p._id !== project._id ? p : { ...p, modules: p.modules.map((m) => m._id === moduleId ? { ...m, status: nextStatus } : m) }));
    try {
      await API.patch(`/projects/module/${moduleId}`, { status: nextStatus });
      toast.success(`Module updated to ${nextStatus}`);
    } catch (err) { toast.error("Failed to update module"); fetchProjects(); }
  };

  const handleSubmit = async (project) => {
    if (["Submitted", "Approved"].includes(project.overallStatus)) { toast.error("Project already submitted"); return; }
    if (!project.modules?.every((m) => m.status === "Completed")) { toast.error("Complete all modules before submitting"); return; }
    if (project.overallStatus !== "Completed") { toast.error("Set overall status to Completed before submitting"); return; }
    try {
      const res = await API.patch(`/projects/${project._id}/submit`);
      toast.success("Project submitted! 🎉");
      setProjects((prev) => prev.map((p) => p._id === project._id ? { ...p, overallStatus: "Submitted", ...res.data?.project } : p));
    } catch (err) { toast.error("Failed to submit project"); }
  };

  const handleSetOverallStatus = async (project, newStatus) => {
    if (newStatus === "Completed" && !project.modules?.every((m) => m.status === "Completed")) { toast.error("All modules must be completed first"); return; }
    const prev = projects.find((p) => p._id === project._id);
    setProjects((ps) => ps.map((p) => p._id === project._id ? { ...p, overallStatus: newStatus } : p));
    try {
      const res = await API.patch(`/projects/${project._id}/status`, { status: newStatus });
      toast.success("Status updated");
      if (res.data?.project) setProjects((ps) => ps.map((p) => p._id === project._id ? res.data.project : p));
    } catch (err) { toast.error("Failed to update status"); setProjects((ps) => ps.map((p) => p._id === project._id ? prev : p)); }
  };

  const calcProgress = (modules) => {
    if (!modules?.length) return 0;
    return Math.round((modules.filter((m) => m.status === "Completed").length / modules.length) * 100);
  };

  const stats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.overallStatus === "In Progress").length,
    completed: projects.filter((p) => p.overallStatus === "Completed").length,
    submitted: projects.filter((p) => p.overallStatus === "Submitted").length,
    approved: projects.filter((p) => p.overallStatus === "Approved").length,
  };

  return (
    <div style={S.page}>
      <Toaster position="top-right" />
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap'); @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 4, height: 20, background: "#2563EB", borderRadius: 4 }} />
            <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1B2B4B", margin: 0 }}>My Projects</h1>
          </div>
          <p style={{ fontSize: 13, color: "#64748B", margin: 0 }}>Track your progress and submit completed work</p>
        </div>
        <button style={S.secondaryBtn} onClick={fetchProjects} disabled={loading}>
          <RefreshCw size={14} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total", value: stats.total, tint: "#EFF6FF", ic: "#2563EB", icon: <Layers size={17} /> },
          { label: "In Progress", value: stats.inProgress, tint: "#FEF3C7", ic: "#F59E0B", icon: <Clock size={17} /> },
          { label: "Completed", value: stats.completed, tint: "#ECFDF5", ic: "#10B981", icon: <CheckCircle2 size={17} /> },
          { label: "Submitted", value: stats.submitted, tint: "#F5F3FF", ic: "#8B5CF6", icon: <Send size={17} /> },
          { label: "Approved", value: stats.approved, tint: "#ECFDF5", ic: "#10B981", icon: <Award size={17} /> },
        ].map((s) => (
          <div key={s.label} style={{ ...S.card, padding: "16px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
              <p style={S.label}>{s.label}</p>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: s.tint, display: "flex", alignItems: "center", justifyContent: "center", color: s.ic }}>{s.icon}</div>
            </div>
            <p style={{ fontSize: 22, fontWeight: 800, color: "#1B2B4B", margin: 0 }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Project List */}
      {loading ? (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 0" }}>
          <div style={{ width: 36, height: 36, border: "3px solid #E2E8F0", borderTopColor: "#2563EB", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        </div>
      ) : projects.length === 0 ? (
        <div style={{ ...S.card, padding: "60px 0", textAlign: "center" }}>
          <Layers size={52} style={{ color: "#CBD5E1", marginBottom: 14 }} />
          <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 16, margin: "0 0 6px" }}>No Projects Yet</p>
          <p style={{ color: "#94A3B8", fontSize: 13, margin: 0 }}>Projects assigned to you will appear here</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {projects.map((project, i) => {
            const progress = calcProgress(project.modules);
            const isLocked = ["Submitted", "Approved"].includes(project.overallStatus);
            const allDone = project.modules?.every((m) => m.status === "Completed");
            const canSubmit = allDone && project.overallStatus === "Completed" && !isLocked;
            const badge = STATUS_BADGE[project.overallStatus] || STATUS_BADGE.Pending;

            return (
              <div key={project._id} style={{ ...S.card, overflow: "hidden" }}>
                {/* Card header */}
                <div style={{ padding: "20px 22px", borderBottom: "1.5px solid #F1F5F9" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16, gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{ width: 34, height: 34, background: "#EFF6FF", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Layers size={16} color="#2563EB" />
                        </div>
                        <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 15, margin: 0 }}>{project.title}</p>
                      </div>
                      <p style={{ color: "#64748B", fontSize: 13, margin: 0 }}>{project.description}</p>
                    </div>
                    <span style={{ ...badge, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5 }}>{project.overallStatus}</span>
                  </div>

                  {/* Progress */}
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#64748B" }}>Overall Progress</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#2563EB" }}>{progress}%</span>
                    </div>
                    <div style={{ height: 7, background: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#2563EB,#60A5FA)", borderRadius: 99, transition: "width 0.5s" }} />
                    </div>
                  </div>

                  {/* Info badges */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 8 }}>
                    {[
                      { label: "Batch", value: project.batch?.batch_name || "-" },
                      { label: "Batch No", value: `#${project.batch?.batch_no || "-"}` },
                      { label: "Assigned By", value: project.createdBy?.name || "-" },
                      { label: "Created", value: project.createdAt ? new Date(project.createdAt).toLocaleDateString() : "-" },
                      { label: "Due Date", value: project.dueDate ? new Date(project.dueDate).toLocaleDateString() : "-" },
                    ].map((b) => (
                      <div key={b.label} style={{ background: "#F8FAFC", border: "1.5px solid #E2E8F0", borderRadius: 7, padding: "8px 10px" }}>
                        <p style={{ fontSize: 10, fontWeight: 600, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 3px" }}>{b.label}</p>
                        <p style={{ fontSize: 12, fontWeight: 700, color: "#1B2B4B", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.value}</p>
                      </div>
                    ))}
                  </div>

                  {project.repo && (
                    <a href={project.repo} target="_blank" rel="noopener noreferrer"
                      style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, color: "#2563EB", fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                      <GitBranch size={14} /> View Repository <ExternalLink size={12} />
                    </a>
                  )}
                </div>

                {/* Expandable */}
                <AnimatePresence>
                  {expandedProjects.has(project._id) && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: "hidden" }}>
                      <div style={{ padding: "20px 22px", background: "#F8FAFC", display: "flex", flexDirection: "column", gap: 20 }}>
                        {/* Modules */}
                        {project.modules?.length > 0 && (
                          <div>
                            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                              <Layers size={14} color="#2563EB" /> Modules ({project.modules.length})
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {project.modules.map((module) => {
                                const modBadge = { Pending: { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" }, "In Progress": { bg: "#EFF6FF", color: "#1E40AF", border: "#BFDBFE" }, Completed: { bg: "#ECFDF5", color: "#065F46", border: "#A7F3D0" } }[module.status] || { bg: "#F8FAFC", color: "#64748B", border: "#E2E8F0" };
                                return (
                                  <div key={module._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", borderRadius: 8, border: `1.5px solid ${modBadge.border}`, background: modBadge.bg }}>
                                    <div>
                                      <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: 0 }}>{module.name}</p>
                                      {module.notes && <p style={{ fontSize: 11, color: "#94A3B8", margin: "2px 0 0" }}>{module.notes}</p>}
                                    </div>
                                    <button onClick={() => handleModuleToggle(project, module._id, module.status)} disabled={isLocked}
                                      style={{ background: "#fff", border: `1.5px solid ${modBadge.border}`, color: modBadge.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 600, cursor: isLocked ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif", opacity: isLocked ? 0.6 : 1 }}>
                                      {module.status}
                                    </button>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Outcomes */}
                        {project.outcomes?.length > 0 && (
                          <div>
                            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                              <Target size={14} color="#2563EB" /> Learning Outcomes
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                              {project.outcomes.map((o, idx) => (
                                <div key={idx} style={{ background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "10px 14px" }}>
                                  <p style={{ fontWeight: 600, color: "#1B2B4B", fontSize: 13, margin: "0 0 2px" }}>{o.title}</p>
                                  {o.description && <p style={{ color: "#64748B", fontSize: 12, margin: 0 }}>{o.description}</p>}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Skills */}
                        {project.skills?.length > 0 && (
                          <div>
                            <p style={{ fontWeight: 700, color: "#1B2B4B", fontSize: 13, margin: "0 0 10px", display: "flex", alignItems: "center", gap: 6 }}>
                              <Award size={14} color="#2563EB" /> Required Skills
                            </p>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                              {project.skills.map((skill, idx) => (
                                <div key={idx} style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 8, padding: "7px 14px" }}>
                                  <p style={{ fontWeight: 700, color: "#1E40AF", fontSize: 12, margin: "0 0 1px" }}>{skill.name}</p>
                                  <p style={{ color: "#60A5FA", fontSize: 11, margin: 0 }}>{skill.level}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Footer */}
                <div style={{ padding: "12px 22px", background: "#F8FAFC", borderTop: "1.5px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <button onClick={() => toggleExpanded(project._id)}
                    style={{ display: "flex", alignItems: "center", gap: 6, color: "#64748B", fontWeight: 600, fontSize: 13, background: "none", border: "none", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                    {expandedProjects.has(project._id) ? <><ChevronUp size={16} /> Show Less</> : <><ChevronDown size={16} /> Show Details</>}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1.5px solid #E2E8F0", borderRadius: 8, padding: "6px 12px" }}>
                      <span style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>Status</span>
                      <select value={project.overallStatus} onChange={(e) => handleSetOverallStatus(project, e.target.value)}
                        disabled={isLocked}
                        style={{ fontSize: 12, border: "none", outline: "none", background: "transparent", color: "#1B2B4B", fontWeight: 600, cursor: isLocked ? "not-allowed" : "pointer", fontFamily: "'DM Sans', sans-serif" }}>
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed" disabled={!allDone}>Completed</option>
                        <option value="Submitted" disabled>Submitted</option>
                        <option value="Approved" disabled>Approved</option>
                      </select>
                    </div>

                    {canSubmit && (
                      <button onClick={() => handleSubmit(project)} style={{ ...S.primaryBtn, gap: 6 }}>
                        <Send size={13} /> Submit Project
                      </button>
                    )}

                    {isLocked && (
                      <div style={{ display: "flex", alignItems: "center", gap: 5, color: "#94A3B8", fontSize: 12 }}>
                        <AlertCircle size={14} />
                        {project.overallStatus === "Submitted" ? "Awaiting approval" : "Project approved"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}