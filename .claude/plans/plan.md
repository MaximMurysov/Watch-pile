# План разработки Watchpile

## Context

`CLAUDE.md` и `README.md` описывают готовое приложение, которого ещё нет.
Фактическое состояние репозитория (ветка `main`, один коммит `41475b8`):

- есть: Vite 8 + React 19 + TS 6 strict, алиас `@/` → `src`, ESLint flat
  config + Prettier, `.env.example` с `VITE_TMDB_TOKEN`, dev-сервер на
  `127.0.0.1:5173`;
- `src/` — три файла-заглушки: [App.tsx](src/App.tsx) с `<h1>Watchpile</h1>`,
  [main.tsx](src/main.tsx), [index.css](src/index.css);
- из стека установлен только `react-router-dom` (и не подключён). Нет
  Redux Toolkit, `react-redux`, Zod, React Hook Form, Jest, RTL, MSW,
  steiger. Нет скриптов `test` и `lint:fsd`, хотя README их обещает.

Цель: довести проект до состояния, описанного в README — поиск фильмов
(источник данных — poiskkino.dev, см. решение в конце этапа 1) с
пагинацией в URL, страница фильма, локальная коллекция с заметками,
всё по FSD, с тестами и зелёными `typecheck / lint / lint:fsd / test`.

Решения, зафиксированные с пользователем:

- **8 последовательных feature-веток и PR**, каждый PR самодостаточен и
  зелёный по всем проверкам;
- **заметка о фильме — часть `entities/collection-item`**, отдельной
  сущности `movie-note` не заводим;
- **CI на GitHub Actions** заводим в первом же PR;
- **трансформер Jest — `@swc/jest`** (допущение: ответ «jest + rtl»
  подтвердил библиотеки, но не трансформер; типы и так проверяет
  отдельный `pnpm typecheck`, поэтому берём самый быстрый вариант);
- **husky pre-push** (добавлено по отдельному запросу во время этапа 1):
  тот же чек-лист, что в CI, гоняется перед `git push`.

Перед стартом: в рабочем дереве не закоммичен `M CLAUDE.md` — решить,
уходит он в первый PR или отдельным коммитом в `main`.

---

## Карта этапов

| #   | Ветка                  | Что появляется                                                             | Тесты этапа                                                       |
| --- | ---------------------- | -------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| 1   | `feat/foundation`      | зависимости, скелет FSD, store, router, Jest/MSW/steiger, CI               | smoke: роутер рендерит навигацию                                  |
| 2   | `feat/movie-entity`    | `shared/api` baseApi, `entities/movie` (схемы, эндпоинты, карточка)        | схема отвергает битый ответ; карточка рендерит данные             |
| 3   | `feat/movie-search`    | `features/movie-search`, `widgets/movie-grid`, `pages/search`              | happy path поиска; ошибка API                                     |
| 4   | `feat/movie-page`      | `widgets/movie-details`, `pages/movie`                                     | happy path; 404/ошибка                                            |
| 5   | `feat/collection`      | `entities/collection-item` (слайс + persist), `features/add-to-collection` | добавление и смена статуса; восстановление из битого localStorage |
| 6   | `feat/rate-movie`      | `features/rate-movie` (RHF + Zod), заметка внутри записи коллекции         | сохранение валидной заметки; показ ошибок валидации               |
| 7   | `feat/collection-page` | `pages/collection` с вкладками «хочу/посмотрел»                            | фильтрация по статусу; пустое состояние                           |
| 8   | `feat/polish`          | 404-страница, скелетоны, a11y, README/CLAUDE.md                            | без новых, все зелёные                                            |

Процесс на каждом этапе одинаков: ветка от актуального `main` → работа →
чек-лист из `CLAUDE.md` → PR → merge → удаление ветки.

---

## Этап 1 — фундамент (`feat/foundation`) — ✅ сделано

Самый крупный PR: после него следующие семь этапов — почти чистый
продуктовый код. Ниже — как построено по факту (часть решений поменялась
по ходу дела относительно черновика).

**Зависимости** (`pnpm add`): `@reduxjs/toolkit`, `react-redux`, `zod`,
`react-hook-form`, `@hookform/resolvers`.

**Dev-зависимости** (`pnpm add -D`): `jest`, `jest-fixed-jsdom`,
`@types/jest`, `@swc/core`, `@swc/jest`, `@testing-library/react`,
`@testing-library/jest-dom`, `@testing-library/user-event`, `msw`,
`identity-obj-proxy`, `steiger`, `@feature-sliced/steiger-plugin`, `husky`
(по отдельному запросу — pre-push хук, см. ниже).

`jest-fixed-jsdom` вместо `jest-environment-jsdom` — это поддерживаемый
командой MSW форк, который не выпиливает нодовые глобалы (`TextEncoder`,
`ReadableStream`, `BroadcastChannel`); на голом jsdom MSW 2 не стартует.

pnpm 11 заблокировал postinstall нативных пакетов (`@swc/core`,
`@parcel/watcher`, `msw`, `unrs-resolver`) — supply-chain защита.
Одобрено явно через `pnpm-workspace.yaml` → `allowBuilds` (не через
интерактивный `approve-builds`, он не работает в неинтерактивной сессии).

**Скрипты в `package.json`**: `test`, `test:watch`, `lint:fsd` (`steiger src`),
`prepare` (`husky`). Существующие `dev/build/lint/typecheck/format` не тронуты.

Jest MSW тянет `rettime` — чисто ESM-пакет без CJS-сборки, из-за чего
`jest` в обычном режиме падает с `Must use import to load ES Module`.
Решение: `test`/`test:watch` запускают Jest через
`node --experimental-vm-modules node_modules/jest/bin/jest.js` — это
включает нативный `require(esm)` в Jest, но **только вместе с Node
≥ 24.9**: на Node 22 та же ошибка воспроизводится и с флагом (проверено
на CI — сначала стоял Node 22 для совместимости с pnpm 11, тест падал).
Итоговое требование к Node — 24.9+, оно перекрывает и pnpm 11 (нужно
≥ 22.13). CI и README обновлены на `node-version: 24`.

**Конфиги**

- `jest.config.js` — ESM-экспорт (в проекте `"type": "module"`),
  `testEnvironment: "jest-fixed-jsdom"`, трансформ `@swc/jest` в CJS,
  `moduleNameMapper`: спец-маппинг `@/shared/config/env` → мок (см. ниже,
  проверяется раньше общего правила), затем `^@/(.*)$` → `<rootDir>/src/$1`,
  `\.module\.css$` → `identity-obj-proxy`.
  `setupFilesAfterEnv` → `src/shared/lib/test/setup.ts` (не корневой
  `jest.setup.ts` — так файл живёт под `tsconfig.app.json` и его тоже
  проверяет `pnpm typecheck`).
- `src/shared/lib/test/setup.ts` — `@testing-library/jest-dom`,
  жизненный цикл MSW-сервера (`listen` с `onUnhandledRequest: "error"` /
  `resetHandlers` / `close`), очистка `localStorage` между тестами.
- `steiger.config.js` — `defineConfig([...fsd.configs.recommended])` на
  пресете `@feature-sliced/steiger-plugin`.
- `tsconfig.app.json` — `"jest"` добавлен в `types` (типы `@testing-library/
jest-dom` подключаются просто через `import` в setup.ts, отдельно в
  `types` их добавлять не нужно).
- `eslint.config.js` — блок для `**/*.test.{ts,tsx}` с `globals.jest`.
- `.github/workflows/ci.yml` — на `push`/`pull_request`: pnpm + Node 24
  (см. требование к версии Node выше), `install --frozen-lockfile`,
  затем `typecheck`, `lint`, `lint:fsd`, `test`.
- `package.json` → `packageManager: "pnpm@11.9.0"` — `pnpm/action-setup`
  требует явную версию pnpm, иначе падает в CI ещё до установки зависимостей.
- `.husky/pre-push` — тот же чек-лист (`typecheck && lint && lint:fsd &&
test`), запускается перед `git push`, то есть перед PR.

**Скелет `src/` (FSD) — как построено**

```
src/
  app/
    index.ts, app.tsx
    model/        store.ts (createAppStore — фабрика, не синглтон), hooks.ts
                  (useAppDispatch/useAppSelector), provider.tsx
    router/       routes.tsx (routeObjects — дерево маршрутов отдельно от
                  createBrowserRouter, тесты строят из него createMemoryRouter),
                  root-layout.tsx (Header + Outlet), provider.tsx
    styles/       index.css (перенесён из src/index.css)
  pages/          search/ movie/ collection/ — заглушки с index.ts
  widgets/        header/
  features/       (пусто до этапа 3)
  entities/       (пусто до этапа 2)
  shared/
    api/          base-api.ts, index.ts
    config/       env.ts, routes.ts, poiskkino.ts (не tmdb.ts — источник
                  данных сменился ещё в рамках этапа 1, см. решение ниже
                  и в CLAUDE.md → «Архитектурные решения»), index.ts
    lib/          test/{render-with-providers.tsx, server.ts, env.mock.ts,
                  setup.ts, index.ts}
```

Сегменты `app/providers/store-provider` и `app/providers/router-provider`
из черновика steiger отклонил правилом `fsd/segments-by-purpose`:
`providers` и `store` — «сущностные» имена (описывают тип кода, а не
назначение). Итог — `app/model` (состояние) и `app/router` (роутинг).
Так же для `shared/lib/test` — вложенная папка внутри сегмента `lib`
тоже требует свой `index.ts` (`fsd/public-api`), не только верхний
уровень слайса.

- `app/model` — `createAppStore()`: `[baseApi.reducerPath]: baseApi.reducer`
  - его middleware; экспорт `RootState`, `AppDispatch`,
    `useAppSelector`/`useAppDispatch`.
- `app/router` — `routeObjects` (маршруты `/`, `/movie/:movieId`,
  `/collection` из `shared/config/routes.ts` — без строк-литералов в коде)
  собраны в `createBrowserRouter` для приложения.
- `shared/api/base-api.ts` — `createApi` с `fetchBaseQuery`, авторизация
  заголовком `X-API-KEY` (не `Bearer` — так требует poiskkino.dev),
  `endpoints: () => ({})`, `tagTypes` объявлены заранее.
- `shared/config/env.ts` — единственное место, читающее `import.meta.env`,
  разбор через Zod (пустой токен → понятная ошибка при старте).
- `shared/lib/test/render-with-providers.tsx` — `render` из RTL в обёртке
  `Provider` + `MemoryRouter`, свежий store на каждый вызов. Store здесь
  собирается из `shared/api` напрямую, **не** через `app/model` — обёртка
  живёт в `shared`, а импорт из `app` был бы нарушением «импорт только
  вниз». Слайсы будущих слоёв (коллекция и т.п.) передаются параметром
  `extraReducers`.
- `shared/lib/test/server.ts` — `setupServer()` **без** хендлеров; каждый
  тест добавляет свои через `server.use(...)`.
- `main.tsx` переключён на `App` из `@/app`; `src/App.tsx` удалён.

**Тест этапа**: `createMemoryRouter(routeObjects)` + `Provider` → в
документе есть навигация со ссылками «Поиск» и «Коллекция».

**Смена источника данных (решение принято по ходу этапа 1).**
themoviedb.org недоступен для регистрации из РФ, включая через VPN.
Источник данных — **poiskkino.dev** (неофициальный API Кинопоиска,
бывший kinopoisk.dev, переименован из-за товарного знака). Из-за этого
`shared/config/tmdb.ts` стал `poiskkino.ts` (`POISKKINO_API_BASE_URL =
"https://api.poiskkino.dev/v1.5"`), `VITE_TMDB_TOKEN` →
`VITE_POISKKINO_API_TOKEN`, авторизация — `X-API-KEY` вместо `Bearer`.
README и CLAUDE.md обновлены, решение записано в CLAUDE.md →
«Архитектурные решения». Подробности по самому API — в начале этапа 2.

---

## Этап 2 — сущность фильма (`feat/movie-entity`) — ✅ сделано

Подробности по факту (что изменилось относительно черновика, тесты,
временное исключение в steiger) — в
[`.claude/plans/stages/02-movie-entity.md`](stages/02-movie-entity.md).

Источник данных изменён после старта этапа 1: не TMDB, а **poiskkino.dev**
(неофициальный API Кинопоиска, бывший kinopoisk.dev) — регистрация на
themoviedb.org недоступна из РФ даже через VPN. Base URL и авторизация
(`X-API-KEY`) уже настроены в `shared/config`/`shared/api` по итогам
этапа 1. Решение записано в CLAUDE.md → «Архитектурные решения».

Отличия от типичной TMDB-интеграции, которые меняют форму сущности:

- поля ответа уже в camelCase (`name`, `year`, `description`, ...) —
  конвертация snake_case → camelCase внутри схемы не нужна;
- постер приходит готовым URL (`poster.url`, `poster.previewUrl`) —
  собственный `buildPosterUrl(path, size)` не нужен, только выбор
  между `url` и `previewUrl` (превью — для карточек в сетке);
- рейтинг — объект `rating.kp` / `rating.imdb` (несколько источников,
  берём `kp` как основной, `imdb` как запасной, если `kp` пуст);
- бесплатный ключ ограничивает поиск страницами 1–10 и `limit` ≤ 10 —
  это влияет на пагинацию в `pages/search` (этап 3), не на entity.

`entities/movie/`:

- `model/` — Zod-схемы: `movieSchema` (карточка/детали — poiskkino.dev
  отдаёт довольно полный объект уже при поиске, отдельная урезанная
  схема для карточки не нужна), `movieSearchResponseSchema` (поле с
  массивом результатов + `page`/`limit`/`pages` — точное имя поля
  массива подтвердить на реальном ответе в начале этапа, ожидается
  `docs`, характерно для этого API).
- `api/movie-api.ts` — `baseApi.injectEndpoints`: `searchMovies({ query, page })`
  (`GET /movie/search`) и `getMovieById(id)` (`GET /movie/{id}`); разбор
  ответа в `transformResponse` через `.parse`.
- `lib/` — чистые функции `selectPosterUrl(poster, size)` (выбор `url`
  vs `previewUrl`), `selectRating(rating)` (`kp` с фолбэком на `imdb`),
  `formatReleaseYear`.
- `ui/movie-card.tsx` + CSS-модуль: постер (с фолбэком-заглушкой, если
  `poster` пуст — бесплатный тариф отдаёт его не для всех фильмов),
  название, год, оценка. Карточка — ссылка на `/movie/:id`, ничего не
  «делает».
- `config/` — константы вроде дефолтного рейтинга при его отсутствии
  (магических значений в коде нет).
- `index.ts` — публичный API: хуки, компонент, типы.

**Тесты**: `movieSchema` отвергает ответ без обязательных полей (и сообщение
об ошибке внятное); `MovieCard` рендерит название, год и `alt` у постера;
отдельный кейс — фильм без постера рендерит заглушку, а не падает.

---

## Этап 3 — поиск (`feat/movie-search`) — ✅ сделано

Подробности по факту (что изменилось относительно черновика, тесты,
три исключения в steiger) — в
[`.claude/plans/stages/03-movie-search.md`](stages/03-movie-search.md).

Разделение ответственности, которое дальше переиспользуется:
**страница владеет данными, виджет — презентационный.** Так `movie-grid`
без изменений подойдёт странице коллекции на этапе 7.

- `features/movie-search/` — `model/use-search-params.ts`: чтение и запись
  `query` и `page` через `useSearchParams` (никакого `useState`), сброс
  страницы на первую при смене запроса, дебаунс ввода константой из `config`.
  `ui/search-input.tsx` — поле с `role="searchbox"` и подписью.
- `widgets/movie-grid/` — сетка `MovieCard` + пагинация; принимает
  `movies`, `isLoading`, `error`, `emptyMessage` пропсами; состояния
  «загрузка / пусто / ошибка» отрисовывает сам.
- `shared/ui/` — по факту надобности: `Pagination`, `Spinner`,
  `ErrorMessage`, `EmptyState`.
- `pages/search/` — читает URL, дергает `useSearchMoviesQuery`
  (`skip`, пока запрос пуст), отдаёт результат в виджет.

**Тесты** (MSW): happy path — пользователь вводит запрос, видит карточки,
в URL появляется `?query=...`; ошибка — TMDB отвечает 500, на экране
сообщение об ошибке, а не пустая сетка.

---

## Этап 4 — страница фильма (`feat/movie-page`) — ✅ сделано

- `widgets/movie-details/` — постер, название, слоган, год, хронометраж,
  жанры, оценка, описание. Презентационный, данные — пропсом.
- `pages/movie/` — `useParams` → `useGetMovieByIdQuery`, состояния загрузки
  и ошибки, невалидный `id` → сообщение, а не падение.

Отличие от черновика: реальный ответ 404 у poiskkino.dev не совпадает с
generic-сообщением `getQueryErrorMessage` («Сервер вернул ошибку (404)») —
для `error.status === 404` `pages/movie` показывает отдельное «Фильм не
найден», тот же текст — для невалидного (нечислового) `id` без обращения
к API. Заодно закрыт долг со stage 2: `entities/movie/index.ts` доэкспортировал
`selectPosterUrl`, `selectRating`, `formatRating`, `formatReleaseYear`,
`POSTER_SIZE`, плейсхолдеры — понадобились `widgets/movie-details`.

**Тесты**: happy path — детали фильма на экране; ошибка — poiskkino.dev
отвечает 404, показано сообщение «Фильм не найден»; невалидный `id` в
адресе — то же сообщение без запроса; отдельно — `widgets/movie-details`
рендерит поля и плейсхолдеры для отсутствующих данных.

---

## Этап 5 — коллекция (`feat/collection`)

`entities/collection-item/` — клиентское состояние, поэтому Redux-слайс,
а не RTK Query.

- `model/schema.ts` — `collectionStatusSchema` (`"want" | "watched"`),
  `noteSchema` (оценка, дата просмотра, теги, текст — все поля опциональны
  на уровне хранения), `collectionItemSchema` (`movieId`, `title`,
  `posterPath`, `status`, `addedAt`, `note?`). Заметка живёт здесь —
  один слайс, один ключ хранилища, никакой связки по id между сущностями.
- `model/slice.ts` — `createEntityAdapter` по `movieId`; экшены
  `itemAdded`, `statusChanged`, `itemRemoved`, `noteSaved`.
- `model/selectors.ts` — `selectItemByMovieId`, `selectItemsByStatus`.
- `model/persistence.ts` — чтение при старте (`preloadedState`) с разбором
  через Zod и молчаливым отбрасыванием битых записей **с логом в консоль**
  (пустой `catch` запрещён), запись через `createListenerMiddleware`.
  Ключ хранилища — именованная константа.
- `features/add-to-collection/` — `CollectionButton`: «Хочу посмотреть» →
  «Посмотрел» → «Убрать»; знает `movieId` и минимум данных для записи.
- Подключение: `widgets/movie-grid` и `widgets/movie-details` рендерят
  кнопку (widget → feature — импорт вниз, правила не нарушены).

**Тесты**: добавление фильма из результатов поиска меняет подпись кнопки и
кладёт запись в `localStorage`; битый JSON в `localStorage` не роняет
приложение — стартуем с пустой коллекцией.

---

## Этап 6 — заметка о фильме (`feat/rate-movie`)

- `features/rate-movie/` — форма на React Hook Form с `zodResolver`.
  Схема **не дублируется**: берём `noteSchema` из публичного API
  `entities/collection-item` и ужесточаем её для формы (обязательная оценка
  1–10, дата не в будущем, длина текста). Тип значений формы — `z.infer`,
  руками не пишем.
- Теги — контролируемый ввод чипами через `useController`.
- Отправка — `dispatch(noteSaved(...))`, серверного запроса нет.
- Форма показывается на странице фильма, когда статус записи `watched`.

**Тесты**: валидная заметка сохраняется и после перерендера видна в форме;
оценка вне диапазона → сообщения об ошибках у полей, диспатча не было.

---

## Этап 7 — страница коллекции (`feat/collection-page`)

- `pages/collection/` — вкладки «Хочу посмотреть» / «Посмотрел», активная
  вкладка в URL (`?status=want`), данные из селекторов слайса, отрисовка —
  тем же `widgets/movie-grid` без пагинации.
- Пустое состояние со ссылкой на поиск.

**Тесты**: переключение вкладки меняет состав списка и URL; пустая коллекция
показывает подсказку.

---

## Этап 8 — полировка (`feat/polish`)

- Страница 404 и `errorElement` у роутера.
- Скелетоны вместо спиннеров в сетке и на странице фильма.
- Доступность: фокус-стили, `aria-live` для результатов поиска, `lang`,
  осмысленный `<title>` на страницах.
- Обновить README (что реально умеет приложение) и раздел
  «Архитектурные решения» в `CLAUDE.md` — как минимум: правило
  «страница владеет данными, виджет презентационный», заметка внутри
  `collection-item`, схема persist коллекции.

---

## Риски, о которых стоит помнить

1. **MSW 2 в jsdom** — самая частая точка отказа. Если `jest-fixed-jsdom`
   не заведётся, запасной путь — `testEnvironment: "node"` для тестов схем
   и `undici`-полифилы в `jest.setup.ts`. Проверяем это на этапе 1, а не
   на этапе 3, когда тестов уже много.
2. **RTK Query в тестах** — store должен быть свежим на каждый тест, иначе
   кэш течёт между кейсами. Это зашито в `render-with-providers`.
   Хуки RTK Query не мокаем (запрет из `CLAUDE.md`).
3. **steiger и пустые слайсы** — линтер ругается на слайсы без публичного
   API и на «незначительные» слайсы из одного файла. Поэтому заглушки
   страниц на этапе 1 создаём сразу с `index.ts`, а не пустыми папками.
4. **`erasableSyntaxOnly: true`** в `tsconfig.app.json` запрещает enum и
   parameter properties — статусы коллекции описываем union-типом из Zod,
   а не `enum`.
5. **Токен poiskkino.dev** уходит в клиентский бандл (`VITE_`). README это
   уже оговаривает; ничего не меняем, но и не «прячем» имитацией безопасности.
6. **Бесплатный ключ poiskkino.dev** ограничивает поиск страницами 1–10 и
   `limit` ≤ 10 — учесть в пагинации `pages/search` на этапе 3, не выдавать
   пользователю страницу 11 как «нет результатов».

---

## Проверка

На каждом PR — чек-лист из `CLAUDE.md`, теперь ещё и в CI:

```bash
pnpm typecheck
pnpm lint
pnpm lint:fsd
pnpm test
```

Ручная проверка после этапов 3–7 (`pnpm dev`, нужен реальный `.env`):

1. `/` → ввести «matrix» → появились карточки, в URL `?query=matrix&page=1`.
2. Перейти на вторую страницу → URL обновился, «назад» возвращает на первую.
3. Клик по карточке → `/movie/:id` с деталями; F5 не ломает страницу.
4. «Хочу посмотреть» → `/collection`, фильм во вкладке «Хочу посмотреть».
5. Перевести в «Посмотрел» → появилась форма заметки → сохранить оценку,
   дату и теги → перезагрузить страницу → заметка на месте.
6. Отключить сеть в DevTools → поиск показывает сообщение об ошибке,
   а не бесконечный спиннер.
