import {
  collectionAdapter,
  collectionReducer,
  itemAdded,
  itemRemoved,
  noteSaved,
  statusChanged,
} from "./slice";

const { selectAll, selectById } = collectionAdapter.getSelectors();

describe("collectionReducer", () => {
  it("itemAdded добавляет запись со статусом и временем добавления", () => {
    const state = collectionReducer(
      undefined,
      itemAdded({
        movieId: 1,
        title: "Матрица",
        posterUrl: "https://example.com/poster.jpg",
        status: "want",
      }),
    );

    const item = selectById(state, 1);
    expect(item?.title).toBe("Матрица");
    expect(item?.status).toBe("want");
    expect(typeof item?.addedAt).toBe("string");
  });

  it("statusChanged меняет статус существующей записи", () => {
    const afterAdd = collectionReducer(
      undefined,
      itemAdded({
        movieId: 1,
        title: "Матрица",
        posterUrl: null,
        status: "want",
      }),
    );

    const afterStatusChange = collectionReducer(
      afterAdd,
      statusChanged({ movieId: 1, status: "watched" }),
    );

    expect(selectById(afterStatusChange, 1)?.status).toBe("watched");
  });

  it("itemRemoved убирает запись из коллекции", () => {
    const afterAdd = collectionReducer(
      undefined,
      itemAdded({
        movieId: 1,
        title: "Матрица",
        posterUrl: null,
        status: "want",
      }),
    );

    const afterRemove = collectionReducer(afterAdd, itemRemoved({ movieId: 1 }));

    expect(selectAll(afterRemove)).toHaveLength(0);
  });

  it("noteSaved сохраняет заметку у существующей записи", () => {
    const afterAdd = collectionReducer(
      undefined,
      itemAdded({
        movieId: 1,
        title: "Матрица",
        posterUrl: null,
        status: "watched",
      }),
    );

    const afterNote = collectionReducer(
      afterAdd,
      noteSaved({ movieId: 1, note: { rating: 9, text: "Шедевр" } }),
    );

    expect(selectById(afterNote, 1)?.note).toEqual({ rating: 9, text: "Шедевр" });
  });
});
