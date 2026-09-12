import { configureStore } from "@reduxjs/toolkit";
import { renderHook, waitFor } from "@testing-library/react";
import { http, HttpResponse } from "msw";
import type { ReactNode } from "react";
import { Provider } from "react-redux";

import { baseApi, SCHEMA_VALIDATION_ERROR_MESSAGE } from "@/shared/api";
import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { server } from "@/shared/lib/test";

import { useGetMovieByIdQuery, useSearchMoviesQuery } from "./movie-api";

/**
 * Свежий store на каждый вызов — RTK Query кэш не должен течь
 * между тестами (то же правило, что в renderWithProviders, но здесь
 * нужен только Provider — хук не рендерит DOM).
 */
function renderQuery<T>(callback: () => T) {
  const store = configureStore({
    reducer: { [baseApi.reducerPath]: baseApi.reducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware),
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>{children}</Provider>
  );

  return renderHook(callback, { wrapper });
}

describe("movieApi", () => {
  it("searchMovies отправляет query и page и возвращает распарсенный ответ", async () => {
    let capturedParams: URLSearchParams | undefined;

    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/search`, ({ request }) => {
        capturedParams = new URL(request.url).searchParams;

        return HttpResponse.json({
          docs: [{ id: 1, name: "Матрица" }],
          page: 1,
          limit: 10,
          pages: 1,
          total: 1,
        });
      }),
    );

    const { result } = renderQuery(() =>
      useSearchMoviesQuery({ query: "матрица", page: 1 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(capturedParams?.get("query")).toBe("матрица");
    expect(capturedParams?.get("page")).toBe("1");
    expect(result.current.data?.docs[0].name).toBe("Матрица");
  });

  it("searchMovies отбрасывает битые записи из docs, но не всю выдачу", async () => {
    const warnSpy = jest.spyOn(console, "warn").mockImplementation(() => {});

    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/search`, () =>
        HttpResponse.json({
          docs: [{ id: 1, name: "Матрица" }, { name: "Без id" }],
          page: 1,
          limit: 10,
          pages: 1,
          total: 2,
        }),
      ),
    );

    const { result } = renderQuery(() =>
      useSearchMoviesQuery({ query: "матрица", page: 1 }),
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data?.docs).toHaveLength(1);
    expect(warnSpy).toHaveBeenCalled();

    warnSpy.mockRestore();
  });

  it("getMovieById завершается предсказуемой ошибкой, если ответ не проходит валидацию схемы", async () => {
    server.use(
      http.get(`${POISKKINO_API_BASE_URL}/movie/:id`, () =>
        HttpResponse.json({ nameWithoutId: "Матрица" }),
      ),
    );

    const { result } = renderQuery(() => useGetMovieByIdQuery(1));

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Ошибка схемы должна выглядеть как обычная FetchBaseQueryError
    // (status + error), а не как сырой SerializedError с дампом ZodError.
    expect(result.current.error).toEqual({
      status: "CUSTOM_ERROR",
      error: SCHEMA_VALIDATION_ERROR_MESSAGE,
    });
  });
});
