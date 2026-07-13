import { useEffect, useState } from "react";
import { getStudentLmsResources } from "../api/lms.api";
import {
  BookOpen, Video, Image, FileText, File,
  Loader2, Search, Eye, Download
} from "lucide-react";
import toast from "react-hot-toast";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const FILE_ICON = {
  video: { icon: Video,    color: "#7C3AED", bg: "#F5F3FF", label: "Video" },
  image: { icon: Image,    color: "#0891B2", bg: "#ECFEFF", label: "Image" },
  pdf:   { icon: FileText, color: "#DC2626", bg: "#FEF2F2", label: "PDF" },
  word:  { icon: FileText, color: "#2563EB", bg: "#EFF6FF", label: "Word" },
  pptx:  { icon: FileText, color: "#EA580C", bg: "#FFF7ED", label: "PPT" },
  text:  { icon: FileText, color: "#4B5563", bg: "#F9FAFB", label: "Text" },
  other: { icon: File,     color: "#6B7280", bg: "#F3F4F6", label: "File" },
};

const S = {
  card: {
    background: "#fff",
    border: "1.5px solid #E2E8F0",
    borderRadius: 14,
    boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
};

function ResourceCard({ resource }) {
  const { title, description, fileType, originalName, fileUrl,
          fileSize, uploadedBy, createdAt } = resource;
  const cfg = FILE_ICON[fileType] || FILE_ICON.other;
  const Icon = cfg.icon;
  const sizeMB = fileSize ? (fileSize / (1024 * 1024)).toFixed(2) : "?";
  const date = new Date(createdAt).toLocaleDateString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
  });

  return (
    <div style={S.card} className="flex flex-col">
      {/* Colour bar at top */}
      <div style={{ height: 4, background: cfg.color }} />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-start gap-3">
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: cfg.bg, display: "flex",
            alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <Icon size={22} color={cfg.color} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider"
              style={{ color: cfg.color }}>{cfg.label}</span>
            <h3 className="font-bold text-[#1B2B4B] text-sm leading-snug mt-0.5 line-clamp-2">
              {title}
            </h3>
          </div>
        </div>
        {description && (
          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{description}</p>
        )}
        <div className="text-[10px] text-slate-400 font-medium flex gap-2 flex-wrap mt-auto">
          <span>{sizeMB} MB</span>
          <span>·</span>
          <span>By {uploadedBy?.name || "Admin"}</span>
          <span>·</span>
          <span>{date}</span>
        </div>
      </div>
      {/* Actions */}
      <div className="border-t border-[#F1F5F9] flex">
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-blue-600 hover:bg-blue-50 transition">
          <Eye size={13} /> View
        </a>
        <div style={{ width: 1, background: "#F1F5F9" }} />
        <a href={fileUrl} download={originalName}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-bold text-slate-600 hover:bg-slate-50 transition">
          <Download size={13} /> Download
        </a>
      </div>
    </div>
  );
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export default function StudentLMS() {
  const [resources, setResources] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const LIMIT = 20;

  const fetchResources = async (p = 1) => {
    try {
      setLoading(true);
      const data = await getStudentLmsResources(p, LIMIT);
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

  const FILE_TYPES = ["all", "video", "image", "pdf", "word", "pptx", "text"];

  const filtered = resources.filter((r) => {
    const matchSearch =
      r.title?.toLowerCase().includes(search.toLowerCase()) ||
      r.description?.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "all" || r.fileType === filterType;
    return matchSearch && matchType;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-[#1B2B4B] flex items-center gap-2">
          <BookOpen size={24} className="text-[#FF6B00]" /> Learning Resources
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Study materials shared by your teachers and admin.
        </p>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search resources..."
            className="pl-9 pr-4 py-2.5 border border-[#E2E8F0] rounded-xl text-sm w-full focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className="px-3 py-2 rounded-xl text-xs font-bold border transition cursor-pointer"
              style={{
                borderColor: filterType === t ? "#7C3AED" : "#E2E8F0",
                background: filterType === t ? "#F5F3FF" : "#fff",
                color: filterType === t ? "#7C3AED" : "#64748B",
              }}>
              {t === "all" ? "All Types" : t.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <p className="text-xs text-slate-400 font-medium mb-4">
        {total} resource{total !== 1 ? "s" : ""} available
      </p>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="h-8 w-8 text-purple-600 animate-spin" />
          <span className="text-sm text-slate-500">Loading resources...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#E2E8F0] rounded-2xl space-y-3">
          <BookOpen className="mx-auto h-12 w-12 text-slate-200" />
          <h3 className="text-lg font-bold text-[#1B2B4B]">No resources yet</h3>
          <p className="text-sm text-slate-400">
            {search ? "No resources match your search." : "Your teacher hasn't shared any materials yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => <ResourceCard key={r._id} resource={r} />)}
        </div>
      )}

      {/* Pagination */}
      {total > LIMIT && (
        <div className="flex justify-center gap-2 mt-8">
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
    </div>
  );
}
