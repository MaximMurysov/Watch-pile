import { createListenerMiddleware, isAnyOf } from "@reduxjs/toolkit";

import { parseCollectionItems } from "./schema";
import {
  collectionAdapter,
  itemAdded,
  itemRemoved,
  noteSaved,
  statusChanged,
} from "./slice";
import type { CollectionState } from "./slice";

export const COLLECTION_STORAGE_KEY = "watchpile:collection";

/**
 * Читается один раз при старте store (preloadedState). Битый JSON или
 * записи, не прошедшие схему, не роняют приложение — коллекция
 * стартует пустой, причина видна в консоли (правило CLAUDE.md
 * «ошибки видимы», пустой catch запрещён).
 */
export function loadPersistedCollectionState(): CollectionState {
  const emptyState = collectionAdapter.getInitialState();
  const raw = localStorage.getItem(COLLECTION_STORAGE_KEY);
  if (!raw) {
    return emptyState;
  }

  try {
    const parsedJson: unknown = JSON.parse(raw);
    if (!Array.isArray(parsedJson)) {
      throw new Error("Коллекция в localStorage должна быть массивом");
    }
    return collectionAdapter.setAll(emptyState, parseCollectionItems(parsedJson));
  } catch (error) {
    console.warn(
      "Не удалось прочитать коллекцию из localStorage — стартуем с пустой",
      error,
    );
    return emptyState;
  }
}

/**
 * Пишет коллекцию в localStorage после каждого экшена, меняющего
 * состояние. Слушатель, а не middleware внутри самого слайса — запись
 * в localStorage - побочный эффект, изолированный от чистого редьюсера
 * (правило CLAUDE.md «side effects изолированы в api/model-слое»).
 */
export const collectionPersistenceMiddleware = createListenerMiddleware();

collectionPersistenceMiddleware.startListening({
  matcher: isAnyOf(itemAdded, statusChanged, itemRemoved, noteSaved),
  effect: (_action, listenerApi) => {
    const state = listenerApi.getState() as { collectionItems: CollectionState };
    const items = collectionAdapter.getSelectors().selectAll(state.collectionItems);
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(items));
  },
});
