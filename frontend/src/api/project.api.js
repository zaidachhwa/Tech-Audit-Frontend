import { API } from "./axios";

export const getStudentProjects = async (studentId) => {
  const res = await API.get(`/projects/student/${studentId}`);
  return res.data;
};

export const updateModuleStatus = async (moduleId, payload) => {
  const res = await API.patch(`/projects/module/${moduleId}`, payload);
  return res.data;
};

export const submitProject = async (projectId) => {
  const res = await API.patch(`/projects/${projectId}/submit`);
  return res.data;
};
