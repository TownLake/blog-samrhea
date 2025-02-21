/* --------------------------------------------
 * FILE: src/components/search-results/search-results.tsx
 * --------------------------------------------
 */
import React, { FC } from "react";
import * as styles from "./search-results.module.scss";
import { Link } from "gatsby";

type SearchResult = {
  title: string;
  slug: string;  // Assuming you have a slug for linking
  excerpt: string; // Short description
};

type SearchResultsProps = {
  results: SearchResult[];
};

export const SearchResults: FC<SearchResultsProps> = ({ results }) => {
  if (!results.length) {
    return null; // Or a "No results found" message
  }

  return (
    <div className={styles.searchResults}>
      <ul>
        {results.map((result, index) => (
          <li key={index} className={styles.resultItem}>
            <Link to={result.slug} className={styles.resultLink}>
              <h3 className={styles.resultTitle}>{result.title}</h3>
              <p className={styles.resultExcerpt}>{result.excerpt}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};