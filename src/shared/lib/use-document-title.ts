import { useEffect } from "react";

const APP_TITLE = "Watchpile";

/**
 * Единый способ задать заголовок вкладки для страницы. Без API
 * `document.title` вкладка браузера всегда показывает статичный
 * `Watchpile` из index.html, что не помогает ориентироваться среди
 * нескольких открытых вкладок приложения.
 */
export function useDocumentTitle(title: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${APP_TITLE}` : APP_TITLE;
  }, [title]);
}
