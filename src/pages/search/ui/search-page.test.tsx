import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useLocation } from "react-router-dom";

import { collectionReducer } from "@/entities/collection-item";
import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { renderWithProviders, server } from "@/shared/lib/test";

import { FEATURED_MOVIE_IDS } from "../config";

import { SearchPage } from "./search-page";

function mockFeaturedMovies() {
  server.use(
    ...FEATURED_MOVIE_IDS.map((movieId) =>
      http.get(`${POISKKINO_API_BASE_URL}/movie/${movieId}`, () =>
        HttpResponse.json({ id: movieId, name: `Фильм ${movieId}`, year: 2000 }),
      ),
    ),
  );
}

function renderSearchPage(ui: React.ReactElement, initialEntries?: string[]) {
  return renderWithProviders(ui, {
    initialEntries,
    extraReducers: { collectionItems: collectionReducer },
  });
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
}

function getLocationSearchParams() {
  const search = screen.getByTestId("location").textContent ?? "";
  return new URLSearchParams(search);
}

describe("SearchPage", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("happy path: ввод запроса показывает карточки и обновляет URL", async () => {
    mockFeaturedMovies();
    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/search`, () =>
        HttpResponse.json({
          docs: [{ id: 1, name: "Матрица" }],
          page: 1,
          limit: 10,
          pages: 1,
          total: 1,
        }),
      ),
    );

    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    renderSearchPage(
      <>
        <SearchPage />
        <LocationProbe />
      </>,
    );

    await waitFor(() => {
      expect(screen.getByText(`Фильм ${FEATURED_MOVIE_IDS[0]}`)).toBeInTheDocument();
    });

    await user.type(screen.getByRole("searchbox"), "матрица");

    await waitFor(() => {
      expect(screen.getByText("Матрица")).toBeInTheDocument();
    });

    const params = getLocationSearchParams();
    expect(params.get("query")).toBe("матрица");
    expect(params.get("page")).toBe("1");
  });

  it("ошибка API: показывает сообщение вместо пустой сетки", async () => {
    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/search`, () =>
        HttpResponse.json(null, { status: 500 }),
      ),
    );

    renderSearchPage(<SearchPage />, ["/?query=матрица&page=1"]);

    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(
        "Сервер вернул ошибку (500)",
      );
    });
    expect(screen.queryByText("Матрица")).not.toBeInTheDocument();
  });

  describe("подборка на пустом запросе", () => {
    it("happy path: показывает фильмы из курируемого списка", async () => {
      mockFeaturedMovies();

      renderSearchPage(<SearchPage />);

      await waitFor(() => {
        for (const movieId of FEATURED_MOVIE_IDS) {
          expect(screen.getByText(`Фильм ${movieId}`)).toBeInTheDocument();
        }
      });
    });

    it("одна карточка не загрузилась: остальные фильмы всё равно показаны", async () => {
      const [failingId, ...okIds] = FEATURED_MOVIE_IDS;
      server.use(
        http.get(`${POISKKINO_API_BASE_URL}/movie/${failingId}`, () =>
          HttpResponse.json(null, { status: 500 }),
        ),
        ...okIds.map((movieId) =>
          http.get(`${POISKKINO_API_BASE_URL}/movie/${movieId}`, () =>
            HttpResponse.json({ id: movieId, name: `Фильм ${movieId}`, year: 2000 }),
          ),
        ),
      );

      renderSearchPage(<SearchPage />);

      await waitFor(() => {
        expect(screen.getByText(`Фильм ${okIds[0]}`)).toBeInTheDocument();
      });
      expect(screen.queryByText(`Фильм ${failingId}`)).not.toBeInTheDocument();
    });
  });
});
