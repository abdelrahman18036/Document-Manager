/**
 * Setup script to copy PDF.js worker files from node_modules
 * Run with: node setup-pdf.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Updated PDF.js version to match what react-pdf is using
const PDFJS_VERSION = "4.8.69";
const PUBLIC_DIR = path.join(__dirname, "public", "pdf-worker");
const NODE_MODULES_PATH = path.join(__dirname, "node_modules", "pdfjs-dist");

// Files to copy - note that we're using .min.mjs extension which is what's actually available
const files = [
  {
    src: path.join(NODE_MODULES_PATH, "build", "pdf.worker.min.mjs"),
    dest: path.join(PUBLIC_DIR, "pdf.worker.min.js"),
  },
];

// Check if pdfjs-dist is installed
if (!fs.existsSync(NODE_MODULES_PATH)) {
  console.error(
    `❌ Error: pdfjs-dist module not found at ${NODE_MODULES_PATH}`
  );
  console.log(
    "Please make sure pdfjs-dist is installed with npm install pdfjs-dist"
  );
  process.exit(1);
}

// Debug: List contents of node_modules/pdfjs-dist/build
const buildPath = path.join(NODE_MODULES_PATH, "build");
console.log(`Checking PDF.js build directory: ${buildPath}`);
try {
  if (fs.existsSync(buildPath)) {
    const buildFiles = fs.readdirSync(buildPath);
    console.log("Available files in pdfjs-dist/build:", buildFiles);
  } else {
    console.log(`Build directory not found: ${buildPath}`);
  }
} catch (error) {
  console.error(`Error reading build directory: ${error.message}`);
}

// Create directory if it doesn't exist
if (!fs.existsSync(PUBLIC_DIR)) {
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  console.log(`✅ Created directory: ${PUBLIC_DIR}`);
}

// Copy function
const copyFile = (src, dest) => {
  return new Promise((resolve, reject) => {
    try {
      if (!fs.existsSync(src)) {
        reject(new Error(`Source file not found: ${src}`));
        return;
      }

      fs.copyFileSync(src, dest);
      console.log(`✅ Copied: ${src} -> ${dest}`);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
};

// Main function
const main = async () => {
  console.log(`Setting up PDF.js worker files (version ${PDFJS_VERSION})...`);

  try {
    // Copy all files
    for (const file of files) {
      try {
        await copyFile(file.src, file.dest);
      } catch (error) {
        console.error(`❌ Error copying ${file.src}: ${error.message}`);
        process.exit(1);
      }
    }

    // Update pdfjs-setup.js to use local files
    const setupFile = path.join(__dirname, "src", "utils", "pdfjs-setup.js");

    if (fs.existsSync(setupFile)) {
      const content = `import { pdfjs } from "react-pdf";

// Using local PDF.js worker files (version ${PDFJS_VERSION})
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

// Configure PDF.js options
const pdfOptions = {
  // Using local cMaps
  cMapUrl: "/pdf-worker/cmaps/",
  cMapPacked: true,
};

console.log("PDF.js initialized using local worker file from public directory");

export { pdfOptions };
`;

      fs.writeFileSync(setupFile, content);
      console.log(`✅ Updated: ${setupFile}`);

      // Create cmaps directory if needed
      const cmapsDir = path.join(PUBLIC_DIR, "cmaps");
      if (!fs.existsSync(cmapsDir)) {
        fs.mkdirSync(cmapsDir, { recursive: true });
        console.log(`✅ Created directory: ${cmapsDir}`);
      }

      // Copy cmaps from node_modules to public directory
      const cmapsSrcDir = path.join(NODE_MODULES_PATH, "cmaps");
      if (fs.existsSync(cmapsSrcDir)) {
        try {
          const cmapFiles = fs.readdirSync(cmapsSrcDir);
          for (const file of cmapFiles) {
            const srcPath = path.join(cmapsSrcDir, file);
            const destPath = path.join(cmapsDir, file);
            fs.copyFileSync(srcPath, destPath);
          }
          console.log(`✅ Copied cmap files to ${cmapsDir}`);
        } catch (error) {
          console.warn(
            `⚠️ Warning: Failed to copy cmap files: ${error.message}`
          );
        }
      } else {
        console.warn(`⚠️ Warning: cMaps directory not found at ${cmapsSrcDir}`);
      }
    }

    console.log("✅ PDF.js worker setup complete!");
  } catch (error) {
    console.error("❌ Error setting up PDF.js worker:", error);
    process.exit(1);
  }
};

main();
