import { jsPDF } from "jspdf";
import "jspdf-autotable";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";

// Extended jsPDF to include autotable
declare module "jspdf" {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

type ExportableColumn = {
  header: string;
  key: string;
  width?: number;
};

type ExportOptions = {
  title: string;
  filename: string;
  author?: string;
  subject?: string;
};

export async function exportToPdf<T extends Record<string, any>>(
  data: T[],
  columns: ExportableColumn[],
  options: ExportOptions
) {
  const { title, filename, author = "Power Plant Management System", subject = "Export Data" } = options;
  
  // Create PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });
  
  // Set document properties
  doc.setProperties({
    title,
    author,
    subject,
    creator: "Power Plant Management System",
  });
  
  // Add title
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  // Add timestamp
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 30);
  
  // Prepare data for autoTable
  const tableData = data.map(item => {
    const row: string[] = [];
    columns.forEach(column => {
      row.push(String(item[column.key] || ""));
    });
    return row;
  });
  
  // Add table
  doc.autoTable({
    head: [columns.map(column => column.header)],
    body: tableData,
    startY: 35,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [0, 82, 204] },
    didDrawPage: (data) => {
      // Add page number
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        doc.internal.pageSize.width - 20, 
        doc.internal.pageSize.height - 10
      );
    }
  });
  
  // Save document
  doc.save(`${filename}.pdf`);
}

export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ExportableColumn[],
  options: ExportOptions
) {
  const { title, filename, author = "Power Plant Management System", subject = "Export Data" } = options;
  
  // Create workbook and worksheet
  const workbook = new Workbook();
  workbook.creator = author;
  workbook.lastModifiedBy = author;
  workbook.created = new Date();
  workbook.modified = new Date();
  workbook.properties.date1904 = true;
  
  const worksheet = workbook.addWorksheet(title);
  
  // Add columns
  worksheet.columns = columns.map(column => ({
    header: column.header,
    key: column.key,
    width: column.width || 20
  }));
  
  // Add title
  worksheet.mergeCells("A1:D1");
  const titleCell = worksheet.getCell("A1");
  titleCell.value = title;
  titleCell.font = {
    size: 16,
    bold: true
  };
  
  // Add timestamp
  worksheet.mergeCells("A2:D2");
  const timestampCell = worksheet.getCell("A2");
  timestampCell.value = `Generated: ${new Date().toLocaleString()}`;
  timestampCell.font = {
    size: 10,
    italic: true
  };
  
  // Style header row
  worksheet.getRow(3).font = {
    bold: true
  };
  worksheet.getRow(3).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF0052CC" },
    bgColor: { argb: "FF0052CC" }
  };
  worksheet.getRow(3).font = {
    color: { argb: "FFFFFFFF" },
    bold: true
  };
  
  // Add data
  data.forEach(item => {
    const row: Record<string, any> = {};
    columns.forEach(column => {
      row[column.key] = item[column.key];
    });
    worksheet.addRow(row);
  });
  
  // Generate Excel file
  const buffer = await workbook.xlsx.writeBuffer();
  saveAs(new Blob([buffer]), `${filename}.xlsx`);
}
