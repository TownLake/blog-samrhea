/* --------------------------------------------
 * FILE: src/components/sidebar-author/sidebar-author.tsx
 * --------------------------------------------
 */
import React, { type FC, useEffect, useRef, useState } from "react"; // Add useState
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "../search-results/search-results"; // ABSOLUTELY CORRECT THIS TIME

import * as styles from "./sidebar-author.module.scss";

type SidebarAuthorProps = {
  author: {
    title: string;
    photo: string;
    description: string;
  };
  isHome?: boolean;
};

export const SidebarAuthor: FC<SidebarAuthorProps> = ({ author, isHome }) => {
  const [isSearchActive, toggleSearch] = useSearch();
  const [searchQuery, setSearchQuery] = useState(""); // Store the search query
  const [searchResults, setSearchResults] = useState<any[]>([]); // Store search results
  const [areSearchResultsShowing, setAreSearchResultsShowing] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  // Dummy search function (replace with actual search logic)
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setAreSearchResultsShowing(true)

    // Simulate a search delay and return dummy results
    setTimeout(() => {
      if (query.trim() === "") {
          setSearchResults([]);
          return;
      }

      const dummyResults = [
        {
          title: "Dummy Result 1",
          slug: "/dummy-1",
          excerpt: "This is a short excerpt for the first dummy result.",
        },
        {
          title: "Dummy Result 2",
          slug: "/dummy-2",
          excerpt: "Another excerpt for the second dummy result.",
        },
        {
          title: "Dummy Result 3",
          slug: "/dummy-3",
          excerpt: "Yet another short excerpt for a dummy result.",
        },
        {
          title: "Very very long title result number four",
          slug: "/dummy-4",
          excerpt: "Yet another short excerpt for a dummy result.",
        },
      ];

      // Limit the results to the top 4.
      setSearchResults(dummyResults.slice(0, 4));
    }, 300); // Simulate a 300ms delay
  };
    useEffect(() => {
    if (!isSearchActive) {
      setSearchQuery(""); // Clear query
      setSearchResults([]); // Clear results
    }
  }, [isSearchActive]);

    useEffect(()=>{
      if (searchQuery.length === 0){
        setAreSearchResultsShowing(false)
      }
    }, [searchQuery])

    const clearSearch = () => {
      setSearchQuery("");
    }
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
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)} // Call handleSearch on change
            />
            {/* Close Button */}
            {searchQuery && (
                <button onClick={clearSearch} className={styles.closeButton}>
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            )}
              {areSearchResultsShowing && <SearchResults results={searchResults} />}
          </div>
        )}

        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};