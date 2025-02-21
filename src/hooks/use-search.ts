// src/hooks/use-search.ts
import { useState, useCallback } from "react";

export type SearchResult = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
};

export const useSearch = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);

  // Toggle search state
  const toggleSearch = useCallback(() => {
    setIsSearchActive((prev) => !prev);
    if (!isSearchActive) {
      setQuery("");
      setResults([]);
    }
  }, [isSearchActive]);

  // Handle search input changes (with dummy results)
  const handleSearch = useCallback((searchQuery: string) => {
    setQuery(searchQuery);

    if (!searchQuery) {
      setResults([]);
      return;
    }

    // Dummy results
    const dummyResults: SearchResult[] = [
      {
        id: "1",
        title: "My First Blog Post",
        slug: "/my-first-blog-post",
        excerpt: "This is a short excerpt about my first post...",
      },
      {
        id: "2",
        title: "Adventures in Gatsby",
        slug: "/adventures-in-gatsby",
        excerpt: "Exploring the world of Gatsby development...",
      },
      {
        id: "3",
        title: "React Hooks Explained",
        slug: "/react-hooks-explained",
        excerpt: "A deep dive into React Hooks and how to use them...",
      },
      {
        id: "4",
        title: "Styling with CSS Modules",
        slug: "/styling-with-css-modules",
        excerpt: "Learn how to use CSS Modules for component styling...",
      },
    ];

    const lowerCaseQuery = searchQuery.toLowerCase();
      const filteredResults = dummyResults.filter((result) => {
        return result.title.toLowerCase().includes(lowerCaseQuery) || result.excerpt.toLowerCase().includes(lowerCaseQuery)
      })
    setResults(filteredResults.slice(0,4));
  }, []);

  return { isSearchActive, toggleSearch, query, handleSearch, results };
};