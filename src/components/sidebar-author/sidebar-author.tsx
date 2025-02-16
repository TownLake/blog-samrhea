// src/components/sidebar-author/sidebar-author.tsx

import React, { type FC } from "react";
import { Link } from "gatsby";

import { Image } from "@/components/image";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { SearchToggle } from "@/components/search-toggle";

import * as styles from "./sidebar-author.module.scss";

type SidebarAuthorProps = {
  author: {
    title: string;
    photo: string;
    description: string;
  };
  isHome?: boolean;
};

const SidebarAuthor: FC<SidebarAuthorProps> = ({ author, isHome }) => (
  <div className={styles.sidebarAuthor}>
    <Link to="/">
      <Image alt={author.title} path={author.photo} className={styles.photo} />
    </Link>

    <div className={styles.titleContainer}>
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
        <SearchToggle />
      </div>
    </div>
    <p className={styles.description}>{author.description}</p>
  </div>
);

export { SidebarAuthor };
