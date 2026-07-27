import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateSchedulePDF = async (schedules, filters, action = "download") => {
  const { type, selectedBatches, selectedTeachers, startDate, endDate } = filters;
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(23, 59, 59, 999);

  let allLectures = [];

  schedules.forEach((schedule) => {
    if (type === "batches") {
      const bId = schedule.batch?._id || schedule.batch;
      if (!selectedBatches.includes(bId)) return;
    }

    const batchName = schedule.batch?.batch_name || "Unknown Batch";
    const subjectName = schedule.subject || "Unknown Subject";
    
    (schedule.lectures || []).forEach((lecture) => {
      if (!lecture.date) return;
      
      const lecDate = new Date(lecture.date);
      if (lecDate < start || lecDate > end) return;

      const teacherObj = lecture.teacher || schedule.teacher;
      const teacherId = teacherObj?._id || teacherObj;
      const teacherName = teacherObj?.name || "Unassigned";

      if (type === "teachers") {
        if (!selectedTeachers.includes(teacherId)) return;
      }

      allLectures.push({
        dateObj: lecDate,
        dateStr: lecDate.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        time: lecture.time_slot || "9:00 AM - 10:45 AM", 
        subject: subjectName,
        faculty: teacherName,
        batch: batchName,
        topics: lecture.title || ""
      });
    });
  });

  allLectures.sort((a, b) => a.dateObj - b.dateObj || a.time.localeCompare(b.time));

  const groupedLectures = {};
  allLectures.forEach((lec) => {
    if (!groupedLectures[lec.dateStr]) groupedLectures[lec.dateStr] = [];
    groupedLectures[lec.dateStr].push(lec);
  });

  const doc = new jsPDF("p", "pt", "a4");

  // Fetch logo.png and convert to base64
  let logoBase64 = null;
  try {
    const response = await fetch('/logo.png');
    if (response.ok) {
      const blob = await response.blob();
      if (blob.type.includes("image")) {
        const reader = new FileReader();
        logoBase64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    }
  } catch(e) {
     console.error("Could not load logo", e);
  }

  // Header
  let textStartX = 40;
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', 40, 40, 60, 60);
      textStartX = 110;
    } catch (err) {
      console.error("Failed to add logo to PDF:", err);
    }
  }

  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Nexcore Institute of Technology", textStartX, 55);
  
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("NEXCORE INSTITUTE OF TECHNOLOGY, CAMPUS NO 1A, 1B AND 3, NEW WHITE HOUSE, BUILDING", textStartX, 70);
  doc.text("NO 3, OFF BKC, KURLA WEST, MUMBAI, MAHARASHTRA, 400070 | +91-9594402775 |", textStartX, 83);
  doc.text("admin@nexcoreinstitute.org | www.nexcoreinstitute.org", textStartX, 96);

  // Divider
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(1);
  doc.line(40, 105, 555, 105);

  // Meta details
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Duration", 40, 125);
  doc.setFont("helvetica", "normal");
  doc.text(`: ${start.toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: '2-digit' })} - ${end.toLocaleDateString("en-US", { day: '2-digit', month: 'short', year: '2-digit' })}`, 100, 125);

  doc.setFont("helvetica", "bold");
  doc.text("Lectures", 40, 145);
  doc.setFont("helvetica", "normal");
  
  let filterText = "All";
  if (type === "batches") filterText = "Selected Batches";
  if (type === "teachers") filterText = "Selected Teachers";
  doc.text(`: ${filterText}`, 100, 145);

  let finalY = 165;

  // Render Table Date by Date
  const dates = Object.keys(groupedLectures);
  if (dates.length === 0) {
    doc.text("No lectures found for the selected filters.", 40, finalY);
  } else {
    dates.forEach((dateStr) => {
      // Add Date Header Row
      const tableData = groupedLectures[dateStr].map(lec => [
        lec.time,
        lec.subject,
        lec.faculty,
        lec.batch,
        lec.topics
      ]);

      autoTable(doc, {
        startY: finalY,
        head: [[{ content: dateStr, colSpan: 5, styles: { halign: 'left', fillColor: [220, 220, 220], textColor: [0, 0, 0], fontStyle: 'bold' } }]],
        body: [
          // Subheader row (columns)
          [{ content: 'Time', styles: { fontStyle: 'bold' } }, 
           { content: 'Subject', styles: { fontStyle: 'bold' } }, 
           { content: 'Faculty', styles: { fontStyle: 'bold' } }, 
           { content: 'Batch', styles: { fontStyle: 'bold' } }, 
           { content: 'Topics', styles: { fontStyle: 'bold' } }],
          ...tableData
        ],
        theme: 'grid',
        headStyles: { fillColor: [220, 220, 220], textColor: 0, fontStyle: 'bold' },
        styles: {
          fontSize: 9,
          cellPadding: 5,
          lineColor: [0, 0, 0],
          lineWidth: 0.5,
          textColor: 20
        },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 120 },
          2: { cellWidth: 100 },
          3: { cellWidth: 100 },
          4: { cellWidth: 'auto' }
        },
        margin: { top: 40, left: 40, right: 40 }
      });
      finalY = doc.lastAutoTable.finalY + 15;
    });
  }

  // Add Page Numbers
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 80, doc.internal.pageSize.height - 20);
  }

  if (action === "preview") {
    const blob = doc.output("blob");
    return URL.createObjectURL(blob);
  } else {
    doc.save(`Schedule_Report_${new Date().getTime()}.pdf`);
  }
};
