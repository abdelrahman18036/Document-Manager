import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
    ArrowUpTrayIcon,
    DocumentTextIcon,
    PresentationChartLineIcon,
    ClockIcon,
    FolderIcon,
    TagIcon,
    UserGroupIcon,
    ChartBarIcon,
    CalendarIcon,
    ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const [stats, setStats] = useState({
        totalDocuments: 0,
        recentDocuments: [],
        totalAnnotations: 0,
        totalVersions: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { currentUser } = useAuth();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Ensure token is set for the request
                const token = localStorage.getItem('token');
                if (!token) {
                    console.error('No authentication token found');
                    setError('Authentication token not found. Please log in again.');
                    setLoading(false);
                    return;
                }

                console.log('Dashboard: Using token for request:', token.substring(0, 10) + '...');

                // Set authorization header
                const config = {
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    }
                };

                // In a real app, you'd have a dedicated endpoint for dashboard stats
                console.log('Fetching documents from API...');
                const documentsResponse = await axios.get('/api/documents/', config);
                console.log('Documents API response:', documentsResponse.status);

                const documents = documentsResponse.data.results || documentsResponse.data;
                console.log('Received documents:', documents.length);

                // Calculate total annotations and versions
                let annotations = 0;
                let versions = 0;

                documents.forEach(doc => {
                    annotations += doc.annotations?.length || 0;
                    versions += doc.versions?.length || 0;
                });

                setStats({
                    totalDocuments: documents.length,
                    recentDocuments: documents.slice(0, 5), // Get 5 most recent documents
                    totalAnnotations: annotations,
                    totalVersions: versions
                });

                setLoading(false);
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError(`Failed to load dashboard data: ${err.response?.data?.detail || err.message}`);
                setLoading(false);

                // If unauthorized, we need to clear token and redirect to login
                if (err.response?.status === 401 || err.response?.status === 403) {
                    console.log('Authentication error detected, clearing tokens');
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    // Redirect will be handled by the ProtectedRoute component
                }
            }
        };

        if (currentUser) {
            fetchDashboardData();
        } else {
            console.log('No current user, waiting for authentication');
            setLoading(false);
            setError('Please log in to view your dashboard');
        }
    }, [currentUser]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 bg-slate-800 rounded-lg border border-slate-700 my-8 mx-auto max-w-2xl">
                <div className="text-center text-red-400 mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <h3 className="text-xl font-medium mt-2">Error Loading Dashboard</h3>
                </div>
                <p className="text-slate-300 mb-6">{error}</p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="px-4 py-2 bg-slate-700 text-slate-200 rounded hover:bg-slate-600"
                    >
                        Retry
                    </button>
                    <Link
                        to="/login"
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Log In Again
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Welcome Header Section */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-xl">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="min-w-0 flex-1">
                        <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl mb-3 flex items-center">
                            <span className="bg-indigo-500/20 p-2 rounded-lg mr-3 border border-indigo-500/30">
                                <DocumentTextIcon className="h-8 w-8 text-indigo-400" />
                            </span>
                            Welcome to DocManager
                        </h1>
                        <div className="max-w-3xl">
                            <p className="text-lg text-slate-300 mb-4 leading-relaxed">
                                Manage, view, and annotate your documents in one centralized platform.
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-4">
                                <div className="flex items-center text-emerald-400">
                                    <div className="w-2 h-2 rounded-full bg-emerald-400 mr-2"></div>
                                    <span className="text-sm">Document Management</span>
                                </div>
                                <div className="flex items-center text-blue-400">
                                    <div className="w-2 h-2 rounded-full bg-blue-400 mr-2"></div>
                                    <span className="text-sm">Annotation Tools</span>
                                </div>
                                <div className="flex items-center text-purple-400">
                                    <div className="w-2 h-2 rounded-full bg-purple-400 mr-2"></div>
                                    <span className="text-sm">Version Control</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-6 flex-shrink-0 md:mt-0">
                        <Link
                            to="/upload"
                            className="btn-primary inline-flex items-center px-6 py-3 text-base font-medium shadow-lg hover:shadow-indigo-500/20 transition-all duration-300"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                            Upload Document
                        </Link>
                    </div>
                </div>
            </div>

            {/* Dashboard Overview Section */}
            <div>
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-400" />
                    Dashboard Overview
                </h2>

                {/* Stats grid */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Document count stat */}
                    <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-4 rounded-lg bg-indigo-900/50 border border-indigo-800">
                                    <DocumentTextIcon className="h-8 w-8 text-indigo-300" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-base font-medium text-slate-400 truncate">Total Documents</dt>
                                        <dd className="flex items-baseline mt-2">
                                            <div className="text-3xl font-bold text-white">{stats.totalDocuments}</div>
                                            <span className="ml-2 text-sm font-medium text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">Files</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/70 px-6 py-4 border-t border-slate-700">
                            <div className="text-sm">
                                <Link to="/documents" className="font-medium text-indigo-400 hover:text-indigo-300 flex items-center">
                                    View all documents
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Annotations stat */}
                    <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-4 rounded-lg bg-blue-900/50 border border-blue-800">
                                    <TagIcon className="h-8 w-8 text-blue-300" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-base font-medium text-slate-400 truncate">Total Annotations</dt>
                                        <dd className="flex items-baseline mt-2">
                                            <div className="text-3xl font-bold text-white">{stats.totalAnnotations}</div>
                                            <span className="ml-2 text-sm font-medium text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">Notes</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/70 px-6 py-4 border-t border-slate-700">
                            <div className="text-sm">
                                <Link to="/documents" className="font-medium text-blue-400 hover:text-blue-300 flex items-center">
                                    See document annotations
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Versions stat */}
                    <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-4 rounded-lg bg-purple-900/50 border border-purple-800">
                                    <FolderIcon className="h-8 w-8 text-purple-300" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-base font-medium text-slate-400 truncate">Document Versions</dt>
                                        <dd className="flex items-baseline mt-2">
                                            <div className="text-3xl font-bold text-white">{stats.totalVersions}</div>
                                            <span className="ml-2 text-sm font-medium text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded">Versions</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/70 px-6 py-4 border-t border-slate-700">
                            <div className="text-sm">
                                <a href="#manage" className="font-medium text-purple-400 hover:text-purple-300 flex items-center">
                                    Manage versions
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* User activity stat */}
                    <div className="card bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:translate-y-[-4px]">
                        <div className="p-6">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 p-4 rounded-lg bg-emerald-900/50 border border-emerald-800">
                                    <UserGroupIcon className="h-8 w-8 text-emerald-300" aria-hidden="true" />
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-base font-medium text-slate-400 truncate">Active Users</dt>
                                        <dd className="flex items-baseline mt-2">
                                            <div className="text-3xl font-bold text-white">1</div>
                                            <span className="ml-2 text-sm font-medium text-emerald-400 bg-emerald-900/30 px-2 py-0.5 rounded">Online</span>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-800/70 px-6 py-4 border-t border-slate-700">
                            <div className="text-sm">
                                <a href="#users" className="font-medium text-emerald-400 hover:text-emerald-300 flex items-center">
                                    View user activity
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Dashboard Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left column - Recent activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Recent documents section */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <ClockIcon className="h-5 w-5 mr-2 text-indigo-400" />
                            Recent Documents
                        </h2>

                        <div className="card rounded-xl overflow-hidden border border-slate-700 shadow-lg">
                            <div className="px-6 py-5 border-b border-slate-700 flex items-center justify-between bg-slate-800/70">
                                <h3 className="text-lg font-medium text-white flex items-center">
                                    <CalendarIcon className="h-5 w-5 mr-2 text-slate-400" />
                                    Latest Uploads
                                </h3>
                                <Link to="/documents" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center">
                                    View all
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            </div>

                            <div className="overflow-hidden bg-slate-900">
                                <ul className="divide-y divide-slate-700/70">
                                    {stats.recentDocuments.length > 0 ? (
                                        stats.recentDocuments.map((doc) => (
                                            <li key={doc.id} className="hover:bg-slate-800/50 transition-colors duration-150 ease-in-out">
                                                <div className="px-6 py-4">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="flex-shrink-0">
                                                            <div className="p-2 bg-slate-800 rounded-lg border border-slate-700">
                                                                <DocumentTextIcon className="h-8 w-8 text-indigo-400" />
                                                            </div>
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="truncate text-base font-medium text-white">{doc.title}</p>
                                                                <div className="ml-2 flex-shrink-0">
                                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-700 text-slate-300">
                                                                        {doc.file_type.toUpperCase()}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="mt-2 sm:flex sm:justify-between">
                                                                <div className="flex items-center text-sm text-slate-400">
                                                                    <ClockIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                                                                    <p>
                                                                        {new Date(doc.created_at).toLocaleDateString(undefined, {
                                                                            year: 'numeric',
                                                                            month: 'short',
                                                                            day: 'numeric'
                                                                        })}
                                                                    </p>
                                                                </div>
                                                                <div className="mt-2 flex items-center text-sm text-slate-400 sm:mt-0">
                                                                    <span className="flex items-center">
                                                                        {doc.annotations?.length ? (
                                                                            <>
                                                                                <TagIcon className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                                                                                <p>{doc.annotations.length} annotations</p>
                                                                            </>
                                                                        ) : null}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <Link
                                                                to={`/documents/${doc.id}`}
                                                                className="btn-outline inline-flex items-center text-sm px-4 py-2"
                                                            >
                                                                View
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))
                                    ) : (
                                        <div className="text-center py-12 px-4">
                                            <div className="bg-slate-800/50 mx-auto h-20 w-20 rounded-full flex items-center justify-center border border-slate-700 mb-4">
                                                <PresentationChartLineIcon className="h-10 w-10 text-slate-400" />
                                            </div>
                                            <h3 className="mt-2 text-lg font-medium text-slate-300">No documents yet</h3>
                                            <p className="mt-1 text-sm text-slate-400 max-w-md mx-auto">
                                                Get started by uploading your first document.
                                            </p>
                                            <div className="mt-6">
                                                <Link to="/upload" className="btn-primary inline-flex items-center px-4 py-2 text-sm">
                                                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                                                    Upload Document
                                                </Link>
                                            </div>
                                        </div>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right column - Activity & Status */}
                <div className="space-y-6">
                    {/* Quick Actions Card */}
                    <div>
                        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                            <ArrowTrendingUpIcon className="h-5 w-5 mr-2 text-indigo-400" />
                            Quick Actions
                        </h2>

                        <div className="card border border-slate-700 rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                            <div className="grid grid-cols-2 gap-4">
                                <Link to="/upload" className="flex flex-col items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors">
                                    <ArrowUpTrayIcon className="h-8 w-8 text-indigo-400 mb-2" />
                                    <span className="text-sm text-slate-300 text-center">Upload Document</span>
                                </Link>
                                <Link to="/documents" className="flex flex-col items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors">
                                    <DocumentTextIcon className="h-8 w-8 text-indigo-400 mb-2" />
                                    <span className="text-sm text-slate-300 text-center">Browse Documents</span>
                                </Link>
                                <a href="#recent" className="flex flex-col items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors">
                                    <TagIcon className="h-8 w-8 text-blue-400 mb-2" />
                                    <span className="text-sm text-slate-300 text-center">View Annotations</span>
                                </a>
                                <a href="#settings" className="flex flex-col items-center p-4 bg-slate-800/80 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors">
                                    <UserGroupIcon className="h-8 w-8 text-emerald-400 mb-2" />
                                    <span className="text-sm text-slate-300 text-center">User Settings</span>
                                </a>
                            </div>
                        </div>
                    </div>

                    {/* System Status Card */}
                    <div className="card border border-slate-700 rounded-xl p-6 bg-gradient-to-br from-slate-800 to-slate-900">
                        <h3 className="text-lg font-medium text-white mb-4">System Status</h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-400">Storage</span>
                                    <span className="text-sm text-slate-400">25%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm text-slate-400">Processing Power</span>
                                    <span className="text-sm text-slate-400">65%</span>
                                </div>
                                <div className="w-full bg-slate-700 rounded-full h-2">
                                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
                                </div>
                            </div>
                            <div className="pt-4 mt-4 border-t border-slate-700">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-slate-400">Last update</span>
                                    <span className="text-slate-300">{new Date().toLocaleTimeString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}