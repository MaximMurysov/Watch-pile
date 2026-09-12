import { POSTER_SIZE } from "../config";
import type { PosterSize } from "../config";
import type { Movie } from "../model";

/**
 * poiskkino.dev отдаёт постер готовым URL — превью для сеток,
 * полный для страницы фильма. Оба поля nullable, поэтому при
 * отсутствии выбранного размера падаем на другой, а не на заглушку —
 * заглушку рисует UI, если оба варианта пусты.
 */
export function selectPosterUrl(
  poster: Movie["poster"],
  size: PosterSize,
): string | null {
  if (!poster) {
    return null;
  }

  const preferred =
    size === POSTER_SIZE.preview ? poster.previewUrl : poster.url;
  const fallback =
    size === POSTER_SIZE.preview ? poster.url : poster.previewUrl;

  return preferred ?? fallback ?? null;
}
