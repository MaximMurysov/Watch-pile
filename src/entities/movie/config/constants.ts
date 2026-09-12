/** Размер постера: превью — для карточек в сетке, полный — для страницы фильма. */
export const POSTER_SIZE = {
  preview: "preview",
  full: "full",
} as const;

export type PosterSize = (typeof POSTER_SIZE)[keyof typeof POSTER_SIZE];

/** Показываем вместо отсутствующих года и рейтинга — бесплатный тариф API отдаёт их не для каждого фильма. */
export const UNKNOWN_VALUE_PLACEHOLDER = "—";

/** Показываем вместо названия, если API его не прислал. */
export const UNKNOWN_TITLE_PLACEHOLDER = "Без названия";

/** Кинопоиск отдаёт рейтинг вроде 8.489 — в интерфейсе округляем до одного знака. */
export const RATING_DECIMAL_PLACES = 1;
