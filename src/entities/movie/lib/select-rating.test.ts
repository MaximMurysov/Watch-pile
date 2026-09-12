import { selectRating } from "./select-rating";

describe("selectRating", () => {
  it("возвращает рейтинг Кинопоиска, если он есть", () => {
    expect(selectRating({ kp: 8.5, imdb: 8.7 })).toBe(8.5);
  });

  it("падает обратно на IMDb, если kp равен нулю — так API помечает неоценённые фильмы", () => {
    expect(selectRating({ kp: 0, imdb: 7.2 })).toBe(7.2);
  });

  it("возвращает null, если оба рейтинга нулевые или отсутствуют", () => {
    expect(selectRating({ kp: 0, imdb: 0 })).toBeNull();
    expect(selectRating(null)).toBeNull();
    expect(selectRating(undefined)).toBeNull();
  });
});
