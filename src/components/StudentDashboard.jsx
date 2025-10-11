import { useEffect, useState } from "react";
import { supabase } from "../services/supabase";
import { Dialog } from "@headlessui/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const StudentsDashboard = () => {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    search: "",
    from: "",
    to: "",
  });

  const [viewReport, setViewReport] = useState(null);
  const [compareList, setCompareList] = useState([]);

  // ✅ Fetch students with latest report
  const fetchData = async () => {
    const { data, error } = await supabase
      .from("students")
      .select(
        `
        id,
        name,
        email,
        phone,
        created_at,
        reports (
          id,
          html,
          css,
          js,
          react,
          devops,
          feedback_1,
          feedback_2,
          feedback_3,
          created_at
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      return;
    }

    // Attach latest report to each student
    const withLatest = data.map((s) => ({
      ...s,
      latestReport: s.reports?.[0] || null,
    }));
    setStudents(withLatest);
    setFiltered(withLatest);
  };

  // ✅ Real-time updates
  useEffect(() => {
    fetchData();

    const studentChannel = supabase
      .channel("students-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "students" },
        () => fetchData()
      )
      .subscribe();

    const reportChannel = supabase
      .channel("reports-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reports" },
        () => fetchData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(studentChannel);
      supabase.removeChannel(reportChannel);
    };
  }, []);

  // ✅ Filtering logic
  useEffect(() => {
    let result = [...students];
    const q = filters.search.toLowerCase();

    if (q) {
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.phone?.toLowerCase().includes(q)
      );
    }

    if (filters.from && filters.to) {
      const from = new Date(filters.from);
      const to = new Date(filters.to);
      result = result.filter((s) => {
        const date = new Date(s.latestReport?.created_at || s.created_at);
        return date >= from && date <= to;
      });
    }

    setFiltered(result);
  }, [filters, students]);

  // ✅ Helper for average
  const calcAverage = (r) => {
    if (!r) return 0;
    const vals = [r.html, r.css, r.js, r.react, r.devops].map(Number);
    const valid = vals.filter((v) => !isNaN(v));
    if (!valid.length) return 0;
    return (valid.reduce((a, b) => a + b, 0) / valid.length).toFixed(1);
  };

  // ✅ Render
  return (
    <div className="w-full min-h-screen bg-slate-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <h1 className="text-2xl font-semibold text-sky-700">
            Students Dashboard
          </h1>
          <button
            onClick={fetchData}
            className="mt-4 md:mt-0 cursor-pointer bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 rounded-md"
          >
            Refresh Data
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 mb-6">
          <div className="grid md:grid-cols-3 gap-4">
            <input
              type="text"
              placeholder="Search by name, email or phone"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />

            <input
              type="date"
              value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })}
              className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />

            <input
              type="date"
              value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })}
              className="border border-slate-300 rounded-md p-2 focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded-xl shadow-md border border-slate-200">
          <table className="w-full text-sm text-left text-slate-700">
            <thead className="bg-slate-100 text-slate-700 uppercase text-xs font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3 text-center">Phone</th>
                <th className="px-4 py-3 text-center">Last Audit</th>
                <th className="px-4 py-3 text-center">Avg Score</th>
                <th className="px-4 py-3 text-center">Feedbacks</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length ? (
                filtered.map((s) => (
                  <tr
                    key={s.id}
                    className="border-b hover:bg-sky-50 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {s.name}
                    </td>
                    <td className="px-4 py-3">{s.email}</td>
                    <td className="px-4 py-3 text-center">{s.phone || "-"}</td>
                    <td className="px-4 py-3 text-center">
                      {s.latestReport
                        ? new Date(
                            s.latestReport.created_at
                          ).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-center font-semibold text-sky-700">
                      {calcAverage(s.latestReport)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {[
                        s.latestReport?.feedback_1,
                        s.latestReport?.feedback_2,
                        s.latestReport?.feedback_3,
                      ].filter(Boolean).length || 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setViewReport(s.latestReport)}
                        className="text-sky-600 hover:underline mr-3 cursor-pointer"
                      >
                        View
                      </button>

                      <button
                        onClick={() => {
                          if (compareList.some((c) => c.id === s.id)) {
                            setCompareList(
                              compareList.filter((c) => c.id !== s.id)
                            );
                          } else if (compareList.length < 2) {
                            setCompareList([...compareList, s]);
                          }
                        }}
                        className={`${
                          compareList.some((c) => c.id === s.id)
                            ? "text-red-600"
                            : "text-emerald-600"
                        } hover:underline cursor-pointer`}
                      >
                        {compareList.some((c) => c.id === s.id)
                          ? "Remove"
                          : "Compare"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center py-6 text-slate-500 font-medium"
                  >
                    No records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Cards */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <SummaryCard
            title="Total Students"
            value={students.length}
            color="bg-sky-50 text-sky-700"
          />
          <SummaryCard
            title="Average Score (All)"
            value={
              students.length
                ? (
                    students.reduce(
                      (a, b) =>
                        a + parseFloat(calcAverage(b.latestReport || {})),
                      0
                    ) / students.length
                  ).toFixed(1)
                : 0
            }
            color="bg-emerald-50 text-emerald-700"
          />
          <SummaryCard
            title="Total Feedbacks"
            value={students.reduce((a, b) => {
              const r = b.latestReport || {};
              return (
                a +
                [r.feedback_1, r.feedback_2, r.feedback_3].filter(Boolean)
                  .length
              );
            }, 0)}
            color="bg-orange-50 text-orange-700"
          />
        </div>
      </div>

      {/* View Report Modal */}
      <Dialog
        open={!!viewReport}
        onClose={() => setViewReport(null)}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      >
        <Dialog.Panel className="bg-white w-full max-w-md rounded-xl p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-sky-700 mb-4">
            Student Report
          </Dialog.Title>
          {viewReport ? (
            <div className="space-y-3 text-slate-700">
              <p>
                <strong>HTML:</strong> {viewReport.html}
              </p>
              <p>
                <strong>CSS:</strong> {viewReport.css}
              </p>
              <p>
                <strong>JS:</strong> {viewReport.js}
              </p>
              <p>
                <strong>React:</strong> {viewReport.react}
              </p>
              <p>
                <strong>DevOps:</strong> {viewReport.devops}
              </p>
              <div className="mt-3">
                <p className="font-medium text-sky-700">Feedbacks:</p>
                <ul className="list-disc list-inside">
                  {[
                    viewReport.feedback_1,
                    viewReport.feedback_2,
                    viewReport.feedback_3,
                  ]
                    .filter(Boolean)
                    .map((f, i) => (
                      <li key={i}>{f}</li>
                    ))}
                </ul>
              </div>
            </div>
          ) : (
            <p>No report available.</p>
          )}
          <div className="mt-6 text-right">
            <button
              onClick={() => setViewReport(null)}
              className="bg-sky-600 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>

      {/* Compare Modal */}
      <Dialog
        open={compareList.length === 2}
        onClose={() => setCompareList([])}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30"
      >
        <Dialog.Panel className="bg-white w-full max-w-3xl rounded-xl p-6 shadow-lg">
          <Dialog.Title className="text-lg font-semibold text-sky-700 mb-4">
            Compare Reports
          </Dialog.Title>

          {compareList.length === 2 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    subject: "HTML",
                    [compareList[0].name]:
                      compareList[0].latestReport?.html || 0,
                    [compareList[1].name]:
                      compareList[1].latestReport?.html || 0,
                  },
                  {
                    subject: "CSS",
                    [compareList[0].name]:
                      compareList[0].latestReport?.css || 0,
                    [compareList[1].name]:
                      compareList[1].latestReport?.css || 0,
                  },
                  {
                    subject: "JS",
                    [compareList[0].name]: compareList[0].latestReport?.js || 0,
                    [compareList[1].name]: compareList[1].latestReport?.js || 0,
                  },
                  {
                    subject: "React",
                    [compareList[0].name]:
                      compareList[0].latestReport?.react || 0,
                    [compareList[1].name]:
                      compareList[1].latestReport?.react || 0,
                  },
                  {
                    subject: "DevOps",
                    [compareList[0].name]:
                      compareList[0].latestReport?.devops || 0,
                    [compareList[1].name]:
                      compareList[1].latestReport?.devops || 0,
                  },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={compareList[0].name} fill="#0ea5e9" />
                <Bar dataKey={compareList[1].name} fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-600 text-center py-8">
              Select two students to compare.
            </p>
          )}

          <div className="mt-6 text-right">
            <button
              onClick={() => setCompareList([])}
              className="bg-sky-600 text-white px-4 py-2 rounded-md"
            >
              Close
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </div>
  );
};

// ✅ Summary Card Component
const SummaryCard = ({ title, value, color }) => (
  <div className={`p-5 rounded-xl shadow-sm border border-slate-200 ${color}`}>
    <p className="text-sm font-medium text-slate-600">{title}</p>
    <p className="text-2xl font-semibold mt-1">{value}</p>
  </div>
);

export default StudentsDashboard;
