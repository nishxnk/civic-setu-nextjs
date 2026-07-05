import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { IComplaint } from "@/types/complaint";

export async function exportComplaintsToPdf(
  complaints: IComplaint[],
  title = "Complaints Report"
): Promise<void> {
  const doc = new jsPDF({ orientation: "landscape", format: "a4" });

  // Title
  doc.setFontSize(16);
  doc.setTextColor(37, 99, 235);
  doc.text(title, 14, 20);

  // Subtitle
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text(`Generated: ${new Date().toLocaleString()} | Total: ${complaints.length} complaints`, 14, 28);

  // Table
  const rows = complaints.map((c) => [
    c.trackingNumber,
    c.title.substring(0, 40),
    c.category,
    c.status,
    c.priority,
    c.citizen?.name || "",
    new Date(c.createdAt).toLocaleDateString(),
  ]);

  autoTable(doc, {
    head: [["Tracking #", "Title", "Category", "Status", "Priority", "Citizen", "Date"]],
    body: rows,
    startY: 34,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: {
      fillColor: [37, 99, 235],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: { fillColor: [248, 250, 252] },
    margin: { left: 10, right: 10 },
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text(
      `Civic Setu — Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 50,
      doc.internal.pageSize.height - 8
    );
  }

  doc.save(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
}
