// src/components/ui/Markdown.jsx
import React, { useMemo } from 'react';
import { marked } from 'marked';
import { removeFrontmatter } from '/src/utils/stringUtils.js';

const renderer = new marked.Renderer();

marked.setOptions({
  breaks: true,
  gfm: true,
  headerIds: true,
  smartypants: true,
  renderer,
});

const Markdown = ({ content }) => {
  const cleanContent = useMemo(() => removeFrontmatter(content || ''), [content]);
  const htmlContent = useMemo(() => marked(cleanContent), [cleanContent]);

  return (
    <div 
      className="prose dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: htmlContent }} 
    />
  );
};

export default Markdown;