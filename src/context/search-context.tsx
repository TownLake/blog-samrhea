// src/context/SearchContext.tsx
import React, { createContext, useContext } from "react";
import { useSearch as useSearchState } from "@/hooks/use-search";

interface SearchContextProps {
  isSearchActive: boolean;
  toggleSearch: () => void;
  query: string;
  setQuery: (query: string) => void;
  results: any[];
  loading: boolean;
  error: string | null;
  performSearch: (q: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextProps | undefined>(undefined);

export const SearchProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const search = useSearchState();
  return <SearchContext.Provider value={search}>{children}</SearchContext.Provider>;
};

export const useSearchContext = (): SearchContextProps => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error("useSearchContext must be used within a SearchProvider");
  }
  return context;
};
