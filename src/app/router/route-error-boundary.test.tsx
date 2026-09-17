import { render, screen } from "@testing-library/react";
import type { RouteObject } from "react-router-dom";
import { createMemoryRouter, Outlet, RouterProvider } from "react-router-dom";

import { RouteErrorBoundary } from "./route-error-boundary";

function ThrowingComponent(): never {
  throw new Error("Something broke");
}

function Layout() {
  return (
    <>
      <header>Навигация</header>
      <Outlet />
    </>
  );
}

function renderWithThrow() {
  // Та же форма дерева, что в routes.tsx: errorElement — на вложенном
  // route-объекте без собственного element, а не на layout-маршруте,
  // чтобы Header из RootLayout не пропадал при ошибке рендера страницы.
  const routes: RouteObject[] = [
    {
      element: <Layout />,
      children: [
        {
          errorElement: <RouteErrorBoundary />,
          children: [{ path: "/", element: <ThrowingComponent /> }],
        },
      ],
    },
  ];
  const router = createMemoryRouter(routes, { initialEntries: ["/"] });

  return render(<RouterProvider router={router} />);
}

describe("RouteErrorBoundary", () => {
  it("показывает сообщение об ошибке, когда компонент маршрута падает", () => {
    renderWithThrow();

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Что-то пошло не так",
    );
  });

  it("не задевает layout выше errorElement — навигация остаётся на экране", () => {
    renderWithThrow();

    expect(screen.getByText("Навигация")).toBeInTheDocument();
  });
});
