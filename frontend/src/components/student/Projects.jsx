import { useEffect, useState } from "react";
import {
  getStudentProjects,
  updateModuleStatus,
  submitProject,
} from "../../api/project.api";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      const res = await getStudentProjects(user.id);
      console.log(res);
      setProjects(res || []);
    }
    fetchProjects();
  }, [user]);

  const handleModuleToggle = async (moduleId, currentStatus) => {
    const nextStatus =
      currentStatus === "Pending" ? "In Progress" : "Completed";
    await updateModuleStatus(moduleId, { status: nextStatus });
    toast.success(`Module marked as ${nextStatus}`);
  };

  const handleSubmit = async (projectId) => {
    await submitProject(projectId);
    toast.success("Project submitted for approval");
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4 text-slate-800">My Projects</h1>

      {projects.map((project) => (
        <div
          key={project._id}
          className="bg-white rounded-xl p-4 mb-3 border shadow-sm"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">{project.title}</h2>
            <span
              className={`px-3 py-1 text-sm rounded-full ${
                project.status === "Pending"
                  ? "bg-amber-100 text-amber-700"
                  : project.status === "In Progress"
                  ? "bg-blue-100 text-blue-700"
                  : project.status === "Submitted"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {project.status}
            </span>
          </div>

          <div className="mt-2">
            <p className="text-sm text-slate-600 mb-2">{project.description}</p>

            {project.modules?.map((mod) => (
              <div
                key={mod._id}
                className="flex justify-between items-center border-b py-2"
              >
                <span>{mod.title}</span>
                <button
                  onClick={() => handleModuleToggle(mod._id, mod.status)}
                  className="text-sm bg-emerald-100 text-emerald-700 px-2 py-1 rounded"
                >
                  {mod.status}
                </button>
              </div>
            ))}
          </div>

          {project.status === "In Progress" && (
            <button
              onClick={() => handleSubmit(project._id)}
              className="mt-3 bg-emerald-600 text-white px-3 py-1 rounded hover:bg-emerald-700"
            >
              Submit Project
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
