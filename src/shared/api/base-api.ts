import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { TMDB_API_BASE_URL } from "@/shared/config";
import { env } from "@/shared/config/env";

/**
 * Единый createApi с пустыми endpoints. Конкретные эндпоинты
 * добавляются через injectEndpoints в entities/<name>/api.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: TMDB_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("Authorization", `Bearer ${env.VITE_TMDB_TOKEN}`);
      return headers;
    },
  }),
  tagTypes: ["Movie", "MovieSearch"],
  endpoints: () => ({}),
});
