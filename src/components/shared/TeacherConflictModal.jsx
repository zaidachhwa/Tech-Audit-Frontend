import React from "react";
import { AlertCircle, X, Clock, CalendarDays, BookOpen, User, Hash } from "lucide-react";

export default function TeacherConflictModal({ isOpen, onClose, conflictDetails, message }) {
  if (!isOpen || !conflictDetails) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-red-50">
          <div className="flex items-center gap-3 text-red-600">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle size={20} className="text-red-600" />
            </div>
            <h2 className="text-lg font-semibold">Teacher Schedule Conflict</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-700 font-medium mb-6 leading-relaxed">
            {message || "This teacher is already assigned to another lecture during the selected date and time. Please select another teacher or choose a different time slot."}
          </p>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
              <User size={16} />
              Teacher: <span className="text-gray-900">{conflictDetails.teacherName}</span>
            </h3>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                  <BookOpen size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Subject</p>
                  <p className="text-sm font-semibold text-gray-900">{conflictDetails.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                    <CalendarDays size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Date</p>
                    <p className="text-sm font-semibold text-gray-900">{conflictDetails.date}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                    <Clock size={16} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Time</p>
                    <p className="text-sm font-semibold text-gray-900">{conflictDetails.time}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                  <Hash size={16} />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Batch</p>
                  <p className="text-sm font-semibold text-gray-900">{conflictDetails.batch}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
}
