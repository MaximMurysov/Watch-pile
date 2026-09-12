/**
 * Подменяет @/shared/config/env в тестах (см. jest.config.js) —
 * Jest не умеет import.meta.env, а реальный токен тестам не нужен:
 * сеть перехватывает MSW.
 */
export const env = {
  VITE_POISKKINO_API_TOKEN: "test-token",
};
