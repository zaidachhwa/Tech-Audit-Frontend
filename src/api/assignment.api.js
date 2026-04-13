import { API } from "./axios";

export const getAssignmentsByStudent = async (studentId) => {
  const res = await API.get(`/assignments/student/${studentId}`);
  return res.data;
};
