import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpTrayIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import DocumentList from '../components/document/DocumentList';

export default function DocumentsList() {
    const [searchQuery, setSearchQuery] = useState('');

    return (
        <div className="space-y-6">
            <div className="md:flex md:items-center md:justify-between">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-white sm:truncate sm:text-3xl sm:tracking-tight">
                        Documents
                    </h2>
                </div>
                <div className="mt-4 flex md:ml-4 md:mt-0">
                    <Link to="/upload" className="btn-primary inline-flex items-center">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                        Upload Document
                    </Link>
                </div>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative mt-1 rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    </div>
                    <input
                        type="text"
                        name="search"
                        id="search"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-field w-full pl-10"
                        placeholder="Search documents..."
                    />
                </div>
            </div>

            {/* Document list component */}
            <DocumentList searchQuery={searchQuery} />
        </div>
    );
} 