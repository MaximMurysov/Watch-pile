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
- [x] Чек-лист PR (выше) — включая два довеска: `packageManager` в
      `package.json` (иначе `pnpm/action-setup` падает без версии) и
      Node 24 в CI (Node 22 достаточно pnpm 11, но не Jest/MSW —
      `require(esm)` для чисто ESM-пакета `rettime` нужен Node ≥ 24.9)
- [x] PR #1 открыт в `main`, CI прошёл
- [x] Смержено, ветка `feat/foundation` удалена (локально и на origin)

## Этап 2 — Сущность фильма (`feat/movie-entity`) — ✅ сделано

Подробности решений — в
[`.claude/plans/stages/02-movie-entity.md`](./stages/02-movie-entity.md).

- [x] Уточнено по реальной OpenAPI-схеме `api.poiskkino.dev/documentation-json`
      (не угадано): массив результатов — поле `docs`, обязателен только `id`
- [x] `entities/movie/model` — Zod-схемы (`movieSchema`,
      `movieSearchEnvelopeSchema`, `parseMovieDocs`) — не одна схема на весь
      ответ поиска, а конверт + поэлементный разбор, чтобы один битый
      фильм не ронял всю выдачу (найдено на ревью)
- [x] `entities/movie/api` — `searchMovies`, `getMovieById` через
      `baseApi.injectEndpoints`; валидация — через `rawResponseSchema` +
      `onSchemaFailure`/`catchSchemaFailure` на `baseApi` (нативный
      механизм схем RTK Query 2.x), а не ручной `.parse()` в
      `transformResponse` — иначе провал схемы был необработанным
      `SerializedError`, а не обычной `FetchBaseQueryError` (найдено на
      ревью, исправлено в `shared/api/base-api.ts`)
- [x] `entities/movie/lib` — `selectPosterUrl`, `selectRating`,
      `formatReleaseYear`, `formatRating` (округление рейтинга до 1
      знака — добавлено на ревью, изначально выводился сырым числом)
- [x] `entities/movie/ui` — `MovieCard`
- [x] Тест: схема отвергает битый ответ с внятным сообщением; жанр без
      имени не роняет фильм; `parseMovieDocs` отбрасывает битые записи
      с `console.warn`, не роняя выдачу целиком
- [x] Тест: `MovieCard` рендерит название/год/округлённый рейтинг/`alt`
- [x] Тест: фильм без постера — заглушка, не падение
- [x] Тест: `movie-api` — параметры запроса (`query`/`page`) доходят до
      API; ошибка валидации схемы имеет предсказуемую форму
- [x] Временное исключение `fsd/insignificant-slice` для
      `entities/movie` в `steiger.config.js` — сущность пока никто не
      импортирует; **снять на этапе 3**, как только `pages/search`
      подключит `useSearchMoviesQuery`/`MovieCard`
- [x] Долг на этап 4: доэкспортировать `selectPosterUrl`, `selectRating`,
      `formatRating`, `POSTER_SIZE.full` из `entities/movie/index.ts`
      перед тем, как писать `widgets/movie-details`
- [x] Чек-лист PR
- [x] PR [#3](https://github.com/MaximMurysov/Watch-pile/pull/3) →
      merge → удаление ветки (локально и на origin)

## Этап 3 — Поиск (`feat/movie-search`) — ✅ сделано

Подробности решений и отклонений от плана — в
[`.claude/plans/stages/03-movie-search.md`](./stages/03-movie-search.md).

- [x] `features/movie-search` — синхронизация `query`/`page` с URL,
      без `useState` (дебаунс — таймер в `useRef`, инпут неконтролируемый)
- [x] `widgets/movie-grid` — сетка + пагинация, состояния
      загрузка/пусто/ошибка
- [x] `pages/search` — владеет данными (`useSearchMoviesQuery`),
      отдаёт в виджет
- [x] Учтён лимит бесплатного ключа poiskkino.dev (страницы 1–10) —
      `clampSearchPage` в `features/movie-search/lib`; `limit` ≤ 10
      относится к самому запросу и не менялся в этом этапе
- [x] Тест: happy path — ввод запроса → карточки → `?query=...&page=1`
      в URL
- [x] Тест: ошибка API (500) → `alert` с сообщением, не пустая сетка
- [x] `shared/lib/get-query-error-message` и `shared/ui`
      (`Spinner`/`ErrorMessage`/`EmptyState`/`Pagination`) — не было
      явно в плане этапа, понадобилось по факту (виджет должен был
      что-то рендерить в состояниях загрузки/ошибки/пустоты)
- [x] `steiger.config.js` — три точечных исключения
      `fsd/insignificant-slice` (`entities/movie` временно до этапа 4,
      `widgets/movie-grid` временно до этапа 7, `features/movie-search`
      постоянно — решения приняты с пользователем, см. стейдж-документ)
- [x] Чек-лист PR (typecheck/lint/lint:fsd/test/build — все зелёные)
- [x] Ручная проверка в браузере — сделана отдельно, через `pnpm screenshot`
      (см. `chore/playwright-screenshots`): реальный поиск «матрица» против
      poiskkino.dev — карточки, постеры (с фолбэком «Нет постера»),
      «Страница 1 из 10»
- [x] PR [#7](https://github.com/MaximMurysov/Watch-pile/pull/7) →
      merge → удаление ветки (локально и на origin, origin — автоматически)

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
