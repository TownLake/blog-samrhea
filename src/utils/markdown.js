// src/utils/markdown.js - cleaned up version
import matter from 'gray-matter';

// Parse frontmatter and content from markdown
export function parseMarkdown(markdown) {
  try {
    const { data, content } = matter(markdown);
    return { data, content };
  } catch (error) {
    console.error('Error parsing markdown:', error);
    return { data: {}, content: '' };
  }
}

// Process markdown file for About page
export async function processAboutMarkdown(markdownContent) {
  const { data, content } = parseMarkdown(markdownContent);
  
  return {
    title: data.title || 'About',
    content
  };
}