import "@testing-library/jest-dom";

import { server } from "./server";

/**
 * jsdom не реализует matchMedia — framer-motion вызывает его при
 * определении prefers-reduced-motion (MotionConfig reducedMotion="user"
 * в app.tsx). Без мока падает с "matchMedia is not a function".
 */
beforeAll(() => {
  window.matchMedia ??= function matchMedia(query: string): MediaQueryList {
    return {
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    } as unknown as MediaQueryList;
  };
});

beforeAll(() => {
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  server.resetHandlers();
  localStorage.clear();
});

afterAll(() => {
  server.close();
});
