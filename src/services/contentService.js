// src/services/contentService.js
import { marked } from 'marked';

/**
 * Fetches and parses the supplements markdown file into a structured array.
 * @returns {Promise<Array>} A promise that resolves to an array of schedule sections.
 */
export async function fetchAndParseSupplements() {
  const response = await fetch('/content/data/supplements.md');
  if (!response.ok) {
    throw new Error('Failed to fetch supplements data');
  }
  const markdown = await response.text();

  // Use the marked lexer to break the markdown into tokens
  const tokens = marked.lexer(markdown);

  const sections = [];
  let currentSection = null;

  for (const token of tokens) {
    // A level 2 heading (##) indicates the start of a new time section
    if (token.type === 'heading' && token.depth === 2) {
      if (currentSection) {
        sections.push(currentSection); // Push the previously completed section
      }
      
      // Split the heading text into a main title and a subtitle
      const [title, ...subtitleParts] = token.text.split('–');

      currentSection = {
        title: title.trim(),
        subtitle: subtitleParts.join('–').trim(),
        supplements: []
      };
    }

    // A table token contains the list of supplements for the current section
    if (token.type === 'table' && currentSection) {
      // The `rows` property contains the table body rows
      for (const row of token.rows) {
        currentSection.supplements.push({
          name: row[0].text,      // First column is the substance name
          nutrients: row[1].text  // Second column is the nutrient details
        });
      }
    }
  }

  // Add the last processed section to the array
  if (currentSection) {
    sections.push(currentSection);
  }

  return sections;
}