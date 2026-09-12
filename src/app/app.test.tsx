import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { createMemoryRouter, RouterProvider } from "react-router-dom";

import { routeObjects } from "@/app/router";
import { createAppStore } from "@/app/model";

describe("App", () => {
  it("показывает навигацию со ссылками «Поиск» и «Коллекция»", () => {
    const router = createMemoryRouter(routeObjects, {
      initialEntries: ["/"],
    });

    render(
      <Provider store={createAppStore()}>
        <RouterProvider router={router} />
      </Provider>,
    );

    expect(screen.getByRole("link", { name: "Поиск" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Коллекция" })).toBeInTheDocument();
  });
});
