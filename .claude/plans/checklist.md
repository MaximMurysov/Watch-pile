# Чек-лист прогресса — Watchpile

Ход работы по [plan.md](./plan.md). Один этап — одна feature-ветка — один
PR в `main`. Отмечать по факту завершения.

## Чек-лист на каждый PR (из `CLAUDE.md`)

- [ ] `pnpm typecheck` — зелёный
- [ ] `pnpm lint` — зелёный
- [ ] `pnpm lint:fsd` — зелёный
- [ ] `pnpm test` — зелёный
- [ ] Ревью субагентом `code-reviewer` пройдено, замечаний [критично] нет
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

## Этап 4 — Страница фильма (`feat/movie-page`) — ✅ сделано

- [x] `widgets/movie-details` — презентационный виджет (постер, название,
      слоган, год, хронометраж, жанры, рейтинг, описание; данные пропсом)
- [x] `pages/movie` — `useParams` → `useGetMovieByIdQuery`; невалидный
      (нечисловой) `id` — «Фильм не найден» без запроса к API (`skip`)
- [x] Долг с этапа 2 закрыт: `entities/movie/index.ts` доэкспортирует
      `selectPosterUrl`, `selectRating`, `formatRating`, `formatReleaseYear`,
      `POSTER_SIZE`, плейсхолдеры — понадобились `widgets/movie-details`
- [x] `steiger.config.js` — снято временное исключение `fsd/insignificant-slice`
      для `entities/movie` (вторая страница — `pages/movie`, условие снятия
      зафиксировано на этапе 3); добавлено новое, постоянное — для
      `widgets/movie-details` (единственный потребитель `pages/movie` и
      по плану других не будет; слайс выделен ради правила «страница
      владеет данными, виджет презентационный», не ради переиспользования)
- [x] Тест: happy path — детали на экране (`pages/movie`, MSW)
- [x] Тест: 404 → «Фильм не найден» (`pages/movie`, MSW)
- [x] Тест: невалидный id в адресе → «Фильм не найден» без запроса
- [x] Тест: `widgets/movie-details` — рендер полей и плейсхолдеров
      (полный набор данных и полностью пустой фильм)
- [x] Ручная проверка в браузере (`pnpm dev`, реальный `.env`): id 301
      («Матрица») — постер, название, год, хронометраж, жанры, рейтинг,
      описание на месте; id 14999999 (валиден по диапазону API, но не
      существует) → 404 → «Фильм не найден»; `/movie/not-a-number` →
      «Фильм не найден» без запроса к API
- [x] Чек-лист PR (typecheck/lint/lint:fsd/test/build — все зелёные)
- [x] PR [#11](https://github.com/MaximMurysov/Watch-pile/pull/11) →
      merge → удаление ветки (локально и на origin, origin — автоматически)

## Этап 5 — Коллекция (`feat/collection`) — ✅ сделано

- [x] `entities/collection-item/model` — схемы (`collectionStatusSchema`,
      `collectionNoteSchema`, `collectionItemSchema`), слайс
      (`createEntityAdapter<CollectionItem, number>` по `movieId` — вторая
      generic-параметр обязательна в RTK 2.x, когда id-поле называется не
      `id`), селекторы (`selectItemByMovieId`, `selectItemsByStatus`,
      типизированы на свой кусок стейта, не на `RootState` — правило FSD:
      entity не может импортировать `app`)
- [x] `entities/collection-item/model/persistence` — чтение при старте
      (`loadPersistedCollectionState`, поэлементная Zod-валидация,
      битые записи отбрасываются с `console.warn`, как `parseMovieDocs`
      на этапе 2) + запись через `createListenerMiddleware`
      (`collectionPersistenceMiddleware`)
- [x] `features/add-to-collection` — `CollectionButton`, цикл «Хочу
      посмотреть» → «Посмотрел» → «Убрать»; диспатч/селектор через
      `useDispatch`/`useSelector` из `react-redux` напрямую (не
      типизированные хуки `app/model` — их нельзя импортировать снизу вверх)
- [x] Подключено в `movie-grid` (сиблинг `MovieCard` в `<li>`, не внутри
      `<Link>` карточки) и `movie-details`
- [x] Отклонение от черновика плана: поле названо `posterUrl`, не
      `posterPath` — poiskkino.dev отдаёт готовый URL, не path (как и вся
      сущность `movie`, см. `selectPosterUrl` с этапа 2); `posterPath` в
      `plan.md` — след черновика с другим источником данных (TMDB)
- [x] `shared/lib/test/render-with-providers` расширен опцией
      `extraMiddleware` (по аналогии с уже существующей `extraReducers`) —
      нужна, чтобы тест кнопки мог проверить фактическую запись в
      `localStorage` через `collectionPersistenceMiddleware`
- [x] Кнопка коллекции появилась в `movie-grid`/`movie-details` → тесты
      этих виджетов и `pages/search`/`pages/movie` (рендерят виджеты
      транзитивно) обновлены: передают `extraReducers: { collectionItems:
      collectionReducer }`, иначе падают без Redux-контекста
      коллекции — не в исходном плане, но необходимо для зелёного `test`
- [x] Найдено на реализации: `steiger` рапортует `fsd/insignificant-slice`
      («has no references») для `features/add-to-collection`, хотя слайс
      реально подключён в двух виджетах (проверено кодом) — тот же класс
      ограничений анализа зависимостей, что и у трёх уже существующих
      исключений этого правила в `steiger.config.js`. Добавлено четвёртое,
      постоянное исключение с той же мотивировкой
- [x] Тест: `entities/collection-item` — схема отвергает запись без
      `movieId`/с неизвестным статусом, `parseCollectionItems` отбрасывает
      битые записи с предупреждением; слайс — все 4 экшена
      (`itemAdded`/`statusChanged`/`itemRemoved`/`noteSaved`); persistence —
      валидный JSON, отсутствие записи, битый JSON (не роняет, стартует
      пустой), запись через middleware
- [x] Тест: `features/add-to-collection` — happy path, полный цикл клика
      («хочу» → «посмотрел» → «убрать») меняет подпись кнопки и
      содержимое `localStorage` на каждом шаге
- [x] Чек-лист PR (typecheck/lint/lint:fsd/test/build — все зелёные)
- [ ] PR → merge → удаление ветки

## Этап 6 — Заметка о фильме (`feat/rate-movie`) — ✅ сделано

- [x] `features/rate-movie/model/schema.ts` — `rateMovieFormSchema`:
      `collectionNoteSchema.extend(...)`, не независимая схема с нуля —
      оценка обязательна (1–10), дата просмотра обязательна и не в
      будущем, текст ограничен по длине. Оценку валидируем `.refine(Number
      .isFinite, ...)` перед `.min`/`.max` — RHF конвертирует пустое
      числовое поле в `NaN` (`valueAsNumber`), а `typeof NaN === "number"`,
      из-за чего голый `z.number()` и сравнения `min`/`max` с `NaN` его
      пропускают
- [x] `features/rate-movie/lib/build-default-values.ts` — `defaultValues`
      формы из заметки коллекции (оценка/дата — `undefined`, если заметки
      ещё нет, а не произвольное значение за пользователя)
- [x] `features/rate-movie/ui/rate-movie-form.tsx` — RHF + `zodResolver`;
      сама читает статус записи коллекции (`useSelector`) и не
      рендерится, пока не `watched` — по аналогии с `CollectionButton`,
      который так же сам решает, что показать, а не получает это пропсом;
      `useEffect` на изменение заметки в сторе вызывает `reset(...)` —
      после сохранения и при повторном заходе форма показывает то, что
      реально лежит в коллекции, а не только то, что успел напечатать
      пользователь
- [x] `features/rate-movie/ui/tags-field.tsx` — теги контролируемым
      вводом чипами через `useController`; дубликаты и превышение длины
      тега молча отбрасываются (не блокирующее UX-решение, не ошибка
      валидации формы)
- [x] Подключено в `widgets/movie-details` (после описания, тем же
      `.info`-блоком, что и `CollectionButton`)
- [x] Тест: `rateMovieFormSchema` — валидная заметка, оценка вне
      диапазона, отсутствующие оценка/дата, дата в будущем, слишком
      длинный текст
- [x] Тест: `RateMovieForm` — не рендерится при статусе не `watched`;
      happy path — сохранение через реальный `localStorage`
      (persistence-middleware, не мок `noteSaved`) и то же значение видно
      после `rerender()`; оценка вне диапазона → сообщение об ошибке,
      `noteSaved` не сохранил заметку
- [x] Найдено на реализации и добавлено отдельным тестом: `rerender()` из
      результата `renderWithProviders` не переоборачивал дерево в
      `Provider`/`MemoryRouter` (ручной JSX-враппер вместо опции RTL
      `wrapper`) — падало «could not find react-redux context value» при
      проверке «заметка видна после перерендера». Функция переведена на
      `render(ui, { wrapper })`, дополнительно теперь возвращает `store`
      (понадобился, чтобы тест мог заранее положить в коллекцию запись
      со статусом `watched`, минуя `CollectionButton`)
- [x] `steiger.config.js` — пятое, постоянное исключение
      `fsd/insignificant-slice` для `features/rate-movie` (единственный
      потребитель — `widgets/movie-details`, тот же класс ограничений
      анализа зависимостей steiger, что и у четырёх предыдущих исключений)
- [x] Ревью субагентом `code-reviewer`: найден и исправлен баг [важно] —
      сравнение «дата не в будущем» шло по UTC-дате (`toISOString()`)
      вместо локальной; в часовых поясах восточнее UTC (вся Россия) в
      начале суток по местному времени реальное «сегодня» ошибочно
      отклонялось как будущее. Исправлено на локальные компоненты даты
      (`getFullYear/getMonth/getDate`), баг закреплён регрессионным
      тестом (`TZ=Europe/Moscow` + `jest.useFakeTimers().setSystemTime`) —
      тест целенаправленно проверен на исходной (баговой) реализации,
      что действительно падает. Два замечания [мелочь] тоже исправлены:
      статус `watched` берётся из `collectionStatusSchema.enum.watched`
      вместо отдельного строкового литерала; границы `min`/`max` инпута
      оценки берутся из `RATING_RANGE`, а не захардкожены отдельно от
      Zod-схемы
- [x] Чек-лист PR (`typecheck`/`lint`/`lint:fsd`/`test`/`build` — все
      зелёные)
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
