import { useEffect, useState } from "react";
import { API } from "../../api/axios";
import toast from "react-hot-toast";
import { X } from "lucide-react";

/**
 * AssignProjectModal
 * - batch: the batch object with students
 * - onClose: close handler
 * - onAssigned: callback after assignment to refresh
 *
 * Behavior:
 * - Pick multiple students (checkboxes)
 * - Provide project title, description and optional repo link
 * - Submits by creating one project per student (sequentially)
 */

export default function AssignProjectModal({ batch, onClose, onAssigned }) {
  const [selected, setSelected] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [repo, setRepo] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (batch?.students) {
      setSelected(batch.students.map((s) => s._id)); // default select all
    }
  }, [batch]);

  const toggle = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const submit = async () => {
    if (!title || !selected.length)
      return toast.error("Title & at least one student required");
    try {
      setLoading(true);
      // create a project for each student (sequentially to keep it simple)
      for (const studentId of selected) {
        await API.post("/projects/create", {
          title,
          description,
          repo,
          studentId,
          batchId: batch._id,
        });
      }
      toast.success("Projects assigned");
      if (onAssigned) onAssigned();
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign projects");
    } finally {
      setLoading(false);
      onClose?.();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.5)",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
      `}</style>

      <div
        className="rounded-lg p-5 w-full max-w-2xl"
        style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 20px 25px rgba(0,0,0,0.15)",
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold" style={{ color: "#1B2B4B", fontSize: "18px", fontWeight: "700" }}>
            Assign Project to Students — {batch?.batch_name} #{batch?.batch_no}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition"
            style={{
              backgroundColor: "transparent",
              color: "#94A3B8",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#F8FAFC";
              e.currentTarget.style.color = "#1B2B4B";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
              e.currentTarget.style.color = "#94A3B8";
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            placeholder="Project Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-3 rounded-lg outline-none transition"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
              color: "#1B2B4B",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          />
          <input
            type="text"
            placeholder="Repository URL (optional)"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            className="w-full p-3 rounded-lg outline-none transition"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
              color: "#1B2B4B",
              fontSize: "14px",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          />
          <textarea
            placeholder="Short description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-3 rounded-lg outline-none transition resize-none"
            style={{
              backgroundColor: "#FFFFFF",
              border: "1.5px solid #E2E8F0",
              borderRadius: "8px",
              color: "#1B2B4B",
              fontSize: "14px",
            }}
            rows={3}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#2563EB";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#E2E8F0";
            }}
          />

          <div>
            <div className="text-sm font-medium mb-2" style={{ color: "#1B2B4B", fontWeight: "600" }}>
              Students
            </div>
            <div
              className="grid gap-2 max-h-40 overflow-auto rounded-lg p-2"
              style={{
                backgroundColor: "#F8FAFC",
                border: "1px solid #E2E8F0",
                borderRadius: "8px",
              }}
            >
              {batch?.students?.map((s) => (
                <label
                  key={s._id}
                  className="flex items-center gap-2 p-2 rounded-lg transition cursor-pointer"
                  style={{
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#FFFFFF";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(s._id)}
                    onChange={() => toggle(s._id)}
                    style={{
                      accentColor: "#2563EB",
                      cursor: "pointer",
                    }}
                  />
                  <div>
                    <div className="text-sm font-medium" style={{ color: "#1B2B4B" }}>
                      {s.name}
                    </div>
                    <div className="text-xs" style={{ color: "#94A3B8" }}>
                      {s.email}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3 justify-end mt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg font-medium transition"
              style={{
                backgroundColor: "#FFFFFF",
                border: "1.5px solid #E2E8F0",
                color: "#1B2B4B",
                borderRadius: "8px",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F8FAFC";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#FFFFFF";
              }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              className="px-4 py-2 rounded-lg text-white font-medium transition disabled:opacity-50"
              style={{
                backgroundColor: "#2563EB",
                borderRadius: "8px",
              }}
              disabled={loading}
              onMouseEnter={(e) => {
                if (!loading) {
                  e.currentTarget.style.backgroundColor = "#1E40AF";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#2563EB";
              }}
            >
              {loading ? "Assigning..." : "Assign"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}