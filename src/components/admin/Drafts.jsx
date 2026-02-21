import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import { Calendar, Eye, Trash2 } from "lucide-react";
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
    <div className="p-6 shadow-lg rounded-lg bg-white">
      <h2 className="text-xl font-semibold mb-4">
        Drafts Reports ({drafts.length})
      </h2>

      {!drafts.length && (
        <div className="text-gray-500 text-sm">No Drafts Found</div>
      )}
      <div className="">
        <table className="w-full text-left mb-4">
          <thead>
            <tr className="border-b-[1px] border-gray-300">
              <th className="p-2 ">Student Name</th>
              <th className="p-2 ">Batch Name</th>
              <th className="p-2 ">Batch No.</th>
              <th className="p-2">Date</th>
              <th className="p-2 ">Actions</th>
            </tr>
          </thead>
          <tbody>
            {drafts.map((d) => (
              <tr key={d._id} className="border-b-[1px] border-gray-300 hover:bg-gray-50 transition  ">
                <td className="px-4 py-5  text-gray-600">{d.student?.name}</td>
                <td className="px-4 py-5  text-gray-600">{d.student?.batch_name}</td>
                <td className="px-4 py-5  text-gray-600">{d.student?.batch_no}</td>
                <td className="px-4 py-5  text-gray-600">
                  <div className="flex items-center text-gray-600">
                    <Calendar size={18} className="inline mr-1 text-gray-600" />
                    {d.createdAt?.substring(0, 10)}
                  </div>
                </td>
                <td className="p-2 ">
                  <div className="flex items-center justify-start gap-2">
                    <Eye
                      size={30}
                      className="text-emerald-600 cursor-pointer hover:bg-green-100 hover:scale-110 p-[2px] rounded transition"
                      onClick={() => handleViewDraft(d)}
                    />
                    <Trash2
                      size={30}
                      className="text-red-500 cursor-pointer hover:bg-red-50 hover:scale-110 p-1 rounded "
                      onClick={() => handleDelete(d._id)}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="space-y-3 bg-green-500">
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