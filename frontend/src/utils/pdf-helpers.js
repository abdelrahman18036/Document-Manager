/**
 * Utility functions for PDF handling
 */

/**
 * Add search highlight class to PDF text layer
 * Call this function after PDF is loaded
 */
export const enhancePdfTextLayer = () => {
  // Ensure we're in a browser environment
  if (typeof window === "undefined") return;

  // Add a small delay to ensure the PDF text layer is rendered
  setTimeout(() => {
    // Find all text spans in the PDF
    const textElements = document.querySelectorAll(
      ".react-pdf__Page__textContent span"
    );

    // Add cursor property to make the text layer selectable
    textElements.forEach((span) => {
      span.style.cursor = "text";
    });

    console.log(`Enhanced ${textElements.length} text elements in PDF`);
  }, 1000);
};

/**
 * Highlights search terms in the PDF text layer
 * @param {string} searchTerm - The term to search for
 * @param {number} pageNumber - The current page number
 */
export const highlightPdfSearchResults = (searchTerm, pageNumber) => {
  if (!searchTerm || typeof window === "undefined") return;

  // Give time for the text layer to render
  setTimeout(() => {
    const textElements = document.querySelectorAll(
      ".react-pdf__Page__textContent span"
    );
    const searchTermLower = searchTerm.toLowerCase();

    // Remove any existing highlights
    textElements.forEach((span) => {
      span.classList.remove("search-highlight");
    });

    // Add highlights to matching text
    let highlightCount = 0;
    textElements.forEach((span) => {
      const text = span.textContent || "";
      if (text.toLowerCase().includes(searchTermLower)) {
        span.classList.add("search-highlight");
        highlightCount++;
      }
    });

    console.log(
      `Highlighted ${highlightCount} instances of "${searchTerm}" on page ${pageNumber}`
    );
  }, 500);
};

/**
 * Makes text selectable in the PDF viewer
 */
export const makeTextSelectable = () => {
  // Add necessary CSS to make text selectable
  const style = document.createElement("style");
  style.textContent = `
    .react-pdf__Page__textContent {
      pointer-events: auto;
    }
    .react-pdf__Page__textContent span {
      cursor: text;
    }
  `;
  document.head.appendChild(style);
};
