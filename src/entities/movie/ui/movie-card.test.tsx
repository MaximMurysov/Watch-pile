import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/shared/lib/test";

import type { Movie } from "../model";
import { MovieCard } from "./movie-card";

const baseMovie: Movie = {
  id: 666,
  name: "Матрица",
  year: 1999,
  description: null,
  slogan: null,
  movieLength: null,
  genres: null,
  poster: {
    url: "https://example.com/full.jpg",
    previewUrl: "https://example.com/preview.jpg",
  },
  rating: { kp: 8.489, imdb: null },
};

describe("MovieCard", () => {
  it("рендерит название, год, округлённый рейтинг и alt у постера", () => {
    renderWithProviders(<MovieCard movie={baseMovie} />);

    expect(screen.getByRole("link", { name: /матрица/i })).toBeInTheDocument();
    expect(screen.getByText("1999")).toBeInTheDocument();
    expect(screen.getByText("8.5")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Матрица" })).toHaveAttribute(
      "src",
      "https://example.com/preview.jpg",
    );
  });

  it("рендерит заглушку вместо постера, если его нет — бесплатный тариф отдаёт его не всегда", () => {
    renderWithProviders(<MovieCard movie={{ ...baseMovie, poster: null }} />);

    expect(screen.queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByText(/нет постера/i)).toBeInTheDocument();
  });

  it("показывает плейсхолдер вместо рейтинга, если его нет", () => {
    renderWithProviders(<MovieCard movie={{ ...baseMovie, rating: null }} />);

    expect(screen.getByText("—")).toBeInTheDocument();
  });
});
