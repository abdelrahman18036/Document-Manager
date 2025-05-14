import { pdfjs } from "react-pdf";

// Using local PDF.js worker files (version 4.8.69)
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf-worker/pdf.worker.min.js";

// Configure PDF.js options
const pdfOptions = {
  // Using local cMaps
  cMapUrl: "/pdf-worker/cmaps/",
  cMapPacked: true,
};

console.log("PDF.js initialized using local worker file from public directory");

export { pdfOptions };
