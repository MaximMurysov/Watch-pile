import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
  {
    // fsd/insignificant-slice считает не прямые импорты, а число
    // разных СТРАНИЦ, до которых доходит слайс транзитивно. entities/movie
    // сейчас доходит только до одной (pages/search — напрямую и через
    // widgets/movie-grid), поэтому проблема не снялась при подключении
    // на этом этапе, как ошибочно предполагалось в конце этапа 2. Вторая
    // страница — pages/movie на этапе 4 (feat/movie-page). Снять
    // исключение тогда.
    files: ["./src/entities/movie/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // Единственный потребитель — pages/collection не подключит эту
    // фичу (у неё вкладки статуса, не поиск), но модель URL-параметров
    // и инпут вынесены из pages/search осознанно: изолированная
    // тестируемость (см. features/movie-search/model) важнее формальной
    // эвристики «один потребитель — держи в pages». Слайс зафиксирован
    // в CLAUDE.md → карта стеков, постоянное исключение, не временное.
    files: ["./src/features/movie-search/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // widgets/movie-grid пока используется только из pages/search.
    // Второй потребитель — pages/collection на этапе 7 (feat/collection-page),
    // тот же виджет без изменений отрисует список коллекции. Снять
    // исключение сразу после подключения.
    files: ["./src/widgets/movie-grid/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
