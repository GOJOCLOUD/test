import { Table, TableRow, TableCell, Paragraph, TextRun, AlignmentType, BorderStyle, TableLayoutType, WidthType } from "docx";
import { TableData } from "../types.js";

/**
 * Collects tables from markdown lines
 * @param lines - The markdown lines
 * @returns An array of table data
 */
export function collectTables(lines: string[]): TableData[] {
  const tables: TableData[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim().startsWith("|")) {
      // Check for separator row with proper regex
      if (
        i + 1 < lines.length &&
        /^\s*\|(?:\s*:?-+:?\s*\|)+\s*$/.test(lines[i + 1])
      ) {
        // Preserve empty cells by slicing off leading/trailing pipe and splitting
        const headers = line
          .trim()
          .replace(/^\|/, "")
          .replace(/\|$/, "")
          .split("|")
          .map((h) => h.trim());
        const rows: string[][] = [];
        let j = i + 2;
        while (j < lines.length && lines[j].trim().startsWith("|")) {
          const row = lines[j]
            .trim()
            .replace(/^\|/, "")
            .replace(/\|$/, "")
            .split("|")
            .map((cell) => cell.trim());
          rows.push(row);
          j++;
        }
        tables.push({ headers, rows });
      }
    }
  }

  return tables;
}

/**
 * Processes a table and returns table formatting
 * @param tableData - The table data
 * @param documentType - The document type
 * @returns The processed table
 */
export function processTable(
  tableData: TableData,
  documentType: "document" | "report"
): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        tableHeader: true,
        children: tableData.headers.map(
          (header) =>
            new TableCell({
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  style: "Strong",
                  children: [
                    new TextRun({
                      text: header,
                      bold: true,
                      color: "000000",
                    }),
                  ],
                }),
              ],
              shading: {
                fill: documentType === "report" ? "DDDDDD" : "F2F2F2",
              },
            })
        ),
      }),
      ...tableData.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell) =>
                new TableCell({
                  children: [
                    new Paragraph({
                      children: [
                        new TextRun({
                          text: cell,
                          color: "000000",
                          rightToLeft: false,
                        }),
                      ],
                    }),
                  ],
                })
            ),
          })
      ),
    ],
    layout: TableLayoutType.FIXED,
    margins: {
      top: 100,
      bottom: 100,
      left: 100,
      right: 100,
    },
  });
}