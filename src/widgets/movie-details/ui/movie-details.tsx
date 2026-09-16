import {
  POSTER_SIZE,
  UNKNOWN_TITLE_PLACEHOLDER,
  UNKNOWN_VALUE_PLACEHOLDER,
  formatRating,
  formatReleaseYear,
  selectPosterUrl,
  selectRating,
} from "@/entities/movie";
import type { Movie } from "@/entities/movie";

import styles from "./movie-details.module.css";

interface MovieDetailsProps {
  movie: Movie;
}

function formatMovieLength(movieLength: Movie["movieLength"]): string {
  return movieLength ? `${movieLength} мин` : UNKNOWN_VALUE_PLACEHOLDER;
}

/**
 * Презентационный виджет: данные приходят пропсом, сам ничего не
 * запрашивает (владелец данных — pages/movie).
 */
export function MovieDetails({ movie }: MovieDetailsProps) {
  const title = movie.name ?? UNKNOWN_TITLE_PLACEHOLDER;
  const posterUrl = selectPosterUrl(movie.poster, POSTER_SIZE.full);
  const rating = selectRating(movie.rating);
  const genreNames = movie.genres?.flatMap((genre) =>
    genre.name ? [genre.name] : [],
  );

  return (
    <article className={styles.details}>
      {posterUrl ? (
        <img src={posterUrl} alt={title} className={styles.poster} />
      ) : (
        <div className={styles.posterPlaceholder}>Нет постера</div>
      )}
      <div className={styles.info}>
        <h1 className={styles.title}>{title}</h1>
        {movie.slogan && <p className={styles.slogan}>«{movie.slogan}»</p>}
        <dl className={styles.meta}>
          <div>
            <dt>Год</dt>
            <dd>{formatReleaseYear(movie.year)}</dd>
          </div>
          <div>
            <dt>Хронометраж</dt>
            <dd>{formatMovieLength(movie.movieLength)}</dd>
          </div>
          <div>
            <dt>Рейтинг</dt>
            <dd className={styles.rating}>
              {rating !== null ? formatRating(rating) : UNKNOWN_VALUE_PLACEHOLDER}
            </dd>
          </div>
        </dl>
        {genreNames && genreNames.length > 0 && (
          <ul className={styles.genres}>
            {genreNames.map((name) => (
              <li key={name} className={styles.genre}>
                {name}
              </li>
            ))}
          </ul>
        )}
        {movie.description && (
          <p className={styles.description}>{movie.description}</p>
        )}
      </div>
    </article>
  );
}
