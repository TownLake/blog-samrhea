// src/components/sidebar-author/sidebar-author.tsx
import React, { type FC, useEffect, useRef } from "react";
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";
import { useSearch } from "@/hooks/use-search";
import { SearchResults } from "@/components/search-results"; // Import the new component

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
  const { isSearchActive, toggleSearch, query, handleSearch, results } =
    useSearch(); // Get everything from the hook

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
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
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
              value={query}
              onChange={(e) => handleSearch(e.target.value)} // Call handleSearch on change
            />
            {/* Display search results */}
            <SearchResults results={results} />
          </div>
        )}

        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};