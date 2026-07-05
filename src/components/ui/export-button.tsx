"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileDown, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { IComplaint } from "@/types/complaint";
import { exportComplaintsToExcel } from "@/lib/excelExport";
import { exportComplaintsToPdf } from "@/lib/pdfExport";

interface ExportButtonProps {
  data: IComplaint[];
  filename?: string;
  title?: string;
}

export default function ExportButton({ data, filename = "complaints", title = "Complaints Report" }: ExportButtonProps) {
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const handleExportPdf = async () => {
    setExporting("pdf");
    try {
      await exportComplaintsToPdf(data, title);
    } catch (e) {
      console.error("PDF export failed:", e);
    } finally {
      setExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setExporting("excel");
    try {
      await exportComplaintsToExcel(data, `${filename}.xlsx`);
    } catch (e) {
      console.error("Excel export failed:", e);
    } finally {
      setExporting(null);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button variant="outline" size="sm" disabled={!!exporting}>
          {exporting ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <FileDown className="w-4 h-4 mr-2" />
          )}
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPdf} disabled={!!exporting}>
          <FileText className="w-4 h-4 mr-2" />
          Export PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportExcel} disabled={!!exporting}>
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          Export Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
