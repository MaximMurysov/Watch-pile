import { movieSchema, parseMovieDocs } from "./schema";

describe("movieSchema", () => {
  it("парсит валидный ответ poiskkino.dev", () => {
    const result = movieSchema.safeParse({
      id: 666,
      name: "Матрица",
      year: 1999,
      description: "Хакер узнаёт правду о реальности",
      slogan: "Добро пожаловать в реальный мир",
      movieLength: 136,
      genres: [{ name: "фантастика" }],
      poster: {
        url: "https://example.com/poster.jpg",
        previewUrl: "https://example.com/poster-preview.jpg",
      },
      rating: { kp: 8.5, imdb: 8.7 },
    });

    expect(result.success).toBe(true);
  });

  it("парсит ответ с null-полями — API помечает их так за неимением данных", () => {
    const result = movieSchema.safeParse({
      id: 1,
      name: null,
      poster: null,
      rating: null,
    });

    expect(result.success).toBe(true);
  });

  it("отвергает ответ без id и объясняет причину в сообщении об ошибке", () => {
    const result = movieSchema.safeParse({ name: "Матрица" });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toMatch(/id/i);
    }
  });

  it("принимает жанр без имени — GenreItem не объявляет его обязательным в OpenAPI-схеме", () => {
    const result = movieSchema.safeParse({ id: 1, genres: [{ id: 6 }] });

    expect(result.success).toBe(true);
  });
});

describe("parseMovieDocs", () => {
  it("отбрасывает невалидные записи и оставляет валидные, не роняя всю выдачу", () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    const docs = parseMovieDocs([
      { id: 1, name: "Матрица" },
      { name: "Без id — битая запись" },
      { id: 2, name: "Матрица: Перезагрузка" },
    ]);

    expect(docs).toHaveLength(2);
    expect(docs.map((movie) => movie.id)).toEqual([1, 2]);
    expect(warnSpy).toHaveBeenCalledTimes(1);

    warnSpy.mockRestore();
  });
});
