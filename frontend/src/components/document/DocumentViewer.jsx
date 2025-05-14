import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import { ArrowLeftIcon, ArrowRightIcon, MagnifyingGlassMinusIcon, MagnifyingGlassPlusIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// Import our PDF.js configuration
import { pdfOptions } from '../../utils/pdfjs-setup';

export default function DocumentViewer({ documentUrl, documentType, currentPage, onPageChange }) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(currentPage || 1);
    const [scale, setScale] = useState(1);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loadFailed, setLoadFailed] = useState(false);

    // Update component state when currentPage prop changes
    useEffect(() => {
        if (currentPage && currentPage !== pageNumber) {
            setPageNumber(currentPage);
        }
    }, [currentPage]);

    useEffect(() => {
        // Reset error state when document URL changes
        if (documentUrl) {
            setErrorMessage(null);
            setLoadFailed(false);
        }
    }, [documentUrl]);

    function onDocumentLoadSuccess({ numPages }) {
        console.log(`PDF loaded successfully with ${numPages} pages`);
        setNumPages(numPages);
        setErrorMessage(null);
        setLoadFailed(false);
    }

    function onDocumentLoadError(error) {
        console.error('PDF load error:', error);
        // More detailed error message
        let errorMsg = 'Failed to load document';
        if (error && error.message) {
            errorMsg = error.message;
            // If it's a worker error, provide more context
            if (errorMsg.includes('worker')) {
                errorMsg += '. This may be due to CORS issues with the PDF worker.';
            }
        }
        setErrorMessage(errorMsg);
        setLoadFailed(true);
    }

    function changePage(offset) {
        const newPageNumber = pageNumber + offset;
        if (newPageNumber >= 1 && newPageNumber <= numPages) {
            setPageNumber(newPageNumber);
            if (onPageChange) {
                onPageChange(newPageNumber);
            }
        }
    }

    function previousPage() {
        changePage(-1);
    }

    function nextPage() {
        changePage(1);
    }

    function zoomIn() {
        setScale(prevScale => Math.min(prevScale + 0.1, 2.5));
    }

    function zoomOut() {
        setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
    }

    // Render based on document type
    const renderDocument = () => {
        if (!documentUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-700">
                    <DocumentTextIcon className="h-16 w-16 text-slate-400" />
                    <p className="text-slate-400 mt-2">No document selected</p>
                </div>
            );
        }

        if (documentType === 'pdf') {
            // If load failed, show a download link as fallback
            if (loadFailed) {
                return (
                    <div className="flex flex-col items-center justify-center h-64 bg-red-900/30 rounded-lg border border-red-700 p-6">
                        <div className="text-red-400 mb-4 text-center">
                            <p className="font-semibold">Failed to render PDF in browser</p>
                            <p className="text-sm mt-2">{errorMessage}</p>
                            <p className="text-xs mt-1">Check console for detailed error information</p>
                        </div>
                        <div className="flex space-x-4">
                            <a
                                href={documentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600 transition-colors"
                            >
                                Download PDF Instead
                            </a>
                            <button
                                onClick={() => {
                                    setErrorMessage(null);
                                    setLoadFailed(false);
                                }}
                                className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                );
            }

            return (
                <Document
                    file={documentUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    options={pdfOptions}
                    loading={
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
                        </div>
                    }
                    error={null} // Use our own error handling instead
                >
                    {numPages > 0 && (
                        <Page
                            key={`page_${pageNumber}`}
                            pageNumber={pageNumber}
                            scale={scale}
                            renderTextLayer={false}
                            renderAnnotationLayer={false}
                            className="rounded-lg shadow-lg bg-white"
                            loading={
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                                </div>
                            }
                            error={() => (
                                <div className="p-4 bg-red-900/20 rounded border border-red-700 text-red-300 text-sm">
                                    Failed to render page {pageNumber}
                                </div>
                            )}
                        />
                    )}
                </Document>
            );
        }

        // For other document types, we'd need different renderers
        // This could be extended for Word, Excel, etc.
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-700">
                <p className="text-slate-400">
                    Document type {documentType} is not supported for preview
                </p>
            </div>
        );
    };

    return (
        <div className="flex flex-col card overflow-hidden">
            {/* Toolbar */}
            <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                {/* Page navigation */}
                <div className="flex items-center space-x-4">
                    <button
                        onClick={previousPage}
                        disabled={pageNumber <= 1}
                        className="p-1.5 bg-slate-700 rounded-md disabled:opacity-30 hover:bg-slate-600 transition-colors"
                        aria-label="Previous page"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-slate-200" />
                    </button>

                    <span className="text-sm text-slate-300">
                        {pageNumber} / {numPages || '--'}
                    </span>

                    <button
                        onClick={nextPage}
                        disabled={!numPages || pageNumber >= numPages}
                        className="p-1.5 bg-slate-700 rounded-md disabled:opacity-30 hover:bg-slate-600 transition-colors"
                        aria-label="Next page"
                    >
                        <ArrowRightIcon className="h-5 w-5 text-slate-200" />
                    </button>
                </div>

                {/* Zoom controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={zoomOut}
                        className="p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                        aria-label="Zoom out"
                    >
                        <MagnifyingGlassMinusIcon className="h-5 w-5 text-slate-200" />
                        <span className="sr-only">Zoom out</span>
                    </button>

                    <span className="text-sm text-slate-300">
                        {Math.round(scale * 100)}%
                    </span>

                    <button
                        onClick={zoomIn}
                        className="p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                        aria-label="Zoom in"
                    >
                        <MagnifyingGlassPlusIcon className="h-5 w-5 text-slate-200" />
                        <span className="sr-only">Zoom in</span>
                    </button>
                </div>
            </div>

            {/* Document container */}
            <div className="overflow-auto p-4 bg-slate-800 min-h-[500px]">
                <div className="flex justify-center">
                    {renderDocument()}
                </div>
            </div>
        </div>
    );
} 