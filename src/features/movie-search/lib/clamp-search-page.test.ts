import { clampSearchPage } from "./clamp-search-page";

describe("clampSearchPage", () => {
  it("возвращает страницу без изменений, если она в допустимом диапазоне", () => {
    expect(clampSearchPage(3)).toBe(3);
  });

  it("поднимает страницу до минимума, если она меньше 1", () => {
    expect(clampSearchPage(0)).toBe(1);
    expect(clampSearchPage(-5)).toBe(1);
  });

  it("опускает страницу до максимума, если она больше лимита бесплатного ключа", () => {
    expect(clampSearchPage(11)).toBe(10);
    expect(clampSearchPage(999)).toBe(10);
  });

  it("возвращает минимум для нечислового значения (NaN)", () => {
    expect(clampSearchPage(Number.NaN)).toBe(1);
  });
});
