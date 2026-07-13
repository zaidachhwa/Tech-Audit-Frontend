import { useEffect, useState, useRef } from "react";
import { API } from "../api/axios";
import {
  uploadLmsResource,
  getAllLmsResources,
  deleteLmsResource,
  updateLmsResource,
} from "../api/lms.api";
import {
  BookOpen, Upload, Trash2, Pencil, X, Check,
  Loader2, Search, FilePlus, Video, Image, FileText,
  File, ChevronDown, Eye, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FILE_ICON = {
  video:  { icon: Video,    color: "#7C3AED", bg: "#F5F3FF" },
  image:  { icon: Image,    color: "#0891B2", bg: "#ECFEFF" },
  pdf:    { icon: FileText, color: "#DC2626", bg: "#FEF2F2" },
  word:   { icon: FileText, color: "#2563EB", bg: "#EFF6FF" },
  pptx:   { icon: FileText, color: "#EA580C", bg: "#FFF7ED" },
  text:   { icon: FileText, color: "#4B5563", bg: "#F9FAFB" },
  other:  { icon: File,     color: "#6B7280", bg: "#F3F4F6" },
};

const S = {
  card: {
    background: "#fff",
    border: "1.5px solid #E2E8F0",
    borderRadius: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
  },
};

function FileTypeIcon({ fileType, size = 20 }) {
  const cfg = FILE_ICON[fileType] || FILE_ICON.other;
  const Icon = cfg.icon;
  return (
    <div
      style={{
        width: 40, height: 40, borderRadius: 10,
        background: cfg.bg, display: "flex",
        alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}
    >
      <Icon size={size} color={cfg.color} />
    </div>
  );
}

// ─── Upload Modal ─────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUploaded }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [batches, setBatches] = useState([]);
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const ACCEPTED = ".mp4,.mpeg,.mov,.avi,.mkv,.webm,.jpg,.jpeg,.png,.gif,.webp,.svg,.pdf,.doc,.docx,.ppt,.pptx,.txt";

  useEffect(() => {
    API.get("/batches").then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.batches || [];
      setBatches(list);
    }).catch(() => {});
  }, []);

  const toggleBatch = (id) =>
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select a file");
    if (!title.trim()) return toast.error("Title is required");
    if (visibility === "specific" && selectedBatches.length === 0)
      return toast.error("Select at least one batch");

    const fd = new FormData();
    fd.append("file", file);
    fd.append("title", title.trim());
    fd.append("description", description.trim());
    fd.append("visibility", visibility);
    if (visibility === "specific")
      fd.append("batches", JSON.stringify(selectedBatches));

    try {
      setUploading(true);
      await uploadLmsResource(fd, setProgress);
      toast.success("Resource uploaded successfully");
      onUploaded();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div style={{ ...S.card, width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h2 className="font-extrabold text-[#1B2B4B] text-base flex items-center gap-2">
            <FilePlus size={18} className="text-[#FF6B00]" /> Upload LMS Resource
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition cursor-pointer">
            <X size={18} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* File picker */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">File *</label>
            <div
              onClick={() => fileRef.current?.click()}
              style={{
                border: "2px dashed #CBD5E1", borderRadius: 10, padding: "20px 16px",
                textAlign: "center", cursor: "pointer", background: "#F8FAFC",
                transition: "border-color 0.2s",
              }}
              className="hover:border-blue-400"
            >
              {file ? (
                <p className="text-sm font-semibold text-[#1B2B4B] break-all">{file.name}</p>
              ) : (
                <>
                  <Upload size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500">Click to select a file</p>
                  <p className="text-[10px] text-slate-400 mt-1">Video, Image, PDF, Word, PPT, TXT — max 500MB</p>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
          </div>
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. React Hooks - Lecture 3"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          {/* Description */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
          {/* Visibility */}
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Visibility *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { val: "all", label: "All Batches" },
                { val: "specific", label: "Specific Batches" },
              ].map(({ val, label }) => (
                <button key={val} type="button" onClick={() => setVisibility(val)}
                  className="py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer"
                  style={{
                    borderColor: visibility === val ? "#2563EB" : "#E2E8F0",
                    background: visibility === val ? "#EFF6FF" : "#fff",
                    color: visibility === val ? "#2563EB" : "#64748B",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Batch selector */}
          {visibility === "specific" && (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Select Batches *</label>
              {batches.length === 0 ? (
                <p className="text-xs text-slate-400">No batches found</p>
              ) : (
                <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                  {batches.map((b) => {
                    const id = b._id;
                    const checked = selectedBatches.includes(id);
                    return (
                      <button key={id} type="button" onClick={() => toggleBatch(id)}
                        className="flex items-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer"
                        style={{
                          borderColor: checked ? "#2563EB" : "#E2E8F0",
                          background: checked ? "#EFF6FF" : "#F8FAFC",
                          color: checked ? "#2563EB" : "#475569",
                        }}>
                        <div style={{
                          width: 14, height: 14, borderRadius: 4, flexShrink: 0,
                          border: `2px solid ${checked ? "#2563EB" : "#CBD5E1"}`,
                          background: checked ? "#2563EB" : "transparent",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                        </div>
                        {b.batch_name} #{b.batch_no}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
          {/* Upload progress */}
          {uploading && progress > 0 && (
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-500 mb-1">
                <span>Uploading...</span><span>{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            </div>
          )}
          <button type="submit" disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
            {uploading ? <><Loader2 size={16} className="animate-spin" /> Uploading...</> : <><Upload size={16} /> Upload Resource</>}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────
function EditModal({ resource, onClose, onUpdated }) {
  const [title, setTitle] = useState(resource.title);
  const [description, setDescription] = useState(resource.description || "");
  const [visibility, setVisibility] = useState(resource.visibility);
  const [selectedBatches, setSelectedBatches] = useState(
    resource.batches?.map((b) => b._id || b) || []
  );
  const [batches, setBatches] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    API.get("/batches").then((r) => {
      const list = Array.isArray(r.data) ? r.data : r.data?.batches || [];
      setBatches(list);
    }).catch(() => {});
  }, []);

  const toggleBatch = (id) =>
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return toast.error("Title is required");
    if (visibility === "specific" && selectedBatches.length === 0)
      return toast.error("Select at least one batch");
    try {
      setSaving(true);
      await updateLmsResource(resource._id, {
        title: title.trim(),
        description: description.trim(),
        visibility,
        batches: visibility === "specific" ? selectedBatches : [],
      });
      toast.success("Resource updated");
      onUpdated();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div style={{ ...S.card, width: "100%", maxWidth: 480, maxHeight: "90vh", overflowY: "auto" }}>
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h2 className="font-extrabold text-[#1B2B4B] text-base">Edit Resource</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 transition cursor-pointer"><X size={18} /></button>
        </div>
        <form onSubmit={handleSave} className="p-5 space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Title *</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none" />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1.5">Visibility</label>
            <div className="grid grid-cols-2 gap-2">
              {[{ val: "all", label: "All Batches" }, { val: "specific", label: "Specific Batches" }].map(({ val, label }) => (
                <button key={val} type="button" onClick={() => setVisibility(val)}
                  className="py-2.5 px-3 rounded-xl border text-xs font-bold transition cursor-pointer"
                  style={{ borderColor: visibility === val ? "#2563EB" : "#E2E8F0", background: visibility === val ? "#EFF6FF" : "#fff", color: visibility === val ? "#2563EB" : "#64748B" }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {visibility === "specific" && (
            <div>
              <label className="text-xs font-bold text-slate-600 block mb-1.5">Select Batches *</label>
              <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto">
                {batches.map((b) => {
                  const id = b._id;
                  const checked = selectedBatches.includes(id);
                  return (
                    <button key={id} type="button" onClick={() => toggleBatch(id)}
                      className="flex items-center gap-2 py-2 px-3 rounded-lg border text-xs font-semibold transition cursor-pointer"
                      style={{ borderColor: checked ? "#2563EB" : "#E2E8F0", background: checked ? "#EFF6FF" : "#F8FAFC", color: checked ? "#2563EB" : "#475569" }}>
                      <div style={{ width: 14, height: 14, borderRadius: 4, flexShrink: 0, border: `2px solid ${checked ? "#2563EB" : "#CBD5E1"}`, background: checked ? "#2563EB" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {checked && <Check size={9} color="#fff" strokeWidth={3} />}
                      </div>
                      {b.batch_name} #{b.batch_no}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          <button type="submit" disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition disabled:opacity-50 cursor-pointer">
            {saving ? <><Loader2 size={16} className="animate-spin" /> Saving...</> : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Resource Card ────────────────────────────────────────────────────────────
function ResourceCard({ resource, onEdit, onDelete }) {
  const { title, description, fileType, originalName, fileUrl,
          fileSize, visibility, batches, uploadedBy, createdAt } = resource;
  const sizeMB = fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : "?";
  const date = new Date(createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const uploaderName = uploadedBy?.name || "Unknown";

  return (
    <div style={S.card} className="p-4 flex items-start gap-4">
      <FileTypeIcon fileType={fileType} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="min-w-0">
            <h3 className="font-bold text-[#1B2B4B] text-[15px] truncate">{title}</h3>
            <p className="text-xs text-slate-400 truncate mt-0.5">{originalName}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full"
              style={{
                background: visibility === "all" ? "#DCFCE7" : "#FEF3C7",
                color: visibility === "all" ? "#166534" : "#92400E",
              }}>
              {visibility === "all" ? "All Batches" : `${batches?.length || 0} Batch${batches?.length !== 1 ? "es" : ""}`}
            </span>
            <a href={fileUrl} target="_blank" rel="noopener noreferrer"
              className="p-1.5 rounded-lg hover:bg-blue-50 text-slate-400 hover:text-blue-600 transition" title="View">
              <Eye size={15} />
            </a>
            <button onClick={() => onEdit(resource)}
              className="p-1.5 rounded-lg hover:bg-amber-50 text-slate-400 hover:text-amber-600 transition cursor-pointer" title="Edit">
              <Pencil size={15} />
            </button>
            <button onClick={() => onDelete(resource)}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer" title="Delete">
              <Trash2 size={15} />
            </button>
          </div>
        </div>
        {description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{description}</p>}
        {visibility === "specific" && batches?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {batches.map((b) => (
              <span key={b._id || b} className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                {b.batch_name} #{b.batch_no}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400 font-medium">
          <span>{sizeMB} MB</span>
          <span>•</span>
          <span>Uploaded by {uploaderName}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LMSManagement() {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [editResource, setEditResource] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const LIMIT = 20;

  const fetchResources = async (p = 1) => {
    try {
      setLoading(true);
      const data = await getAllLmsResources(p, LIMIT);
      setResources(data.items || []);
      setTotal(data.total || 0);
      setPage(p);
    } catch {
      toast.error("Failed to load LMS resources");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchResources(); }, []);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteLmsResource(deleteTarget._id);
      toast.success("Resource deleted");
      setDeleteTarget(null);
      fetchResources(page);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleting(false);
    }
  };

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.originalName?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.fileType === filterType;
    return matchSearch && matchType;
  });

  const FILE_TYPES = ["all", "video", "image", "pdf", "word", "pptx", "text"];

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1B2B4B] flex items-center gap-2">
            <BookOpen size={24} className="text-[#FF6B00]" /> LMS Resources
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Upload and manage learning materials for your batches.
          </p>
        </div>
        <button onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition cursor-pointer shadow-sm">
          <Upload size={16} /> Upload Resource
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
              style={{
                borderColor: filterType === t ? "#2563EB" : "#E2E8F0",
                background: filterType === t ? "#EFF6FF" : "#fff",
                color: filterType === t ? "#2563EB" : "#64748B",
              }}>
              {t === "all" ? "All Types" : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="text-xs text-slate-500 font-medium mb-4">
        {total} resource{total !== 1 ? "s" : ""} total · showing {filtered.length}
      </div>

      {/* Resource list */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
          <span className="text-sm text-slate-500">Loading resources...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
          <BookOpen className="mx-auto h-12 w-12 text-slate-200" />
          <h3 className="text-lg font-bold text-[#1B2B4B]">No resources found</h3>
          <p className="text-sm text-slate-400">Upload your first LMS resource to get started.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((r) => (
            <ResourceCard key={r._id} resource={r}
              onEdit={setEditResource} onDelete={setDeleteTarget} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => fetchResources(page - 1)}
            className="px-4 py-2 text-sm font-bold border border-[#E2E8F0] rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer">
            ← Prev
          </button>
          <span className="px-4 py-2 text-sm font-bold text-slate-600">
            Page {page} of {Math.ceil(total / LIMIT)}
          </span>
          <button disabled={page >= Math.ceil(total / LIMIT)} onClick={() => fetchResources(page + 1)}
            className="px-4 py-2 text-sm font-bold border border-[#E2E8F0] rounded-xl disabled:opacity-40 hover:bg-slate-50 transition cursor-pointer">
            Next →
          </button>
        </div>
      )}

      {/* Upload modal */}
      {showUpload && (
        <UploadModal onClose={() => setShowUpload(false)} onUploaded={() => fetchResources(1)} />
      )}

      {/* Edit modal */}
      {editResource && (
        <EditModal resource={editResource} onClose={() => setEditResource(null)}
          onUpdated={() => fetchResources(page)} />
      )}

      {/* Delete confirm */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div style={{ ...S.card, width: "100%", maxWidth: 380 }} className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <AlertCircle size={20} className="text-rose-600" />
              </div>
              <div>
                <h3 className="font-extrabold text-[#1B2B4B] text-sm">Delete Resource</h3>
                <p className="text-xs text-slate-500 mt-0.5">This cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-slate-600">
              Are you sure you want to delete <strong>"{deleteTarget.title}"</strong>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)}
                className="flex-1 py-2.5 border border-[#E2E8F0] rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
                Cancel
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 py-2.5 bg-rose-600 text-white rounded-xl text-sm font-bold hover:bg-rose-700 transition disabled:opacity-50 cursor-pointer">
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
