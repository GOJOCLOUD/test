import { Paragraph, TextRun, BorderStyle } from "docx";
import { Style } from "../types.js";

/**
 * Processes a code block and returns appropriate paragraph formatting
 * @param code - The code block text
 * @param language - The programming language (optional)
 * @param style - The style configuration
 * @returns The processed paragraph
 */
export function processCodeBlock(
  code: string,
  language: string | undefined,
  style: Style
): Paragraph {
  // Split the code into lines and process each line
  const lines = code.split("\n");

  // Create text runs for each line
  const codeRuns: TextRun[] = [];

  // Add language indicator if present
  if (language) {
    codeRuns.push(
      new TextRun({
        text: language,
        font: "Courier New",
        size: style.codeBlockSize || 18,
        color: "666666",
        bold: true,
        rightToLeft: style.direction === "RTL",
      }),
      new TextRun({
        text: "\n",
        font: "Courier New",
        size: style.codeBlockSize || 18,
        break: 1,
        rightToLeft: style.direction === "RTL",
      })
    );
  }

  // Process each line
  lines.forEach((line, index) => {
    // Preserve leading spaces by converting them to non-breaking spaces
    const leadingSpaces = line.match(/^\s*/)?.[0].length || 0;
    const leadingNbsp = "\u00A0".repeat(leadingSpaces);
    const processedLine = leadingNbsp + line.slice(leadingSpaces);

    // Add the line
    codeRuns.push(
      new TextRun({
        text: processedLine,
        font: "Courier New",
        size: style.codeBlockSize || 20,
        color: "444444",
        rightToLeft: style.direction === "RTL",
      })
    );

    // Add line break if not the last line
    if (index < lines.length - 1) {
      codeRuns.push(
        new TextRun({
          text: "\n",
          font: "Courier New",
          size: style.codeBlockSize || 20,
          break: 1,
          rightToLeft: style.direction === "RTL",
        })
      );
    }
  });

  return new Paragraph({
    children: codeRuns,
    spacing: {
      before: style.paragraphSpacing,
      after: style.paragraphSpacing,
      // Preserve line spacing exactly
      line: 360,
      lineRule: "exact",
    },
    shading: {
      fill: "F5F5F5",
    },
    border: {
      top: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      bottom: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      left: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
      right: { style: BorderStyle.SINGLE, size: 1, color: "DDDDDD" },
    },
    // Preserve indentation
    indent: {
      left: 360, // 0.25 inch indent for the entire code block
    },
  });
}