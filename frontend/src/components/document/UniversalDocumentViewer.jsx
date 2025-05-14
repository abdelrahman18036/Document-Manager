import { useState, useEffect } from 'react';
import { Document, Page } from 'react-pdf';
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    MagnifyingGlassMinusIcon,
    MagnifyingGlassPlusIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
    ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { pdfOptions } from '../../utils/pdfjs-setup';
import { enhancePdfTextLayer, highlightPdfSearchResults } from '../../utils/pdf-helpers';

const FileTypes = {
    PDF: 'pdf',
    IMAGE: 'image',
    WORD: 'word',
    EXCEL: 'excel',
    POWERPOINT: 'powerpoint',
    UNKNOWN: 'unknown'
};

export default function UniversalDocumentViewer({
    documentUrl,
    documentType,
    documentName,
    currentPage,
    onPageChange,
    searchHighlights = [] // array of areas to highlight for search
}) {
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(currentPage || 1);
    const [scale, setScale] = useState(1);
    const [errorMessage, setErrorMessage] = useState(null);
    const [loadFailed, setLoadFailed] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [fileType, setFileType] = useState(null);

    // Update component state when currentPage prop changes
    useEffect(() => {
        if (currentPage && currentPage !== pageNumber) {
            setPageNumber(currentPage);
        }
    }, [currentPage]);

    // Determine file type from document type or URL extension
    useEffect(() => {
        if (documentType) {
            setFileType(documentType);
        } else if (documentUrl) {
            const extension = documentUrl.split('.').pop().toLowerCase();
            if (['pdf'].includes(extension)) {
                setFileType(FileTypes.PDF);
            } else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension)) {
                setFileType(FileTypes.IMAGE);
            } else if (['doc', 'docx'].includes(extension)) {
                setFileType(FileTypes.WORD);
            } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
                setFileType(FileTypes.EXCEL);
            } else if (['ppt', 'pptx'].includes(extension)) {
                setFileType(FileTypes.POWERPOINT);
            } else {
                setFileType(FileTypes.UNKNOWN);
            }
        }
    }, [documentUrl, documentType]);

    // Reset error state when document URL changes
    useEffect(() => {
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

        // Enhance PDF text layer for better selection and searching
        enhancePdfTextLayer();
    }

    function onDocumentLoadError(error) {
        console.error('Document load error:', error);
        // More detailed error message
        let errorMsg = 'Failed to load document';
        if (error && error.message) {
            errorMsg = error.message;
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

    function rotateClockwise() {
        setRotation((rotation + 90) % 360);
    }

    // Update search highlighting when page changes or search highlights change
    useEffect(() => {
        if (fileType === FileTypes.PDF && searchHighlights && searchHighlights.length > 0) {
            // Get current page highlights
            const currentPageHighlights = searchHighlights.filter(highlight => highlight.page === pageNumber);
            if (currentPageHighlights.length > 0) {
                // Use the first highlight's text as search term
                highlightPdfSearchResults(currentPageHighlights[0].text, pageNumber);
            }
        }
    }, [pageNumber, searchHighlights, fileType]);

    function renderToolbar() {
        return (
            <div className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700">
                {/* Page navigation for multi-page documents */}
                {(fileType === FileTypes.PDF || fileType === FileTypes.WORD || fileType === FileTypes.POWERPOINT) && (
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
                )}

                {/* Zoom and download controls */}
                <div className="flex items-center space-x-2">
                    <button
                        onClick={zoomOut}
                        className="p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                        aria-label="Zoom out"
                    >
                        <MagnifyingGlassMinusIcon className="h-5 w-5 text-slate-200" />
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
                    </button>

                    {/* Download button */}
                    <a
                        href={documentUrl}
                        download={documentName || "document"}
                        className="ml-4 p-1.5 bg-slate-700 rounded-md hover:bg-slate-600 transition-colors"
                        aria-label="Download document"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 text-slate-200" />
                    </a>
                </div>
            </div>
        );
    }

    // Render PDF document
    const renderPdfDocument = () => {
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
                        key={`page_${pageNumber}_${scale}_${rotation}`}
                        pageNumber={pageNumber}
                        scale={scale}
                        rotate={rotation}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="rounded-lg shadow-lg bg-white"
                        loading={
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                            </div>
                        }
                        customTextRenderer={({ str, itemIndex }) => {
                            if (!searchHighlights || searchHighlights.length === 0) {
                                return str;
                            }

                            // Find if we need to highlight this text
                            const currentPageHighlights = searchHighlights.filter(highlight => highlight.page === pageNumber);
                            if (currentPageHighlights.length === 0) {
                                return str;
                            }

                            let shouldHighlight = false;
                            let highlightTerm = '';

                            for (const highlight of currentPageHighlights) {
                                // Case-insensitive search within the string
                                const searchTermLower = highlight.text.toLowerCase();
                                const strLower = str.toLowerCase();

                                if (strLower.includes(searchTermLower)) {
                                    shouldHighlight = true;
                                    highlightTerm = highlight.text;
                                    break;
                                }
                            }

                            if (shouldHighlight) {
                                // Create regex with word boundaries to highlight exact matches
                                try {
                                    const regex = new RegExp(`(${highlightTerm})`, 'gi');
                                    const parts = str.split(regex);

                                    return (
                                        <>
                                            {parts.map((part, index) => {
                                                const isMatch = part.toLowerCase() === highlightTerm.toLowerCase();
                                                return isMatch ? (
                                                    <mark
                                                        key={index}
                                                        className="search-highlight"
                                                    >
                                                        {part}
                                                    </mark>
                                                ) : part;
                                            })}
                                        </>
                                    );
                                } catch (e) {
                                    console.error("Regex error:", e);
                                    return str;
                                }
                            }

                            return str;
                        }}
                    />
                )}
            </Document>
        );
    };

    // Render image
    const renderImage = () => {
        return (
            <div className="flex justify-center items-center bg-slate-900 rounded-lg p-4">
                <img
                    src={documentUrl}
                    alt={documentName || "Document image"}
                    style={{
                        transform: `scale(${scale}) rotate(${rotation}deg)`,
                        transformOrigin: 'center',
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        transition: 'transform 0.2s ease'
                    }}
                    className="rounded shadow-md"
                    onError={(e) => {
                        console.error('Image load error:', e);
                        setLoadFailed(true);
                        setErrorMessage('Failed to load image');
                    }}
                />
            </div>
        );
    };

    // Render MS Office Documents
    const renderOfficeDocument = () => {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-slate-800 rounded-lg border border-slate-700 text-center">
                <ExclamationTriangleIcon className="h-16 w-16 text-yellow-500 mb-4" />
                <h3 className="text-xl font-semibold text-slate-200 mb-2">
                    {fileType === FileTypes.WORD ? 'Word Document' :
                        fileType === FileTypes.EXCEL ? 'Excel Spreadsheet' :
                            'PowerPoint Presentation'}
                </h3>
                <p className="text-slate-400 mb-6">
                    This document format cannot be previewed directly in the browser.
                </p>
                <div className="flex space-x-4">
                    <a
                        href={documentUrl}
                        download={documentName}
                        className="px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition-colors flex items-center"
                    >
                        <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                        Download Document
                    </a>
                </div>
            </div>
        );
    };

    // Render document based on file type
    const renderDocument = () => {
        if (!documentUrl) {
            return (
                <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-700">
                    <DocumentTextIcon className="h-16 w-16 text-slate-400" />
                    <p className="text-slate-400 mt-2">No document selected</p>
                </div>
            );
        }

        switch (fileType) {
            case FileTypes.PDF:
                return renderPdfDocument();
            case FileTypes.IMAGE:
                return renderImage();
            case FileTypes.WORD:
            case FileTypes.EXCEL:
            case FileTypes.POWERPOINT:
                return renderOfficeDocument();
            default:
                return (
                    <div className="flex flex-col items-center justify-center h-64 bg-slate-800 rounded-lg border border-slate-700">
                        <p className="text-slate-400">
                            Document type is not supported for preview
                        </p>
                        <a
                            href={documentUrl}
                            download={documentName}
                            className="mt-4 px-4 py-2 bg-indigo-700 text-white rounded-md hover:bg-indigo-600 transition-colors"
                        >
                            Download Instead
                        </a>
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col card overflow-hidden">
            {/* Toolbar */}
            {renderToolbar()}

            {/* Document container */}
            <div className="overflow-auto p-4 bg-slate-800 min-h-[500px]">
                <div className="flex justify-center">
                    {renderDocument()}
                </div>
            </div>
        </div>
    );
} 