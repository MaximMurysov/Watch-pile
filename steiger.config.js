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
  {
    // features/add-to-collection реально подключена в двух местах —
    // widgets/movie-grid и widgets/movie-details импортируют
    // CollectionButton из публичного API слайса (этап 5). steiger при
    // этом рапортует "has no references" — похоже на тот же класс
    // ограничений анализа зависимостей, что и у предыдущих трёх
    // исключений выше (не первый случай в проекте). Постоянное
    // исключение, не временное — реальных потребителей меньше не станет.
    files: ["./src/features/add-to-collection/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
  {
    // features/rate-movie реально подключена в widgets/movie-details
    // (этап 6) — тот же класс ограничений анализа зависимостей steiger,
    // что и у трёх предыдущих исключений выше. Постоянное исключение.
    files: ["./src/features/rate-movie/**"],
    rules: {
      "fsd/insignificant-slice": "off",
    },
  },
]);
