import type { RouteObject } from "react-router-dom";

import { CollectionPage } from "@/pages/collection";
import { MoviePage } from "@/pages/movie";
import { SearchPage } from "@/pages/search";
import { ROUTES } from "@/shared/config";

import { RootLayout } from "./root-layout";

/**
 * Дерево маршрутов отдельно от createBrowserRouter — тесты строят
 * из него createMemoryRouter, не завязываясь на реальный браузер.
 */
export const routeObjects: RouteObject[] = [
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.search, element: <SearchPage /> },
      { path: ROUTES.movie, element: <MoviePage /> },
      { path: ROUTES.collection, element: <CollectionPage /> },
    ],
  },
];
