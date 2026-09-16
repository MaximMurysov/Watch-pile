import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

import { MovieCard } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { CollectionButton } from "@/features/add-to-collection";
import { getQueryErrorMessage } from "@/shared/lib";
import { EmptyState, ErrorMessage, Pagination, Spinner } from "@/shared/ui";

import styles from "./movie-grid.module.css";

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
  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <ErrorMessage message={getQueryErrorMessage(error)} />;
  }

  if (movies.length === 0) {
    return <EmptyState message={emptyMessage} />;
  }

  return (
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
