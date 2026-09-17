import { screen, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import { Route, Routes } from "react-router-dom";

import { collectionReducer } from "@/entities/collection-item";
import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { renderWithProviders, server } from "@/shared/lib/test";

import { MoviePage } from "./movie-page";

function renderMoviePage(initialPath: string) {
  return renderWithProviders(
    <Routes>
      <Route path="/movie/:movieId" element={<MoviePage />} />
    </Routes>,
    {
      initialEntries: [initialPath],
      extraReducers: { collectionItems: collectionReducer },
    },
  );
}

describe("MoviePage", () => {
  it("happy path: показывает детали фильма", async () => {
    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/1`, () =>
        HttpResponse.json({ id: 1, name: "Матрица", year: 1999 }),
      ),
    );

    renderMoviePage("/movie/1");

    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: "Матрица" }),
      ).toBeInTheDocument();
    });
  });

  it("API отвечает 404: показывает «Фильм не найден» и меняет заголовок вкладки", async () => {
    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/404`, () =>
        HttpResponse.json(null, { status: 404 }),
      ),
    );

    renderMoviePage("/movie/404");

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent("Фильм не найден");
    });
    expect(document.title).toBe("Фильм не найден · Watchpile");
  });

  it("невалидный id в адресе: показывает «Фильм не найден» без запроса и с тем же заголовком вкладки", () => {
    renderMoviePage("/movie/not-a-number");

    expect(screen.getByRole("alert")).toHaveTextContent("Фильм не найден");
    expect(document.title).toBe("Фильм не найден · Watchpile");
  });
});
