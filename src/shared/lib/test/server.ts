import { setupServer } from "msw/node";

/**
 * Сервер без хендлеров: shared ничего не знает о конкретных API.
 * Каждый тест добавляет свои обработчики через server.use(...).
 */
export const server = setupServer();
