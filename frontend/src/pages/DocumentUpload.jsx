import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowUpTrayIcon,
    XMarkIcon,
    DocumentIcon,
    DocumentTextIcon,
    DocumentChartBarIcon,
    PhotoIcon,
    ArrowLeftIcon,
    CheckCircleIcon,
    ExclamationCircleIcon
} from '@heroicons/react/24/outline';

export default function DocumentUpload() {
    const navigate = useNavigate();
    const [title, setTitle] = useState('');
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadSuccess, setUploadSuccess] = useState(false);

    // Reset upload progress when file changes
    useEffect(() => {
        setUploadProgress(0);
        setUploadSuccess(false);
    }, [file]);

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (!selectedFile) return;

        // Check file size (max 10MB)
        if (selectedFile.size > 10 * 1024 * 1024) {
            setError('File size exceeds 10MB limit. Please choose a smaller file.');
            return;
        }

        setFile(selectedFile);
        setError(null);

        // Create preview for supported file types
        if (selectedFile.type === 'application/pdf') {
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreview(fileUrl);
        } else {
            setPreview(null);
        }

        // Auto-set title from filename if not already set
        if (!title) {
            const filename = selectedFile.name.split('.')[0];
            setTitle(filename.replace(/_/g, ' ').replace(/-/g, ' '));
        }
    };

    const handleDragEnter = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0];

            // Check file size (max 10MB)
            if (droppedFile.size > 10 * 1024 * 1024) {
                setError('File size exceeds 10MB limit. Please choose a smaller file.');
                return;
            }

            setFile(droppedFile);
            setError(null);

            // Create preview for supported file types
            if (droppedFile.type === 'application/pdf') {
                const fileUrl = URL.createObjectURL(droppedFile);
                setPreview(fileUrl);
            } else {
                setPreview(null);
            }

            // Auto-set title from filename if not already set
            if (!title) {
                const filename = droppedFile.name.split('.')[0];
                setTitle(filename.replace(/_/g, ' ').replace(/-/g, ' '));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!title || !file) {
            setError('Please provide a title and select a file to upload.');
            return;
        }

        setIsUploading(true);
        setError(null);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('name', title);
        formData.append('file', file);

        // Determine file type
        const extension = file.name.split('.').pop().toLowerCase();
        let fileType;

        if (extension === 'pdf') {
            fileType = 'pdf';
        } else if (['doc', 'docx'].includes(extension)) {
            fileType = 'word';
        } else if (['xls', 'xlsx'].includes(extension)) {
            fileType = 'excel';
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            fileType = 'image';
        } else {
            fileType = 'other';
        }

        formData.append('file_type', fileType);

        // Get token from localStorage
        const token = localStorage.getItem('token');

        try {
            const response = await axios.post('/api/documents/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Token ${token}`
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                    setUploadProgress(percentCompleted);
                }
            });

            // Show success state briefly
            setUploadSuccess(true);

            // After a short delay, navigate to the newly created document
            setTimeout(() => {
                navigate(`/documents/${response.data.id}`);
            }, 1500);

        } catch (err) {
            console.error('Error uploading document:', err);
            setError(err.response?.data?.detail || 'Failed to upload document. Please try again.');
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    const resetForm = () => {
        setTitle('');
        setFile(null);
        setPreview(null);
        setError(null);
        setUploadProgress(0);
        setUploadSuccess(false);

        // If there's a preview URL, revoke it to free up memory
        if (preview) {
            URL.revokeObjectURL(preview);
        }
    };

    const getFileTypeIcon = () => {
        if (!file) return null;

        const extension = file.name.split('.').pop().toLowerCase();

        // Return appropriate icon based on file type
        if (['pdf'].includes(extension)) {
            return <DocumentTextIcon className="h-20 w-20 text-red-400" />;
        } else if (['doc', 'docx'].includes(extension)) {
            return <DocumentTextIcon className="h-20 w-20 text-blue-400" />;
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return <DocumentChartBarIcon className="h-20 w-20 text-green-400" />;
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return <PhotoIcon className="h-20 w-20 text-purple-400" />;
        }

        // Default icon
        return <DocumentIcon className="h-20 w-20 text-indigo-400" />;
    };

    const getFileTypeBadge = (extension) => {
        const baseClasses = "text-xs font-medium px-2.5 py-1 rounded-full";

        if (['pdf'].includes(extension)) {
            return <span className={`${baseClasses} bg-red-900/30 text-red-300 border border-red-700/50`}>PDF</span>;
        } else if (['doc', 'docx'].includes(extension)) {
            return <span className={`${baseClasses} bg-blue-900/30 text-blue-300 border border-blue-700/50`}>Word</span>;
        } else if (['xls', 'xlsx', 'csv'].includes(extension)) {
            return <span className={`${baseClasses} bg-green-900/30 text-green-300 border border-green-700/50`}>Excel</span>;
        } else if (['jpg', 'jpeg', 'png', 'gif'].includes(extension)) {
            return <span className={`${baseClasses} bg-purple-900/30 text-purple-300 border border-purple-700/50`}>Image</span>;
        }

        return <span className={`${baseClasses} bg-gray-900/30 text-gray-300 border border-gray-700/50`}>File</span>;
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            {/* Breadcrumb & Navigation */}
            <nav className="flex items-center justify-between mb-8">
                <Link to="/" className="flex items-center text-slate-400 hover:text-white transition-colors group">
                    <span className="bg-slate-800/80 p-2 rounded-lg group-hover:bg-slate-700/80 transition-colors">
                        <ArrowLeftIcon className="h-5 w-5" />
                    </span>
                    <span className="ml-2">Back to Dashboard</span>
                </Link>

                <Link to="/documents" className="text-indigo-400 hover:text-indigo-300 transition-colors font-medium">
                    View All Documents
                </Link>
            </nav>

            {/* Main Content */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl shadow-xl p-8 border border-slate-700">
                {/* Header */}
                <div className="md:flex md:items-center md:justify-between mb-8 pb-6 border-b border-slate-700">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-3xl font-bold text-white sm:text-4xl mb-3 flex items-center">
                            <span className="bg-indigo-500/20 p-2 rounded-lg mr-3 border border-indigo-500/30">
                                <ArrowUpTrayIcon className="h-8 w-8 text-indigo-400" />
                            </span>
                            Upload Document
                        </h1>
                        <p className="text-lg text-slate-300">
                            Add a new document to your collection for viewing, annotation, and management.
                        </p>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-8 bg-red-900/30 border border-red-500 text-red-300 p-5 rounded-lg animate-fade-in">
                        <div className="flex items-center">
                            <ExclamationCircleIcon className="h-6 w-6 mr-3 text-red-400 flex-shrink-0" />
                            <p className="text-base">{error}</p>
                        </div>
                    </div>
                )}

                {/* Upload Success Message */}
                {uploadSuccess && (
                    <div className="mb-8 bg-green-900/30 border border-green-500 text-green-300 p-5 rounded-lg animate-fade-in">
                        <div className="flex items-center">
                            <CheckCircleIcon className="h-6 w-6 mr-3 text-green-400 flex-shrink-0" />
                            <div>
                                <p className="text-base font-medium">Upload successful!</p>
                                <p className="text-sm mt-1">Redirecting to document view...</p>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Title input */}
                    <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                        <label htmlFor="title" className="block text-base font-medium text-slate-300 mb-2">
                            Document Title
                        </label>
                        <input
                            type="text"
                            name="title"
                            id="title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-field w-full bg-slate-900/70 border-slate-600 focus:border-indigo-500 focus:ring-indigo-500/30"
                            placeholder="Enter document title"
                            required
                        />
                    </div>

                    {/* File upload area */}
                    <div
                        className={`relative border-2 border-dashed rounded-xl p-10 transition-all duration-300
                        ${isDragging ? 'border-indigo-400 bg-indigo-900/40 scale-[1.02]' : ''}
                        ${file ? 'border-indigo-500 bg-indigo-900/20' : 'border-slate-600 hover:border-slate-500'}`}
                        onDrop={handleDrop}
                        onDragOver={(e) => e.preventDefault()}
                        onDragEnter={handleDragEnter}
                        onDragLeave={handleDragLeave}
                    >
                        {file ? (
                            <div className="text-center py-4">
                                <div className="flex justify-center mb-6">
                                    {getFileTypeIcon()}
                                </div>
                                <p className="text-xl font-medium text-white mb-2">{file.name}</p>
                                <div className="flex items-center justify-center gap-3 mb-2">
                                    {getFileTypeBadge(file.name.split('.').pop().toLowerCase())}
                                    <span className="text-sm text-slate-400">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mb-6">
                                    Added {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                                </p>

                                <div className="mt-6 flex justify-center">
                                    <button
                                        type="button"
                                        onClick={resetForm}
                                        className="inline-flex items-center px-4 py-2 border border-red-500 rounded-lg shadow-md text-base font-medium text-red-400 bg-transparent hover:bg-red-900/30 transition-all duration-200"
                                    >
                                        <XMarkIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                        Remove File
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-10">
                                <div className="bg-indigo-900/20 mx-auto h-24 w-24 rounded-full flex items-center justify-center border border-indigo-700/30 mb-6">
                                    <ArrowUpTrayIcon className="h-14 w-14 text-indigo-400" />
                                </div>
                                <div className="mt-4">
                                    <p className="text-xl font-medium text-slate-300 mb-2">
                                        Drag and drop your file here
                                    </p>
                                    <p className="text-base text-slate-400 mb-6">
                                        or
                                    </p>
                                    <label
                                        htmlFor="file-upload"
                                        className="cursor-pointer rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 py-3 text-white font-medium transition-all duration-200 hover:shadow-lg inline-flex items-center"
                                    >
                                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                        <span>Browse Files</span>
                                        <input
                                            id="file-upload"
                                            name="file-upload"
                                            type="file"
                                            className="sr-only"
                                            onChange={handleFileChange}
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                                        />
                                    </label>
                                </div>
                                <div className="mt-8 flex justify-center flex-wrap gap-3">
                                    <span className="bg-red-900/20 text-red-300 border border-red-700/30 px-3 py-1.5 rounded-full text-sm">
                                        PDF
                                    </span>
                                    <span className="bg-blue-900/20 text-blue-300 border border-blue-700/30 px-3 py-1.5 rounded-full text-sm">
                                        Word
                                    </span>
                                    <span className="bg-green-900/20 text-green-300 border border-green-700/30 px-3 py-1.5 rounded-full text-sm">
                                        Excel
                                    </span>
                                    <span className="bg-purple-900/20 text-purple-300 border border-purple-700/30 px-3 py-1.5 rounded-full text-sm">
                                        Images
                                    </span>
                                </div>
                                <p className="text-sm text-slate-400 mt-6">
                                    Maximum file size: 10MB
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Upload Progress */}
                    {isUploading && (
                        <div className="mt-6 animate-fade-in">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-slate-300">Upload Progress</span>
                                <span className="text-sm font-medium text-slate-300">{uploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-2.5">
                                <div
                                    className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* File preview for PDF */}
                    {preview && (
                        <div className="mt-8 bg-slate-900 rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                            <div className="p-4 border-b border-slate-700 bg-slate-800/70 flex justify-between items-center">
                                <h3 className="text-lg font-medium text-white flex items-center">
                                    <DocumentTextIcon className="h-5 w-5 mr-2 text-red-400" />
                                    Document Preview
                                </h3>
                                <div className="text-sm text-slate-400">PDF Preview</div>
                            </div>
                            <div className="p-4 flex justify-center">
                                <embed
                                    src={preview}
                                    type="application/pdf"
                                    width="100%"
                                    height="500px"
                                    className="rounded-md"
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit button */}
                    <div className="flex justify-end mt-8 pt-6 border-t border-slate-700">
                        <Link
                            to="/documents"
                            className="btn-secondary mr-4"
                            disabled={isUploading}
                        >
                            Cancel
                        </Link>
                        <button
                            type="submit"
                            className={`btn-primary px-8 ${!file || isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                            disabled={isUploading || !file}
                        >
                            {isUploading ? (
                                <>
                                    <div className="animate-spin mr-3 h-5 w-5 border-2 border-white rounded-full border-t-transparent"></div>
                                    Uploading...
                                </>
                            ) : uploadSuccess ? (
                                <>
                                    <CheckCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                    Uploaded Successfully
                                </>
                            ) : (
                                <>
                                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                    Upload Document
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}