/**
 * Script to check React PDF and PDF.js versions
 * Run with: node check-pdf-versions.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const require = createRequire(import.meta.url);

// Function to read package.json
const readPackageJson = (pkgPath) => {
  try {
    const data = fs.readFileSync(pkgPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    console.error(`Error reading ${pkgPath}:`, err);
    return null;
  }
};

// Check local package.json
const packageJson = readPackageJson(path.join(__dirname, "package.json"));
console.log("\n📦 Checking package versions...");

if (packageJson) {
  const reactPdfVersion = packageJson.dependencies["react-pdf"];
  console.log(`- react-pdf: ${reactPdfVersion || "Not installed"}`);

  const pdfJsVersion = packageJson.dependencies["pdfjs-dist"];
  console.log(`- pdfjs-dist: ${pdfJsVersion || "Not installed"}`);
}

// Try to find the actual versions in node_modules
console.log("\n📋 Checking actual installed versions:");

try {
  // Check react-pdf
  const reactPdfPkg = readPackageJson(
    path.join(__dirname, "node_modules", "react-pdf", "package.json")
  );
  if (reactPdfPkg) {
    console.log(`- react-pdf: ${reactPdfPkg.version}`);
    console.log(
      `  ↳ pdfjs-dist peerDependency: ${
        reactPdfPkg.peerDependencies?.["pdfjs-dist"] || "Not specified"
      }`
    );
  }

  // Check pdfjs-dist
  const pdfJsPkg = readPackageJson(
    path.join(__dirname, "node_modules", "pdfjs-dist", "package.json")
  );
  if (pdfJsPkg) {
    console.log(`- pdfjs-dist: ${pdfJsPkg.version}`);
  }

  // Print recommendation
  console.log("\n📝 Recommendation:");
  if (reactPdfPkg && pdfJsPkg) {
    const reactPdfPeerDep = reactPdfPkg.peerDependencies?.["pdfjs-dist"] || "";
    if (reactPdfPeerDep) {
      const isPeerMatched = reactPdfPeerDep.includes(pdfJsPkg.version);
      if (isPeerMatched) {
        console.log(
          "✅ The installed pdfjs-dist version matches react-pdf peer dependency"
        );
      } else {
        console.log(
          `❌ Version mismatch! react-pdf expects pdfjs-dist ${reactPdfPeerDep}`
        );
        console.log(
          `   Consider running: npm install --save pdfjs-dist@${reactPdfPeerDep.replace(
            /[\^~]/,
            ""
          )}`
        );
      }
    }
  }
} catch (err) {
  console.error("Error checking node_modules:", err);
}

// Update pdfjs-setup.js file with correct version
try {
  const pdfJsPkg = readPackageJson(
    path.join(__dirname, "node_modules", "pdfjs-dist", "package.json")
  );
  if (pdfJsPkg) {
    const pdfJsVersion = pdfJsPkg.version;
    const setupFilePath = path.join(
      __dirname,
      "src",
      "utils",
      "pdfjs-setup.js"
    );

    if (fs.existsSync(setupFilePath)) {
      const content = `import { pdfjs } from "react-pdf";

// PDF.js version - using the installed version: ${pdfJsVersion}
pdfjs.GlobalWorkerOptions.workerSrc = \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/pdf.worker.min.js\`;

// Configure PDF.js options
const pdfOptions = {
  cMapUrl: \`//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfJsVersion}/cmaps/\`,
  cMapPacked: true,
};

console.log('PDF.js worker configured with version ${pdfJsVersion}');

export { pdfOptions };
`;

      fs.writeFileSync(setupFilePath, content);
      console.log(`\n✅ Updated ${setupFilePath} with version ${pdfJsVersion}`);
    }
  }
} catch (err) {
  console.error("Error updating pdfjs-setup.js:", err);
}
