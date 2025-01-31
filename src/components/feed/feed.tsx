import React, { type FC } from "react";
import { Link } from "gatsby";
import { type Edge } from "@/types/edge";
import * as styles from "./feed.module.scss";

const FEATURED_CARDS = [
  {
    title: "2025 Reading",
    description: "Fatherhood year one",
    link: "https://blog.samrhea.com/posts/2024/reading-list/"
  },
  {
    title: "Featured Book 2",
    description: "Revenge of the Kindle",
    link: "https://blog.samrhea.com/posts/2023/reading-list/"
  }
];

type FeedProps = {
  edges: Array<Edge>;
  category?: string;
};

const Feed: FC<FeedProps> = ({ edges, category }) => {
  const isReadingCategory = category === 'reading';

  return (
    <div className={styles.feed}>
      {isReadingCategory && (
        <div className={styles.featuredCards}>
          {FEATURED_CARDS.map((card, index) => (
            <a 
              key={index}
              href={card.link}
              className={styles.featuredCard}
              target="_blank"
              rel="noopener noreferrer"
            >
              <h3 className={styles.featuredCardTitle}>{card.title}</h3>
              <p className={styles.featuredCardDescription}>{card.description}</p>
            </a>
          ))}
        </div>
      )}
      
      {edges.map((edge) => (
        <div className={styles.item} key={edge.node.fields.slug}>
          <div className={styles.meta}>
            <time
              className={styles.time}
              dateTime={new Date(edge.node.frontmatter.date).toLocaleDateString(
                "en-US",
                { year: "numeric", month: "long", day: "numeric" }
              )}
            >
              {new Date(edge.node.frontmatter.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </time>
            <span className={styles.divider} />
            <span className={styles.category}>
              <Link to={edge.node.fields.categorySlug} className={styles.link}>
                {edge.node.frontmatter.category}
              </Link>
            </span>
          </div>
          <h2 className={styles.title}>
            <Link
              className={styles.link}
              to={edge.node.frontmatter?.slug || edge.node.fields.slug}
            >
              {edge.node.frontmatter.title}
            </Link>
          </h2>
          <p className={styles.description}>
            {edge.node.frontmatter.description}
          </p>
        </div>
      ))}
    </div>
  );
};

export { Feed };