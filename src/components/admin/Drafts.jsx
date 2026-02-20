import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Drafts() {
  const [drafts, setDrafts] = useState([]);

  // ⭐ correct preview states
  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const fetchDrafts = async () => {
    const res = await API.get("/reports/drafts"); // ✅ fixed
    setDrafts(res.data);
  };

  useEffect(() => {
    fetchDrafts();
  }, []);

  const handleDelete = async (id) => {
    await API.delete(`/reports/draft/${id}`); // ✅ fixed
    toast.success("Draft Deleted");
    fetchDrafts();
  };

  const handleViewDraft = async (draft) => {
    try {
      const res = await API.post(
        "/reports/preview",
        {
          student: {
            name: draft.student?.name,
            email: draft.student?.email,
            batch_name: draft.student?.batch_name,
            batch_no: draft.student?.batch_no,
          },
          parameters: draft.parameters,
          feedbackSchema: draft.feedbackSchema?.[0],
          overallRemarks: draft.overallRemarks,
          auditDate: draft.auditDate,
        },
        { responseType: "blob" }
      );

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      setPreviewPdfUrl(url);
      setShowPreview(true);
    } catch (err) {
      toast.error("Preview failed");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">
        Drafts Reports ({drafts.length})
      </h2>

      {!drafts.length && (
        <div className="text-gray-500 text-sm">No Drafts Found</div>
      )}

      <div className="space-y-3">
        {drafts.map((d) => (
          <div
            key={d._id}
            className="border rounded-lg p-4 flex justify-between items-center"
          >
            <div>
              <div className="font-semibold">{d.student?.name}</div>
              <div className="text-sm text-gray-500">
                {d.student?.batch_name} #{d.student?.batch_no}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Eye
                size={20}
                className="text-emerald-600 cursor-pointer hover:scale-110 transition"
                onClick={() => handleViewDraft(d)}
              />

              <Trash2
                size={18}
                className="text-red-500 cursor-pointer hover:bg-red-50 p-1 rounded"
                onClick={() => handleDelete(d._id)}
              />
            </div>
          </div>
        ))}

        {/* ⭐ Preview Modal */}
        {showPreview && previewPdfUrl && (
          <PreviewModal
            pdfUrl={previewPdfUrl}
            onClose={() => {
              URL.revokeObjectURL(previewPdfUrl);
              setPreviewPdfUrl(null);
              setShowPreview(false);
            }}
          />
        )}
      </div>
    </div>
  );
}

/* ⭐ Preview modal */
function PreviewModal({ pdfUrl, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-[90%] h-[90%] rounded shadow"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-3 border-b flex justify-end">
          <button onClick={onClose}>Close</button>
        </div>

        <iframe src={pdfUrl} className="w-full h-full" title="Preview" />
      </div>
    </div>
  );
}