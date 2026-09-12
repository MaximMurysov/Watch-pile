/**
 * Пути приложения — единственное место, где строки маршрутов
 * записаны буквально. Остальной код ссылается на эти константы.
 */
export const ROUTES = {
  search: "/",
  movie: "/movie/:movieId",
  collection: "/collection",
} as const;

export function buildMoviePath(movieId: string | number): string {
  return `/movie/${movieId}`;
}
