import { POSTER_SIZE } from "../config";
import { selectPosterUrl } from "./select-poster-url";

describe("selectPosterUrl", () => {
  it("возвращает previewUrl для размера preview", () => {
    const url = selectPosterUrl(
      {
        url: "https://example.com/full.jpg",
        previewUrl: "https://example.com/preview.jpg",
      },
      POSTER_SIZE.preview,
    );

    expect(url).toBe("https://example.com/preview.jpg");
  });

  it("возвращает url для размера full", () => {
    const url = selectPosterUrl(
      {
        url: "https://example.com/full.jpg",
        previewUrl: "https://example.com/preview.jpg",
      },
      POSTER_SIZE.full,
    );

    expect(url).toBe("https://example.com/full.jpg");
  });

  it("падает обратно на url, если previewUrl не пришёл", () => {
    const url = selectPosterUrl(
      { url: "https://example.com/full.jpg", previewUrl: null },
      POSTER_SIZE.preview,
    );

    expect(url).toBe("https://example.com/full.jpg");
  });

  it("возвращает null, если постера нет вовсе", () => {
    expect(selectPosterUrl(null, POSTER_SIZE.preview)).toBeNull();
    expect(selectPosterUrl(undefined, POSTER_SIZE.preview)).toBeNull();
  });

  it("возвращает null, если у постера нет ни одного URL", () => {
    expect(
      selectPosterUrl({ url: null, previewUrl: null }, POSTER_SIZE.full),
    ).toBeNull();
  });
});
