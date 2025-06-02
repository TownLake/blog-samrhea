// src/components/data/SupplementsPage.jsx
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Pill } from 'lucide-react';
import { fetchAndParseSupplements } from '../../services/contentService';
import DataIntroCard from './DataIntroCard';
import Card from '../Card';
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';

// A small helper component to safely render markdown content (like **bold** text) within a line.
const MarkdownLine = ({ content }) => {
    // Use marked's inline parser for single lines to avoid wrapping with <p> tags
    const html = marked.parseInline(content || '', { gfm: true, breaks: true });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const SupplementsPage = () => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSupplements = async () => {
            try {
                setLoading(true);
                const data = await fetchAndParseSupplements();
                setSections(data);
            } catch (err) {
                setError('Failed to load supplement schedule. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSupplements();
    }, []);

    return (
        <div className="py-2">
            {/* The intro card, as you requested */}
            <DataIntroCard title="Supplements" icon={Pill}>
              <p>An overview of the supplements I take, the reasons why, and links to relevant research. This is not medical advice.</p>
            </DataIntroCard>

            {/* The dynamic schedule content, rendered below the intro */}
            <div className="mt-6">
                {loading && <LoadingIndicator message="Loading supplement schedule..." />}
                
                {error && <StatusMessage type="error" message={error} />}

                {!loading && !error && (
                    <div className="space-y-6">
                        {sections.map((section, index) => (
                            <Card key={index} className="p-6">
                                {/* Section Header */}
                                <div className="mb-5">
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h2>
                                    {section.subtitle && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            <MarkdownLine content={section.subtitle} />
                                        </p>
                                    )}
                                </div>
                                {/* Supplements List */}
                                <ul className="space-y-4">
                                    {section.supplements.map((sup, supIndex) => (
                                        <li 
                                        key={supIndex} 
                                        className="pb-4 border-b border-gray-200/80 dark:border-gray-700/80 last:border-b-0 last:pb-0"
                                        >
                                            <p className="font-semibold text-gray-800 dark:text-gray-200">
                                                <MarkdownLine content={sup.name} />
                                            </p>
                                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                <MarkdownLine content={sup.nutrients} />
                                            </p>
                                        </li>
                                    ))}
                                </ul>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SupplementsPage;