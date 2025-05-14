import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    DocumentTextIcon,
    DocumentIcon,
    ArrowUpTrayIcon,
    EyeIcon,
    ClockIcon,
    TagIcon
} from '@heroicons/react/24/outline';

export default function DocumentList({ searchQuery }) {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDocuments = async () => {
            try {
                const response = await axios.get('/api/documents/');
                setDocuments(response.data.results || response.data);
                setLoading(false);
            } catch (err) {
                setError('Failed to load documents. Please try again later.');
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    // Filter documents based on search query
    const filteredDocuments = searchQuery
        ? documents.filter(doc =>
            doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            doc.file_type.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : documents;

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-900/30 border border-red-600 text-red-300 p-4 rounded-lg">
                <p>{error}</p>
            </div>
        );
    }

    if (filteredDocuments.length === 0) {
        return (
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-lg p-12 text-center border border-slate-700 animate-fade-in max-w-2xl mx-auto">
                <div className="bg-slate-700/30 p-6 rounded-full w-28 h-28 mx-auto mb-4 flex items-center justify-center shadow-inner border border-slate-600/40">
                    <DocumentIcon className="h-16 w-16 text-indigo-400" />
                </div>
                <h2 className="mt-6 text-2xl font-bold text-white">No documents found</h2>
                <p className="mt-4 text-lg text-slate-300 max-w-md mx-auto">
                    {searchQuery
                        ? `No documents matching "${searchQuery}"`
                        : "Your document collection is empty. Get started by uploading your first document."
                    }
                </p>
                <div className="mt-8">
                    <Link
                        to="/upload"
                        className="btn-primary inline-flex items-center text-base px-8 py-3.5 shadow-md hover:shadow-xl transition-all duration-300"
                    >
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                        Upload Document
                    </Link>
                </div>
                <p className="mt-4 text-sm text-slate-400">
                    Supported formats: PDF, Word, Excel, Images
                </p>
            </div>
        );
    }

    // Document type to icon/color mapping
    const getDocTypeStyles = (fileType) => {
        const types = {
            pdf: {
                bg: 'bg-red-900/40',
                text: 'text-red-300',
                border: 'border-red-800'
            },
            word: {
                bg: 'bg-blue-900/40',
                text: 'text-blue-300',
                border: 'border-blue-800'
            },
            excel: {
                bg: 'bg-green-900/40',
                text: 'text-green-300',
                border: 'border-green-800'
            },
            default: {
                bg: 'bg-indigo-900/40',
                text: 'text-indigo-300',
                border: 'border-indigo-800'
            }
        };

        return types[fileType] || types.default;
    };

    return (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 animate-fade-in">
            {filteredDocuments.map((document) => {
                const typeStyles = getDocTypeStyles(document.file_type);
                const fileName = document.file ? document.file.split('/').pop() : (document.url ? document.url.split('/').pop() : 'Unknown file');

                return (
                    <Link
                        key={document.id}
                        to={`/documents/${document.id}`}
                        className="card card-hover group border border-slate-700 flex flex-col transition-all duration-200"
                    >
                        <div className="p-5 flex-grow">
                            <div className="flex items-start">
                                <div className={`flex-shrink-0 p-3 rounded-md ${typeStyles.bg} ${typeStyles.border} border`}>
                                    <DocumentTextIcon className={`h-6 w-6 ${typeStyles.text}`} />
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-medium text-white truncate group-hover:text-indigo-300 transition-colors duration-200">
                                        {document.name}
                                    </h3>

                                    <div className="mt-1 flex items-center">
                                        <ClockIcon className="h-4 w-4 text-slate-400 mr-1" />
                                        <p className="text-sm text-slate-400">
                                            {new Date(document.created_at).toLocaleDateString(undefined, {
                                                year: 'numeric',
                                                month: 'short',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>

                                    <div className="mt-1 text-xs text-slate-500 truncate max-w-xs">
                                        {fileName}
                                    </div>

                                    <div className="mt-3 flex items-center">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${typeStyles.bg} ${typeStyles.text}`}>
                                            {document.file_type.toUpperCase()}
                                        </span>

                                        {document.versions && document.versions.length > 0 && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                                v{document.versions.length}
                                            </span>
                                        )}

                                        {document.annotations && document.annotations.length > 0 && (
                                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/60 text-indigo-300">
                                                {document.annotations.length} {document.annotations.length === 1 ? 'note' : 'notes'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-700/50 px-5 py-3 rounded-b-xl flex justify-between items-center border-t border-slate-700">
                            <div className="text-xs text-slate-400 flex items-center">
                                <TagIcon className="h-4 w-4 mr-1" />
                                <span>
                                    {document.versions?.length
                                        ? `${document.versions.length} versions`
                                        : 'No versions'
                                    }
                                </span>
                            </div>

                            <span className="inline-flex items-center text-xs font-medium text-indigo-400 group-hover:text-indigo-300">
                                <EyeIcon className="h-4 w-4 mr-1" />
                                View Document
                            </span>
                        </div>
                    </Link>
                );
            })}
        </div>
    );
} 