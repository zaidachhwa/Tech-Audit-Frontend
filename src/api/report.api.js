import { API } from "./axios";

export const getReportsByStudent = async (studentId) => {
  const res = await API.get(`/reports/student/${studentId}`);
  return res.data;
};
