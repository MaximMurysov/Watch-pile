import { UNKNOWN_VALUE_PLACEHOLDER } from "../config";
import { formatReleaseYear } from "./format-release-year";

describe("formatReleaseYear", () => {
  it("превращает год в строку", () => {
    expect(formatReleaseYear(1999)).toBe("1999");
  });

  it("возвращает плейсхолдер, если года нет", () => {
    expect(formatReleaseYear(null)).toBe(UNKNOWN_VALUE_PLACEHOLDER);
    expect(formatReleaseYear(undefined)).toBe(UNKNOWN_VALUE_PLACEHOLDER);
  });
});
