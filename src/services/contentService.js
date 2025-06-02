// src/services/contentService.js
import { marked } from 'marked';

/**
 * Fetches and parses the supplements markdown file.
 * @returns {Promise<Object>} A promise that resolves to an object containing the intro markdown and schedule sections.
 */
export async function fetchAndParseSupplements() {
  const response = await fetch('/content/data/supplements.md');
  if (!response.ok) {
    throw new Error('Failed to fetch supplements data');
  }
  const markdown = await response.text();

  const tokens = marked.lexer(markdown);

  let introMarkdown = '';
  const sections = [];
  let currentSection = null;
  let parsingIntro = true;

  for (const token of tokens) {
    if (token.type === 'hr' && parsingIntro) { // Horizontal rule can also separate intro from sections
        parsingIntro = false; // Stop collecting intro content after the first HR if it precedes sections
        continue; // Don't include the HR in introMarkdown or section parsing
    }

    if (token.type === 'heading' && token.depth === 2) {
      parsingIntro = false; // First H2 marks the end of the intro
      if (currentSection) {
        sections.push(currentSection);
      }
      
      const [title, ...subtitleParts] = token.text.split('–');
      currentSection = {
        title: title.trim(),
        subtitle: subtitleParts.join('–').trim(),
        supplements: []
      };
      continue; // Continue to next token after processing H2
    }

    if (parsingIntro) {
      // Append the raw markdown of the token to build up the intro section
      // This handles H1, blockquotes, paragraphs, etc. in the intro
      if (token.raw) {
        introMarkdown += token.raw + '\n';
      }
    } else if (token.type === 'table' && currentSection) {
      for (const row of token.rows) {
        currentSection.supplements.push({
          name: row[0].text,
          nutrients: row[1].text
        });
      }
    }
  }

  if (currentSection) {
    sections.push(currentSection);
  }

  return { introMarkdown: introMarkdown.trim(), sections };
}