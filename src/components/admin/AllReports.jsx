import React, { useEffect, useState } from "react";
import { API } from "../../api/axios";
import {
    FileText,
    Calendar,
    Hash,
    BookOpen,
    Eye,
    Trash2,
    X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

export default function ReportsList() {
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);

    const [selectedReport, setSelectedReport] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const res = await API.get("/reports");
            setReports(res.data.reports || []);
        } catch {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    const handleDelete = async () => {
        try {
            const res = await API.delete(`/reports/${deleteTarget._id}`);
            console.log(res);
            
            toast.success("Report deleted");
            setDeleteTarget(null);
            fetchReports();
        } catch (err){
            console.log(err);
            
            toast.error("Delete failed");
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <FileText className="w-7 h-7 text-emerald-600" />
                <h1 className="text-2xl font-semibold text-gray-800">
                    Audit Reports
                </h1>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border shadow-sm overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-4 py-3 text-left">Student</th>
                            <th className="px-4 py-3 text-left">Batch</th>
                            <th className="px-4 py-3 text-left">Audit Date</th>
                            <th className="px-4 py-3 text-center">Actions</th>
                        </tr>
                    </thead>

                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan="4" className="py-6 text-center text-gray-500">
                                    Loading...
                                </td>
                            </tr>
                        ) : reports.length === 0 ? (
                            <tr>
                                <td colSpan="4" className="py-6 text-center text-gray-500">
                                    No reports found
                                </td>
                            </tr>
                        ) : (
                            reports.map((r) => (
                                <tr
                                    key={r._id}
                                    className="border-t hover:bg-emerald-50/40"
                                >
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{r.student?.name}</div>
                                        <div className="text-xs text-gray-500">
                                            {r.student?.email}
                                        </div>
                                    </td>

                                    <td className="px-4 py-3">
                                        {r.student?.batch_name} - {r.student?.batch_no}
                                    </td>

                                    <td className="px-4 py-3">
                                        {new Date(r.auditDate).toLocaleDateString()}
                                    </td>

                                    <td className="px-4 py-3">
                                        <div className="flex justify-center gap-2">
                                            <button
                                                onClick={() => setSelectedReport(r)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700"
                                            >
                                                <Eye className="w-4 h-4" /> View
                                            </button>

                                            <button
                                                onClick={() => setDeleteTarget(r)}
                                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* VIEW MODAL */}
            <AnimatePresence>
                {selectedReport && (
                    <Modal onClose={() => setSelectedReport(null)}>
                        <h2 className="text-lg font-semibold mb-4 text-gray-800">
                            Report Details
                        </h2>

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
                                value={new Date(
                                    selectedReport.auditDate
                                ).toLocaleDateString()}
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
                                {selectedReport.overallRemarks || "—"}
                            </p>
                        </div>
                    </Modal>
                )}

            </AnimatePresence>

            {/* DELETE MODAL */}
            <AnimatePresence>
                {deleteTarget && (
                    <Modal onClose={() => setDeleteTarget(null)}>
                        <h2 className="text-lg font-semibold mb-3 text-red-600">
                            Delete Report
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete this report? This action
                            cannot be undone.
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

/* ===================== Reusable Components ===================== */

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
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <X className="w-5 h-5" />
                </button>
                {children}
            </motion.div>
        </motion.div>
    );
}

function Info({ label, value }) {
  return (
    <div>
      <div className="text-xs text-gray-500">{label}</div>
      <div className="font-medium text-gray-800">{value || "—"}</div>
    </div>
  );
}

