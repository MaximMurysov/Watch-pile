import { renderHook } from "@testing-library/react";

import { useDocumentTitle } from "./use-document-title";

describe("useDocumentTitle", () => {
  it("подставляет переданный заголовок с суффиксом Watchpile", () => {
    renderHook(() => useDocumentTitle("Поиск фильмов"));

    expect(document.title).toBe("Поиск фильмов · Watchpile");
  });

  it("для пустого заголовка оставляет только Watchpile", () => {
    renderHook(() => useDocumentTitle(""));

    expect(document.title).toBe("Watchpile");
  });

  it("обновляет заголовок при повторном рендере с новым значением", () => {
    const { rerender } = renderHook(({ title }) => useDocumentTitle(title), {
      initialProps: { title: "Коллекция" },
    });
    expect(document.title).toBe("Коллекция · Watchpile");

    rerender({ title: "Фильм" });

    expect(document.title).toBe("Фильм · Watchpile");
  });
});
