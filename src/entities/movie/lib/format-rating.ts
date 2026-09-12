import { RATING_DECIMAL_PLACES } from "../config";

export function formatRating(rating: number): string {
  return rating.toFixed(RATING_DECIMAL_PLACES);
}
