import React, { useState, useEffect } from "react";
import { X, ArrowRightLeft, User, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import { API } from "../../api/axios";

export default function TransferLectureModal({
  isOpen,
  onClose,
  lecture,
  teachers,
  onTransferSuccess,
  onConflict
}) {
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedTeacherId("");
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen || !lecture) return null;

  const currentTeacherName = lecture.teacherName || "Unknown Teacher";
  const currentTeacherId = lecture.teacherId || "";

  // Filter out the current teacher
  const availableTeachers = teachers.filter((t) => {
    const tId = t._id || t.id;
    return String(tId) !== String(currentTeacherId);
  });

  const handleSubmit = async () => {
    if (!selectedTeacherId) {
      toast.error("Please select a new teacher.");
      return;
    }

    setIsSubmitting(true);
    try {
      await API.post(`/schedules/${lecture.scheduleId}/lectures/${lecture._id || lecture.id}/transfer`, {
        newTeacherId: selectedTeacherId,
        reason
      });

      toast.success("Lecture transferred successfully.");
      if (onTransferSuccess) onTransferSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 409) {
        if (onConflict && err.response?.data?.conflictDetails) {
          onConflict(err.response.data.message, err.response.data.conflictDetails);
          onClose();
        } else {
          toast.error(err.response?.data?.message || "Conflict: Teacher already has a lecture at this time.");
        }
      } else {
        toast.error(err.response?.data?.message || "Failed to transfer lecture.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
              <ArrowRightLeft size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#1B2B4B]">Transfer Lecture</h2>
              <p className="text-sm text-[#64748B]">Assign lecture to another teacher</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#64748B] hover:text-[#1B2B4B] hover:bg-[#F8FAFC] rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 flex gap-3 text-blue-800 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <p>
              Transferring will reassign this lecture. The new teacher will take over all responsibilities for this session.
            </p>
          </div>

          {/* Current Teacher */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Current Teacher
            </label>
            <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3 text-gray-500">
              <User size={16} />
              <span className="font-medium text-sm">{currentTeacherName}</span>
            </div>
          </div>

          {/* New Teacher */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              New Teacher <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-sm font-medium text-[#1B2B4B] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all appearance-none"
            >
              <option value="" disabled>Select a teacher</option>
              {availableTeachers.map((t) => (
                <option key={t._id || t.id} value={t._id || t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Reason */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
              Reason (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Medical Leave, Teacher unavailable..."
              className="w-full bg-white border border-[#E2E8F0] rounded-lg px-4 py-3 text-sm font-medium text-[#1B2B4B] focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-none h-24"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[#E2E8F0] flex justify-end gap-3 bg-gray-50 mt-auto">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-[#64748B] hover:text-[#1B2B4B] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-[#2563EB] text-white px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-[#1D4ED8] transition-all shadow-sm disabled:opacity-70"
          >
            {isSubmitting ? (
              <span className="animate-pulse">Transferring...</span>
            ) : (
              <>
                <ArrowRightLeft size={16} /> Transfer Lecture
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
