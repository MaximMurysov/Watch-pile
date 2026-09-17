import { FEATURED_MOVIE_IDS } from "../config";

import { FeaturedMovieCard } from "./featured-movie-card";
import styles from "./featured-movies.module.css";

const FEATURED_TITLE = "Популярное";

/**
 * Показывается вместо пустой сетки, пока запрос не введён — курируемый
 * список (FEATURED_MOVIE_IDS), не «новинки»: см. комментарий в
 * pages/search/config/constants.ts, почему.
 */
export function FeaturedMovies() {
  return (
    <section>
      <h2>{FEATURED_TITLE}</h2>
      <div aria-live="polite" aria-atomic="true">
        <ul className={styles.grid}>
          {FEATURED_MOVIE_IDS.map((movieId, index) => (
            <li key={movieId} className={styles.item}>
              <FeaturedMovieCard movieId={movieId} index={index} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
