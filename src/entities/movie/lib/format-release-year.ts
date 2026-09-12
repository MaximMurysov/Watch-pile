import { UNKNOWN_VALUE_PLACEHOLDER } from "../config";
import type { Movie } from "../model";

export function formatReleaseYear(year: Movie["year"]): string {
  return year ? String(year) : UNKNOWN_VALUE_PLACEHOLDER;
}
