import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

import { MovieCard } from "@/entities/movie";
import type { Movie } from "@/entities/movie";
import { CollectionButton } from "@/features/add-to-collection";
import { getQueryErrorMessage } from "@/shared/lib";
import { EmptyState, ErrorMessage, MovieCardSkeleton, Pagination } from "@/shared/ui";

import { SKELETON_CARD_COUNT } from "../config";

import styles from "./movie-grid.module.css";

const LOADING_MESSAGE = "Загрузка…";

const GRID_CONTAINER_VARIANTS = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.04 } },
};

const GRID_ITEM_VARIANTS = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

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
        <motion.ul
          className={styles.grid}
          variants={GRID_CONTAINER_VARIANTS}
          initial="hidden"
          animate="visible"
        >
          {movies.map((movie) => (
            <motion.li
              key={movie.id}
              className={styles.item}
              variants={GRID_ITEM_VARIANTS}
            >
              <MovieCard movie={movie} />
              <CollectionButton movie={movie} />
            </motion.li>
          ))}
        </motion.ul>
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
