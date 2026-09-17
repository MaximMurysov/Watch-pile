import { screen } from "@testing-library/react";

import { renderWithProviders } from "@/shared/lib/test";

import { NotFoundPage } from "./not-found-page";

describe("NotFoundPage", () => {
  it("показывает сообщение и ссылку на поиск", () => {
    renderWithProviders(<NotFoundPage />);

    expect(
      screen.getByRole("heading", { name: "Страница не найдена" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Искать фильмы" })).toHaveAttribute(
      "href",
      "/",
    );
  });
});
