import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { ReactNode } from "react";

import { MovieCard } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { CollectionButton } from "@/features/add-to-collection";
import { getQueryErrorMessage } from "@/shared/lib";
import { EmptyState, ErrorMessage, MovieCardSkeleton, Pagination } from "@/shared/ui";

import { SKELETON_CARD_COUNT } from "../config";

import styles from "./movie-grid.module.css";

const LOADING_MESSAGE = "Загрузка…";

interface MovieGridProps {
  movies: Movie[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  error?: FetchBaseQueryError | SerializedError;
  emptyMessage: string;
}

/**
 * Презентационный виджет: владелец данных (pages/search) передаёт
 * результат запроса пропсами, а состояния «загрузка / ошибка / пусто /
 * данные» виджет решает сам.
 */
export function MovieGrid({
  movies,
  page,
  totalPages,
  onPageChange,
  isLoading,
  error,
  emptyMessage,
}: MovieGridProps) {
  let content: ReactNode;

  if (isLoading) {
    // Без собственного role="status" — обёртка компонента уже несёт
    // aria-live="polite", второй уровень live-region был бы дублирующим.
    content = (
      <div>
        <span className={styles.visuallyHidden}>{LOADING_MESSAGE}</span>
        <ul className={styles.grid}>
          {Array.from({ length: SKELETON_CARD_COUNT }, (_, index) => (
            <li key={index} className={styles.item}>
              <MovieCardSkeleton />
            </li>
          ))}
        </ul>
      </div>
    );
  } else if (error) {
    content = <ErrorMessage message={getQueryErrorMessage(error)} />;
  } else if (movies.length === 0) {
    content = <EmptyState message={emptyMessage} />;
  } else {
    content = (
      <div>
        <ul className={styles.grid}>
          {movies.map((movie) => (
            <li key={movie.id} className={styles.item}>
              <MovieCard movie={movie} />
              <CollectionButton movie={movie} />
            </li>
          ))}
        </ul>
        <Pagination
          currentPage={page}
          totalPages={totalPages}
          onPageChange={onPageChange}
        />
      </div>
    );
  }

  return (
    <div aria-live="polite" aria-atomic="true">
      {content}
    </div>
  );
}
