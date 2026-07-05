import ExcelJS from "exceljs";
import { IComplaint } from "@/types/complaint";

export async function exportComplaintsToExcel(
  complaints: IComplaint[],
  filename = "complaints-report.xlsx"
): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Complaints");

  // Define columns
  sheet.columns = [
    { header: "Tracking #", key: "trackingNumber", width: 18 },
    { header: "Title", key: "title", width: 30 },
    { header: "Category", key: "category", width: 14 },
    { header: "Department", key: "department", width: 16 },
    { header: "Status", key: "status", width: 14 },
    { header: "Priority", key: "priority", width: 12 },
    { header: "Citizen Name", key: "citizenName", width: 22 },
    { header: "Citizen Phone", key: "citizenPhone", width: 16 },
    { header: "Location", key: "location", width: 30 },
    { header: "Created Date", key: "createdAt", width: 18 },
  ];

  // Style header
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF2563EB" },
  };
  headerRow.alignment = { vertical: "middle", horizontal: "center" };
  headerRow.height = 24;

  // Add rows
  complaints.forEach((c) => {
    sheet.addRow({
      trackingNumber: c.trackingNumber,
      title: c.title,
      category: c.category,
      department: c.department,
      status: c.status,
      priority: c.priority,
      citizenName: c.citizen?.name || "",
      citizenPhone: c.citizen?.phone || "",
      location: c.location?.address || "",
      createdAt: new Date(c.createdAt).toLocaleDateString(),
    });
  });

  // Auto-fit (approximate)
  sheet.columns.forEach((col) => {
    if (col.key && col.width) {
      col.width = Math.min(col.width + 5, 45);
    }
  });

  // Generate and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
