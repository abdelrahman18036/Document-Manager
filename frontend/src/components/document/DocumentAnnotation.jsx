import { useState } from 'react';
import axios from 'axios';
import { XMarkIcon, PencilIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';

export default function DocumentAnnotation({ documentId, pageNumber, onAnnotationAdded }) {
    const [isOpen, setIsOpen] = useState(false);
    const [annotationType, setAnnotationType] = useState('comment');
    const [content, setContent] = useState('');
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleOpenAnnotation = (event) => {
        // Get position relative to the document viewer container
        const rect = event.currentTarget.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        setPosition({ x, y });
        setIsOpen(true);
    };

    const handleCloseAnnotation = () => {
        setIsOpen(false);
        setContent('');
    };

    const handleSubmitAnnotation = async () => {
        if (!content) return;

        setIsSubmitting(true);

        try {
            const response = await axios.post('/api/annotations/', {
                document: documentId,
                annotation_type: annotationType,
                content,
                page_number: pageNumber,
                position_x: position.x,
                position_y: position.y
            });

            if (onAnnotationAdded) {
                onAnnotationAdded(response.data);
            }

            handleCloseAnnotation();
        } catch (error) {
            console.error('Error creating annotation:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Annotation type options
    const annotationTypes = [
        { id: 'comment', name: 'Comment', icon: ChatBubbleLeftIcon },
        { id: 'highlight', name: 'Highlight', icon: PencilIcon },
    ];

    if (!isOpen) {
        return null;
    }

    return (
        <div
            className="absolute z-10 bg-gray-800 rounded-lg shadow-lg p-4 border border-gray-700"
            style={{
                left: `${position.x}px`,
                top: `${position.y}px`,
                width: '300px',
            }}
        >
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Add Annotation</h3>
                <button
                    onClick={handleCloseAnnotation}
                    className="text-gray-400 hover:text-white"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Annotation Type
                </label>
                <div className="flex space-x-2">
                    {annotationTypes.map((type) => (
                        <button
                            key={type.id}
                            onClick={() => setAnnotationType(type.id)}
                            className={`flex items-center px-3 py-2 rounded-md ${annotationType === type.id
                                    ? 'bg-indigo-700 text-white'
                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <type.icon className="h-4 w-4 mr-2" />
                            {type.name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="annotation-content" className="block text-sm font-medium text-gray-300 mb-2">
                    Content
                </label>
                <textarea
                    id="annotation-content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    rows={4}
                    className="input-field w-full"
                    placeholder="Add your annotation here..."
                />
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleCloseAnnotation}
                    className="btn-secondary mr-2"
                    disabled={isSubmitting}
                >
                    Cancel
                </button>
                <button
                    onClick={handleSubmitAnnotation}
                    className="btn-primary"
                    disabled={!content || isSubmitting}
                >
                    {isSubmitting ? 'Saving...' : 'Save Annotation'}
                </button>
            </div>
        </div>
    );
} 