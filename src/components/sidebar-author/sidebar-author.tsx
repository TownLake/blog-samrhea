/* --------------------------------------------
 * FILE: src/components/sidebar-author/sidebar-author.tsx
 * --------------------------------------------
 */
import React, { type FC, useEffect, useRef } from "react";
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";
import { useSearch } from "@/hooks/use-search";

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
  // Manage search state at the parent level
  const [isSearchActive, toggleSearch] = useSearch();

  // For auto-focus on the input
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (isSearchActive && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearchActive]);

  return (
    <div className={styles.sidebarAuthor}>
      {/* Author photo linking to home */}
      <Link to="/">
        <Image alt={author.title} path={author.photo} className={styles.photo} />
      </Link>

      <div className={styles.titleContainer}>
        {/* The top row: name on left, toggles (theme + search button) on right */}
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
            {/* SearchToggle is just a button, no input inside */}
            <SearchToggle
              isSearchActive={isSearchActive}
              toggleSearch={toggleSearch}
            />
          </div>
        </div>

        {/* If search is active, show the input below the row */}
        {isSearchActive && (
          <div className={styles.searchRow}>
            <input
              ref={inputRef}
              type="text"
              placeholder="Search..."
              className={styles.searchInput}
            />
          </div>
        )}

        {/* Author description below everything */}
        <p className={styles.description}>{author.description}</p>
      </div>
    </div>
  );
};