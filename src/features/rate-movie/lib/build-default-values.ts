import type { DefaultValues } from "react-hook-form";

import type { CollectionNote } from "@/entities/collection-item";

import type { RateMovieFormValues } from "../model";

/**
 * Готовит `defaultValues` формы из заметки коллекции. Оценка и дата
 * просмотра остаются `undefined`, если их ещё нет — форма не должна
 * подставлять произвольную оценку за пользователя.
 */
export function buildDefaultValues(
  note: CollectionNote | null | undefined,
): DefaultValues<RateMovieFormValues> {
  return {
    rating: note?.rating ?? undefined,
    watchedAt: note?.watchedAt ?? undefined,
    tags: note?.tags ?? [],
    text: note?.text ?? null,
  };
}
