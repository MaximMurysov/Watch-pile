import { Link } from "react-router-dom";

import { buildMoviePath } from "@/shared/config";

import {
  POSTER_SIZE,
  UNKNOWN_TITLE_PLACEHOLDER,
  UNKNOWN_VALUE_PLACEHOLDER,
} from "../config";
import {
  formatRating,
  formatReleaseYear,
  selectPosterUrl,
  selectRating,
} from "../lib";
import type { Movie } from "../model";

import styles from "./movie-card.module.css";

interface MovieCardProps {
  movie: Movie;
}

/**
 * Карточка — ссылка на страницу фильма, ничего не «делает». Кнопку
 * коллекции поверх карточки подключает widgets/movie-grid (этап 5).
 */
export function MovieCard({ movie }: MovieCardProps) {
  const title = movie.name ?? UNKNOWN_TITLE_PLACEHOLDER;
  const posterUrl = selectPosterUrl(movie.poster, POSTER_SIZE.preview);
  const rating = selectRating(movie.rating);

  return (
    <Link to={buildMoviePath(movie.id)} className={styles.card}>
      {posterUrl ? (
        <img src={posterUrl} alt={title} className={styles.poster} />
      ) : (
        <div className={styles.posterPlaceholder}>Нет постера</div>
      )}
      <div className={styles.info}>
        <span className={styles.title}>{title}</span>
        <span className={styles.meta}>
          <span>{formatReleaseYear(movie.year)}</span>
          <span className={styles.rating}>
            {rating !== null ? formatRating(rating) : UNKNOWN_VALUE_PLACEHOLDER}
          </span>
        </span>
      </div>
    </Link>
  );
}
