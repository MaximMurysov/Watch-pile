import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  COLLECTION_STORAGE_KEY,
  collectionPersistenceMiddleware,
  collectionReducer,
  itemAdded,
} from "@/entities/collection-item";
import { renderWithProviders } from "@/shared/lib/test";

import { RateMovieForm } from "./rate-movie-form";

const MOVIE_ID = 1;

function getPersistedNote(): unknown {
  const items = JSON.parse(localStorage.getItem(COLLECTION_STORAGE_KEY) ?? "[]") as Array<{
    movieId: number;
    note?: unknown;
  }>;
  return items.find((item) => item.movieId === MOVIE_ID)?.note;
}

function renderForm() {
  const result = renderWithProviders(<RateMovieForm movieId={MOVIE_ID} />, {
    extraReducers: { collectionItems: collectionReducer },
    extraMiddleware: [collectionPersistenceMiddleware.middleware],
  });

  act(() => {
    result.store.dispatch(
      itemAdded({ movieId: MOVIE_ID, title: "Матрица", posterUrl: null, status: "watched" }),
    );
  });

  return result;
}

describe("RateMovieForm", () => {
  it("не рендерится, если статус записи не «посмотрел»", () => {
    renderWithProviders(<RateMovieForm movieId={MOVIE_ID} />, {
      extraReducers: { collectionItems: collectionReducer },
    });

    expect(screen.queryByRole("button", { name: "Сохранить заметку" })).not.toBeInTheDocument();
  });

  it("happy path: сохраняет валидную заметку, она остаётся в форме после перерендера", async () => {
    const user = userEvent.setup();
    const { rerender } = renderForm();

    await user.type(screen.getByLabelText("Оценка"), "9");
    await user.type(screen.getByLabelText("Дата просмотра"), "2024-01-15");
    await user.type(screen.getByLabelText("Теги"), "пересмотр");
    await user.click(screen.getByRole("button", { name: "Добавить тег" }));
    await user.type(screen.getByLabelText("Текст заметки"), "Отличный фильм");
    await user.click(screen.getByRole("button", { name: "Сохранить заметку" }));

    expect(getPersistedNote()).toEqual({
      rating: 9,
      watchedAt: "2024-01-15",
      tags: ["пересмотр"],
      text: "Отличный фильм",
    });

    rerender(<RateMovieForm movieId={MOVIE_ID} />);

    expect(screen.getByLabelText("Оценка")).toHaveValue(9);
    expect(screen.getByLabelText("Дата просмотра")).toHaveValue("2024-01-15");
    expect(screen.getByText("пересмотр")).toBeInTheDocument();
    expect(screen.getByLabelText("Текст заметки")).toHaveValue("Отличный фильм");
  });

  it("оценка вне диапазона: показывает ошибку и не сохраняет заметку", async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText("Оценка"), "15");
    await user.type(screen.getByLabelText("Дата просмотра"), "2024-01-15");
    await user.click(screen.getByRole("button", { name: "Сохранить заметку" }));

    expect(await screen.findByText("Оценка должна быть от 1 до 10")).toBeInTheDocument();
    expect(getPersistedNote()).toBeUndefined();
  });
});
