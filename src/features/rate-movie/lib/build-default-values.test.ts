import { buildDefaultValues } from "./build-default-values";

describe("buildDefaultValues", () => {
  it("переносит поля существующей заметки", () => {
    expect(
      buildDefaultValues({
        rating: 9,
        watchedAt: "2024-05-01",
        tags: ["пересмотр"],
        text: "Заметка",
      }),
    ).toEqual({
      rating: 9,
      watchedAt: "2024-05-01",
      tags: ["пересмотр"],
      text: "Заметка",
    });
  });

  it("подставляет пустые значения, если заметки ещё нет", () => {
    expect(buildDefaultValues(undefined)).toEqual({
      rating: undefined,
      watchedAt: undefined,
      tags: [],
      text: null,
    });
  });

  it("подставляет пустой список тегов, если в заметке tags отсутствует", () => {
    expect(
      buildDefaultValues({ rating: 5, watchedAt: "2024-05-01", tags: null, text: null }),
    ).toEqual({
      rating: 5,
      watchedAt: "2024-05-01",
      tags: [],
      text: null,
    });
  });
});
