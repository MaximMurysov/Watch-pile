import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { MemoryRouter } from "react-router-dom";

import { useSearchMovieParams } from "./use-search-movie-params";

function renderWithRouter(initialEntry: string) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <MemoryRouter initialEntries={[initialEntry]}>{children}</MemoryRouter>
  );
  return renderHook(() => useSearchMovieParams(), { wrapper });
}

describe("useSearchMovieParams", () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("по умолчанию отдаёт пустой запрос и первую страницу", () => {
    const { result } = renderWithRouter("/");

    expect(result.current.query).toBe("");
    expect(result.current.page).toBe(1);
  });

  it("читает query и page из URL", () => {
    const { result } = renderWithRouter("/?query=matrix&page=3");

    expect(result.current.query).toBe("matrix");
    expect(result.current.page).toBe(3);
  });

  it("зажимает page из URL за пределами лимита бесплатного ключа", () => {
    const { result } = renderWithRouter("/?page=25");

    expect(result.current.page).toBe(10);
  });

  it("setQuery применяет значение только после дебаунса и сбрасывает page", () => {
    const { result } = renderWithRouter("/?query=old&page=4");

    act(() => {
      result.current.setQuery("matrix");
    });
    expect(result.current.query).toBe("old");

    act(() => {
      jest.runAllTimers();
    });
    expect(result.current.query).toBe("matrix");
    expect(result.current.page).toBe(1);
  });

  it("несколько setQuery подряд до истечения дебаунса применяют только последнее значение", () => {
    const { result } = renderWithRouter("/");

    act(() => {
      result.current.setQuery("m");
      result.current.setQuery("ma");
      result.current.setQuery("mat");
    });
    act(() => {
      jest.runAllTimers();
    });

    expect(result.current.query).toBe("mat");
  });

  it("setPage применяется сразу и зажимается лимитом", () => {
    const { result } = renderWithRouter("/?query=matrix");

    act(() => {
      result.current.setPage(2);
    });
    expect(result.current.page).toBe(2);

    act(() => {
      result.current.setPage(50);
    });
    expect(result.current.page).toBe(10);
  });
});
