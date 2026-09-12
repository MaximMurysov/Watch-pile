import { baseApi } from "@/shared/api";

import {
  movieSchema,
  movieSearchEnvelopeSchema,
  parseMovieDocs,
} from "../model";
import type { Movie, MovieSearchEnvelope, MovieSearchResponse } from "../model";

interface SearchMoviesArgs {
  query: string;
  page: number;
}

/**
 * Валидация — через rawResponseSchema/onSchemaFailure/catchSchemaFailure
 * у baseApi (shared/api), не через ручной .parse() в transformResponse:
 * так несовпадение со схемой превращается в обычный FetchBaseQueryError,
 * а не в необработанное исключение RTK Query.
 *
 * У поиска сам конверт (page/limit/pages/total, docs — массив) проверяет
 * rawResponseSchema, а вот элементы docs разбирает parseMovieDocs уже в
 * transformResponse — один битый фильм в выдаче не должен прятать девять
 * остальных.
 */
export const movieApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    searchMovies: builder.query<MovieSearchResponse, SearchMoviesArgs>({
      query: ({ query, page }) => ({
        url: "movie/search",
        params: { query, page },
      }),
      rawResponseSchema: movieSearchEnvelopeSchema,
      transformResponse: (envelope: MovieSearchEnvelope) => ({
        ...envelope,
        docs: parseMovieDocs(envelope.docs),
      }),
      providesTags: ["MovieSearch"],
    }),
    getMovieById: builder.query<Movie, number>({
      query: (movieId) => `movie/${movieId}`,
      rawResponseSchema: movieSchema,
      providesTags: ["Movie"],
    }),
  }),
});

export const { useSearchMoviesQuery, useGetMovieByIdQuery } = movieApi;
