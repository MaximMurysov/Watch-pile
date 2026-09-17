import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { ErrorMessage } from "@/shared/ui";

const NOT_FOUND_MESSAGE = "Страница не найдена";
const GENERIC_ERROR_MESSAGE =
  "Что-то пошло не так. Попробуйте перезагрузить страницу.";
const HTTP_NOT_FOUND_STATUS = 404;

/**
 * `errorElement` верхнего маршрута — ловит непредвиденные ошибки рендера
 * в дереве страниц. Несуществующие пути обрабатывает отдельный маршрут
 * `path: "*"` (NotFoundPage) — сюда 404 может дойти только в
 * нестандартном случае (например, ошибка внутри самого NotFoundPage).
 */
export function RouteErrorBoundary() {
  const error = useRouteError();
  const message =
    isRouteErrorResponse(error) && error.status === HTTP_NOT_FOUND_STATUS
      ? NOT_FOUND_MESSAGE
      : GENERIC_ERROR_MESSAGE;

  return <ErrorMessage message={message} />;
}
