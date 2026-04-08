import React, { useEffect, useState, useMemo } from 'react';
import { API } from '../../api/axios';
import {
  FileText,
  Eye,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Download,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export default function ReportsList() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteBatchTarget, setDeleteBatchTarget] = useState(null);

  const groupedReports = useMemo(() => {
    const groups = {};
    reports.forEach((r) => {
      const batchName = r.student?.batch_name;
      const batchNo = r.student?.batch_no;
      const key =
        batchName && batchNo ? `${batchName} - #${batchNo}` : 'Unassigned';
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

  const handleBatchDelete = async () => {
    try {
      if (!deleteBatchTarget || deleteBatchTarget.length === 0) return;
      setLoading(true);
      await Promise.all(
        deleteBatchTarget.map((r) => API.delete(`/reports/${r._id}`)),
      );
      toast.success(`Deleted ${deleteBatchTarget.length} reports`);
      setDeleteBatchTarget(null);
      fetchReports();
    } catch {
      toast.error('Batch delete failed');
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-6 h-6 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: '#EFF6FF' }}
        >
          <FileText className="w-6 h-6" style={{ color: '#2563EB' }} />
        </div>
        <div>
          <h1
            className="font-bold"
            style={{ color: '#1B2B4B', fontSize: '20px', fontWeight: '700' }}
          >
            Audit Reports
          </h1>
          <p className="text-sm" style={{ color: '#94A3B8', fontSize: '13px' }}>
            {reports.length} total reports
          </p>
        </div>
      </div>

      {/* Accordion List */}
      <div className="space-y-4">
        {loading ? (
          <div
            className="py-12 text-center rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              color: '#94A3B8',
            }}
          >
            Loading reports...
          </div>
        ) : Object.keys(groupedReports).length === 0 ? (
          <div
            className="py-12 text-center rounded-lg"
            style={{
              backgroundColor: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              color: '#94A3B8',
            }}
          >
            No reports found
          </div>
        ) : (
          Object.entries(groupedReports)
            .sort()
            .map(([batchKey, batchReports]) => (
              <BatchAccordion
                key={batchKey}
                batchName={batchKey}
                reports={batchReports}
                onSelectedReport={setSelectedReport}
                onDeleteTarget={setDeleteTarget}
                onDeleteBatch={() => setDeleteBatchTarget(batchReports)}
              />
            ))
        )}
      </div>

      {/* ================= VIEW MODAL ================= */}
      {/* ================= VIEW MODAL ================= */}
      <AnimatePresence>
        {selectedReport && (
          <Modal onClose={() => setSelectedReport(null)}>
            {/* 🔒 STICKY HEADER */}
            <div className="sticky top-0 z-10 bg-white border-b px-4 sm:px-6 py-3 flex items-center justify-between">
              <h2 className="font-semibold text-base sm:text-lg md:text-xl">
                Report Details
              </h2>

              <div className="flex items-center gap-2">
                {/* Download */}
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
                      toast.error('Download failed');
                    }
                  }}
                  className="px-3 py-1 text-xs sm:text-sm border rounded-lg flex items-center gap-2"
                >
                  <Download size={16} />
                  Download
                </button>

                {/* Close */}
                <button
                  onClick={() => setSelectedReport(null)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 📜 SCROLLABLE BODY */}
            <div className="overflow-y-auto px-4 sm:px-6 py-4 space-y-6">
              {/* STUDENT INFO */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <Info
                  label="Student Name"
                  value={selectedReport.student?.name}
                />
                <Info label="Email" value={selectedReport.student?.email} />
                <Info
                  label="Batch"
                  value={`${selectedReport.student?.batch_name} - ${selectedReport.student?.batch_no}`}
                />
                <Info
                  label="Audit Date"
                  value={new Date(selectedReport.auditDate).toLocaleDateString(
                    'en-GB',
                    {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    },
                  )}
                />
              </div>

              {/* PARAMETERS */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-2">
                  Parameters
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {selectedReport.parameters?.map((p) => (
                    <div
                      key={p._id}
                      className="rounded-lg px-3 py-2 bg-green-50 border"
                    >
                      <div className="text-xs text-gray-500">{p.name}</div>
                      <div className="font-semibold text-sm sm:text-base">
                        {p.score} / 10
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* FEEDBACK */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-2">
                  Feedback
                </h3>

                {selectedReport.feedbackSchema?.map((f, idx) => (
                  <ul
                    key={idx}
                    className="list-disc list-inside text-sm space-y-1"
                  >
                    {f.point1 && <li>{f.point1}</li>}
                    {f.point2 && <li>{f.point2}</li>}
                    {f.point3 && <li>{f.point3}</li>}
                  </ul>
                ))}
              </div>

              {/* OVERALL REMARKS */}
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">
                  Overall Remarks
                </h3>

                <p className="text-sm rounded-lg p-3 border bg-gray-50">
                  {selectedReport.overallRemarks || '—'}
                </p>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ================= DELETE MODAL ================= */}
      <AnimatePresence>
        {deleteTarget && (
          <Modal onClose={() => setDeleteTarget(null)}>
            <h2
              className="font-semibold mb-3"
              style={{ color: '#EF4444', fontSize: '18px', fontWeight: '700' }}
            >
              Delete Report
            </h2>

            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              Are you sure you want to delete this report?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 rounded-lg font-medium transition"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  color: '#1B2B4B',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#F8FAFC';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                }}
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded-lg text-white font-medium transition"
                style={{
                  backgroundColor: '#EF4444',
                  borderRadius: '8px',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#DC2626';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#EF4444';
                }}
              >
                Delete
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ================= BATCH DELETE MODAL ================= */}
      <AnimatePresence>
        {deleteBatchTarget && (
          <Modal onClose={() => setDeleteBatchTarget(null)}>
            <h2
              className="font-semibold mb-3"
              style={{ color: '#EF4444', fontSize: '18px', fontWeight: '700' }}
            >
              Delete All Reports
            </h2>
            <p className="text-sm mb-6" style={{ color: '#64748B' }}>
              Are you sure you want to delete all {deleteBatchTarget.length}{' '}
              reports for this batch? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteBatchTarget(null)}
                className="px-4 py-2 rounded-lg font-medium transition"
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1.5px solid #E2E8F0',
                  color: '#1B2B4B',
                  borderRadius: '8px',
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleBatchDelete}
                className="px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50"
                style={{ backgroundColor: '#EF4444', borderRadius: '8px' }}
              >
                Delete All
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */

function BatchAccordion({
  batchName,
  reports,
  onSelectedReport,
  onDeleteTarget,
  onDeleteBatch,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="rounded-lg overflow-hidden"
      style={{
        backgroundColor: '#FFFFFF',
        border: '1.5px solid #E2E8F0',
        borderRadius: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      }}
    >
      <div
        className="w-full flex items-center justify-between p-4 transition"
        style={{
          backgroundColor: '#F8FAFC',
          borderBottom: '1px solid #F1F5F9',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#F1F5F9';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#F8FAFC';
        }}
      >
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center gap-3 text-left focus:outline-none"
        >
          {isOpen ? (
            <ChevronDown className="w-5 h-5" style={{ color: '#94A3B8' }} />
          ) : (
            <ChevronRight className="w-5 h-5" style={{ color: '#94A3B8' }} />
          )}
          <span className="font-semibold" style={{ color: '#1B2B4B' }}>
            {batchName}
          </span>
          <span
            className="text-xs px-2.5 py-1 rounded-full font-medium"
            style={{
              backgroundColor: '#ECFDF5',
              color: '#065F46',
              borderRadius: '20px',
              padding: '3px 12px',
              fontSize: '12px',
              fontWeight: '600',
            }}
          >
            {reports.length} report{reports.length !== 1 ? 's' : ''}
          </span>
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onDeleteBatch();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition ml-4"
          style={{
            backgroundColor: '#FEF2F2',
            color: '#EF4444',
            border: '1px solid #FCA5A5',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#FEE2E2';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FEF2F2';
          }}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Delete All
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  style={{
                    backgroundColor: '#F8FAFC',
                    borderBottom: '1px solid #F1F5F9',
                  }}
                >
                  <tr>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Student
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Email
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Audit Date
                    </th>
                    <th
                      className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide"
                      style={{
                        color: '#64748B',
                        fontSize: '11px',
                        fontWeight: '600',
                        letterSpacing: '0.06em',
                        textTransform: 'uppercase',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((r, idx) => (
                    <tr
                      key={r._id}
                      style={{
                        backgroundColor: idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC',
                        borderBottom: '1px solid #F1F5F9',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#F1F5F9';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor =
                          idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
                      }}
                    >
                      <td
                        className="px-4 py-3 font-medium"
                        style={{ color: '#1B2B4B' }}
                      >
                        {r.student?.name}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#94A3B8' }}>
                        {r.student?.email}
                      </td>
                      <td className="px-4 py-3" style={{ color: '#64748B' }}>
                        {new Date(r.auditDate).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => onSelectedReport(r)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-white text-xs font-medium transition"
                            style={{
                              backgroundColor: '#2563EB',
                              borderRadius: '6px',
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#1E40AF';
                              e.currentTarget.style.boxShadow =
                                '0 4px 12px rgba(37, 99, 235, 0.4)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#2563EB';
                              e.currentTarget.style.boxShadow =
                                '0 2px 8px rgba(37, 99, 235, 0.3)';
                            }}
                          >
                            <Eye className="w-4 h-4" /> View
                          </button>
                          <button
                            onClick={() => onDeleteTarget(r)}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition"
                            style={{
                              backgroundColor: '#FEF2F2',
                              color: '#EF4444',
                              borderRadius: '6px',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE2E2';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                            }}
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.95 }}
        className="
          w-full 
          max-w-sm sm:max-w-lg md:max-w-2xl
          max-h-[90vh]
          bg-white rounded-xl shadow-xl
          flex flex-col              /* ✅ IMPORTANT */
          overflow-hidden            /* ✅ IMPORTANT */
        "
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs" style={{ color: '#94A3B8' }}>
        {label}
      </div>
      <div className="font-medium" style={{ color: '#1B2B4B' }}>
        {value || '—'}
      </div>
    </div>
  );
}
