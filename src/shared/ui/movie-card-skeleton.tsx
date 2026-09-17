import styles from "./movie-card-skeleton.module.css";

/**
 * Заглушка одной карточки на время загрузки сетки поиска/коллекции.
 * Декоративная — семантику загрузки (role="status") несёт обёртка
 * вызывающего виджета, а не каждая отдельная карточка.
 */
export function MovieCardSkeleton() {
  return (
    <div className={styles.card} aria-hidden="true">
      <div className={styles.poster} />
      <div className={`${styles.line} ${styles.title}`} />
      <div className={`${styles.line} ${styles.meta}`} />
    </div>
  );
}
