/* --------------------------------------------
 * FILE: src/components/search-toggle/search-toggle.tsx
 * --------------------------------------------
 */
import React, { FC } from "react";
import cn from "classnames";
import * as styles from "./search-toggle.module.scss";

type SearchToggleProps = {
  isSearchActive: boolean;
  toggleSearch: () => void;
};

export const SearchToggle: FC<SearchToggleProps> = ({
  isSearchActive,
  toggleSearch,
}) => {
  return (
    <button
      className={cn(styles.searchToggleButton, {
        [styles.active]: isSearchActive,
      })}
      onClick={toggleSearch}
    >
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
  );
};
