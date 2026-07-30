import * as XLSX from "xlsx";

/**
 * Converts an uploaded File (Excel or CSV) into a clean CSV string.
 * - Strips completely empty rows
 * - Validates that 'name' and 'email' headers exist
 * - Throws a user-friendly Error if headers are missing
 *
 * @param {File} file
 * @returns {Promise<string>} clean CSV string
 */
export async function fileToCleanCSV(file) {
  const fileName = file.name.toLowerCase();
  const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let rows; // array of arrays

        if (isExcel) {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });
        } else {
          // Parse CSV text into array of arrays manually
          const text = event.target.result;
          rows = text
            .split(/\r?\n/)
            .map((line) => line.split(",").map((cell) => cell.replace(/^"|"$/g, "").trim()));
        }

        // Remove completely empty rows
        const nonEmpty = rows.filter((row) =>
          row.some((cell) => String(cell).trim() !== "")
        );

        if (nonEmpty.length === 0) {
          return reject(new Error("The file appears to be empty."));
        }

        // Validate headers (first non-empty row)
        const headers = nonEmpty[0].map((h) => String(h).trim().toLowerCase());
        const missingFields = [];
        if (!headers.includes("name") && !headers.includes("student name")) missingFields.push("Student Name");
        if (!headers.includes("email") && !headers.includes("student email")) missingFields.push("Student Email");

        if (missingFields.length > 0) {
          const found = nonEmpty[0].map((h) => String(h).trim()).filter(Boolean);
          return reject(
            new Error(
              `Missing required columns: "${missingFields.join('", "')}". ` +
              `Columns found in your file: "${found.join('", "') || "none"}". ` +
              `Please use the provided Template.`
            )
          );
        }

        // Rebuild clean CSV with proper quoting
        const csvData = nonEmpty
          .map((row) =>
            row
              .map((cell) => {
                const s = String(cell).trim();
                return s.includes(",") || s.includes('"') || s.includes("\n")
                  ? `"${s.replace(/"/g, '""')}"`
                  : s;
              })
              .join(",")
          )
          .join("\n");

        resolve(csvData);
      } catch (err) {
        reject(new Error("Failed to parse file: " + err.message));
      }
    };

    reader.onerror = () => reject(new Error("Failed to read the file."));

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}
