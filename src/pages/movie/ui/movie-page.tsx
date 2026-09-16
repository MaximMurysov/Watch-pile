import { useParams } from "react-router-dom";

import { useGetMovieByIdQuery } from "@/entities/movie";
import { getQueryErrorMessage } from "@/shared/lib";
import { ErrorMessage, Spinner } from "@/shared/ui";
import { MovieDetails } from "@/widgets/movie-details";

const NOT_FOUND_MESSAGE = "Фильм не найден";
const HTTP_NOT_FOUND_STATUS = 404;

export function MoviePage() {
  const { movieId } = useParams<{ movieId: string }>();
  const parsedMovieId = Number(movieId);
  const isValidMovieId = movieId !== undefined && Number.isInteger(parsedMovieId);

  const { data, isFetching, error } = useGetMovieByIdQuery(parsedMovieId, {
    skip: !isValidMovieId,
  });

  if (!isValidMovieId) {
    return <ErrorMessage message={NOT_FOUND_MESSAGE} />;
  }

  if (isFetching) {
    return <Spinner />;
  }

  if (error) {
    const message =
      "status" in error && error.status === HTTP_NOT_FOUND_STATUS
        ? NOT_FOUND_MESSAGE
        : getQueryErrorMessage(error);
    return <ErrorMessage message={message} />;
  }

  if (!data) {
    return <ErrorMessage message={NOT_FOUND_MESSAGE} />;
  }

  return <MovieDetails movie={data} />;
}
