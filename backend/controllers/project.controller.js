import Project from "../model/project.model.js";
import Batch from "../model/batch.model.js";
import { Student } from "../model/student.model.js";
import Report from "../model/report.model.js";

// ✅ Assign project to all students in a batch
export const assignProjectToBatch = async (req, res) => {
  try {
    const { batchId, title, description, modules, adminId } = req.body;

    console.log(req?.body);

    if (!batchId || !title || !description || !modules || !adminId)
      return res.status(400).json({ message: "All fields are required." });

    const batch = await Batch.findById(batchId).populate("students");
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    const createdProjects = [];

    for (const student of batch.students) {
      const project = new Project({
        title,
        description,
        assignedTo: student._id,
        batch: batch._id,
        modules,
        createdBy: adminId,
      });

      await project.save();

      await Student.findByIdAndUpdate(student._id, {
        $push: { projects: project._id },
      });

      createdProjects.push(project);
    }

    res.status(201).json({
      message: "Projects assigned successfully to all batch students.",
      projects: createdProjects,
    });
  } catch (error) {
    res.status(500).json({ message: "Error assigning project", error });
  }
};

// ✅ Get all projects for a batch (for admin)
export const getProjectsByBatch = async (req, res) => {
  try {
    const projects = await Project.find({ batch: req.params.batchId })
      .populate("assignedTo", "name email")
      .populate("createdBy", "name email");

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

// ✅ Get all projects for a specific student
export const getProjectsByStudent = async (req, res) => {
  try {
    const projects = await Project.find({ assignedTo: req.params.studentId })
      .populate("batch", "batch_name batch_no")
      .populate("createdBy", "name email");
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching student projects", error });
  }
};

// ✅ Update module status (by student)
export const updateModuleStatus = async (req, res) => {
  try {
    const { moduleId } = req.params;
    const { status, notes } = req.body;
    const studentId = req.user.id;

    const project = await Project.findOneAndUpdate(
      { "modules._id": moduleId, assignedTo: studentId },
      {
        $set: {
          "modules.$.status": status,
          "modules.$.notes": notes,
        },
      },
      { new: true }
    );

    if (!project)
      return res.status(404).json({ message: "Project or module not found." });

    res.status(200).json({ message: "Module updated successfully.", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating module", error });
  }
};

// ✅ Update overall project status (by student)
export const updateProjectStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const studentId = req.user.id;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, assignedTo: studentId },
      { overallStatus: status },
      { new: true }
    );

    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });

    res.status(200).json({ message: "Project status updated", project });
  } catch (error) {
    res.status(500).json({ message: "Error updating project status", error });
  }
};

// ✅ Student submits project for approval
export const submitProject = async (req, res) => {
  try {
    const studentId = req.user.id;

    const project = await Project.findOneAndUpdate(
      { _id: req.params.projectId, assignedTo: studentId },
      { overallStatus: "Submitted" },
      { new: true }
    );

    if (!project)
      return res
        .status(404)
        .json({ message: "Project not found or unauthorized" });

    res
      .status(200)
      .json({ message: "Project submitted for approval", project });
  } catch (error) {
    res.status(500).json({ message: "Error submitting project", error });
  }
};

// ✅ Admin approves a submitted project
export const approveProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.projectId,
      { overallStatus: "Approved" },
      { new: true }
    );

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project approved successfully", project });
  } catch (error) {
    res.status(500).json({ message: "Error approving project", error });
  }
};
