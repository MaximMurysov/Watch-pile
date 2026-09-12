/**
 * Jest в ESM-режиме проекта ("type": "module" в package.json).
 * Трансформ через @swc/jest — самый быстрый вариант; типы уже
 * проверяет отдельный `pnpm typecheck`, поэтому Jest их не проверяет.
 */
export default {
  testEnvironment: "jest-fixed-jsdom",
  transform: {
    "^.+\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          parser: { syntax: "typescript", tsx: true },
          transform: { react: { runtime: "automatic" } },
        },
      },
    ],
  },
  moduleNameMapper: {
    "^@/shared/config/env$": "<rootDir>/src/shared/lib/test/env.mock.ts",
    "^@/(.*)$": "<rootDir>/src/$1",
    "\.module\.css$": "identity-obj-proxy",
  },
  setupFilesAfterEnv: ["<rootDir>/src/shared/lib/test/setup.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
};
