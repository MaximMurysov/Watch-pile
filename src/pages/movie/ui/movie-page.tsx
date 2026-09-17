import { useParams } from "react-router-dom";

import { useGetMovieByIdQuery } from "@/entities/movie";
import { getQueryErrorMessage, useDocumentTitle } from "@/shared/lib";
import { ErrorMessage, MovieDetailsSkeleton } from "@/shared/ui";
import { MovieDetails } from "@/widgets/movie-details";

const NOT_FOUND_MESSAGE = "Фильм не найден";
const HTTP_NOT_FOUND_STATUS = 404;
const DEFAULT_MOVIE_TITLE = "Фильм";

export function MoviePage() {
  const { movieId } = useParams<{ movieId: string }>();
  const parsedMovieId = Number(movieId);
  const isValidMovieId = movieId !== undefined && Number.isInteger(parsedMovieId);

  const { data, isFetching, error } = useGetMovieByIdQuery(parsedMovieId, {
    skip: !isValidMovieId,
  });

  const isMovieNotFound =
    !isValidMovieId ||
    (!!error && "status" in error && error.status === HTTP_NOT_FOUND_STATUS) ||
    (!isFetching && !error && !data);

  useDocumentTitle(
    isMovieNotFound ? NOT_FOUND_MESSAGE : (data?.name ?? DEFAULT_MOVIE_TITLE),
  );

  if (!isValidMovieId) {
    return <ErrorMessage message={NOT_FOUND_MESSAGE} />;
  }

  if (isFetching) {
    return <MovieDetailsSkeleton />;
  }

  if (error) {
    const message = isMovieNotFound ? NOT_FOUND_MESSAGE : getQueryErrorMessage(error);
    return <ErrorMessage message={message} />;
  }

  if (!data) {
    return <ErrorMessage message={NOT_FOUND_MESSAGE} />;
  }

  return <MovieDetails movie={data} />;
}
