import type { CollectionItem } from "@/entities/collection-item";

import { collectionItemToMovie } from "./collection-item-to-movie";

describe("collectionItemToMovie", () => {
  it("переносит id/название/постер, остальные поля Movie обнуляет", () => {
    const item: CollectionItem = {
      movieId: 1,
      title: "Матрица",
      posterUrl: "https://example.com/poster.jpg",
      status: "want",
      addedAt: "2024-01-01T00:00:00.000Z",
      note: null,
    };

    expect(collectionItemToMovie(item)).toEqual({
      id: 1,
      name: "Матрица",
      year: null,
      description: null,
      slogan: null,
      movieLength: null,
      genres: null,
      poster: {
        url: "https://example.com/poster.jpg",
        previewUrl: "https://example.com/poster.jpg",
      },
      rating: null,
    });
  });

  it("без названия и постера не падает, отдаёт null вместо пустой строки", () => {
    const item: CollectionItem = {
      movieId: 2,
      title: null,
      posterUrl: null,
      status: "watched",
      addedAt: "2024-01-01T00:00:00.000Z",
      note: null,
    };

    const movie = collectionItemToMovie(item);

    expect(movie.name).toBeNull();
    expect(movie.poster).toBeNull();
  });
});
