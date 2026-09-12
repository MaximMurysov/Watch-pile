import { formatRating } from "./format-rating";

describe("formatRating", () => {
  it("округляет рейтинг до одного знака после запятой", () => {
    expect(formatRating(8.489)).toBe("8.5");
  });

  it("не добавляет лишний знак, если рейтинг уже с одним знаком", () => {
    expect(formatRating(7)).toBe("7.0");
  });
});
