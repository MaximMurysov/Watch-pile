import { configureStore } from "@reduxjs/toolkit";

import { collectionAdapter, collectionReducer, itemAdded } from "./slice";
import {
  COLLECTION_STORAGE_KEY,
  collectionPersistenceMiddleware,
  loadPersistedCollectionState,
} from "./persistence";

const { selectAll } = collectionAdapter.getSelectors();

describe("loadPersistedCollectionState", () => {
  it("возвращает пустую коллекцию, если в localStorage ничего нет", () => {
    const state = loadPersistedCollectionState();

    expect(selectAll(state)).toHaveLength(0);
  });

  it("разбирает валидный JSON из localStorage", () => {
    localStorage.setItem(
      COLLECTION_STORAGE_KEY,
      JSON.stringify([
        {
          movieId: 1,
          title: "Матрица",
          posterUrl: null,
          status: "want",
          addedAt: "2026-09-16T10:00:00.000Z",
        },
      ]),
    );

    const state = loadPersistedCollectionState();

    expect(selectAll(state)).toHaveLength(1);
    expect(selectAll(state)[0].movieId).toBe(1);
  });

  it("не падает на битом JSON — стартует с пустой коллекции и предупреждает в консоли", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});
    localStorage.setItem(COLLECTION_STORAGE_KEY, "не json");

    const state = loadPersistedCollectionState();

    expect(selectAll(state)).toHaveLength(0);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });
});

describe("collectionPersistenceMiddleware", () => {
  it("пишет коллекцию в localStorage после экшена, меняющего состояние", () => {
    const store = configureStore({
      reducer: { collectionItems: collectionReducer },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(collectionPersistenceMiddleware.middleware),
    });

    store.dispatch(
      itemAdded({
        movieId: 1,
        title: "Матрица",
        posterUrl: null,
        status: "want",
      }),
    );

    const persisted = JSON.parse(
      localStorage.getItem(COLLECTION_STORAGE_KEY) ?? "[]",
    );
    expect(persisted).toHaveLength(1);
    expect(persisted[0].movieId).toBe(1);
  });
});
