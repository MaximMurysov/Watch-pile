import { render, screen } from "@testing-library/react";

import type { Movie } from "@/entities/movie";

import { MovieDetails } from "./movie-details";

const movie: Movie = {
  id: 1,
  name: "Матрица",
  year: 1999,
  description: "Хакер узнаёт правду о реальности",
  slogan: "Добро пожаловать в реальный мир",
  movieLength: 136,
  genres: [{ name: "фантастика" }, { name: null }],
  poster: { url: "https://example.com/poster.jpg", previewUrl: null },
  rating: { kp: 8.7, imdb: null },
};

describe("MovieDetails", () => {
  it("рендерит название, слоган, год, хронометраж, жанры, рейтинг и описание", () => {
    render(<MovieDetails movie={movie} />);

    expect(
      screen.getByRole("heading", { name: "Матрица" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("«Добро пожаловать в реальный мир»"),
    ).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("136 мин")).toBeInTheDocument();
    expect(screen.getByText("фантастика")).toBeInTheDocument();
    expect(screen.getByText("8.7")).toBeInTheDocument();
    expect(
      screen.getByText("Хакер узнаёт правду о реальности"),
    ).toBeInTheDocument();
    expect(screen.getByAltText("Матрица")).toHaveAttribute(
      "src",
      "https://example.com/poster.jpg",
    );
  });

  it("показывает заглушку постера и плейсхолдеры для отсутствующих полей", () => {
    const bareMovie: Movie = {
      id: 2,
      name: null,
      year: null,
      description: null,
      slogan: null,
      movieLength: null,
      genres: null,
      poster: null,
      rating: null,
    };

    render(<MovieDetails movie={bareMovie} />);

    expect(screen.getByText("Нет постера")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Без названия" }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("—")).toHaveLength(3);
  });
});
