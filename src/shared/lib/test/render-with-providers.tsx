import { configureStore } from "@reduxjs/toolkit";
import type { Middleware, Reducer } from "@reduxjs/toolkit";
import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { Provider } from "react-redux";
import { MemoryRouter } from "react-router-dom";

import { baseApi } from "@/shared/api";

interface RenderWithProvidersOptions {
  initialEntries?: string[];
  /**
   * Редьюсеры сущностей, которых нет в shared (например, слайс
   * коллекции). shared не может импортировать их напрямую — это
   * был бы импорт вверх по слоям, поэтому тест сам передаёт то,
   * что ему нужно.
   */
  extraReducers?: Record<string, Reducer>;
  /**
   * Middleware сущностей, которых нет в shared (например, listener
   * коллекции, пишущий в localStorage) — по той же причине, что и
   * extraReducers.
   */
  extraMiddleware?: Middleware[];
}

/**
 * Рендерит компонент в Provider + MemoryRouter со свежим store —
 * кэш RTK Query не должен течь между тестами.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ["/"],
    extraReducers = {},
    extraMiddleware = [],
  }: RenderWithProvidersOptions = {},
) {
  const store = configureStore({
    reducer: {
      [baseApi.reducerPath]: baseApi.reducer,
      ...extraReducers,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(baseApi.middleware, ...extraMiddleware),
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={initialEntries}>{ui}</MemoryRouter>
    </Provider>,
  );
}
