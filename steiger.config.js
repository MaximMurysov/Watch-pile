import fsd from "@feature-sliced/steiger-plugin";
import { defineConfig } from "steiger";

export default defineConfig([
  ...fsd.configs.recommended,
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
  {
    // widgets/movie-details — единственный потребитель pages/movie, и по
    // плану других не появится. Слайс выделен не ради переиспользования,
    // а ради правила «страница владеет данными, виджет презентационный»
    // (см. CLAUDE.md → «Архитектурные решения»): pages/movie дёргает
    // useGetMovieByIdQuery, widgets/movie-details только рендерит пропс.
    // Постоянное исключение, не временное.
    files: ["./src/widgets/movie-details/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
