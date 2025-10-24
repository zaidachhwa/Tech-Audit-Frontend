// controllers/batch.controller.js
import Batch from "../model/batch.model.js";
// import Student from "../model/student.model.js";

export const createBatch = async (req, res) => {
  try {
    const { batch_name, batch_no } = req.body;

    const batch = new Batch({ batch_name, batch_no });
    await batch.save();

    res.status(201).json({ message: "Batch created successfully", batch });
  } catch (error) {
    res.status(500).json({ message: "Error creating batch", error });
  }
};

export const getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find().populate("students");
    res.status(200).json(batches);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batches", error });
  }
};

export const getBatchById = async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate("students");
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    res.status(200).json(batch);
  } catch (error) {
    res.status(500).json({ message: "Error fetching batch", error });
  }
};

export const addStudentToBatch = async (req, res) => {
  try {
    const { studentId } = req.body;
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ message: "Batch not found" });

    if (!batch.students.includes(studentId)) {
      batch.students.push(studentId);
      await batch.save();
    }

    res.status(200).json({ message: "Student added to batch", batch });
  } catch (error) {
    res.status(500).json({ message: "Error adding student to batch", error });
  }
};
