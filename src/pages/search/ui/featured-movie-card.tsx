import { useEffect, useState } from "react";

import { MovieCard, useGetMovieByIdQuery } from "@/entities/movie";
import { CollectionButton } from "@/features/add-to-collection";
import { MovieCardSkeleton } from "@/shared/ui";

import { FEATURED_CARD_STAGGER_MS } from "../config";

interface FeaturedMovieCardProps {
  movieId: number;
  /** Позиция в подборке — задаёт задержку запроса, см. комментарий ниже. */
  index: number;
}

/**
 * Один элемент подборки — сам запрашивает фильм по id (тот же
 * getMovieById, что у pages/movie). Если запрос не удался, карточка
 * молча не рендерится, не роняя всю подборку — как parseMovieDocs у
 * обычного поиска; ошибка при этом видна в консоли, не проглочена.
 *
 * Запрос отложен на `index * FEATURED_CARD_STAGGER_MS`: без этого все
 * карточки подборки бьют по бесплатному тарифу poiskkino.dev разом,
 * десятью параллельными запросами при каждом первом заходе на пустой
 * поиск — а API уже показал себя нестабильным под нагрузкой (см.
 * CLAUDE.md). Растянутая на доли секунды пачка запросов пользователем
 * не воспринимается как задержка, но снижает пиковую нагрузку.
 */
export function FeaturedMovieCard({ movieId, index }: FeaturedMovieCardProps) {
  const [isReady, setIsReady] = useState(index === 0);

  useEffect(() => {
    if (index === 0) {
      return;
    }
    const timer = setTimeout(() => setIsReady(true), index * FEATURED_CARD_STAGGER_MS);
    return () => clearTimeout(timer);
  }, [index]);

  const {
    data: movie,
    isLoading,
    isError,
    error,
  } = useGetMovieByIdQuery(movieId, { skip: !isReady });

  if (isError) {
    console.warn(`Не удалось загрузить фильм из подборки (id=${movieId})`, error);
    return null;
  }

  if (isLoading || !movie) {
    return <MovieCardSkeleton />;
  }

  return (
    <>
      <MovieCard movie={movie} />
      <CollectionButton movie={movie} />
    </>
  );
}
