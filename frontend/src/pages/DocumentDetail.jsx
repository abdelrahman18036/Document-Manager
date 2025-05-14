import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentIcon } from '@heroicons/react/24/outline';

// Import our components
import UniversalDocumentViewer from '../components/document/UniversalDocumentViewer';
import DocumentVersions from '../components/document/DocumentVersions';
import DocumentAnnotations from '../components/document/DocumentAnnotations';
import DocumentSearch from '../components/document/DocumentSearch';

// Import API functions
import { getDocument, searchDocument, addAnnotation, deleteAnnotation, getAnnotations, createDocumentVersion, getDocumentVersions } from '../api/documents';
import { useAuth } from '../context/AuthContext';

export default function DocumentDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const token = localStorage.getItem('token');

    const [document, setDocument] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [annotations, setAnnotations] = useState([]);
    const [versions, setVersions] = useState([]);
    const [searchHighlights, setSearchHighlights] = useState([]);
    const [currentVersionId, setCurrentVersionId] = useState(null);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch document details
                const documentData = await getDocument(id, token);
                setDocument(documentData);
                setCurrentVersionId(documentData.current_version_id);

                // Fetch annotations
                const annotationsData = await getAnnotations(id, token);
                setAnnotations(annotationsData);

                // Fetch versions
                const versionsData = await getDocumentVersions(id, token);
                console.log("Versions data:", versionsData);
                setVersions(Array.isArray(versionsData) ? versionsData : []);

            } catch (err) {
                setError(err.message || 'Failed to load document');
                console.error('Error fetching document:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [id, token]);

    // Handle page change
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
    };

    // Handle document search
    const handleSearch = async (documentId, query) => {
        try {
            const results = await searchDocument(documentId, query, token);

            // Convert search results to highlight format
            const highlights = results.matches.map(match => ({
                page: match.page,
                text: match.text
            }));

            setSearchHighlights(highlights);
            return results;
        } catch (error) {
            console.error('Search error:', error);
            return { matches: [] };
        }
    };

    // Handle annotation operations
    const handleAddAnnotation = async (annotation) => {
        try {
            const newAnnotation = await addAnnotation(
                id,
                annotation.content,
                annotation.type,
                annotation.page,
                token
            );

            setAnnotations(prev => [...prev, newAnnotation]);
            return newAnnotation;
        } catch (error) {
            console.error('Error adding annotation:', error);
            throw error;
        }
    };

    const handleDeleteAnnotation = async (annotationId) => {
        try {
            await deleteAnnotation(id, annotationId, token);
            setAnnotations(prev => prev.filter(a => a.id !== annotationId));
        } catch (error) {
            console.error('Error deleting annotation:', error);
        }
    };

    // Handle version operations
    const handleUploadNewVersion = async (documentId, file) => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const newVersion = await createDocumentVersion(documentId, formData, token);

            // Update versions list and set current version
            setVersions(prev => [...prev, newVersion]);
            setCurrentVersionId(newVersion.id);

            // Update document with new version info
            setDocument(prev => ({
                ...prev,
                current_version_id: newVersion.id,
                url: newVersion.file_url
            }));

            return newVersion;
        } catch (error) {
            console.error('Error uploading new version:', error);
            throw error;
        }
    };

    const handleVersionSelect = (versionId) => {
        // Find the selected version
        const selectedVersion = versions.find(v => v.id === versionId);
        if (!selectedVersion) return;

        // Update current version
        setCurrentVersionId(versionId);

        // Update document with selected version info
        setDocument(prev => ({
            ...prev,
            current_version_id: versionId,
            url: selectedVersion.file_url
        }));
    };

    // Handle search result navigation
    const handleNavigateToMatch = (match) => {
        // Navigate to the page containing the search match
        setCurrentPage(match.page);
    };

    const goBack = () => {
        navigate(-1);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error || !document) {
        return (
            <div className="p-6 bg-red-900/20 rounded-lg border border-red-700 text-center">
                <h2 className="text-xl font-semibold text-red-300 mb-4">Error Loading Document</h2>
                <p className="text-red-200 mb-6">{error || 'Document not found'}</p>
                <button
                    onClick={goBack}
                    className="px-4 py-2 bg-slate-700 text-white rounded-md hover:bg-slate-600"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-6">
            {/* Header */}
            <div className="flex flex-col space-y-2 mb-6">
                <div className="flex items-center">
                    <button
                        onClick={goBack}
                        className="mr-4 p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"
                    >
                        <ArrowLeftIcon className="h-5 w-5 text-slate-200" />
                    </button>
                    <h1 className="text-2xl font-semibold text-slate-200 flex items-center">
                        <DocumentIcon className="h-6 w-6 mr-2 text-indigo-400" />
                        {document.name}
                    </h1>
                </div>

                <div className="flex items-center ml-12 text-sm text-slate-400">
                    <span className="mr-3 px-2 py-1 bg-slate-800 rounded-md">
                        {document.file_type.toUpperCase()}
                    </span>
                    <span>
                        {versions && versions.length > 0 ? (
                            <span>Version {document.current_version_id ?
                                (versions.find(v => v.id === document.current_version_id)?.version_number || '1') : '1'}</span>
                        ) : (
                            <span>Original version</span>
                        )}
                    </span>
                    <span className="mx-2">•</span>
                    <span>Uploaded {new Date(document.created_at).toLocaleDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main document viewer */}
                <div className="lg:col-span-2 space-y-6">
                    <UniversalDocumentViewer
                        documentUrl={document.url.startsWith('http') ? document.url : `http://localhost:8000${document.url}`}
                        documentType={document.file_type}
                        documentName={document.name}
                        currentPage={currentPage}
                        onPageChange={handlePageChange}
                        searchHighlights={searchHighlights}
                    />
                </div>

                {/* Sidebar with document tools */}
                <div className="space-y-6">
                    <DocumentSearch
                        documentId={id}
                        onSearch={handleSearch}
                        onNavigateToMatch={handleNavigateToMatch}
                    />

                    <DocumentAnnotations
                        documentId={id}
                        currentPage={currentPage}
                        annotations={annotations}
                        onAddAnnotation={handleAddAnnotation}
                        onDeleteAnnotation={handleDeleteAnnotation}
                    />

                    <DocumentVersions
                        documentId={id}
                        currentVersion={currentVersionId}
                        versions={versions}
                        onVersionSelect={handleVersionSelect}
                        onUploadNewVersion={handleUploadNewVersion}
                    />
                </div>
            </div>
        </div>
    );
} 