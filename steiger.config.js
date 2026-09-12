import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // entities/movie ещё ничего не подключает — pages/search и
    // pages/movie начнут импортировать её на этапах 3–4. До тех пор
    // правило считает слайс «незначительным» (нет ни одной ссылки).
    // Снять это исключение сразу после того, как поиск подключит
    // сущность (этап 3, feat/movie-search).
    files: ["./src/entities/movie/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
