import { z } from "zod";

/**
 * Единственное место в приложении, читающее import.meta.env.
 * В тестах этот модуль подменяется мок-версией (см. jest.config.js),
 * потому что Jest не умеет import.meta.env.
 */
const envSchema = z.object({
  VITE_POISKKINO_API_TOKEN: z
    .string()
    .min(
      1,
      "VITE_POISKKINO_API_TOKEN не задан. Скопируйте .env.example в .env",
    ),
});

const parsedEnv = envSchema.safeParse(import.meta.env);

if (!parsedEnv.success) {
  throw new Error(
    `Некорректные переменные окружения: ${parsedEnv.error.message}`,
  );
}

export const env = parsedEnv.data;
