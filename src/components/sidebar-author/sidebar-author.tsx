/* --------------------------------------------
 * FILE: src/components/sidebar-author/sidebar-author.tsx
 * --------------------------------------------
 */
import React, { type FC, useEffect, useRef, useState } from "react";
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";
import { useSearch } from "@/hooks/use-search";
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

export const SidebarAuthor: FC<SidebarAuthorProps> = ({ author, isHome }) => {
  const [isSearchActive, toggleSearch] = useSearch();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [areSearchResultsShowing, setAreSearchResultsShowing] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setAreSearchResultsShowing(true);

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

      setSearchResults(dummyResults.slice(0, 4));
    }, 300);
  };

  useEffect(() => {
    if (!isSearchActive) {
      setSearchQuery("");
      setSearchResults([]);
       setAreSearchResultsShowing(false); // Also hide results when search is deactivated
    }
  }, [isSearchActive]);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setAreSearchResultsShowing(false);
    }
  }, [searchQuery]);

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
            {/* Wrap the input and results */}
            <div className={styles.searchInputAndResults}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Search..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
              {areSearchResultsShowing && <SearchResults results={searchResults} />}
            </div>
          </div>
        )}

        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};