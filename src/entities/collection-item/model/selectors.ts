import type { CollectionStatus } from "./schema";
import { collectionAdapter } from "./slice";
import type { CollectionState } from "./slice";

const { selectAll, selectById } = collectionAdapter.getSelectors();

/**
 * Селектор принимает только тот кусок стейта, который читает, а не
 * RootState — RootState объявлен в app, импорт оттуда был бы импортом
 * вверх по слоям (правило FSD).
 */
export function selectItemByMovieId(movieId: number) {
  return (state: { collectionItems: CollectionState }) =>
    selectById(state.collectionItems, movieId);
}

export function selectItemsByStatus(status: CollectionStatus) {
  return (state: { collectionItems: CollectionState }) =>
    selectAll(state.collectionItems).filter((item) => item.status === status);
}
