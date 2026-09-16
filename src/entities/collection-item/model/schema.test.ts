import { collectionItemSchema, parseCollectionItems } from "./schema";

const validItem = {
  movieId: 1,
  title: "Матрица",
  posterUrl: "https://example.com/poster.jpg",
  status: "want",
  addedAt: "2026-09-16T10:00:00.000Z",
};

describe("collectionItemSchema", () => {
  it("парсит валидную запись коллекции", () => {
    const result = collectionItemSchema.safeParse(validItem);

    expect(result.success).toBe(true);
  });

  it("парсит запись с заметкой", () => {
    const result = collectionItemSchema.safeParse({
      ...validItem,
      status: "watched",
      note: {
        rating: 9,
        watchedAt: "2026-09-15",
        tags: ["пересмотр"],
        text: "Всё ещё шедевр",
      },
    });

    expect(result.success).toBe(true);
  });

  it("отвергает запись без movieId", () => {
    const itemWithoutMovieId: Record<string, unknown> = { ...validItem };
    delete itemWithoutMovieId.movieId;

    const result = collectionItemSchema.safeParse(itemWithoutMovieId);

    expect(result.success).toBe(false);
  });

  it("отвергает запись с неизвестным статусом", () => {
    const result = collectionItemSchema.safeParse({
      ...validItem,
      status: "watching",
    });

    expect(result.success).toBe(false);
  });
});

describe("parseCollectionItems", () => {
  it("отбрасывает невалидные записи и предупреждает в консоли, не роняя остальные", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const items = parseCollectionItems([
      validItem,
      { title: "Без movieId — битая запись" },
    ]);

    expect(items).toHaveLength(1);
    expect(items[0].movieId).toBe(1);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
