import { z } from "zod";

import { collectionNoteSchema } from "@/entities/collection-item";

import { MAX_NOTE_TEXT_LENGTH, RATING_RANGE } from "../config";

/**
 * `toISOString()` даёт UTC-дату — в часовых поясах восточнее UTC (вся
 * Россия) в начале суток по местному времени это ещё «вчера» по UTC,
 * из-за чего реальное «сегодня» ошибочно отклонялось бы как будущее.
 * Поэтому берём локальные компоненты даты, а не UTC. Экспортирована для
 * прямого юнит-теста этого поведения без завязки на «сейчас» — так тест
 * не зависит от `jest.useFakeTimers()`, который на CI ненадёжно
 * взаимодействует с рантайм-сменой `process.env.TZ` (см. schema.test.ts).
 */
export function getLocalDateString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isNotInFuture(date: string): boolean {
  return date <= getLocalDateString(new Date());
}

/**
 * Ужесточает `collectionNoteSchema` для формы: в хранилище коллекции
 * заметка опциональна целиком, но раз пользователь открыл форму и
 * сохраняет её — оценка и дата просмотра обязательны.
 */
export const rateMovieFormSchema = collectionNoteSchema.extend({
  rating: z
    .number({ error: "Укажите оценку от 1 до 10" })
    // Пустое числовое поле ввода RHF конвертирует в NaN, а не в undefined
    // (valueAsNumber) — typeof NaN === "number", поэтому z.number() сам
    // по себе его пропускает, а min/max с NaN тоже всегда «проходят».
    .refine(Number.isFinite, "Укажите оценку от 1 до 10")
    .min(RATING_RANGE.min, `Оценка должна быть от ${RATING_RANGE.min} до ${RATING_RANGE.max}`)
    .max(RATING_RANGE.max, `Оценка должна быть от ${RATING_RANGE.min} до ${RATING_RANGE.max}`),
  watchedAt: z
    .string({ error: "Укажите дату просмотра" })
    .min(1, "Укажите дату просмотра")
    .refine(isNotInFuture, "Дата просмотра не может быть в будущем"),
  tags: z.array(z.string()),
  text: z
    .string()
    .max(MAX_NOTE_TEXT_LENGTH, `Текст не длиннее ${MAX_NOTE_TEXT_LENGTH} символов`)
    .nullish(),
});

export type RateMovieFormValues = z.infer<typeof rateMovieFormSchema>;
