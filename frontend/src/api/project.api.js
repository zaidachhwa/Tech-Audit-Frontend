// src/api/project.api.js
import { API } from "./axios";

/**
 * Get all projects for a student
 * @param {string} studentId - The student's ID
 * @returns {Promise} - Project data
 */
export const getStudentProjects = async (studentId) => {
  try {
    const res = await API.get(`/projects/student/${studentId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching student projects:", error);
    throw error;
  }
};

/**
 * Update a module's status
 * @param {string} moduleId - The module's ID
 * @param {object} payload - { status: string, notes?: string }
 * @returns {Promise} - Updated project data
 */
export const updateModuleStatus = async (moduleId, payload) => {
  try {
    const res = await API.patch(`/projects/module/${moduleId}`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating module status:", error);
    throw error;
  }
};

/**
 * Submit a project for approval
 * @param {string} projectId - The project's ID
 * @returns {Promise} - Updated project data
 */
export const submitProject = async (projectId) => {
  try {
    const res = await API.patch(`/projects/${projectId}/submit`);
    return res.data;
  } catch (error) {
    console.error("Error submitting project:", error);
    throw error;
  }
};

/**
 * Update project's overall status (student)
 * @param {string} projectId - The project's ID
 * @param {object} payload - { status: string }
 * @returns {Promise} - Updated project data
 */
export const updateOverallStatus = async (projectId, payload) => {
  try {
    const res = await API.patch(`/projects/${projectId}/status`, payload);
    return res.data;
  } catch (error) {
    console.error("Error updating project status:", error);
    throw error;
  }
};

/**
 * Get projects by batch (admin)
 * @param {string} batchId - The batch's ID
 * @returns {Promise} - Projects data
 */
export const getProjectsByBatch = async (batchId) => {
  try {
    const res = await API.get(`/projects/batch/${batchId}`);
    return res.data;
  } catch (error) {
    console.error("Error fetching batch projects:", error);
    throw error;
  }
};

/**
 * Create a new project (admin)
 * @param {object} projectData - Project details
 * @returns {Promise} - Created project data
 */
export const createProject = async (projectData) => {
  try {
    const res = await API.post("/projects/create", projectData);
    return res.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

/**
 * Approve a project (admin)
 * @param {string} projectId - The project's ID
 * @returns {Promise} - Updated project data
 */
export const approveProject = async (projectId) => {
  try {
    const res = await API.patch(`/projects/${projectId}/approve`);
    return res.data;
  } catch (error) {
    console.error("Error approving project:", error);
    throw error;
  }
};

/**
 * Update project details (admin)
 * @param {string} projectId - The project's ID
 * @param {object} updates - Fields to update
 * @returns {Promise} - Updated project data
 */
export const updateProject = async (projectId, updates) => {
  try {
    const res = await API.patch(`/projects/${projectId}`, updates);
    return res.data;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

/**
 * Delete a project (admin)
 * @param {string} projectId - The project's ID
 * @returns {Promise} - Success message
 */
export const deleteProject = async (projectId) => {
  try {
    const res = await API.delete(`/projects/${projectId}`);
    return res.data;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
};
