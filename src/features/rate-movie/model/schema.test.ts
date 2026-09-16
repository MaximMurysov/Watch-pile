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

  describe("getLocalDateString: использует местные компоненты даты, а не UTC", () => {
    afterEach(() => {
      jest.restoreAllMocks();
    });

    // Рантайм-смена process.env.TZ здесь не годится: на GitHub Actions
    // (Linux) она не действует на Date, если тот уже был использован
    // раньше в этом процессе (похоже на кэширование таймзоны в V8/ICU —
    // на Windows та же смена TZ отрабатывала, что и маскировало проблему
    // при локальном прогоне). Поэтому не полагаемся на реальную
    // таймзону процесса вообще: подменяем сами методы getFullYear/
    // getMonth/getDate у конкретного объекта Date значениями, которые
    // вернул бы Date в Москве (UTC+3) для момента 22:00 UTC 1 июня —
    // это 01:00 2 июня. Если бы getLocalDateString была реализована
    // через toISOString()/UTC-геттеры, эта подмена ничего бы не изменила
    // и тест ловил бы регрессию.
    it("для 22:00 UTC 1 июня возвращает 2024-06-02, если местные геттеры говорят о 2 июня", () => {
      const momentNearMidnightUtc = new Date("2024-06-01T22:00:00Z");
      jest.spyOn(momentNearMidnightUtc, "getFullYear").mockReturnValue(2024);
      jest.spyOn(momentNearMidnightUtc, "getMonth").mockReturnValue(5);
      jest.spyOn(momentNearMidnightUtc, "getDate").mockReturnValue(2);

      expect(getLocalDateString(momentNearMidnightUtc)).toBe("2024-06-02");
    });
  });
});
