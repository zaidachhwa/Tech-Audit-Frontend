import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { API } from "../../api/axios";
import { Users, Plus, Trash2, Eye, MoveLeft } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import image from "../../assets/letter_head.jpg";
import { Link } from "react-router-dom";

/**
 * AddReport (Save / Save & Download PDF / Preview)
 * - Header consumes full width and 10% page height.
 * - Print template sized A4: 794 x 1123 px (approx @96dpi).
 * - Marks badges centered.
 * - Uses tailwind classes where appropriate + a few inline px sizes for exact page sizing.
 */

const COMPANY_NAME = "Nexcore Alliance ";
const LOGO_URL = image;
const LOGO_DATA_URI = image;
// "data:image/svg+xml;utf8," +
// encodeURIComponent(
//   `<svg xmlns='http://www.w3.org/2000/svg' width='256' height='256' viewBox='0 0 256 256'>
//      <rect rx='32' width='256' height='256' fill='#10B981'/>
//      <text x='50%' y='56%' font-family='sans-serif' font-weight='700' font-size='96' text-anchor='middle' fill='white'>${COMPANY_NAME.split(
//        " "
//      )
//        .map((w) => w[0])
//        .slice(0, 2)
//        .join("")}</text>
//    </svg>`
// );

export default function AddReport() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [form, setForm] = useState({
    batch_name: "",
    batch_no: "",
    studentId: "",
    parameters: [{ name: "", score: "" }],
    feedbackSchema: { point1: "", point2: "", point3: "" },
    overallRemarks: "",
    auditDate: "",
  });

  const printRef = useRef();

  // preview modal state
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // A4 px at ~96dpi used for html2canvas capture
  const A4_WIDTH_PX = 794;
  const A4_HEIGHT_PX = 1123;
  const HEADER_HEIGHT_PX = Math.round(A4_HEIGHT_PX * 0.2); // ~30%

  useEffect(() => {
    API.get("/student/list")
      .then((res) => {
        const data = res.data?.students || res.data?.data?.students || [];
        setStudents(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch students");
      });
  }, []);

  useEffect(() => {
    const filtered = students.filter(
      (s) =>
        s.batch_name === form.batch_name &&
        s.batch_no?.toString() === form.batch_no?.toString()
    );
    setFilteredStudents(filtered);
  }, [form.batch_name, form.batch_no, students]);

  const handleParamChange = (index, field, value) => {
    const updated = [...form.parameters];
    updated[index][field] = value;
    setForm({ ...form, parameters: updated });
  };

  const addParameter = () =>
    setForm({
      ...form,
      parameters: [...form.parameters, { name: "", score: "" }],
    });

  const removeParameter = (index) =>
    setForm({
      ...form,
      parameters: form.parameters.filter((_, i) => i !== index),
    });

  // ---------- Save only (original)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/reports/create", {
        studentId: form.studentId,
        parameters: form.parameters,
        feedbackSchema: {
          point1: form.feedbackSchema.point1,
          point2: form.feedbackSchema.point2,
          point3: form.feedbackSchema.point3,
        },
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });
      toast.success("Report added successfully!");
      setForm({
        batch_name: "",
        batch_no: "",
        studentId: "",
        parameters: [{ name: "", score: "" }],
        feedbackSchema: { point1: "", point2: "", point3: "" },
        overallRemarks: "",
        auditDate: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Something went wrong");
    }
  };

  // ---------- Save + Generate PDF
  const handleSaveAndDownload = async (e) => {
    e?.preventDefault?.();
    try {
      const res = await API.post("/reports/create", {
        studentId: form.studentId,
        parameters: form.parameters,
        feedbackSchema: {
          point1: form.feedbackSchema.point1,
          point2: form.feedbackSchema.point2,
          point3: form.feedbackSchema.point3,
        },
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });

      const createdReport = res.data?.report || res.data || null;
      toast.success("Report saved — generating PDF...");

      const pdfData = buildPdfDataFrom(createdReport);
      await populatePrintTemplate(pdfData);
      setTimeout(() => {
        const filename = buildPdfFilename(pdfData);
        generatePdfFromElement(printRef.current, filename);
      }, 250);

      setForm({
        batch_name: "",
        batch_no: "",
        studentId: "",
        parameters: [{ name: "", score: "" }],
        feedbackSchema: { point1: "", point2: "", point3: "" },
        overallRemarks: "",
        auditDate: "",
      });
    } catch (err) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "Failed to save or generate PDF"
      );
    }
  };

  const buildPdfDataFrom = (r) => {
    if (r) {
      return {
        student: r.student || r.studentData || null,
        parameters: r.parameters || r.params || r.parameters || [],
        feedbackSchema: r.feedbackSchema || r.feedback || {},
        overallRemarks: r.overallRemarks || r.remark || "",
        auditDate: r.auditDate || r.createdAt || r.date || form.auditDate,
        batch_name:
          r.batch_name ||
          (r.student && r.student.batch_name) ||
          form.batch_name,
        batch_no:
          r.batch_no || (r.student && r.student.batch_no) || form.batch_no,
      };
    }
    return {
      student: students.find((s) => s._id === form.studentId) || null,
      parameters: form.parameters,
      feedbackSchema: form.feedbackSchema,
      overallRemarks: form.overallRemarks,
      auditDate: form.auditDate,
      batch_name: form.batch_name,
      batch_no: form.batch_no,
    };
  };

  // ---------- Populate template (ensures centered badges)
  const populatePrintTemplate = async (data) => {
    const container = printRef.current;
    if (!container) return;

    // Student details
    const nameEl = container.querySelector(".print-student-name");
    const emailEl = container.querySelector(".print-student-email");
    const batchEl = container.querySelector(".print-batch");
    const batchNoEl = container.querySelector(".print-batch-no");
    const dateEl = container.querySelector(".print-audit-date");
    const overallEl = container.querySelector(".print-overall-remarks");

    if (nameEl) nameEl.textContent = data.student?.name || "Unnamed Student";
    if (emailEl) emailEl.textContent = data.student?.email || "-";
    if (batchEl)
      batchEl.textContent = data.batch_name || data.student?.batch_name || "-";
    if (batchNoEl)
      batchNoEl.textContent = data.batch_no ?? data.student?.batch_no ?? "-";
    if (dateEl) dateEl.textContent = formatDateForPrint(data.auditDate) || "-";
    if (overallEl) overallEl.textContent = data.overallRemarks || "-";

    // Parameters section
    const paramsContainer = container.querySelector(".print-parameters");
    if (paramsContainer) {
      paramsContainer.innerHTML = "";

      (data.parameters || []).forEach((p) => {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "space-between";
        wrapper.style.alignItems = "center";
        wrapper.style.padding = "10px 14px";
        wrapper.style.borderBottom = "1px solid #eef2f7";
        wrapper.style.fontSize = "12px";
        wrapper.style.boxSizing = "border-box";

        const nameDiv = document.createElement("div");
        nameDiv.textContent = p.name || "-";
        nameDiv.style.flex = "1";
        nameDiv.style.color = "#0f172a";
        nameDiv.style.marginRight = "12px";
        nameDiv.style.wordBreak = "break-word";

        // ---- FIXED BADGE ALIGNMENT ----
        const badge = document.createElement("div");
        const score = Number(p.score) || 0;
        badge.textContent = `${score} / 10`;

        // inside populatePrintTemplate badge creation
        badge.style.display = "flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
        badge.style.minWidth = "70px";
        badge.style.height = "30px";
        badge.style.borderRadius = "8px";
        badge.style.fontWeight = "700";
        badge.style.fontSize = "13px";
        badge.style.textAlign = "center";
        badge.style.boxSizing = "border-box";
        badge.style.padding = "0 10px 8px 10px";
        badge.style.whiteSpace = "nowrap";

        // ensure crisp vertical centering (important!)
        badge.style.lineHeight = "1";
        badge.style.verticalAlign = "middle";
        badge.style.margin = "0 auto"; // keep centered in flex rows
        badge.style.transform = "translateY(0)"; // neutralize subpixel shift
        badge.style.fontFamily = "Inter, Arial, Helvetica, sans-serif"; // consistent font metrics

        // Colors by score
        if (score >= 8) {
          badge.style.background = "#f0fdf4";
          badge.style.color = "#065f46";
          badge.style.border = "2px solid #86efac";
        } else if (score >= 5) {
          badge.style.background = "#fffbeb";
          badge.style.color = "#92400e";
          badge.style.border = "2px solid #fde68a";
        } else {
          badge.style.background = "#fef2f2";
          badge.style.color = "#991b1b";
          badge.style.border = "2px solid #fecaca";
        }

        wrapper.appendChild(nameDiv);
        wrapper.appendChild(badge);
        paramsContainer.appendChild(wrapper);
      });
    }

    // Feedback section
    const fbContainer = container.querySelector(".print-feedback");
    if (fbContainer) {
      fbContainer.innerHTML = "";
      const fb = data.feedbackSchema || {};
      ["point1", "point2", "point3"].forEach((k) => {
        const pEl = document.createElement("p");
        pEl.textContent = fb[k] || "-";
        pEl.style.marginBottom = "8px";
        pEl.style.fontSize = "12px";
        pEl.style.color = "#0f172a";
        fbContainer.appendChild(pEl);
      });
    }
  };

  const formatDateForPrint = (iso) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      const day = d.getDate();
      const month = d.toLocaleString("default", { month: "long" });
      const year = d.getFullYear();
      return `${day} ${month} ${year}`;
    } catch {
      return iso;
    }
  };

  const buildPdfFilename = (pdfData) => {
    const studentName = (pdfData?.student?.name || "student").replace(
      /\s+/g,
      "_"
    );
    const batchName = (pdfData?.batch_name || "batch").replace(/\s+/g, "_");
    const batchNo = pdfData?.batch_no ?? "";
    const datePart = pdfData?.auditDate
      ? new Date(pdfData.auditDate).toISOString().slice(0, 10)
      : "";
    return `${studentName}_${batchName}_${batchNo}_${datePart}`.replace(
      /__+/g,
      "_"
    );
  };

  // ---------- PDF generation (unchanged slicing)
  const generatePdfFromElement = async (el, filename = "report") => {
    if (!el) {
      toast.error("PDF element missing");
      return;
    }
    try {
      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth(); // 210
      const pdfHeight = pdf.internal.pageSize.getHeight(); // 297
      const margin = 5;
      const imgWidth = pdfWidth - margin * 2;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      const pxPerMm = canvasWidth / imgWidth;
      const sliceHeightPx = Math.floor((pdfHeight - margin * 2) * pxPerMm);

      let y = 0;
      let page = 0;
      while (y < canvasHeight) {
        const sliceCanvas = document.createElement("canvas");
        sliceCanvas.width = canvasWidth;
        const sliceHeight = Math.min(sliceHeightPx, canvasHeight - y);
        sliceCanvas.height = sliceHeight;

        const ctx = sliceCanvas.getContext("2d");
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);

        ctx.drawImage(
          canvas,
          0,
          y,
          canvasWidth,
          sliceHeight,
          0,
          0,
          canvasWidth,
          sliceHeight
        );

        const imgData = sliceCanvas.toDataURL("image/png");
        const imgHeightMm = sliceHeight / pxPerMm;

        if (page > 0) pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          margin,
          margin,
          imgWidth,
          imgHeightMm,
          undefined,
          "FAST"
        );

        y += sliceHeightPx;
        page += 1;
      }

      pdf.save(`${filename}.pdf`);
      toast.success("PDF generated");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate PDF");
    }
  };

  // ---------- Preview handler (no save)
  const handlePreview = async (e) => {
    e?.preventDefault?.();
    const pdfData = buildPdfDataFrom(null);
    await populatePrintTemplate(pdfData);
    setPreviewData(pdfData);
    setShowPreview(true);
  };

  return (
    <div className="relative">
      <Toaster position="top-right" />
      <Link to="/admin/dashboard" className="absolute top-10 left-20 ">
        <MoveLeft className=" cursor-pointer text-emerald-600" />
      </Link>

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-slate-50 p-6">
        <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-md border border-slate-200 rounded-3xl shadow-2xl p-6 space-y-6">
          {/* header */}
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-emerald-600 p-3 rounded-full text-white shadow-md">
              <Users size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">
              Add Student Report
            </h2>
          </div>

          {/* form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Batch Name"
                value={form.batch_name}
                onChange={(e) =>
                  setForm({ ...form, batch_name: e.target.value })
                }
                className="border outline-0 border-slate-300 rounded-xl px-4 py-2 bg-white/80 focus:ring-2 focus:ring-emerald-400"
              />
              <input
                type="number"
                placeholder="Batch No"
                value={form.batch_no}
                onChange={(e) => setForm({ ...form, batch_no: e.target.value })}
                className="border outline-0 border-slate-300 rounded-xl px-4 py-2 bg-white/80 focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <input
              type="date"
              value={form.auditDate}
              onChange={(e) => setForm({ ...form, auditDate: e.target.value })}
              className="border outline-0 border-slate-300 rounded-xl px-4 py-2 bg-white/80 focus:ring-2 focus:ring-emerald-400 w-full"
            />

            <select
              value={form.studentId}
              onChange={(e) => setForm({ ...form, studentId: e.target.value })}
              className="border outline-0 border-slate-300 rounded-xl px-4 py-2 bg-white/80 focus:ring-2 focus:ring-emerald-400 w-full"
            >
              <option value="">Select Student</option>
              {filteredStudents.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.email})
                </option>
              ))}
            </select>

            {/* Parameters */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                <Plus size={18} /> Parameters
              </h3>
              {form.parameters.map((p, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row items-center gap-2 border border-slate-200 rounded-xl p-2 bg-white/70"
                >
                  <input
                    type="text"
                    placeholder="Parameter Name"
                    value={p.name}
                    onChange={(e) =>
                      handleParamChange(i, "name", e.target.value)
                    }
                    className="flex-1 outline-0 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400"
                  />
                  <input
                    type="number"
                    placeholder="Score"
                    value={p.score}
                    onChange={(e) =>
                      handleParamChange(i, "score", e.target.value)
                    }
                    className="w-24 outline-0 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-400"
                  />
                  <button
                    type="button"
                    onClick={() => removeParameter(i)}
                    className="text-red-500 cursor-pointer p-2 rounded-full  hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={addParameter}
                  className="flex items-center cursor-pointer gap-1 text-blue-600 font-medium hover:underline"
                >
                  <Plus size={16} /> Add Parameter
                </button>
                <button
                  type="button"
                  onClick={handlePreview}
                  className="ml-auto cursor-pointer inline-flex items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-3 py-2 rounded-xl"
                >
                  <Eye size={16} /> Preview
                </button>
              </div>
            </div>

            {/* Feedback */}
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-slate-700">Feedback</h3>
              {["point1", "point2", "point3"].map((p) => (
                <textarea
                  key={p}
                  placeholder={`Point ${p.slice(-1)}`}
                  value={form.feedbackSchema[p]}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      feedbackSchema: {
                        ...form.feedbackSchema,
                        [p]: e.target.value,
                      },
                    })
                  }
                  className="w-full outline-0 px-4 py-2 rounded-xl border border-slate-300 bg-white/80 focus:ring-2 focus:ring-emerald-400 h-16"
                />
              ))}
            </div>

            <textarea
              placeholder="Overall Remarks"
              value={form.overallRemarks}
              onChange={(e) =>
                setForm({ ...form, overallRemarks: e.target.value })
              }
              className="w-full outline-0 px-4 py-2 rounded-xl border border-slate-300 bg-white/80 focus:ring-2 focus:ring-emerald-400 h-24"
            />

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 cursor-pointer w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-2xl shadow-md"
              >
                Save Report
              </button>

              <button
                type="button"
                onClick={handleSaveAndDownload}
                className="flex-1 w-full bg-white border border-emerald-600 text-emerald-700 font-semibold py-3 rounded-2xl shadow-sm hover:shadow-md cursor-pointer"
              >
                Save & Download PDF
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* ----------------------------
    Hidden printable template (A4 sized) — refactored
   ---------------------------- */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          top: -99999,
          left: -99999,
          width: `${A4_WIDTH_PX}px`,
          height: `${A4_HEIGHT_PX}px`,
          background: "#ffffff",
          boxSizing: "border-box",
          fontFamily: "Arial, Helvetica, sans-serif",
          color: "#0f172a",
          overflow: "hidden",
        }}
        className="print-page"
        aria-hidden="true"
      >
        {/* Letterhead: full width, fixed height (10% of A4) */}
        <div
          style={{
            width: `${A4_WIDTH_PX}px`,
            height: `${HEADER_HEIGHT_PX}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            boxSizing: "border-box",
            borderBottom: "1px solid #e6e6e6",
            background: "#ffffff",
          }}
        >
          {/* Left: logo area (keeps aspect, centered vertically) */}
          <div
            style={{
              flex: "0 0 auto",
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100vh",
              marginBottom: 20,
            }}
          >
            <img
              src={LOGO_URL || LOGO_DATA_URI}
              alt="logo"
              style={{
                height: `${HEADER_HEIGHT_PX}`, // safe padding inside header
                objectFit: "contain",
                display: "block",
                width: "100%",
              }}
            />
          </div>

          {/* Right: small meta placeholder (keeps letterhead clean) */}
          <div
            style={{
              flex: "0 0 180px",
              textAlign: "right",
              fontSize: 12,
              color: "#0f172a",
            }}
          >
            <div>
              <strong>Batch:</strong> <span className="print-batch">—</span>
            </div>
            <div style={{ marginTop: 4 }}>
              <strong>Batch No:</strong>{" "}
              <span className="print-batch-no">—</span>
            </div>
          </div>
        </div>

        {/* === Content area starts below the letterhead === */}
        <div
          style={{
            boxSizing: "border-box",
          }}
        >
          {/* Student meta (separate row - avoids any overlap with header) */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 12,
              marginTop: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 18, color: "#065f46", marginBottom: 4 }}>
                <strong className="print-student-name">Student Name</strong>
              </div>
              <div
                style={{ fontSize: 11, color: "#475569" }}
                className="print-student-email"
              >
                student@example.com
              </div>
            </div>

            <div style={{ textAlign: "right", fontSize: 12, color: "#0f172a" }}>
              <div style={{ marginBottom: 10 }}>
                <strong>Audit Date:</strong>{" "}
                <span className="print-audit-date">—</span>
              </div>
              <div>
                <strong>Generated:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Parameters header */}
          <div style={{ marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: 14, color: "#065f46" }}>
              Parameters
            </h3>
          </div>

          {/* Parameters list container — scrollable if many items, but capture will include full content */}
          <div
            className="print-parameters"
            style={{
              borderRadius: 8,
              overflow: "hidden",
              marginBottom: 24,
              // ensure there is plenty of room on page; html2canvas will capture whatever fits vertically,
              // and your slicing logic will paginate content that overflows the visible A4 height.
              maxHeight: `${A4_HEIGHT_PX - HEADER_HEIGHT_PX - 300}px`,
              overflowY: "auto",
              background: "#fff",
            }}
          >
            {/* rows will be dynamically appended here by populatePrintTemplate */}
          </div>

          {/* Overall Remarks */}
          <div style={{ marginTop: 20, marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 14, color: "#065f46" }}>
              Overall Remarks
            </h3>
            <div
              className="print-overall-remarks"
              style={{ fontSize: 12, color: "#0f172a" }}
            >
              —
            </div>
          </div>

          {/* Feedback */}
          <div style={{ marginTop: 32 }}>
            <h3 style={{ margin: "0 0 6px 0", fontSize: 14, color: "#065f46" }}>
              Feedback
            </h3>
            <div
              className="print-feedback"
              style={{ fontSize: 12, color: "#0f172a" }}
            />
          </div>

          {/* Footer placeholders */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: 60,
              alignItems: "flex-end",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  height: 60,
                  width: 220,
                  borderBottom: "1px solid #cbd5e1",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 12, color: "#334155" }}>
                Evaluator's Signature
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  height: 60,
                  width: 220,
                  borderBottom: "1px solid #cbd5e1",
                  marginBottom: 6,
                }}
              />
              <div style={{ fontSize: 12, color: "#334155" }}>
                Company Stamp
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --------- Preview modal (unchanged) ---------- */}
      {showPreview && (
        <PreviewModal
          data={previewData}
          onClose={() => setShowPreview(false)}
          onDownload={() => {
            const pdfData = previewData || buildPdfDataFrom(null);
            const filename = buildPdfFilename(pdfData);
            generatePdfFromElement(printRef.current, filename);
          }}
          logoSrc={LOGO_URL || LOGO_DATA_URI}
        />
      )}
    </div>
  );
}

/* ---------- Preview Modal ---------- */
function PreviewModal({ data, onClose, onDownload, logoSrc }) {
  if (!data) return null;
  const student = data.student || {};
  const params = data.parameters || [];
  const fb = data.feedbackSchema || {};

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="logo"
              style={{ height: 44, width: 44, borderRadius: 8 }}
            />
            <div>
              <div className="text-lg font-semibold text-emerald-700">
                {COMPANY_NAME}
              </div>
              <div className="text-sm text-slate-500">
                Technical Audit Report — Preview
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              className="inline-flex cursor-pointer items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg"
            >
              Download PDF
            </button>
            <button
              onClick={onClose}
              className="bg-slate-100 px-3 py-1 rounded-lg cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-sm text-slate-700 font-medium">
                {student.name || "Unnamed Student"}
              </div>
              <div className="text-xs text-slate-500">
                {student.email || "-"}
              </div>
            </div>
            <div className="text-right text-sm text-slate-600">
              <div>
                <strong>Batch:</strong> {data?.batch_name || "-"}
              </div>
              <div>
                <strong>Batch No:</strong> {data?.batch_no ?? "-"}
              </div>
              <div>
                <strong>Audit Date:</strong>{" "}
                {data?.auditDate
                  ? new Date(data.auditDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-emerald-600 font-semibold mb-2">Parameters</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {params.length ? (
                params.map((p, i) => {
                  const score = Number(p.score) || 0;
                  let badgeClass =
                    "bg-red-50 text-red-700 border border-red-200";
                  if (score >= 8)
                    badgeClass =
                      "bg-green-50 text-green-700 border border-green-200";
                  else if (score >= 5)
                    badgeClass =
                      "bg-yellow-50 text-yellow-700 border border-yellow-200";
                  return (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 rounded-xl border"
                    >
                      <div className="text-sm font-medium">{p.name || "-"}</div>
                      <div
                        className={`px-3 py-1 rounded-md font-semibold ${badgeClass}`}
                        style={{
                          minWidth: 64,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {score} / 10
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-sm text-slate-500">No parameters</div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-emerald-600 font-semibold mb-2">
              Overall Remarks
            </h4>
            <div className="text-sm text-slate-700">
              {data?.overallRemarks || "-"}
            </div>
          </div>

          <div>
            <h4 className="text-emerald-600 font-semibold mb-2">Feedback</h4>
            <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
              <li>{fb.point1 || "-"}</li>
              <li>{fb.point2 || "-"}</li>
              <li>{fb.point3 || "-"}</li>
            </ul>
          </div>

          <div className="flex justify-between items-end mt-6">
            <div className="text-center">
              <div className="h-14 w-48 border-b border-slate-200 mb-1" />
              <div className="text-xs text-slate-600">
                Evaluator's Signature
              </div>
            </div>
            <div className="text-center">
              <div className="h-14 w-48 border-b border-slate-200 mb-1" />
              <div className="text-xs text-slate-600">Company Stamp</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
