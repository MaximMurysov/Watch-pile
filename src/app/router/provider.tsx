import {
  createBrowserRouter,
  RouterProvider as ReactRouterDomProvider,
} from "react-router-dom";

import { routeObjects } from "./routes";

const router = createBrowserRouter(routeObjects);

export function RouterProvider() {
  return <ReactRouterDomProvider router={router} />;
}
