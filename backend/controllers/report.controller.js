import Report from "../model/report.model.js";
import { Student } from "../model/student.model.js";

// ============================
// CREATE REPORT
// ============================
export const createReport = async (req, res) => {
  try {
    const { studentId, parameters, feedbackSchema, overallRemarks, auditDate } =
      req.body;

    if (!studentId || !parameters?.length || !auditDate) {
      return res
        .status(400)
        .json({ message: "Student, parameters and audit date are required." });
    }

    const studentExists = await Student.findById(studentId);
    if (!studentExists) {
      return res.status(404).json({ message: "Student not found." });
    }

    const report = await Report.create({
      student: studentId,
      parameters,
      feedbackSchema,
      overallRemarks,
      auditDate, // ✅ added auditDate field
    });

    res.status(201).json({
      message: "Report created successfully.",
      report,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ============================
// GET ALL REPORTS
// ============================
export const getAllReports = async (req, res) => {
  try {
    const { batch_name, batch_no, from, to } = req.query;

    const filter = {};
    if (from && to)
      filter.auditDate = { $gte: new Date(from), $lte: new Date(to) };

    const reports = await Report.find(filter)
      .populate({
        path: "student",
        match: {
          ...(batch_name && { batch_name }),
          ...(batch_no && { batch_no }),
        },
      })
      .lean();

    const filtered = reports.filter((r) => r.student !== null);

    res.status(200).json({ count: filtered.length, reports: filtered });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// GET REPORTS BY STUDENT
// ============================
export const getReportsByStudent = async (req, res) => {
  try {
    if (
      req.user.role === "student" &&
      req.user._id.toString() !== req.params.studentId
    ) {
      return res
        .status(403)
        .json({ message: "You can only view your own reports." });
    }

    const reports = await Report.find({ student: req.params.studentId });
    res.status(200).json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// COMPARE BATCHES BY AUDIT DATE, BATCH NAME, BATCH NO
// ============================
export const compareBatchesByParameterDetailed = async (req, res) => {
  try {
    const { parameter, batch_name, batch_no } = req.query;

    // Validate parameters
    if (!parameter || !batch_name || !batch_no) {
      return res.status(400).json({
        message: "parameter, batch_name, and batch_no are required.",
      });
    }

    const matchConditions = {
      "student.batch_name": batch_name,
      "student.batch_no": Number(batch_no),
      "parameters.name": parameter,
    };

    const results = await Report.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      { $unwind: "$parameters" },
      { $match: matchConditions },
      {
        $project: {
          _id: 0,
          student_name: "$student.name",
          batch_name: "$student.batch_name",
          batch_no: "$student.batch_no",
          parameter: "$parameters.name",
          score: "$parameters.score",
          audit_date: { $ifNull: ["$auditDate", "$createdAt"] },
        },
      },
      { $sort: { student_name: 1, audit_date: 1 } },
    ]);

    res.status(200).json({
      message: `Comparison for ${parameter} in ${batch_name} - ${batch_no}`,
      results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ============================
// BATCH AVERAGES
// ============================
export const getBatchAverages = async (req, res) => {
  try {
    const { batch_name, batch_no } = req.query;
    if (!batch_name || !batch_no)
      return res
        .status(400)
        .json({ message: "Batch name and number required" });

    const results = await Report.aggregate([
      {
        $lookup: {
          from: "students",
          localField: "student",
          foreignField: "_id",
          as: "student",
        },
      },
      { $unwind: "$student" },
      {
        $match: {
          "student.batch_name": batch_name,
          "student.batch_no": Number(batch_no),
        },
      },
      { $unwind: "$parameters" },
      {
        $group: {
          _id: "$parameters.name",
          avg_score: { $avg: "$parameters.score" },
        },
      },
      {
        $project: {
          parameter: "$_id",
          avg_score: 1,
          _id: 0,
        },
      },
    ]);

    res.status(200).json({
      batch: `${batch_name}-${batch_no}`,
      averages: results,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
