import styles from "./movie-details-skeleton.module.css";

const LOADING_MESSAGE = "Загрузка…";

export function MovieDetailsSkeleton() {
  return (
    <div role="status" className={styles.wrapper}>
      <span className={styles.visuallyHidden}>{LOADING_MESSAGE}</span>
      <div className={styles.details} aria-hidden="true">
        <div className={styles.poster} />
        <div className={styles.info}>
          <div className={`${styles.line} ${styles.title}`} />
          <div className={`${styles.line} ${styles.meta}`} />
          <div className={`${styles.line} ${styles.description}`} />
          <div className={`${styles.line} ${styles.description}`} />
        </div>
      </div>
    </div>
  );
}
