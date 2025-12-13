// AddReport.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { API } from "../../api/axios";
import {
  Users,
  Plus,
  Trash2,
  Eye,
  MoveLeft,
  FileText,
  Download,
  Save,
  Calendar,
  Mail,
  Hash,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import image from "../../assets/letter_head.jpg";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/**
 * AddReport (Save / Save & Download PDF / Preview)
 * Formal minimal theme with emerald accents
 */

const COMPANY_NAME = "Nexcore Alliance ";
const LOGO_URL = image;
const LOGO_DATA_URI = image;

export default function AddReport() {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
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
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  const A4_WIDTH_PX = 800;
  const A4_HEIGHT_PX = 1150;
  const HEADER_HEIGHT_PX = Math.round(A4_HEIGHT_PX * 0.2);

  const DEFAULTS_KEY = "report_param_defaults";

  useEffect(() => {
    API.get("/students/list")
      .then((res) => {
        const data = res.data?.students || res.data?.data?.students || [];
        setStudents(data);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch students");
      });

    API.get("/batches/public")
      .then((res) => {
        setBatches(res.data || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error("Failed to fetch batches");
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

  // Get unique batch names
  const getUniqueBatchNames = () => {
    const uniqueNames = [...new Set(batches.map((b) => b.batch_name))];
    return uniqueNames.sort();
  };

  // Get batch numbers for selected batch name
  const getBatchNumbers = (batchName) => {
    if (!batchName) return [];
    const numbers = batches
      .filter((b) => b.batch_name === batchName)
      .map((b) => b.batch_no)
      .sort((a, b) => a - b);
    return numbers;
  };

  // ---------- Parameter helpers ----------
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

  // ---------- Defaults utilities ----------
  const saveDefaultsToLocal = () => {
    try {
      const names = form.parameters
        .map((p) => (p.name || "").trim())
        .filter(Boolean);
      if (!names.length) {
        toast.error("No parameter names to save");
        return;
      }
      localStorage.setItem(DEFAULTS_KEY, JSON.stringify(names));
      toast.success("Parameter defaults saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save defaults");
    }
  };

  const loadDefaultsFromLocal = () => {
    try {
      const raw = localStorage.getItem(DEFAULTS_KEY);
      if (!raw) {
        toast.error("No saved defaults found");
        return;
      }
      const names = JSON.parse(raw);
      if (!Array.isArray(names) || !names.length) {
        toast.error("Saved defaults invalid");
        return;
      }
      const params = names.map((n) => ({ name: n, score: "" }));
      setForm({ ...form, parameters: params });
      toast.success("Defaults loaded (scores left empty)");
    } catch (err) {
      console.error(err);
      toast.error("Failed to load defaults");
    }
  };

  const clearDefaultsFromLocal = () => {
    try {
      localStorage.removeItem(DEFAULTS_KEY);
      toast.success("Defaults cleared");
    } catch (err) {
      console.error(err);
      toast.error("Failed to clear defaults");
    }
  };

  // ---------- Save only ----------
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

  // ---------- Save + Generate PDF ----------
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

  // ---------- Populate template ----------
  const populatePrintTemplate = async (data) => {
    const container = printRef.current;
    if (!container) return;

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

    const paramsContainer = container.querySelector(".print-parameters");
    if (paramsContainer) {
      paramsContainer.innerHTML = "";

      (data.parameters || []).forEach((p) => {
        const wrapper = document.createElement("div");
        wrapper.style.display = "flex";
        wrapper.style.justifyContent = "space-between";
        wrapper.style.alignItems = "center";
        wrapper.style.padding = "12px 16px";
        wrapper.style.borderBottom = "1px solid #e5e7eb";
        wrapper.style.fontSize = "13px";
        wrapper.style.boxSizing = "border-box";

        const nameDiv = document.createElement("div");
        nameDiv.textContent = p.name || "-";
        nameDiv.style.flex = "1";
        nameDiv.style.color = "#111827";
        nameDiv.style.fontWeight = "500";
        nameDiv.style.marginRight = "16px";
        nameDiv.style.wordBreak = "break-word";

        const badge = document.createElement("div");
        const score = Number(p.score) || 0;
        badge.textContent = `${score} / 10`;

        badge.style.display = "inline-flex";
        badge.style.alignItems = "center";
        badge.style.justifyContent = "center";
        badge.style.minWidth = "75px";
        badge.style.height = "32px";
        badge.style.borderRadius = "6px";
        badge.style.fontWeight = "700";
        badge.style.fontSize = "13px";
        badge.style.textAlign = "center";
        badge.style.boxSizing = "border-box";
        badge.style.padding = "0 12px";
        badge.style.whiteSpace = "nowrap";
        badge.style.lineHeight = "32px";
        badge.style.fontFamily = "Inter, Arial, Helvetica, sans-serif";

        if (score >= 8) {
          badge.style.background = "#ecfdf5";
          badge.style.color = "#047857";
          badge.style.border = "1.5px solid #6ee7b7";
        } else if (score >= 5) {
          badge.style.background = "#fffbeb";
          badge.style.color = "#b45309";
          badge.style.border = "1.5px solid #fcd34d";
        } else {
          badge.style.background = "#fef2f2";
          badge.style.color = "#b91c1c";
          badge.style.border = "1.5px solid #fca5a5";
        }

        wrapper.appendChild(nameDiv);
        wrapper.appendChild(badge);
        paramsContainer.appendChild(wrapper);
      });
    }

    const fbContainer = container.querySelector(".print-feedback");
    if (fbContainer) {
      fbContainer.innerHTML = "";
      const fb = data.feedbackSchema || {};
      ["point1", "point2", "point3"].forEach((k, idx) => {
        const itemWrapper = document.createElement("div");
        itemWrapper.style.display = "flex";
        itemWrapper.style.gap = "10px";
        itemWrapper.style.alignItems = "flex-start";
        itemWrapper.style.marginBottom = "10px";

        const bullet = document.createElement("div");
        bullet.textContent = `${idx + 1}.`;
        bullet.style.fontWeight = "700";
        bullet.style.color = "#059669";
        bullet.style.fontSize = "13px";
        bullet.style.minWidth = "20px";

        const pEl = document.createElement("div");
        pEl.textContent = fb[k] || "-";
        pEl.style.fontSize = "13px";
        pEl.style.color = "#111827";
        pEl.style.lineHeight = "1.6";
        pEl.style.flex = "1";

        itemWrapper.appendChild(bullet);
        itemWrapper.appendChild(pEl);
        fbContainer.appendChild(itemWrapper);
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

  // ---------- PDF generation ----------
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

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
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

  // ---------- Preview handler ----------
  const handlePreview = async (e) => {
    e?.preventDefault?.();
    const pdfData = buildPdfDataFrom(null);
    await populatePrintTemplate(pdfData);
    setPreviewData(pdfData);
    setShowPreview(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />

      {/* Main Container */}
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          {/* Header */}
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="flex items-center gap-4">
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                <FileText size={28} className="text-emerald-600" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Add Student Report
                </h2>
                <p className="text-gray-600 text-sm mt-1">
                  Create detailed performance reports with ease
                </p>
              </div>
            </div>
          </div>

          {/* Form */}
          <form className="p-8 space-y-6" onSubmit={handleSubmit}>
            {/* Batch Info Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Hash size={20} className="text-emerald-600" />
                Batch Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* BATCH NAME DROPDOWN */}
                <div className="relative">
                  <BookOpen
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  />
                  <select
                    value={form.batch_name}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        batch_name: e.target.value,
                        batch_no: "",
                        studentId: "",
                      });
                    }}
                    className="w-full border border-gray-300 outline-none bg-white rounded-lg pl-12 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none cursor-pointer"
                  >
                    <option value="">Select Batch Name</option>
                    {getUniqueBatchNames().map((batchName) => (
                      <option key={batchName} value={batchName}>
                        {batchName}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>

                {/* BATCH NUMBER DROPDOWN */}
                <div className="relative">
                  <Hash
                    size={18}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10"
                  />
                  <select
                    value={form.batch_no}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        batch_no: e.target.value,
                        studentId: "",
                      });
                    }}
                    disabled={!form.batch_name}
                    className="w-full border border-gray-300 outline-none bg-white rounded-lg pl-12 pr-10 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    <option value="">
                      {form.batch_name
                        ? "Select Batch Number"
                        : "Select Batch Name First"}
                    </option>
                    {getBatchNumbers(form.batch_name).map((batchNo) => (
                      <option key={batchNo} value={batchNo}>
                        Batch #{batchNo}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
              </div>
            </div>

            {/* Date and Student Selection */}
            <div className="space-y-4">
              <div className="relative">
                <Calendar
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.auditDate}
                  onChange={(e) =>
                    setForm({ ...form, auditDate: e.target.value })
                  }
                  className="w-full border border-gray-300 outline-none bg-white rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                />
              </div>

              <div className="relative">
                <Users
                  size={18}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                />
                <select
                  value={form.studentId}
                  onChange={(e) =>
                    setForm({ ...form, studentId: e.target.value })
                  }
                  disabled={!form.batch_name || !form.batch_no}
                  className="w-full border border-gray-300 outline-none bg-white rounded-lg pl-12 pr-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition appearance-none cursor-pointer disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {form.batch_name && form.batch_no
                      ? "Select Student"
                      : "Select Batch First"}
                  </option>
                  {filteredStudents.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.email})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parameters Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Plus size={20} className="text-emerald-600" />
                  Performance Parameters
                </h3>

                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={saveDefaultsToLocal}
                    className="cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm transition shadow-sm"
                    title="Save parameter names as defaults"
                  >
                    Save Defaults
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={loadDefaultsFromLocal}
                    className="cursor-pointer bg-white border border-emerald-600 text-emerald-700 px-3 py-1.5 rounded-lg text-sm hover:bg-emerald-50 transition"
                    title="Load default parameter names"
                  >
                    Load Defaults
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={clearDefaultsFromLocal}
                    className="cursor-pointer bg-white border border-red-400 text-red-600 px-3 py-1.5 rounded-lg text-sm hover:bg-red-50 transition"
                    title="Clear saved defaults"
                  >
                    Clear
                  </motion.button>
                </div>
              </div>

              <div className="space-y-3">
                {form.parameters.map((p, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col sm:flex-row items-center gap-3 bg-white rounded-lg p-3 border border-gray-200"
                  >
                    <input
                      type="text"
                      placeholder="Parameter Name"
                      value={p.name}
                      onChange={(e) =>
                        handleParamChange(i, "name", e.target.value)
                      }
                      className="flex-1 outline-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <input
                      type="number"
                      placeholder="Score"
                      value={p.score}
                      onChange={(e) =>
                        handleParamChange(i, "score", e.target.value)
                      }
                      className="w-full sm:w-24 outline-none px-4 py-2.5 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                    />
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      type="button"
                      onClick={() => removeParameter(i)}
                      className="text-red-500 cursor-pointer p-2 rounded-full hover:bg-red-50 transition"
                    >
                      <Trash2 size={18} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>

              <div className="flex items-center gap-4 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={addParameter}
                  className="flex items-center cursor-pointer gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition"
                >
                  <Plus size={18} /> Add Parameter
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={handlePreview}
                  className="ml-auto cursor-pointer inline-flex items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition"
                >
                  <Eye size={18} /> Preview Report
                </motion.button>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText size={20} className="text-emerald-600" />
                Feedback Points
              </h3>
              <div className="space-y-3">
                {["point1", "point2", "point3"].map((p, idx) => (
                  <textarea
                    key={p}
                    placeholder={`Feedback Point ${idx + 1}`}
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
                    className="w-full outline-none px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition h-20 resize-none"
                  />
                ))}
              </div>
            </div>

            {/* Overall Remarks */}
            <div>
              <textarea
                placeholder="Overall Remarks & Summary"
                value={form.overallRemarks}
                onChange={(e) =>
                  setForm({ ...form, overallRemarks: e.target.value })
                }
                className="w-full outline-none px-4 py-3 rounded-lg border border-gray-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition h-28 resize-none"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="flex-1 cursor-pointer bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                <Save size={20} />
                Save Report
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={handleSaveAndDownload}
                className="flex-1 cursor-pointer bg-white border border-emerald-600 text-emerald-700 font-semibold py-3.5 rounded-lg hover:bg-emerald-50 transition flex items-center justify-center gap-2"
              >
                <Download size={20} />
                Save & Download PDF
              </motion.button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Hidden printable template */}
      <div
        ref={printRef}
        style={{
          position: "fixed",
          top: -99999,
          left: -99999,
          width: `full`,
          // width: `${A4_WIDTH_PX}px`,
          // minHeight: `100%`, // ✅ FIXED
          minHeight: `${A4_HEIGHT_PX}px`, // ✅ FIXED
          background: "#ffffff",
          boxSizing: "border-box",
          fontFamily: "Inter, Arial, Helvetica, sans-serif",
          color: "#111827",
          overflow: "hidden",
          // padding: "20px",
          display: "flex", // ✅ REQUIRED
          flexDirection: "column", // ✅ REQUIRED
        }}
        className="print-page"
        aria-hidden="true"
      >
        <div
          style={{
            width: "100%",
            height: `full`,
            // height: `${HEADER_HEIGHT_PX}px`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            // paddingBottom: "16px",
            boxSizing: "border-box",
            // borderBottom: "2px solid #e5e7eb",
            background: "#ffffff",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              flex: "1",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <img
              src={LOGO_URL || LOGO_DATA_URI}
              alt="logo"
              style={{
                height: `${HEADER_HEIGHT_PX}px`,
                objectFit: "contain",
                display: "block",
              }}
            />
          </div>
        </div>

        <div
          style={{
            flex: "0 0 auto",
            textAlign: "right",
            fontSize: "13px",
            color: "#111827",
            lineHeight: "1.8",
            fontFamily: "Arial, sans-serif",
            minWidth: "120px",
          }}
        >
          <div style={{ marginBottom: "4px" }}>
            <strong>Batch :</strong>{" "}
            <span className="print-batch" style={{ fontWeight: "500" }}>
              FSD
            </span>
          </div>

          <div>
            <strong>Batch No :</strong>{" "}
            <span className="print-batch-no" style={{ fontWeight: "500" }}>
              4
            </span>
          </div>
        </div>

        <div style={{ boxSizing: "border-box" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: "20px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e5e7eb",
            }}
          >
            <div>
              <div
                style={{
                  fontSize: "20px",
                  color: "#059669",
                  marginBottom: "6px",
                  fontWeight: "700",
                }}
              >
                <span className="print-student-name">Student Name</span>
              </div>
              <div
                style={{ fontSize: "13px", color: "#6b7280" }}
                className="print-student-email"
              >
                student@example.com
              </div>
            </div>

            <div
              style={{
                textAlign: "right",
                fontSize: "13px",
                color: "#111827",
                lineHeight: "1.8",
              }}
            >
              <div>
                <strong>Audit Date:</strong>{" "}
                <span className="print-audit-date">—</span>
              </div>
              <div>
                <strong>Generated:</strong> {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "16px" }}>
            <h3
              style={{
                margin: 0,
                fontSize: "16px",
                color: "#059669",
                fontWeight: "700",
                marginBottom: "12px",
              }}
            >
              Performance Parameters
            </h3>
          </div>

          <div
            className="print-parameters"
            style={{
              borderRadius: "8px",
              overflow: "hidden",
              marginBottom: "24px",
              border: "1px solid #e5e7eb",
              background: "#fff",
            }}
          />

          <div style={{ marginTop: "24px", marginBottom: "16px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                color: "#059669",
                fontWeight: "700",
              }}
            >
              Overall Remarks
            </h3>
            <div
              className="print-overall-remarks"
              style={{
                fontSize: "13px",
                color: "#111827",
                lineHeight: "1.6",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            >
              —
            </div>
          </div>

          <div style={{ marginTop: "24px", marginBottom: "24px" }}>
            <h3
              style={{
                margin: "0 0 10px 0",
                fontSize: "16px",
                color: "#059669",
                fontWeight: "700",
              }}
            >
              Feedback Points
            </h3>
            <div
              className="print-feedback"
              style={{
                fontSize: "13px",
                color: "#111827",
                padding: "12px",
                background: "#f9fafb",
                borderRadius: "6px",
                border: "1px solid #e5e7eb",
              }}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              marginTop: "40px",
              paddingTop: "20px",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  height: "60px",
                  width: "200px",
                  borderBottom: "2px solid #d1d5db",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Evaluator's Signature and Stamp
              </div>
            </div>

            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  height: "60px",
                  width: "200px",
                  borderBottom: "2px solid #d1d5db",
                  marginBottom: "8px",
                }}
              />
              <div style={{ fontSize: "12px", color: "#6b7280" }}>
                Student's Signature
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Preview modal */}
      <AnimatePresence>
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
      </AnimatePresence>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-lg w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col border border-gray-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <img
                src={logoSrc}
                alt="logo"
                className="h-10 w-10 object-contain"
              />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">
                Nexcore Alliance
              </div>
              <div className="text-sm text-gray-600">
                Technical Audit Report — Preview
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onDownload}
              className="inline-flex cursor-pointer items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg transition shadow-sm"
            >
              <Download size={18} />
              Download PDF
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="bg-white hover:bg-gray-50 border border-gray-300 px-3 py-2 rounded-lg cursor-pointer text-gray-700 transition"
            >
              Close
            </motion.button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Student Info */}
          <div className="flex items-start justify-between bg-gray-50 p-5 rounded-lg border border-gray-200">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Users size={18} className="text-emerald-600" />
                <div className="text-lg font-semibold text-gray-900">
                  {student.name || "Unnamed Student"}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Mail size={14} />
                {student.email || "-"}
              </div>
            </div>
            <div className="text-right text-sm text-gray-700 space-y-2">
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                <strong>Batch:</strong> {data?.batch_name || "-"}
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                <strong>Batch No:</strong> {data?.batch_no ?? "-"}
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-gray-200">
                <strong>Audit Date:</strong>{" "}
                {data?.auditDate
                  ? new Date(data.auditDate).toLocaleDateString()
                  : "-"}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Performance Parameters
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {params.length ? (
                params.map((p, i) => {
                  const score = Number(p.score) || 0;
                  let badgeClass =
                    "bg-red-50 text-red-700 border-2 border-red-200";
                  if (score >= 8)
                    badgeClass =
                      "bg-green-50 text-green-700 border-2 border-green-200";
                  else if (score >= 5)
                    badgeClass =
                      "bg-yellow-50 text-yellow-700 border-2 border-yellow-200";

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="flex items-center justify-between p-4 rounded-lg bg-white border border-gray-200"
                    >
                      <div className="text-sm font-medium text-gray-900">
                        {p.name || "-"}
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-lg font-bold text-sm ${badgeClass}`}
                        style={{
                          minWidth: 70,
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                        }}
                      >
                        {score} / 10
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="text-sm text-gray-500 col-span-2 text-center py-4">
                  No parameters available
                </div>
              )}
            </div>
          </div>

          {/* Overall Remarks */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Overall Remarks
            </h4>
            <div className="text-sm text-gray-700 bg-white p-4 rounded-lg border border-gray-200">
              {data?.overallRemarks || "-"}
            </div>
          </div>

          {/* Feedback */}
          <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <FileText size={18} className="text-emerald-600" />
              Feedback Points
            </h4>
            <div className="space-y-2">
              {["point1", "point2", "point3"].map((key, idx) => (
                <div
                  key={key}
                  className="flex gap-3 items-start bg-white p-3 rounded-lg border border-gray-200"
                >
                  <div className="flex-shrink-0 w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {idx + 1}
                  </div>
                  <div className="text-sm text-gray-700 flex-1">
                    {fb[key] || "-"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end gap-6 pt-6 border-t border-gray-200">
            <div className="text-center flex-1">
              <div className="h-16 border-b-2 border-gray-300 mb-2" />
              <div className="text-xs text-gray-600 font-medium">
                Evaluator's Signature
              </div>
            </div>
            <div className="text-center flex-1">
              <div className="h-16 border-b-2 border-gray-300 mb-2" />
              <div className="text-xs text-gray-600 font-medium">
                Company Stamp
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
