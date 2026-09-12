import type { Movie } from "../model";

/**
 * kp — основной рейтинг Кинопоиска, imdb — запасной. Ноль в поле
 * рейтинга — это не оценка «0», а признак того, что API не насчитал
 * рейтинг вовсе, поэтому его тоже считаем отсутствующим значением.
 */
export function selectRating(rating: Movie["rating"]): number | null {
  if (!rating) {
    return null;
  }

  return rating.kp || rating.imdb || null;
}
