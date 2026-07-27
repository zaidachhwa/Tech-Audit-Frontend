import React, { useState } from "react";
import { X, Calendar as CalendarIcon, Download, AlertCircle, Eye } from "lucide-react";
import toast from "react-hot-toast";
import { generateSchedulePDF } from "../../utils/generateSchedulePDF";

export default function DownloadScheduleModal({ isOpen, onClose, schedules, batches, teachers, onPreview }) {
  const [reportType, setReportType] = useState("all");
  const [selectedBatches, setSelectedBatches] = useState([]);
  const [selectedTeachers, setSelectedTeachers] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleToggleBatch = (id) => {
    setErrorMsg("");
    setSelectedBatches((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const handleToggleTeacher = (id) => {
    setErrorMsg("");
    setSelectedTeachers((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleGenerate = async (action = "download") => {
    setErrorMsg("");
    
    if (!startDate || !endDate) {
      setErrorMsg("Please select Start Date and End Date.");
      return;
    }

    if (new Date(endDate) < new Date(startDate)) {
      setErrorMsg("End Date cannot be before Start Date.");
      return;
    }

    if (reportType === "batches" && selectedBatches.length === 0) {
      setErrorMsg("Please select at least one Batch.");
      return;
    }

    if (reportType === "teachers" && selectedTeachers.length === 0) {
      setErrorMsg("Please select at least one Teacher.");
      return;
    }

    const filters = {
      type: reportType,
      selectedBatches,
      selectedTeachers,
      startDate,
      endDate,
    };

    try {
      const result = await generateSchedulePDF(schedules, filters, action);
      if (action === "preview") {
        onClose();
        if (onPreview) onPreview(`Schedule_Report_${new Date().getTime()}.pdf`, result);
      } else {
        toast.success("PDF generated successfully!");
        onClose();
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Failed to generate PDF. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8F0]">
          <h2 className="text-lg font-bold text-[#1B2B4B] flex items-center gap-2">
            <Download size={20} className="text-[#2563EB]" />
            Download Schedule Lectures
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:bg-[#F1F5F9] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 flex flex-col gap-5">
          {/* Report Type */}
          <div>
            <label className="block text-xs font-bold uppercase text-[#64748B] mb-1.5">
              Report Type <span className="text-red-500">*</span>
            </label>
            <div className="flex bg-[#F8FAFC] p-1 rounded-lg border border-[#E2E8F0]">
              <button
                onClick={() => {
                  setReportType("all");
                  setSelectedBatches([]);
                  setSelectedTeachers([]);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  reportType === "all"
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "text-[#64748B] hover:text-[#1B2B4B]"
                }`}
              >
                All
              </button>
              <button
                onClick={() => {
                  setReportType("batches");
                  setSelectedBatches([]);
                  setSelectedTeachers([]);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  reportType === "batches"
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "text-[#64748B] hover:text-[#1B2B4B]"
                }`}
              >
                Batches
              </button>
              <button
                onClick={() => {
                  setReportType("teachers");
                  setSelectedBatches([]);
                  setSelectedTeachers([]);
                }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  reportType === "teachers"
                    ? "bg-white text-[#2563EB] shadow-sm"
                    : "text-[#64748B] hover:text-[#1B2B4B]"
                }`}
              >
                Teachers
              </button>
            </div>
          </div>

          {/* Batch Selection */}
          {reportType === "batches" && (
            <div>
              <label className="block text-xs font-bold uppercase text-[#64748B] mb-1.5">
                Select Batches <span className="text-red-500">*</span>
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 max-h-48 overflow-y-auto flex flex-col gap-2">
                {batches.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No batches available.</p>
                ) : (
                  batches.map((b) => (
                    <label key={b._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        checked={selectedBatches.includes(b._id)}
                        onChange={() => handleToggleBatch(b._id)}
                      />
                      <span className="text-sm text-[#1B2B4B]">{b.batch_name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Teacher Selection */}
          {reportType === "teachers" && (
            <div>
              <label className="block text-xs font-bold uppercase text-[#64748B] mb-1.5">
                Select Teachers <span className="text-red-500">*</span>
              </label>
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 max-h-48 overflow-y-auto flex flex-col gap-2">
                {teachers.length === 0 ? (
                  <p className="text-sm text-[#64748B]">No teachers available.</p>
                ) : (
                  teachers.map((t) => (
                    <label key={t._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded border-[#CBD5E1] text-[#2563EB] focus:ring-[#2563EB]"
                        checked={selectedTeachers.includes(t._id)}
                        onChange={() => handleToggleTeacher(t._id)}
                      />
                      <span className="text-sm text-[#1B2B4B]">{t.name}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase text-[#64748B] mb-1.5">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none rounded-lg text-sm font-semibold text-[#1B2B4B] transition-all"
                />
                <CalendarIcon size={16} className="absolute left-3 top-3 text-[#64748B]" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-[#64748B] mb-1.5">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#CBD5E1] focus:border-[#2563EB] focus:outline-none rounded-lg text-sm font-semibold text-[#1B2B4B] transition-all"
                />
                <CalendarIcon size={16} className="absolute left-3 top-3 text-[#64748B]" />
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2 bg-blue-50 text-blue-800 p-3 rounded-lg text-xs mt-2">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <p>Ensure the start and end dates cover the schedules you wish to include in the report.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E2E8F0] flex items-center justify-between mt-auto">
          <div className="text-red-500 text-xs font-semibold">
            {errorMsg}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleGenerate("preview")}
              className="bg-white border border-[#E2E8F0] text-[#1B2B4B] px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#F8FAFC] transition-all shadow-sm"
            >
              <Eye size={16} className="text-[#2563EB]" /> View PDF
            </button>
            <button
              onClick={() => handleGenerate("download")}
              className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-sm"
            >
              <Download size={16} /> Download PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
