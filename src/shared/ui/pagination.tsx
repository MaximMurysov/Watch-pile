import styles from "./pagination.module.css";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * Не рендерится вовсе при totalPages <= 1 — управлять страницами
 * нечем.
 */
export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav className={styles.pagination} aria-label="Страницы результатов">
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Назад
      </button>
      <span className={styles.status}>
        Страница {currentPage} из {totalPages}
      </span>
      <button
        type="button"
        className={styles.button}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Вперёд
      </button>
    </nav>
  );
}
