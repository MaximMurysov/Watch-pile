import { render, screen } from "@testing-library/react";

import { ErrorMessage } from "./error-message";

describe("ErrorMessage", () => {
  it("показывает переданный текст ошибки как alert", () => {
    render(<ErrorMessage message="Что-то пошло не так" />);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Что-то пошло не так",
    );
  });
});
