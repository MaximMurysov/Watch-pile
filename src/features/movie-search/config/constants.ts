export const SEARCH_QUERY_PARAM = "query";
export const SEARCH_PAGE_PARAM = "page";

export const MIN_SEARCH_PAGE = 1;
export const DEFAULT_SEARCH_PAGE = MIN_SEARCH_PAGE;

/**
 * Бесплатный ключ poiskkino.dev ограничивает поиск страницами 1–10 —
 * запрос за пределами лимита завершается ошибкой API. Держим лимит
 * здесь: это единственный слайс, который его использует (клампит
 * page из URL и totalPages для pages/search).
 */
export const MAX_SEARCH_RESULT_PAGE = 10;

export const SEARCH_INPUT_DEBOUNCE_MS = 400;
