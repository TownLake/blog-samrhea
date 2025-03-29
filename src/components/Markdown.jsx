// src/components/Markdown.jsx
import React, { useMemo } from 'react';
import { marked } from 'marked';
import { removeFrontmatter } from '../utils/stringUtils';

const renderer = new marked.Renderer();

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  smartypants: true,
  renderer,
});

const Markdown = ({ content }) => {
  // Use the utility function to clean the content
  const cleanContent = useMemo(() => removeFrontmatter(content || ''), [content]);
  
  // Process markdown only when content changes
  const htmlContent = useMemo(() => marked(cleanContent), [cleanContent]);

  return (
    <div 
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default Markdown;