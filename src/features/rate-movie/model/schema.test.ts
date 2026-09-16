/// <reference types="node" />
import { getLocalDateString, rateMovieFormSchema } from "./schema";

const validNote = {
  rating: 8,
  watchedAt: "2024-01-15",
  tags: ["пересмотр"],
  text: "Отличный фильм",
};

describe("rateMovieFormSchema", () => {
  it("принимает валидную заметку", () => {
    const result = rateMovieFormSchema.safeParse(validNote);

    expect(result.success).toBe(true);
  });

  it("отклоняет оценку вне диапазона 1–10", () => {
    const result = rateMovieFormSchema.safeParse({ ...validNote, rating: 11 });

    expect(result.success).toBe(false);
  });

  it("отклоняет отсутствующую оценку", () => {
    const noteWithoutRating = {
      watchedAt: validNote.watchedAt,
      tags: validNote.tags,
      text: validNote.text,
    };
    const result = rateMovieFormSchema.safeParse(noteWithoutRating);

    expect(result.success).toBe(false);
  });

  it("отклоняет дату просмотра в будущем", () => {
    const result = rateMovieFormSchema.safeParse({ ...validNote, watchedAt: "2999-01-01" });

    expect(result.success).toBe(false);
  });

  it("отклоняет отсутствующую дату просмотра", () => {
    const result = rateMovieFormSchema.safeParse({ ...validNote, watchedAt: "" });

    expect(result.success).toBe(false);
  });

  it("отклоняет слишком длинный текст заметки", () => {
    const result = rateMovieFormSchema.safeParse({
      ...validNote,
      text: "а".repeat(2001),
    });

    expect(result.success).toBe(false);
  });

  describe("getLocalDateString: часовой пояс восточнее UTC", () => {
    const originalTz = process.env.TZ;

    afterEach(() => {
      process.env.TZ = originalTz;
    });

    // Тестируем саму функцию с явной датой, а не через rateMovieFormSchema +
    // jest.useFakeTimers(): подменённый "сейчас" на CI ненадёжно учитывает
    // рантайм-смену process.env.TZ (падало на GitHub Actions при зелёном
    // прогоне локально), а без fake timers нативный Date().getFullYear()
    // всегда читает текущий TZ.
    it("возвращает местную дату, а не UTC", () => {
      process.env.TZ = "Europe/Moscow";
      // 22:00 UTC 1 июня — в Москве (UTC+3) уже 01:00 2 июня.
      const momentNearMidnightUtc = new Date("2024-06-01T22:00:00Z");

      expect(getLocalDateString(momentNearMidnightUtc)).toBe("2024-06-02");
    });
  });
});
