import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { env } from "@/shared/config/env";

/**
 * Одно сообщение для любого эндпоинта, чей ответ не прошёл проверку
 * схемы (Zod, через rawResponseSchema/responseSchema у injectEndpoints).
 * Причина всегда видна в консоли (onSchemaFailure ниже), пользователю
 * технический разбор ZodError не нужен.
 */
export const SCHEMA_VALIDATION_ERROR_MESSAGE =
  "Сервер вернул данные в неожиданном формате";

/**
 * Единый createApi с пустыми endpoints. Конкретные эндпоинты
 * добавляются через injectEndpoints в entities/<name>/api.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: POISKKINO_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("X-API-KEY", env.VITE_POISKKINO_API_TOKEN);
      return headers;
    },
  }),
  tagTypes: ["Movie", "MovieSearch"],
  /**
   * Без catchSchemaFailure ошибка схемы — необработанное исключение:
   * RTK Query кладёт в error произвольный SerializedError (JSON-дамп
   * ZodError) и пишет в консоль "unhandled error". Здесь она приводится
   * к тому же виду FetchBaseQueryError, что и сетевые ошибки — компонент
   * разбирает один тип ошибки, а не два разных.
   */
  onSchemaFailure: (error, info) => {
    console.error(
      `Ответ эндпоинта "${info.endpoint}" не прошёл проверку схемы`,
      error.issues,
    );
  },
  catchSchemaFailure: () => ({
    status: "CUSTOM_ERROR" as const,
    error: SCHEMA_VALIDATION_ERROR_MESSAGE,
  }),
  endpoints: () => ({}),
});
