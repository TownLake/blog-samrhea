// src/components/search-results/search-results.tsx
import React, { FC } from "react";
import { Link } from "gatsby";
import { SearchResult } from "@/hooks/use-search"; // Import the type

import * as styles from "./search-results.module.scss";

type SearchResultsProps = {
  results: SearchResult[];
};

export const SearchResults: FC<SearchResultsProps> = ({ results }) => {
  if (!results.length) {
    return null; // Don't render anything if there are no results
  }

  return (
    <ul className={styles.searchResultsList}>
      {results.map((result) => (
        <li key={result.id} className={styles.searchResultItem}>
          <Link to={result.slug} className={styles.resultLink}>
            <span className={styles.resultTitle}>{result.title}</span>
            <span className={styles.resultExcerpt}>{result.excerpt}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
};