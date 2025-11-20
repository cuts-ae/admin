import fs from "fs";
import path from "path";

async function generatePDFAssets() {
  // Convert logo to base64
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const logoBuffer = fs.readFileSync(logoPath);
  const logoBase64 = logoBuffer.toString("base64");

  // Read Geist font file
  const geistFontPath = path.join(
    process.cwd(),
    "node_modules/next/dist/esm/next-devtools/server/font/geist-latin.woff2"
  );
  const fontBuffer = fs.readFileSync(geistFontPath);
  const fontBase64 = fontBuffer.toString("base64");

  // Generate output file
  const output = `// Auto-generated PDF assets
export const LOGO_BASE64 = "data:image/png;base64,${logoBase64}";
export const GEIST_FONT_BASE64 = "${fontBase64}";
`;

  const outputPath = path.join(process.cwd(), "lib", "pdf-assets.ts");
  fs.writeFileSync(outputPath, output);

  console.log("✅ PDF assets generated successfully");
  console.log(`   Logo size: ${(logoBase64.length / 1024).toFixed(2)} KB`);
  console.log(`   Font size: ${(fontBase64.length / 1024).toFixed(2)} KB`);
}

generatePDFAssets().catch(console.error);
