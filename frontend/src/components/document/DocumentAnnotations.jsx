import { useState, useEffect } from 'react';
import {
    ChatBubbleLeftIcon,
    PencilIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    TrashIcon,
    UserIcon,
    CalendarIcon,
    PaperAirplaneIcon
} from '@heroicons/react/24/outline';
import { formatDistanceToNow } from 'date-fns';

const AnnotationTypes = {
    HIGHLIGHT: 'highlight',
    COMMENT: 'comment',
    DRAWING: 'drawing'
};

export default function DocumentAnnotations({ documentId, currentPage, annotations, onAddAnnotation, onDeleteAnnotation }) {
    const [expanded, setExpanded] = useState(true);
    const [newAnnotation, setNewAnnotation] = useState('');
    const [annotationType, setAnnotationType] = useState(AnnotationTypes.COMMENT);
    const [isAddingAnnotation, setIsAddingAnnotation] = useState(false);

    // Filter annotations for current page
    const currentPageAnnotations = annotations?.filter(
        ann => ann.page === currentPage || !ann.page
    ) || [];

    const handleAddAnnotation = async () => {
        if (!newAnnotation.trim()) return;

        setIsAddingAnnotation(true);
        try {
            await onAddAnnotation({
                documentId,
                page: currentPage,
                content: newAnnotation,
                type: annotationType,
            });
            setNewAnnotation('');
        } catch (error) {
            console.error('Error adding annotation:', error);
        } finally {
            setIsAddingAnnotation(false);
        }
    };

    return (
        <div className="card overflow-hidden">
            <div
                className="flex items-center justify-between p-3 bg-slate-800 border-b border-slate-700 cursor-pointer"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex items-center space-x-2">
                    <ChatBubbleLeftIcon className="h-5 w-5 text-slate-400" />
                    <h3 className="font-medium text-slate-200">Annotations</h3>
                    {currentPageAnnotations.length > 0 && (
                        <span className="bg-slate-700 text-xs px-2 py-1 rounded-full text-slate-300">
                            {currentPageAnnotations.length}
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
                    {/* Annotation Type Selector */}
                    <div className="flex space-x-2 mb-3">
                        <button
                            className={`px-3 py-1.5 rounded text-sm ${annotationType === AnnotationTypes.COMMENT
                                ? 'bg-indigo-700 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            onClick={() => setAnnotationType(AnnotationTypes.COMMENT)}
                        >
                            <ChatBubbleLeftIcon className="h-4 w-4 inline mr-1" />
                            Comment
                        </button>
                        <button
                            className={`px-3 py-1.5 rounded text-sm ${annotationType === AnnotationTypes.HIGHLIGHT
                                ? 'bg-indigo-700 text-white'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                }`}
                            onClick={() => setAnnotationType(AnnotationTypes.HIGHLIGHT)}
                        >
                            <PencilIcon className="h-4 w-4 inline mr-1" />
                            Highlight
                        </button>
                    </div>

                    {/* Add Annotation Input */}
                    <div className="flex mb-4">
                        <input
                            type="text"
                            className="flex-1 bg-slate-700 border border-slate-600 rounded-l px-3 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder={`Add a ${annotationType}...`}
                            value={newAnnotation}
                            onChange={(e) => setNewAnnotation(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddAnnotation();
                            }}
                        />
                        <button
                            className="bg-indigo-700 hover:bg-indigo-600 text-white rounded-r px-3 py-2 flex items-center"
                            onClick={handleAddAnnotation}
                            disabled={isAddingAnnotation || !newAnnotation.trim()}
                        >
                            <PaperAirplaneIcon className="h-4 w-4" />
                            <span className="sr-only">Add</span>
                        </button>
                    </div>

                    {/* Current Page Label */}
                    <div className="mb-3">
                        <p className="text-xs text-slate-400">
                            Showing annotations for page {currentPage}
                        </p>
                    </div>

                    {/* Annotations List */}
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                        {currentPageAnnotations.length > 0 ? (
                            currentPageAnnotations.map((annotation) => (
                                <div
                                    key={annotation.id}
                                    className={`p-3 rounded ${annotation.type === AnnotationTypes.HIGHLIGHT
                                        ? 'bg-yellow-900/20 border border-yellow-900/30'
                                        : 'bg-slate-700/70 border border-slate-600'
                                        }`}
                                >
                                    <div className="flex justify-between">
                                        <div className="flex items-center space-x-2 mb-1">
                                            <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300 capitalize">
                                                {annotation.type}
                                            </span>
                                            {annotation.page && (
                                                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded-full text-slate-300">
                                                    Page {annotation.page}
                                                </span>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => onDeleteAnnotation(annotation.id)}
                                            className="text-slate-400 hover:text-red-400"
                                        >
                                            <TrashIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm text-slate-200 mb-2">{annotation.content}</p>
                                    <div className="flex items-center justify-between text-xs text-slate-400">
                                        <div className="flex items-center space-x-3">
                                            {annotation.created_by && (
                                                <span className="flex items-center">
                                                    <UserIcon className="h-3 w-3 mr-1" />
                                                    {annotation.created_by}
                                                </span>
                                            )}
                                            {annotation.created_at && (
                                                <span className="flex items-center">
                                                    <CalendarIcon className="h-3 w-3 mr-1" />
                                                    {formatDistanceToNow(new Date(annotation.created_at), { addSuffix: true })}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="py-4 text-center text-slate-400">
                                <p>No annotations for this page</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
} 