import { MAX_SEARCH_RESULT_PAGE, MIN_SEARCH_PAGE } from "../config";

/**
 * Зажимает номер страницы в диапазон, который реально поддерживает
 * бесплатный ключ poiskkino.dev — так URL с page=11 (введённый вручную)
 * не отправляет заведомо провальный запрос вместо честного отключения
 * «Вперёд» на границе.
 */
export function clampSearchPage(page: number): number {
  if (Number.isNaN(page)) {
    return MIN_SEARCH_PAGE;
  }
  return Math.min(Math.max(page, MIN_SEARCH_PAGE), MAX_SEARCH_RESULT_PAGE);
}
