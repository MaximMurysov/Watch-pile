import { act, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useLocation } from "react-router-dom";

import { collectionReducer, itemAdded } from "@/entities/collection-item";
import { renderWithProviders } from "@/shared/lib/test";

import { CollectionPage } from "./collection-page";

function renderCollectionPage(initialEntries?: string[]) {
  return renderWithProviders(
    <>
      <CollectionPage />
      <LocationProbe />
    </>,
    {
      initialEntries,
      extraReducers: { collectionItems: collectionReducer },
    },
  );
}

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.search}</div>;
}

function getLocationSearchParams() {
  const search = screen.getByTestId("location").textContent ?? "";
  return new URLSearchParams(search);
}

describe("CollectionPage", () => {
  it("happy path: переключение вкладки меняет список и URL", async () => {
    const user = userEvent.setup();
    const { store } = renderCollectionPage(["/collection"]);

    act(() => {
      store.dispatch(
        itemAdded({
          movieId: 1,
          title: "Матрица",
          posterUrl: null,
          status: "want",
        }),
      );
      store.dispatch(
        itemAdded({
          movieId: 2,
          title: "Начало",
          posterUrl: null,
          status: "watched",
        }),
      );
    });

    expect(screen.getByText("Матрица")).toBeInTheDocument();
    expect(screen.queryByText("Начало")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Посмотрел" }));

    expect(screen.getByText("Начало")).toBeInTheDocument();
    expect(screen.queryByText("Матрица")).not.toBeInTheDocument();
    expect(getLocationSearchParams().get("status")).toBe("watched");
  });

  it("пустая коллекция показывает подсказку со ссылкой на поиск", () => {
    renderCollectionPage(["/collection"]);

    expect(
      screen.getByText("Пока нет фильмов, которые хотите посмотреть"),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Искать фильмы" })).toHaveAttribute(
      "href",
      "/",
    );
  });

  it("невалидный статус в URL не роняет страницу, показывает вкладку по умолчанию", () => {
    renderCollectionPage(["/collection?status=bogus"]);

    expect(screen.getByRole("tab", { name: "Хочу посмотреть" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
  });
});
