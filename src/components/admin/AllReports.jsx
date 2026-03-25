import React, { useEffect, useState } from 'react';
import { API } from '../../api/axios';
import { FileText, Eye, Trash2, X, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

// ── helper: group flat reports array into { courseName: { batchNo: [reports] } }
function groupReports(reports) {
  return reports.reduce((acc, r) => {
    const course = r.student?.batch_name || 'Unknown';
    const batch  = r.student?.batch_no   ?? 'Unknown';
    if (!acc[course])        acc[course] = {};
    if (!acc[course][batch]) acc[course][batch] = [];
    acc[course][batch].push(r);
    return acc;
  }, {});
}

export default function ReportsList() {
  const [reports, setReports]             = useState([]);
  const [loading, setLoading]             = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [deleteTarget, setDeleteTarget]   = useState(null);

  // track which courses / batches are open
  const [openCourses, setOpenCourses] = useState({});
  const [openBatches, setOpenBatches] = useState({});

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await API.get('/reports');
      const data = res.data.reports || [];
      setReports(data);

      // open all courses and batches by default
      const grouped = groupReports(data);
      const courses = {};
      const batches = {};
      Object.keys(grouped).forEach(course => {
        courses[course] = true;
        Object.keys(grouped[course]).forEach(batch => {
          batches[`${course}-${batch}`] = true;
        });
      });
      setOpenCourses(courses);
      setOpenBatches(batches);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReports(); }, []);

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

  const toggleCourse = (course) =>
    setOpenCourses(prev => ({ ...prev, [course]: !prev[course] }));

  const toggleBatch = (key) =>
    setOpenBatches(prev => ({ ...prev, [key]: !prev[key] }));

  const grouped = groupReports(reports);

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* Page header */}
      <div className="flex items-center gap-3 mb-6">
        <FileText className="w-7 h-7 text-emerald-600" />
        <h1 className="text-2xl font-semibold text-gray-800">Audit Reports</h1>
      </div>

      {loading && (
        <p className="text-center text-gray-500 py-10">Loading...</p>
      )}

      {!loading && Object.keys(grouped).length === 0 && (
        <p className="text-center text-gray-500 py-10">No reports found</p>
      )}

      {/* Course accordion */}
      {Object.entries(grouped).map(([course, batches]) => {
        const totalReports = Object.values(batches).reduce((s, arr) => s + arr.length, 0);
        const isCourseOpen = openCourses[course];

        return (
          <div key={course} className="mb-3 border border-gray-200 rounded-2xl overflow-hidden shadow-sm">

            {/* Course header */}
            <button
              type="button"
              onClick={() => toggleCourse(course)}
              className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition text-left"
            >
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span className="text-base font-semibold text-gray-900">{course}</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full">
                  {Object.keys(batches).length} {Object.keys(batches).length === 1 ? 'batch' : 'batches'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400">{totalReports} reports</span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isCourseOpen ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {/* Batches */}
            <AnimatePresence initial={false}>
              {isCourseOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  {Object.entries(batches)
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([batchNo, batchReports]) => {
                      const batchKey  = `${course}-${batchNo}`;
                      const isBatchOpen = openBatches[batchKey];

                      return (
                        <div key={batchNo} className="border-t border-gray-200">

                          {/* Batch sub-header */}
                          <button
                            type="button"
                            onClick={() => toggleBatch(batchKey)}
                            className="w-full flex items-center justify-between pl-10 pr-5 py-3 bg-white hover:bg-emerald-50/40 transition text-left"
                          >
                            <div className="flex items-center gap-2">
                              <ChevronDown
                                className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${isBatchOpen ? 'rotate-180' : ''}`}
                              />
                              <span className="text-sm font-medium text-gray-700">
                                Batch {batchNo}
                              </span>
                              <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                {batchReports.length} {batchReports.length === 1 ? 'student' : 'students'}
                              </span>
                            </div>
                          </button>

                          {/* Student rows */}
                          <AnimatePresence initial={false}>
                            {isBatchOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <table className="w-full text-sm">
                                  <thead className="bg-gray-50">
                                    <tr>
                                      <th className="pl-14 pr-4 py-2.5 text-left text-xs text-gray-500 font-medium uppercase tracking-wide">Student</th>
                                      <th className="px-4 py-2.5 text-left text-xs text-gray-500 font-medium uppercase tracking-wide">Audit Date</th>
                                      <th className="px-4 py-2.5 text-center text-xs text-gray-500 font-medium uppercase tracking-wide">Actions</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {batchReports.map(r => (
                                      <tr key={r._id} className="border-t border-gray-100 hover:bg-emerald-50/30">
                                        <td className="pl-14 pr-4 py-3">
                                          <div className="font-medium text-gray-800">{r.student?.name}</div>
                                          <div className="text-xs text-gray-400">{r.student?.email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                          {new Date(r.auditDate).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3">
                                          <div className="flex justify-center gap-2">
                                            <button
                                              onClick={() => setSelectedReport(r)}
                                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs hover:bg-emerald-700 transition"
                                            >
                                              <Eye className="w-3.5 h-3.5" /> View
                                            </button>
                                            <button
                                              onClick={() => setDeleteTarget(r)}
                                              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs hover:bg-red-600 transition"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" /> Delete
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}

      {/* View modal and Delete modal stay exactly the same as before */}
      {/* ... paste your existing AnimatePresence modal blocks here unchanged ... */}
    </div>
  );
}