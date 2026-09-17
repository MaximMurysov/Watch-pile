import type { RouteObject } from "react-router-dom";

import { CollectionPage } from "@/pages/collection";
import { MoviePage } from "@/pages/movie";
import { NotFoundPage } from "@/pages/not-found";
import { SearchPage } from "@/pages/search";
import { ROUTES } from "@/shared/config";

import { RootLayout } from "./root-layout";
import { RouteErrorBoundary } from "./route-error-boundary";

const NOT_FOUND_ROUTE_PATH = "*";

/**
 * Дерево маршрутов отдельно от createBrowserRouter — тесты строят
 * из него createMemoryRouter, не завязываясь на реальный браузер.
 */
export const routeObjects: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      {
        // Без собственного element — маршрут-обёртка рендерит только
        // <Outlet />, чтобы errorElement не подменял RootLayout: при
        // ошибке рендера в странице Header и навигация должны остаться
        // на экране, а не пропасть вместе с провалившимся содержимым.
        errorElement: <RouteErrorBoundary />,
        children: [
          { path: ROUTES.search, element: <SearchPage /> },
          { path: ROUTES.movie, element: <MoviePage /> },
          { path: ROUTES.collection, element: <CollectionPage /> },
          { path: NOT_FOUND_ROUTE_PATH, element: <NotFoundPage /> },
        ],
      },
    ],
  },
];
