import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import type { Movie } from "@/entities/movie";

import { MovieGrid } from "./movie-grid";

function renderGrid(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

const movie: Movie = {
  id: 1,
  name: "Матрица",
  year: 1999,
  description: null,
  slogan: null,
  movieLength: null,
  genres: null,
  poster: null,
  rating: null,
};

describe("MovieGrid", () => {
  it("показывает индикатор загрузки, пока идёт запрос", () => {
    renderGrid(
      <MovieGrid
        movies={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
        isLoading
        emptyMessage="Ничего не найдено"
      />,
    );

    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("показывает сообщение об ошибке вместо сетки", () => {
    renderGrid(
      <MovieGrid
        movies={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
        isLoading={false}
        error={{ status: 500, data: null }}
        emptyMessage="Ничего не найдено"
      />,
    );

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Сервер вернул ошибку (500)",
    );
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("показывает пустое состояние, если фильмов нет", () => {
    renderGrid(
      <MovieGrid
        movies={[]}
        page={1}
        totalPages={1}
        onPageChange={jest.fn()}
        isLoading={false}
        emptyMessage="Ничего не найдено"
      />,
    );

    expect(screen.getByText("Ничего не найдено")).toBeInTheDocument();
  });

  it("рендерит карточки фильмов и пагинацию", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    renderGrid(
      <MovieGrid
        movies={[movie]}
        page={1}
        totalPages={2}
        onPageChange={onPageChange}
        isLoading={false}
        emptyMessage="Ничего не найдено"
      />,
    );

    expect(screen.getByText("Матрица")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Вперёд" }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });
});
