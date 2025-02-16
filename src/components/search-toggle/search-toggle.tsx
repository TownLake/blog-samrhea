/* --------------------------------------------
 * FILE: src/components/search-toggle/search-toggle.tsx
 * --------------------------------------------
 */
import React, { useEffect, useRef, useState, type FC } from "react";
import cn from "classnames";

import { useSearch } from "@/hooks/use-search";
import * as styles from "./search-toggle.module.scss";

const SearchToggle: FC = () => {
  const [isSearchActive, toggleSearch] = useSearch();
  const [isClient, setIsClient] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsClient(typeof window !== "undefined");
  }, []);

  // When the search becomes active, focus the input automatically
  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  if (!isClient) {
    return null;
  }

  return (
    <div
      className={cn(styles.searchToggle, {
        [styles.active]: isSearchActive,
      })}
    >
      <button className={styles.button} onClick={toggleSearch}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <title>Search</title>
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      </button>

      {isSearchActive && (
        <input
          ref={inputRef}
          type="text"
          placeholder="Search..."
          className={styles.searchInput}
        />
      )}
    </div>
  );
};

export { SearchToggle };
