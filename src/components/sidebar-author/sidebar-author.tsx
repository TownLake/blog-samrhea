// src/components/sidebar-author/sidebar-author.tsx
import React, { type FC, useEffect, useRef, useState } from "react";
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";
import { useSearch } from "@/hooks/use-search"; // Keep if you have custom hook logic
import { SearchResults } from "../search-results/search-results";

import * as styles from "./sidebar-author.module.scss";

type SidebarAuthorProps = {
  author: {
    title: string;
    photo: string;
    description: string;
  };
  isHome?: boolean;
};

type SearchResult = {
  title: string;
  slug: string;
  score: string;
};

export const SidebarAuthor: FC<SidebarAuthorProps> = ({ author, isHome }) => {
  const [isSearchActive, toggleSearch] = useSearch(); // Keep if useSearch handles local state.
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [areSearchResultsShowing, setAreSearchResultsShowing] = useState(false);
  const [loading, setLoading] = useState(false); // Add loading state

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);

    if (query.trim() === "") {
      setSearchResults([]);
      setAreSearchResultsShowing(false);
      return;
    }

    setAreSearchResultsShowing(true);
    setLoading(true); // Set loading to true when starting the search

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResult[] = await response.json();
      setSearchResults(data);
    } catch (error) {
      console.error("Error during search:", error);
      setSearchResults([]); // Clear results on error
    } finally {
      setLoading(false); // Set loading to false after search (success or failure)
    }
  };

  useEffect(() => {
    if (!isSearchActive) {
      setSearchQuery("");
      setSearchResults([]);
      setAreSearchResultsShowing(false);
    }
  }, [isSearchActive]);

  return (
    <div className={styles.sidebarAuthor}>
      <Link to="/">
        <Image alt={author.title} path={author.photo} className={styles.photo} />
      </Link>

      <div className={styles.titleContainer}>
        <div className={styles.topRow}>
          {isHome ? (
            <h1 className={styles.title}>
              <Link className={styles.link} to="/">
                {author.title}
              </Link>
            </h1>
          ) : (
            <h2 className={styles.title}>
              <Link className={styles.link} to="/">
                {author.title}
              </Link>
            </h2>
          )}

          <div className={styles.toggles}>
            <ThemeSwitcher />
            <SearchToggle
              isSearchActive={isSearchActive}
              toggleSearch={toggleSearch}
            />
          </div>
        </div>

        {isSearchActive && (
          <div className={styles.searchRow}>
            <div className={styles.searchInputAndResults}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {loading && (
                <div className={styles.loadingIndicator}>Loading...</div>
              )}
              {/* Show loading indicator */}
              {areSearchResultsShowing && (
                <SearchResults results={searchResults} />
              )}
            </div>
          </div>
        )}

        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};