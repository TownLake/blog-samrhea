// src/components/data/SupplementsPage.jsx
import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Pill } from 'lucide-react';
import { fetchAndParseSupplements } from '../../services/contentService';
import DataIntroCard from './DataIntroCard';
import Card from '../Card';
import LoadingIndicator from '../LoadingIndicator';
import StatusMessage from '../StatusMessage';

const MarkdownLine = ({ content }) => {
    const html = marked.parseInline(content || '', { gfm: true, breaks: true });
    return <span dangerouslySetInnerHTML={{ __html: html }} />;
};

const SupplementsPage = () => {
    const [schedule, setSchedule] = useState({ pageTitle: '', sections: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSupplements = async () => {
            try {
                setLoading(true);
                const data = await fetchAndParseSupplements();
                setSchedule(data);
            } catch (err) {
                setError('Failed to load supplement schedule. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadSupplements();
    }, []);

    if (loading) {
        return <LoadingIndicator message="Loading supplement schedule..." />;
    }

    if (error) {
        return <StatusMessage type="error" message={error} />;
    }

    return (
        <div className="py-2">
            <DataIntroCard title="Supplements" icon={Pill}>
              <p>More for my own reminders (and to copy-paste the .md to an LLM for periodic review).</p>
            </DataIntroCard>

            {/* NEW: Styled header for the schedule section */}
            {schedule.pageTitle && (
              <div className="my-10 text-center">
                <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {schedule.pageTitle}
                </h2>
                {/* A short, decorative horizontal rule to act as a separator */}
                <hr className="mt-4 w-24 mx-auto border-gray-300 dark:border-gray-600" />
              </div>
            )}
            
            {/* Dynamic schedule content */}
            <div className="space-y-6">
                {schedule.sections.map((section, index) => (
                    <Card key={index} className="p-6">
                        <div className="mb-5">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">{section.title}</h3>
                            {section.subtitle && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    <MarkdownLine content={section.subtitle} />
                                </p>
                            )}
                        </div>
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
        </div>
    );
};

export default SupplementsPage;