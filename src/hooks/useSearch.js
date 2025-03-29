// src/hooks/useSearch.js
import { useState, useCallback } from 'react';

export const useSearch = () => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const toggleSearch = useCallback(() => {
    setIsSearchActive(prev => !prev);
  }, []);
  return [isSearchActive, toggleSearch];
};
