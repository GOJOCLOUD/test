import { describe, it, expect } from "@jest/globals";
import { convertMarkdownToDocx } from "../src/index";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outputDir = path.join(__dirname, "..", "test-output");

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

describe("Table rendering", () => {
  it("should render basic tables with headers and rows", async () => {
    const markdown = `
| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |
`;

    const blob = await convertMarkdownToDocx(markdown);
    const buffer = await blob.arrayBuffer();
    const outputPath = path.join(outputDir, "table-basic.docx");
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it("should support alignment markers and empty cells", async () => {
    const markdown = `
| Left | Center | Right | Empty |
|:-----|:------:|------:|-------|
| a    |   b    |     c |       |
| d    |   e    |     f |   g   |
`;

    const blob = await convertMarkdownToDocx(markdown);
    const buffer = await blob.arrayBuffer();
    const outputPath = path.join(outputDir, "table-aligned-empty.docx");
    fs.writeFileSync(outputPath, Buffer.from(buffer));

    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
