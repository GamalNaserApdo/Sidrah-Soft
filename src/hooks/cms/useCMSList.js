/**
 * useCMSList — reusable hook for CMS list pages.
 *
 * Manages pagination, search, filters, loading, error, and data state.
 * Works with DRF PageNumberPagination response shape.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { parseApiError } from '../../services/cms/cmsFetch';

export function useCMSList(fetchFn, initialParams = {}) {
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialParams.page_size || 20);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);

  const searchTimerRef = useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        page,
        page_size: pageSize,
        search: debouncedSearch || undefined,
        ...filters,
        ...initialParams,
      };
      // Remove undefined values
      Object.keys(params).forEach((k) => {
        if (params[k] === undefined || params[k] === '' || params[k] === null) {
          delete params[k];
        }
      });
      const data = await fetchFn(params);
      setItems(data.results || []);
      setCount(data.count || 0);
      setNext(data.next);
      setPrevious(data.previous);
    } catch (err) {
      setError(parseApiError(err));
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, debouncedSearch, filters]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (value === '' || value === undefined || value === null) {
        delete next[key];
      } else {
        next[key] = value;
      }
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
    setSearch('');
    setDebouncedSearch('');
    setPage(1);
  }, []);

  const refresh = useCallback(() => {
    load();
  }, [load]);

  return {
    items,
    count,
    page,
    pageSize,
    totalPages,
    loading,
    error,
    search,
    setSearch,
    debouncedSearch,
    filters,
    setFilter,
    clearFilters,
    setPage,
    next,
    previous,
    refresh,
  };
}
