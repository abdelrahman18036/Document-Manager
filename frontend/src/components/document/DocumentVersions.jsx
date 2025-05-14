import { useState, useEffect } from 'react';
import {
    ArrowPathIcon,
    DocumentDuplicateIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CalendarIcon,
    UserIcon,
    TrashIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

export default function DocumentVersions({ documentId, currentVersion, versions, onVersionSelect, onUploadNewVersion }) {
    const [expanded, setExpanded] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [fileInput, setFileInput] = useState(null);

    useEffect(() => {
        // Set the component to expanded by default if we have versions
        if (versions && versions.length > 0) {
            setExpanded(true);
        }
    }, [versions]);

    const handleFileChange = async (e) => {
        if (!e.target.files || e.target.files.length === 0) return;

        const file = e.target.files[0];
        setUploading(true);

        try {
            await onUploadNewVersion(documentId, file);
            // Reset file input
            if (fileInput) fileInput.value = '';
        } catch (error) {
            console.error('Error uploading new version:', error);
        } finally {
            setUploading(false);
        }
    };

    // Format the file URL to display the filename only
    const formatFileUrl = (url) => {
        if (!url) return 'Unknown file';

        // For both relative and absolute URLs, get the filename
        const parts = url.split('/');
        return parts[parts.length - 1];
    };

    return (
        <div className="card overflow-hidden">
            <div
                className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-2">
                    <DocumentDuplicateIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="font-medium text-slate-200">Document Versions</h3>
                    {versions?.length > 0 && (
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">
                            {versions.length}
                        </span>
                    )}
                </div>
                <button className="text-slate-400 hover:text-slate-200">
                    {expanded ? (
                        <ChevronUpIcon className="h-5 w-5" />
                    ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                    )}
                </button>
            </div>

            {expanded && (
                <div className="bg-slate-800 p-3">
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-slate-400">Upload a new version of this document</p>

                            <label className="flex items-center px-3 py-1.5 bg-indigo-700 text-white rounded cursor-pointer hover:bg-indigo-600 transition-all">
                                <ArrowPathIcon className="h-4 w-4 mr-1" />
                                <span className="text-sm">{uploading ? 'Uploading...' : 'Upload New Version'}</span>
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                    ref={ref => setFileInput(ref)}
                                />
                            </label>
                        </div>
                        <p className="text-xs text-slate-500">Supported formats: PDF, DOCX, XLSX, JPG, PNG</p>
                    </div>

                    <div className="divide-y divide-slate-700">
                        {versions && versions.length > 0 ? (
                            versions.map((version) => (
                                <div
                                    key={version.id}
                                    className={`py-3 flex items-center justify-between ${version.id === currentVersion ? 'bg-slate-700/30' : ''}`}
                                >
                                    <div className="flex flex-col">
                                        <div className="flex items-center">
                                            <span className="text-sm font-medium text-slate-200">Version {version.version_number}</span>
                                            {version.id === currentVersion && (
                                                <span className="ml-2 text-xs bg-indigo-900/50 text-indigo-300 px-2 py-0.5 rounded-full">Current</span>
                                            )}
                                        </div>
                                        <div className="flex items-center text-xs text-slate-400 space-x-4 mt-1">
                                            <span className="flex items-center">
                                                <CalendarIcon className="h-3 w-3 mr-1" />
                                                {formatDistanceToNow(new Date(version.created_at), { addSuffix: true })}
                                            </span>
                                            {version.created_by && (
                                                <span className="flex items-center">
                                                    <UserIcon className="h-3 w-3 mr-1" />
                                                    {version.created_by}
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-xs text-slate-500 mt-1 truncate max-w-xs">
                                            {formatFileUrl(version.file_url || version.file)}
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        {version.id !== currentVersion ? (
                                            <button
                                                onClick={() => onVersionSelect(version.id)}
                                                className="p-1.5 bg-slate-700 rounded text-slate-300 hover:bg-slate-600"
                                                title="Switch to this version"
                                            >
                                                <CheckCircleIcon className="h-4 w-4" />
                                            </button>
                                        ) : null}
                                        <button
                                            className="p-1.5 bg-red-900/30 rounded text-red-400 hover:bg-red-900/50"
                                            title="Delete this version"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-slate-400">
                                <p>No previous versions available</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 