import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

import { POISKKINO_API_BASE_URL } from "@/shared/config";
import { env } from "@/shared/config/env";

/**
 * Единый createApi с пустыми endpoints. Конкретные эндпоинты
 * добавляются через injectEndpoints в entities/<name>/api.
 */
export const baseApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: POISKKINO_API_BASE_URL,
    prepareHeaders: (headers) => {
      headers.set("X-API-KEY", env.VITE_POISKKINO_API_TOKEN);
      return headers;
    },
  }),
  tagTypes: ["Movie", "MovieSearch"],
  endpoints: () => ({}),
});
