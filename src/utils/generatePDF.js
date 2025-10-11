import jsPDF from "jspdf";
import html2canvas from "html2canvas-pro";

export default async function generatePDF(element, filename = "report") {
  if (!element) return;

  // Temporarily remove decorative spacing
  const prevStyle = element.style.cssText;
  element.style.boxShadow = "none";
  element.style.borderRadius = "0";
  element.style.margin = "0";
  element.style.padding = "0";
  element.style.background = "#fff";

  // Capture the rendered node
  const canvas = await html2canvas(element, {
    scale: 3,
    useCORS: true,
    logging: false,
    backgroundColor: "#fff",
    scrollX: 0,
    scrollY: 0,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  // Restore element styling
  element.style.cssText = prevStyle;

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  // ⚡ Always fill full width of A4
  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  // Vertically center (or crop slightly if too tall)
  let y = 1;
  // if (imgHeight < pageHeight) {
  //   y = (pageHeight - imgHeight) / 2;
  // }

  pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight, "", "FAST");
  pdf.save(`${filename}.pdf`);
}
