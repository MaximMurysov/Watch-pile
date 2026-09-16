import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Pagination } from "./pagination";

describe("Pagination", () => {
  it("не рендерится, если всего одна страница", () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={1} onPageChange={jest.fn()} />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("показывает текущую страницу из общего числа", () => {
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByText("Страница 2 из 5")).toBeInTheDocument();
  });

  it("отключает «Назад» на первой странице", () => {
    render(
      <Pagination currentPage={1} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Назад" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Вперёд" })).toBeEnabled();
  });

  it("отключает «Вперёд» на последней странице", () => {
    render(
      <Pagination currentPage={5} totalPages={5} onPageChange={jest.fn()} />,
    );

    expect(screen.getByRole("button", { name: "Вперёд" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Назад" })).toBeEnabled();
  });

  it("вызывает onPageChange с соседней страницей по клику", async () => {
    const user = userEvent.setup();
    const onPageChange = jest.fn();
    render(
      <Pagination currentPage={2} totalPages={5} onPageChange={onPageChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Вперёд" }));
    expect(onPageChange).toHaveBeenCalledWith(3);

    await user.click(screen.getByRole("button", { name: "Назад" }));
    expect(onPageChange).toHaveBeenCalledWith(1);
  });
});
