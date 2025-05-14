import { useState, useEffect } from 'react';
import {
    MagnifyingGlassIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronRightIcon,
    ChevronLeftIcon
} from '@heroicons/react/24/outline';
import { highlightPdfSearchResults } from '../../utils/pdf-helpers';

export default function DocumentSearch({ documentId, onSearch, onNavigateToMatch }) {
    const [expanded, setExpanded] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState(null);
    const [currentMatch, setCurrentMatch] = useState(0);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setError(null);
        try {
            const results = await onSearch(documentId, searchQuery);
            setSearchResults(results);

            // Reset current match and navigate to first match if available
            if (results && results.matches && results.matches.length > 0) {
                setCurrentMatch(0);
                onNavigateToMatch(results.matches[0]);
            }
        } catch (error) {
            console.error('Error searching document:', error);
            setError('Failed to search document. Please try again.');
        } finally {
            setIsSearching(false);
        }
    };

    const navigateToMatch = (direction) => {
        if (!searchResults || !searchResults.matches || searchResults.matches.length === 0) {
            return;
        }

        let newMatch;
        if (direction === 'next') {
            newMatch = (currentMatch + 1) % searchResults.matches.length;
        } else {
            newMatch = (currentMatch - 1 + searchResults.matches.length) % searchResults.matches.length;
        }

        setCurrentMatch(newMatch);
        onNavigateToMatch(searchResults.matches[newMatch]);

        // Also highlight in the PDF directly
        highlightPdfSearchResults(searchQuery, searchResults.matches[newMatch].page);
    };

    // Highlight search term in preview text
    const highlightSearchTerm = (text, term) => {
        if (!term || !text) return text;

        try {
            const regex = new RegExp(`(${term})`, 'gi');
            const parts = text.split(regex);

            return (
                <>
                    {parts.map((part, index) => {
                        // Check if this part matches the search term (case insensitive)
                        const isMatch = part.toLowerCase() === term.toLowerCase();
                        return isMatch ? (
                            <span key={index} className="text-highlight bg-yellow-300 text-black px-0.5 font-medium rounded-sm">
                                {part}
                            </span>
                        ) : part;
                    })}
                </>
            );
        } catch (e) {
            console.error("Regex error:", e);
            return text;
        }
    };

    return (
        <div className="card overflow-hidden">
            <div
                className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-2">
                    <MagnifyingGlassIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="font-medium text-slate-200">Search Document</h3>
                    {searchResults?.matches?.length > 0 && (
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">
                            {searchResults.matches.length} matches
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
                    {/* Search Input */}
                    <div className="flex mb-4">
                        <input
                            type="text"
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-l px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="Search in document..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleSearch();
                            }}
                        />
                        <button
                            className={`${isSearching ? 'bg-indigo-800' : 'bg-indigo-700 hover:bg-indigo-600'
                                } text-white rounded-r px-3 py-2 flex items-center`}
                            onClick={handleSearch}
                            disabled={isSearching || !searchQuery.trim()}
                        >
                            <MagnifyingGlassIcon className="h-4 w-4" />
                            <span className="ml-1">{isSearching ? 'Searching...' : 'Search'}</span>
                        </button>
                    </div>

                    {/* Error message */}
                    {error && (
                        <div className="p-3 mb-3 bg-red-900/30 border border-red-600 text-red-300 rounded-md">
                            <p className="text-sm">{error}</p>
                            {searchResults?.error && (
                                <p className="text-xs mt-1">{searchResults.error}</p>
                            )}
                        </div>
                    )}

                    {/* Search Results */}
                    {searchResults && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-sm text-slate-400">
                                    {searchResults.matches?.length > 0
                                        ? `Found ${searchResults.matches.length} matches for "${searchQuery}"`
                                        : `No matches found for "${searchQuery}"`}
                                </p>

                                {searchResults.matches?.length > 0 && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => navigateToMatch('prev')}
                                            className="p-1 bg-slate-700 rounded hover:bg-slate-600 text-slate-300"
                                            title="Previous match"
                                        >
                                            <ChevronLeftIcon className="h-4 w-4" />
                                        </button>

                                        <span className="text-xs text-slate-300">
                                            {currentMatch + 1} of {searchResults.matches.length}
                                        </span>

                                        <button
                                            onClick={() => navigateToMatch('next')}
                                            className="p-1 bg-slate-700 rounded hover:bg-slate-600 text-slate-300"
                                            title="Next match"
                                        >
                                            <ChevronRightIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {searchResults.matches?.length > 0 && (
                                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
                                    {searchResults.matches.map((match, index) => (
                                        <div
                                            key={index}
                                            className={`p-2 rounded text-sm cursor-pointer ${index === currentMatch
                                                ? 'bg-indigo-900/30 border border-indigo-700/50'
                                                : 'bg-slate-700 hover:bg-slate-600 border border-slate-600'
                                                }`}
                                            onClick={() => {
                                                setCurrentMatch(index);
                                                onNavigateToMatch(match);
                                            }}
                                        >
                                            <div className="flex items-center space-x-2 mb-1">
                                                <span className="text-xs bg-slate-600 px-2 py-0.5 rounded-full text-slate-300">
                                                    Page {match.page}
                                                </span>
                                            </div>
                                            <p className="text-slate-300">
                                                {highlightSearchTerm(match.preview, searchQuery)}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
} 