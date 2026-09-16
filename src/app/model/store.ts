import { configureStore } from "@reduxjs/toolkit";

import {
  collectionPersistenceMiddleware,
  collectionReducer,
  loadPersistedCollectionState,
} from "@/entities/collection-item";
import { baseApi } from "@/shared/api";

/**
 * Фабрика store, а не единственный экземпляр — нужна тестам
 * (каждый тест получает свой чистый store) и самому приложению.
 */
export function createAppStore() {
  return configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      collectionItems: collectionReducer,
    },
    preloadedState: {
      collectionItems: loadPersistedCollectionState(),
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(
        baseApi.middleware,
        collectionPersistenceMiddleware.middleware,
      ),
  });
}

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
