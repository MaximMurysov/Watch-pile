import type { CollectionItem } from "@/entities/collection-item";
import type { Movie } from "@/entities/movie";

/**
 * Запись коллекции хранит только movieId/title/posterUrl (этап 5), не
 * полный Movie. Чтобы отрисовать её тем же MovieGrid/MovieCard без
 * изменения их сигнатуры, недостающие поля Movie обнуляются — MovieCard
 * уже рассчитан на nullish-поля и рисует для них плейсхолдеры.
 */
export function collectionItemToMovie(item: CollectionItem): Movie {
  return {
    id: item.movieId,
    name: item.title ?? null,
    year: null,
    description: null,
    slogan: null,
    movieLength: null,
    genres: null,
    poster: item.posterUrl
      ? { url: item.posterUrl, previewUrl: item.posterUrl }
      : null,
    rating: null,
  };
}
