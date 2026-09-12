import { z } from "zod";

const posterSchema = z.object({
  url: z.string().nullish(),
  previewUrl: z.string().nullish(),
});

const ratingSchema = z.object({
  kp: z.number().nullish(),
  imdb: z.number().nullish(),
});

/**
 * `GenreItem` в OpenAPI-схеме poiskkino.dev не объявляет ни одного
 * обязательного поля (список `required` пуст) — `name` тоже nullish,
 * иначе один жанр без имени завалил бы всю карточку фильма.
 */
const genreSchema = z.object({
  name: z.string().nullish(),
});

/**
 * poiskkino.dev отдаёт объект одной формы и при поиске, и при запросе
 * по id (второй ответ немного полнее) — отдельная урезанная схема для
 * карточки не нужна, одна схема покрывает оба случая. Почти все поля
 * API помечает nullable, схема это повторяет. id обязателен здесь не
 * потому, что того требует OpenAPI-спека (у полного MovieDtoV1_4 он
 * формально nullable, обязателен только у SearchMovieDtoV1_4) — а
 * потому, что без числового id приложению фильм показать нечем:
 * не построить ни ссылку на страницу, ни запись коллекции.
 */
export const movieSchema = z.object({
  id: z.number({ error: "У фильма должен быть числовой id" }),
  name: z.string().nullish(),
  year: z.number().nullish(),
  description: z.string().nullish(),
  slogan: z.string().nullish(),
  movieLength: z.number().nullish(),
  genres: z.array(genreSchema).nullish(),
  poster: posterSchema.nullish(),
  rating: ratingSchema.nullish(),
});

export type Movie = z.infer<typeof movieSchema>;

/**
 * Конверт ответа GET /movie/search: массив результатов лежит в поле
 * `docs` (унаследовано от MongoDB-пагинации). Элементы `docs` здесь
 * намеренно не строгие (movieSchema навесится позже, в parseMovieDocs) —
 * один битый фильм в выдаче не должен ронять её целиком: это ответ на
 * поисковый запрос пользователя, у остальных девяти фильмов из десяти
 * может не быть никаких проблем.
 */
export const movieSearchEnvelopeSchema = z.object({
  docs: z.array(z.unknown()),
  page: z.number(),
  limit: z.number(),
  pages: z.number(),
  total: z.number(),
});

export type MovieSearchEnvelope = z.infer<typeof movieSearchEnvelopeSchema>;

export interface MovieSearchResponse {
  docs: Movie[];
  page: number;
  limit: number;
  pages: number;
  total: number;
}

/**
 * Разбирает элементы `docs`, отбрасывая записи, не прошедшие
 * movieSchema, вместо того чтобы ронять всю выдачу поиска. Причина
 * отбрасывания — не пустой catch, а предупреждение в консоли
 * (правило CLAUDE.md «ошибки видимы»).
 */
export function parseMovieDocs(docs: unknown[]): Movie[] {
  return docs.flatMap((doc) => {
    const result = movieSchema.safeParse(doc);
    if (!result.success) {
      console.warn(
        "Фильм из результатов поиска пропущен — не прошёл валидацию схемы",
        result.error.issues,
      );
      return [];
    }
    return [result.data];
  });
}
