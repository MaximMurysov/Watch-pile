# Чек-лист прогресса — Watchpile

Ход работы по [plan.md](./plan.md). Один этап — одна feature-ветка — один
PR в `main`. Отмечать по факту завершения.

## Чек-лист на каждый PR (из `CLAUDE.md`)

- [ ] `pnpm typecheck` — зелёный
- [ ] `pnpm lint` — зелёный
- [ ] `pnpm lint:fsd` — зелёный
- [ ] `pnpm test` — зелёный
- [ ] Новый код лежит в правильном слое, импорты идут только вниз
- [ ] Новый слайс имеет `index.ts` с публичным API
- [ ] Нет `console.log`, `debugger`, TODO без причины
- [ ] Нет закомментированного кода
- [ ] Изменены только те файлы, которые относятся к задаче
- [ ] Если поведение изменилось — обновлён README
- [ ] Если принято архитектурное решение — дописано в CLAUDE.md →
      «Архитектурные решения»

---

## Этап 1 — Фундамент (`feat/foundation`)

- [x] Зависимости: Redux Toolkit, RTK Query, react-redux, Zod, RHF
- [x] FSD-скелет: `app/model`, `app/router`, `widgets/header`,
      `pages/{search,movie,collection}`, `shared/{api,config,lib}`
- [x] Jest + `@swc/jest` + `jest-fixed-jsdom` + MSW, запуск через
      `--experimental-vm-modules`
- [x] steiger зелёный (`fsd/segments-by-purpose`, `fsd/public-api`
      прошли после переименования `providers`→`model`/`router`)
- [x] GitHub Actions CI (typecheck/lint/lint:fsd/test)
- [x] husky pre-push с тем же чек-листом
- [x] Источник данных заменён: TMDB → poiskkino.dev (регистрация на
      themoviedb.org недоступна из РФ), решение записано в CLAUDE.md
- [x] Локальная проверка: `typecheck`, `lint`, `lint:fsd`, `test`, `build`
- [ ] Чек-лист PR (выше)
- [ ] PR открыт в `main`
- [ ] Смержено, ветка `feat/foundation` удалена

## Этап 2 — Сущность фильма (`feat/movie-entity`)

- [ ] Уточнить на реальном ответе имя поля с массивом результатов поиска
      (ожидается `docs`)
- [ ] `entities/movie/model` — Zod-схемы (`movieSchema`,
      `movieSearchResponseSchema`)
- [ ] `entities/movie/api` — `searchMovies`, `getMovieById` через
      `baseApi.injectEndpoints`
- [ ] `entities/movie/lib` — `selectPosterUrl`, `selectRating`,
      `formatReleaseYear`
- [ ] `entities/movie/ui` — `MovieCard`
- [ ] Тест: схема отвергает битый ответ с внятным сообщением
- [ ] Тест: `MovieCard` рендерит название/год/`alt`
- [ ] Тест: фильм без постера — заглушка, не падение
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 3 — Поиск (`feat/movie-search`)

- [ ] `features/movie-search` — синхронизация `query`/`page` с URL,
      без `useState`
- [ ] `widgets/movie-grid` — сетка + пагинация, состояния
      загрузка/пусто/ошибка
- [ ] `pages/search` — владеет данными (`useSearchMoviesQuery`),
      отдаёт в виджет
- [ ] Учтён лимит бесплатного ключа poiskkino.dev (страницы 1–10,
      `limit` ≤ 10)
- [ ] Тест: happy path — ввод запроса → карточки → `?query=...` в URL
- [ ] Тест: ошибка API → сообщение, не пустая сетка
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 4 — Страница фильма (`feat/movie-page`)

- [ ] `widgets/movie-details` — презентационный виджет
- [ ] `pages/movie` — `useParams` → `useGetMovieByIdQuery`
- [ ] Тест: happy path — детали на экране
- [ ] Тест: 404/ошибка → «фильм не найден»
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 5 — Коллекция (`feat/collection`)

- [ ] `entities/collection-item/model` — схемы, слайс
      (`createEntityAdapter` по `movieId`), селекторы
- [ ] `entities/collection-item/model/persistence` — чтение/запись
      `localStorage` с Zod-валидацией, битые записи отбрасываются с логом
- [ ] `features/add-to-collection` — кнопка смены статуса
- [ ] Подключено в `movie-grid` и `movie-details`
- [ ] Тест: добавление меняет подпись кнопки и `localStorage`
- [ ] Тест: битый JSON в `localStorage` не роняет приложение
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 6 — Заметка о фильме (`feat/rate-movie`)

- [ ] `features/rate-movie` — форма RHF + `zodResolver` на схеме из
      `entities/collection-item`
- [ ] Теги — контролируемый ввод чипами (`useController`)
- [ ] Форма видна на странице фильма при статусе `watched`
- [ ] Тест: валидная заметка сохраняется и видна после перерендера
- [ ] Тест: оценка вне диапазона → ошибки полей, диспатча не было
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 7 — Страница коллекции (`feat/collection-page`)

- [ ] `pages/collection` — вкладки «хочу»/«посмотрел», статус в URL
- [ ] Пустое состояние со ссылкой на поиск
- [ ] Тест: переключение вкладки меняет список и URL
- [ ] Тест: пустая коллекция → подсказка
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

## Этап 8 — Полировка (`feat/polish`)

- [ ] Страница 404, `errorElement` роутера
- [ ] Скелетоны вместо спиннеров
- [ ] a11y: фокус-стили, `aria-live`, `<title>` по страницам
- [ ] README и CLAUDE.md приведены в соответствие с финальным поведением
- [ ] Чек-лист PR
- [ ] PR → merge → удаление ветки

---

## Сквозная проверка (после этапов 3–7, `pnpm dev` с реальным `.env`)

- [ ] `/` → «matrix» → карточки, `?query=matrix&page=1` в URL
- [ ] Вторая страница → URL обновился, «назад» возвращает на первую
- [ ] Клик по карточке → `/movie/:id`, F5 не ломает страницу
- [ ] «Хочу посмотреть» → фильм в `/collection` во вкладке «Хочу посмотреть»
- [ ] Перевод в «Посмотрел» → форма заметки → сохранение → переживает
      перезагрузку страницы
- [ ] Отключить сеть в DevTools → сообщение об ошибке, не бесконечный спиннер
