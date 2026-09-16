import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  COLLECTION_STORAGE_KEY,
  collectionPersistenceMiddleware,
  collectionReducer,
} from "@/entities/collection-item";
import type { Movie } from "@/entities/movie";
import { renderWithProviders } from "@/shared/lib/test";

import { CollectionButton } from "./collection-button";

const movie: Movie = {
  id: 1,
  name: "Матрица",
  year: 1999,
  description: null,
  slogan: null,
  movieLength: null,
  genres: null,
  poster: { url: "https://example.com/poster.jpg", previewUrl: null },
  rating: null,
};

function renderButton() {
  return renderWithProviders(<CollectionButton movie={movie} />, {
    extraReducers: { collectionItems: collectionReducer },
    extraMiddleware: [collectionPersistenceMiddleware.middleware],
  });
}

function getPersistedItems() {
  return JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) ?? "[]");
}

describe("CollectionButton", () => {
  it("happy path: цикл «хочу посмотреть» → «посмотрел» → «убрать» меняет подпись и localStorage", async () => {
    const user = userEvent.setup();
    renderButton();

    const button = screen.getByRole("button", { name: "Хочу посмотреть" });
    await user.click(button);

    expect(
      screen.getByRole("button", { name: "Посмотрел" }),
    ).toBeInTheDocument();
    expect(getPersistedItems()).toEqual([
      expect.objectContaining({ movieId: 1, status: "want", title: "Матрица" }),
    ]);

    await user.click(screen.getByRole("button", { name: "Посмотрел" }));

    expect(screen.getByRole("button", { name: "Убрать" })).toBeInTheDocument();
    expect(getPersistedItems()).toEqual([
      expect.objectContaining({ movieId: 1, status: "watched" }),
    ]);

    await user.click(screen.getByRole("button", { name: "Убрать" }));

    expect(
      screen.getByRole("button", { name: "Хочу посмотреть" }),
    ).toBeInTheDocument();
    expect(getPersistedItems()).toEqual([]);
  });
});
