import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { useLocation } from "react-router-dom";

import { collectionReducer } from "@/entities/collection-item";
import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { renderWithProviders, server } from "@/shared/lib/test";

import { SearchPage } from "./search-page";

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

    expect(
      screen.getByText("Введите запрос, чтобы начать поиск"),
    ).toBeInTheDocument();

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
});
