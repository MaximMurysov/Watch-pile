import { useCallback, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";

import {
  DEFAULT_SEARCH_PAGE,
  SEARCH_INPUT_DEBOUNCE_MS,
  SEARCH_PAGE_PARAM,
  SEARCH_QUERY_PARAM,
} from "../config";
import { clampSearchPage } from "../lib";

interface UseSearchMovieParamsResult {
  query: string;
  page: number;
  setQuery: (query: string) => void;
  setPage: (page: number) => void;
}

/**
 * Единственный источник query/page — URL (useSearchParams), локального
 * useState нет нигде в этом хуке. Дебаунс ввода реализован таймером в
 * useRef вокруг записи query, а не отдельным полем состояния — иначе
 * появился бы второй источник правды, расходящийся с URL.
 */
export function useSearchMovieParams(): UseSearchMovieParamsResult {
  const [searchParams, setSearchParams] = useSearchParams();
  const debounceTimeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const query = searchParams.get(SEARCH_QUERY_PARAM) ?? "";
  const page = clampSearchPage(
    Number(searchParams.get(SEARCH_PAGE_PARAM)) || DEFAULT_SEARCH_PAGE,
  );

  useEffect(() => {
    return () => clearTimeout(debounceTimeoutRef.current);
  }, []);

  const setQuery = useCallback(
    (nextQuery: string) => {
      clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        setSearchParams((previous) => {
          const next = new URLSearchParams(previous);
          if (nextQuery) {
            next.set(SEARCH_QUERY_PARAM, nextQuery);
          } else {
            next.delete(SEARCH_QUERY_PARAM);
          }
          next.set(SEARCH_PAGE_PARAM, String(DEFAULT_SEARCH_PAGE));
          return next;
        });
      }, SEARCH_INPUT_DEBOUNCE_MS);
    },
    [setSearchParams],
  );

  const setPage = useCallback(
    (nextPage: number) => {
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.set(SEARCH_PAGE_PARAM, String(clampSearchPage(nextPage)));
        return next;
      });
    },
    [setSearchParams],
  );

  return { query, page, setQuery, setPage };
}
