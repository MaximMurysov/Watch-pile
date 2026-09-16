import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  it("рендерит доступное поле поиска с исходным значением", () => {
    render(<SearchInput defaultValue="matrix" onQueryChange={jest.fn()} />);

    expect(screen.getByRole("searchbox", { name: /поиск фильмов/i })).toHaveValue(
      "matrix",
    );
  });

  it("вызывает onQueryChange при каждом изменении значения", async () => {
    const user = userEvent.setup();
    const onQueryChange = jest.fn();
    render(<SearchInput defaultValue="" onQueryChange={onQueryChange} />);

    await user.type(screen.getByRole("searchbox"), "matrix");

    expect(onQueryChange).toHaveBeenCalledTimes("matrix".length);
    expect(onQueryChange).toHaveBeenLastCalledWith("matrix");
  });
});
