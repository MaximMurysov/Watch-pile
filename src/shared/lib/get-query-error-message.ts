import type { SerializedError } from "@reduxjs/toolkit";
import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";

const NETWORK_ERROR_MESSAGE =
  "Не удалось выполнить запрос. Проверьте подключение к интернету";
const UNKNOWN_ERROR_MESSAGE = "Не удалось загрузить данные";

/**
 * Единый перевод ошибки RTK Query в текст для пользователя. Общий для
 * любого эндпоинта baseApi — переиспользуется всеми виджетами, которые
 * показывают error из хука запроса, а не только widgets/movie-grid.
 */
export function getQueryErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
): string {
  if (!error) {
    return UNKNOWN_ERROR_MESSAGE;
  }

  if (!("status" in error)) {
    return error.message ?? UNKNOWN_ERROR_MESSAGE;
  }

  switch (error.status) {
    case "FETCH_ERROR":
    case "TIMEOUT_ERROR":
      return NETWORK_ERROR_MESSAGE;
    case "PARSING_ERROR":
    case "CUSTOM_ERROR":
      return error.error;
    default:
      return `Сервер вернул ошибку (${error.status})`;
  }
}
