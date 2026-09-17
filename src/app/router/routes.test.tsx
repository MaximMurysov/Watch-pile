import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { createAppStore } from "@/app/model";

import { routeObjects } from "./routes";

function renderAt(path: string) {
  const router = createMemoryRouter(routeObjects, { initialEntries: [path] });

  return render(
    <Provider store={createAppStore()}>
      <RouterProvider router={router} />
    </Provider>,
  );
}

describe("routeObjects", () => {
  it("несуществующий путь показывает страницу 404, header остаётся", () => {
    renderAt("/does-not-exist");

    expect(
      screen.getByRole("heading", { name: "Страница не найдена" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Поиск" })).toBeInTheDocument();
  });
});
