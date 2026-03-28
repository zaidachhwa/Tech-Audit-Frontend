import React, { useEffect, useState, useMemo } from 'react';
import { API } from '../../api/axios';
import { FileText, Eye, Trash2, X, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const groupedReports = useMemo(() => {
    const groups = {};
    reports.forEach(r => {
      const batchName = r.student?.batch_name;
      const batchNo = r.student?.batch_no;
      const key = (batchName && batchNo) ? `${batchName} - #${batchNo}` : "Unassigned";
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [reports]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports');
      setReports(res.data.reports || []);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async () => {
    try {
      await API.delete(`/reports/${deleteTarget._id}`);
      toast.success('Report deleted');
      setDeleteTarget(null);
      fetchReports();
    } catch {
      toast.error('Delete failed');
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-6 h-6 text-emerald-600" />
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Audit Reports</h1>
          <p className="text-sm text-gray-500">{reports.length} total reports</p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {loading ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            Loading reports...
          </div>
        ) : Object.keys(groupedReports).length === 0 ? (
          <div className="py-12 text-center text-gray-500 bg-white rounded-2xl shadow-sm border border-gray-100">
            No reports found
          </div>
        ) : (
          Object.entries(groupedReports).sort().map(([batchKey, batchReports]) => (
            <BatchAccordion
              key={batchKey}
              batchName={batchKey}
              reports={batchReports}
              onSelectedReport={setSelectedReport}
              onDeleteTarget={setDeleteTarget}
            />
          ))
        )}
      </div>

      {/* ================= VIEW MODAL ================= */}
      <AnimatePresence>
        {selectedReport && (
          <Modal onClose={() => setSelectedReport(null)}>
            {/* HEADER */}
            <div className="relative mb-6">
              {/* Close button - absolute top-right */}
              <button
                onClick={() => setSelectedReport(null)}
                className="absolute -top-1 -right-1 w-8 h-8 flex items-center justify-center
                           text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                           rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Title and Download button */}
              <div className="flex items-center justify-between pr-10">
                <h2 className="text-lg font-semibold text-gray-900">
                  Report Details
                </h2>

                <button
                  onClick={async () => {
                    try {
                      if (!selectedReport) {
                        toast.error('Report data not available');
                        return;
                      }

                      const res = await fetch(
                        `${import.meta.env.VITE_API_URL}/reports/${selectedReport._id}/pdf`,
                      );

                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);

                      // 🔥 Build meaningful filename
                      const studentName =
                        selectedReport.student?.name?.replace(/\s+/g, '_') ||
                        'Student';

                      const batchName =
                        selectedReport.student?.batch_name || 'Batch';
                      const batchNo = selectedReport.student?.batch_no || '';
                      const date = new Date(selectedReport.auditDate)
                        .toISOString()
                        .split('T')[0];

                      const fileName = `${studentName}-${batchName}-${batchNo}-${date}.pdf`;

                      const a = document.createElement('a');
                      a.href = url;
                      a.download = fileName;
                      document.body.appendChild(a);
                      a.click();

                      a.remove();
                      window.URL.revokeObjectURL(url);
                    } catch (err) {
                      console.error('Download failed', err);
                      toast.error('Download failed');
                    }
                  }}
                  className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg 
             text-gray-700 hover:bg-gray-100 transition"
                >
                  Download
                </button>
              </div>
            </div>

            {/* STUDENT INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-sm">
              <Info label="Student Name" value={selectedReport.student?.name} />
              <Info label="Email" value={selectedReport.student?.email} />
              <Info
                label="Batch"
                value={`${selectedReport.student?.batch_name} - ${selectedReport.student?.batch_no}`}
              />
              <Info
                label="Audit Date"
                value={new Date(selectedReport.auditDate).toLocaleDateString()}
              />
            </div>

            {/* PARAMETERS */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Parameters
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {selectedReport.parameters?.map((p) => (
                  <div
                    key={p._id}
                    className="rounded-xl border bg-emerald-50/40 px-3 py-2"
                  >
                    <div className="text-xs text-gray-500">{p.name}</div>
                    <div className="text-lg font-semibold text-emerald-700">
                      {p.score} / 10
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* FEEDBACK */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">
                Feedback
              </h3>

              {selectedReport.feedbackSchema?.map((f, idx) => (
                <ul
                  key={idx}
                  className="list-disc list-inside text-sm text-gray-700 space-y-1"
                >
                  {f.point1 && <li>{f.point1}</li>}
                  {f.point2 && <li>{f.point2}</li>}
                  {f.point3 && <li>{f.point3}</li>}
                </ul>
              ))}
            </div>

            {/* OVERALL REMARKS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-1">
                Overall Remarks
              </h3>
              <p className="text-sm text-gray-800 bg-gray-50 rounded-xl p-3 border">
                {selectedReport.overallRemarks || '—'}
              </p>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ================= DELETE MODAL ================= */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <h2 className="text-lg font-semibold mb-3 text-red-600">
              Delete Report
            </h2>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this report?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg border"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg bg-red-600 text-white"
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function BatchAccordion({ batchName, reports, onSelectedReport, onDeleteTarget }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition border-b border-gray-100"
      >
        <div className="flex items-center gap-3">
          {isOpen ? <ChevronDown className="w-5 h-5 text-gray-500" /> : <ChevronRight className="w-5 h-5 text-gray-500" />}
          <span className="font-semibold text-gray-800">{batchName}</span>
          <span className="text-xs bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Audit Date</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r) => (
                    <tr key={r._id} className="border-b last:border-0 border-gray-50 hover:bg-emerald-50/40 transition">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {r.student?.name}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {r.student?.email}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(r.auditDate).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onSelectedReport(r)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition shadow-sm"
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => onDeleteTarget(r)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs hover:bg-red-100 transition"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="bg-white rounded-2xl p-6 w-full max-w-lg relative shadow-xl"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value || '—'}</div>
    </div>
  );
}