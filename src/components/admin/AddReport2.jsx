// AddReport.jsx
import React, { useEffect, useRef, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { API } from "../../api/axios";
import {
  Users,
  Plus,
  Trash2,
  Eye,
  FileText,
  Download,
  Save,
  Calendar,
  Mail,
  Hash,
  BookOpen,
  ChevronDown,
} from "lucide-react";
import image from "../../assets/letter_head.jpg";
import { AnimatePresence, motion } from "framer-motion";

const LOGO_URL = image;

export default function AddReport2() {
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

  const [previewPdfUrl, setPreviewPdfUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  const DEFAULTS_KEY = "report_param_defaults";

  

  useEffect(() => {
    API.get("/students/list")
      .then((res) => {
        const data = res.data?.students || res.data?.data?.students || [];
        // console.log(data)
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

  useEffect(() => {
    // only check draft when select student and date
    if(!form.studentId || !form.auditDate) return;

    //call backend and fetch the draft
    API.get("/reports/draft" , {
      params: {
        studentId : form.studentId,
        auditDate: form.auditDate,
      },
    })
    .then((res) => {
      //if draft get auto fill
      if(res.data){
        setForm((prev) => ({
          ...prev,

          //parameters load
          parameters: res.data.parameters?.length
          ? res.data.parameters
          :prev.parameters,

          //feedabck schema
          feedbackSchema:
          res.data.feedbackSchema?.[0] || prev.feedbackSchema,

          //remarks load
          overallRemarks: res.data.overallRemarks || "",
        }));
        toast("Draft loaded")
      }
    })
    .catch(() => {
      //silent failed it dont disturb the user
    });
  }, [form.studentId, form.auditDate]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }
    };
  }, [previewPdfUrl]);

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

  // Parameter helpers
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

  // Defaults utilities
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

  // Save only
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

  // Save + Download PDF
  const handleSaveAndDownload = async (e) => {
    e.preventDefault();

    try {
      const res = await API.post("/reports/create", {
        studentId: form.studentId,
        parameters: form.parameters,
        feedbackSchema: form.feedbackSchema,
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });

      const reportId = res.data?.report?._id || res.data?._id;
      const name = res.data?.report?.student?.name;
      const batchName = res.data?.report?.student?.batch_name;
      const batchNo = res.data?.report?.student?.batch_no;
      const auditDate = res.data?.report?.auditDate;
      const formatAuditDate = auditDate
        ? new Date(auditDate).toISOString().slice(0, 10)
        : "";
      toast.success("Report saved");

      // Fetch PDF as blob
      const pdfResponse = await API.get(`/reports/${reportId}/pdf`, {
        responseType: "blob",
      });

      // Create download link
      const blob = new Blob([pdfResponse.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${name}-${batchName}-${batchNo}-${formatAuditDate}.pdf`;
      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      toast.error("Failed to save or download report");
    }
  };

  // Preview handler - calls backend preview endpoint
  const handlePreview = async (e) => {
    e?.preventDefault?.();
    
    // Validate required fields
    if (!form.studentId) {
      toast.error("Please select a student");
      return;
    }
    
    if (!form.parameters.length || !form.parameters.some(p => p.name && p.score)) {
      toast.error("Please add at least one parameter with name and score");
      return;
    }

    setIsLoadingPreview(true);

    try {
      // Get student data
      const student = students.find((s) => s._id === form.studentId);
      
      if (!student) {
        toast.error("Student not found");
        return;
      }

      // Call backend preview endpoint
      const response = await API.post(
        "/reports/preview",
        {
          student: {
            name: student.name,
            email: student.email,
            batch_name: form.batch_name,
            batch_no: form.batch_no,
          },
          parameters: form.parameters,
          feedbackSchema: form.feedbackSchema,
          overallRemarks: form.overallRemarks,
          auditDate: form.auditDate,
        },
        { responseType: "blob" }
      );

      // Create blob URL for preview
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      // Clean up old URL if exists
      if (previewPdfUrl) {
        URL.revokeObjectURL(previewPdfUrl);
      }

      setPreviewPdfUrl(url);
      setShowPreview(true);
      toast.success("Preview generated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate preview");
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const handleSaveDraft = async () => {
    try{
      await API.post("/reports/draft", {
        studentId: form.studentId,
        parameters: form.parameters,
        feedbackSchema: form.feedbackSchema,
        overallRemarks: form.overallRemarks,
        auditDate: form.auditDate,
      });

      toast.success("Draft saved");
    } catch (err){
      toast.error("Draft saved failed");
    }
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
                  disabled={isLoadingPreview}
                  className="ml-auto cursor-pointer inline-flex items-center gap-2 bg-white border border-emerald-600 text-emerald-700 px-4 py-2 rounded-lg hover:bg-emerald-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Eye size={18} /> 
                  {isLoadingPreview ? "Generating..." : "Preview Report"}
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
              
              {/* Save Draft Button */}
              <motion.button
                whileHover = {{ scale: 1.02 }}
                whileTap = {{ scale: 0.98 }}
                type = "button"
                onClick={handleSaveDraft}
                className="flex-1 cursor-pointer bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3.5 rounded-lg shadow-sm transition flex items-center justify-center gap-2" >
                  Save Draft
                </motion.button>
                

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

      {/* Preview modal */}
      <AnimatePresence>
        {showPreview && previewPdfUrl && (
          <PreviewModal
            pdfUrl={previewPdfUrl}
            onClose={() => {
              setShowPreview(false);
              // Clean up the URL after modal closes
              setTimeout(() => {
                if (previewPdfUrl) {
                  URL.revokeObjectURL(previewPdfUrl);
                  setPreviewPdfUrl(null);
                }
              }, 300);
            }}
            logoSrc={LOGO_URL}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Preview Modal ---------- */
function PreviewModal({ pdfUrl, onClose, logoSrc }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 min-h-screen flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-6xl overflow-hidden h-[95vh] flex flex-col border border-gray-200"
      >
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              <img
                src={logoSrc}
                alt="logo"
                className="h-8 w-8 object-contain"
              />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900">
                Report Preview
              </div>
              <div className="text-xs text-gray-600">
                Review your report before saving
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="bg-white hover:bg-gray-50 border border-gray-300 px-4 py-2 rounded-lg cursor-pointer text-gray-700 transition font-medium"
          >
            Close
          </motion.button>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-hidden bg-gray-100">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Report Preview"
          />
        </div>
      </motion.div>
    </motion.div>
  );
}