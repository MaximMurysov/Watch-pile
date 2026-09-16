import { useDispatch, useSelector } from "react-redux";

import {
  itemAdded,
  itemRemoved,
  selectItemByMovieId,
  statusChanged,
} from "@/entities/collection-item";
import { POSTER_SIZE, selectPosterUrl } from "@/entities/movie";
import type { Movie } from "@/entities/movie";

const WANT_LABEL = "Хочу посмотреть";
const WATCHED_LABEL = "Посмотрел";
const REMOVE_LABEL = "Убрать";

interface CollectionButtonProps {
  movie: Movie;
}

/**
 * Кнопка — цикл «хочу посмотреть» → «посмотрел» → «убрать». Знает
 * movieId и минимум данных фильма, нужных для записи коллекции; сам
 * запрос за фильмом делает pages/search или pages/movie, не эта фича.
 */
export function CollectionButton({ movie }: CollectionButtonProps) {
  const dispatch = useDispatch();
  const item = useSelector(selectItemByMovieId(movie.id));

  function handleClick() {
    if (!item) {
      dispatch(
        itemAdded({
          movieId: movie.id,
          title: movie.name,
          posterUrl: selectPosterUrl(movie.poster, POSTER_SIZE.preview),
          status: "want",
        }),
      );
      return;
    }

    if (item.status === "want") {
      dispatch(statusChanged({ movieId: movie.id, status: "watched" }));
      return;
    }

    dispatch(itemRemoved({ movieId: movie.id }));
  }

  const label = !item
    ? WANT_LABEL
    : item.status === "want"
      ? WATCHED_LABEL
      : REMOVE_LABEL;

  return (
    <button type="button" onClick={handleClick}>
      {label}
    </button>
  );
}
