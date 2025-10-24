import { useEffect, useState } from "react";
import { getReportsByStudent } from "../../api/report.api";
import { useAuth } from "../../context/AuthContext";

export default function Reports() {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);

  useEffect(() => {
    async function fetchReports() {
      const res = await getReportsByStudent(user.id);
      console.log(res);
      setReports(res || []);
    }
    fetchReports();
  }, [user]);

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-slate-800">Reports</h1>

      {reports.map((r) => (
        <div
          key={r._id}
          className="bg-white rounded-xl p-4 mb-3 border shadow-sm"
        >
          <h2 className="font-semibold text-slate-700">{r.title}</h2>
          <p className="text-sm text-slate-500">{r.summary}</p>
          <div className="mt-2 flex justify-between">
            <span className="text-xs text-slate-400">{r.parameter}</span>
            <span
              className={`px-2 py-1 text-xs rounded-full ${
                r.status === "Completed"
                  ? "bg-green-100 text-green-700"
                  : r.status === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-amber-100 text-amber-700"
              }`}
            >
              {r.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
