# Этап 3 — поиск (`feat/movie-search`)

Реализовано по TDD, как этап 2: для каждого модуля сначала тест, проверка
падения, потом реализация до зелёного прогона. Порядок: `shared/lib` →
`shared/ui` → `features/movie-search` (`config` → `lib` → `model` → `ui`) →
`widgets/movie-grid` → `pages/search`.

## Что сделано

```
src/shared/lib/
  get-query-error-message.ts(+.test)   FetchBaseQueryError|SerializedError → текст
  index.ts

src/shared/ui/
  spinner.tsx, error-message.tsx(+.test), empty-state.tsx, pagination.tsx(+.test)
  index.ts

src/features/movie-search/
  config/constants.ts   SEARCH_QUERY_PARAM, SEARCH_PAGE_PARAM,
                         MIN_SEARCH_PAGE, DEFAULT_SEARCH_PAGE,
                         MAX_SEARCH_RESULT_PAGE, SEARCH_INPUT_DEBOUNCE_MS
  lib/clamp-search-page.ts(+.test)
  model/use-search-movie-params.ts(+.test)
  ui/search-input.tsx(+.test), search-input.module.css
  index.ts   — useSearchMovieParams, SearchInput, MAX_SEARCH_RESULT_PAGE

src/widgets/movie-grid/
  ui/movie-grid.tsx(+.test), movie-grid.module.css
  index.ts

src/pages/search/
  ui/search-page.tsx (переписан), search-page.test.tsx
```

`steiger.config.js` — три точечных исключения `fsd/insignificant-slice`
(подробности ниже, в «Что изменилось относительно плана»).

## Разделение ответственности

Как и планировалось: `pages/search` владеет данными
(`useSearchMoviesQuery`), `widgets/movie-grid` — презентационный, сам
решает, что показать по пропсам `isLoading`/`error`/`movies`. Это же
поведение без изменений подключится к `pages/collection` на этапе 7.

- `features/movie-search/model/use-search-movie-params` — единственный
  источник `query`/`page` — `useSearchParams`, **без `useState`** нигде в
  хуке. Дебаунс записи `query` — таймер в `useRef` вокруг
  `setSearchParams`, а не отдельное поле состояния (иначе появился бы
  второй источник правды, расходящийся с URL).
- `features/movie-search/ui/search-input` — **неконтролируемый** `<input>`
  (`defaultValue` + `onChange`), тоже без `useState`. Значение поля живёт
  в DOM. Если `query` в URL меняется извне (кнопка «назад» в браузере),
  `pages/search` монтирует инпут заново через `key={query}` — так значение
  поля переезжает вслед за URL без контролируемого состояния.
- `widgets/movie-grid` — сетка `MovieCard` + `Pagination`; сам вызывает
  `getQueryErrorMessage(error)` и рисует `Spinner`/`ErrorMessage`/
  `EmptyState`/сетку в зависимости от пропсов.
- `shared/lib/get-query-error-message` — общий перевод ошибки RTK Query
  в текст (сеть/таймаут → одно сообщение, `CUSTOM_ERROR`/`PARSING_ERROR`
  → текст ошибки как есть — сюда попадает и `SCHEMA_VALIDATION_ERROR_MESSAGE`
  из этапа 2, — числовой статус → `Сервер вернул ошибку (N)`). Не в
  виджете — этим же воспользуется `widgets/movie-details` на этапе 4.

## Что изменилось относительно плана / решения по ходу работы

Три момента обсуждались с пользователем отдельно, до и во время
реализации — фиксирую здесь, что решено и почему.

### 1. Незакоммиченный README.md на `main`

Перед созданием ветки на `main` обнаружено незакоммиченное изменение
README (удалён раздел «Лицензия и данные» про poiskkino.dev). Не
относится к этапу 3. По решению пользователя — оставлено как есть и
унесено в ветку `feat/movie-search` вместе с остальными изменениями;
войдёт в PR этого этапа.

### 2. Где хранить `MAX_SEARCH_RESULT_PAGE`

Лимит бесплатного ключа poiskkino.dev (страницы 1–10) — по решению
пользователя лежит в `features/movie-search/config`, не в
`entities/movie/config`. Причина: единственный текущий потребитель —
клампинг `page` из URL и `totalPages` на `pages/search`; `entities/movie`
не публикует лишний экспорт ради constant, которым сам не пользуется.

### 3. `fsd/insignificant-slice` считает не прямые импорты, а страницы

Ожидание в конце этапа 2 было: «сущность перестанет быть незначительной,
как только `pages/search` подключит `useSearchMoviesQuery`/`MovieCard`».
Оказалось не так — `steiger` считает не количество прямых импортов, а
количество **разных страниц**, до которых слайс доходит транзитивно.
`entities/movie` после этапа 3 доходит только до одной страницы
(`pages/search` — напрямую через хук и через `widgets/movie-grid`), и
предупреждение осталось, просто с другой формулировкой («only one
reference in slice pages\search» вместо «no references»).

То же самое проявилось и для новых слайсов этапа: `features/movie-search`
и `widgets/movie-grid` тоже пока доходят только до одной страницы. Разбор
и решение по каждому — отдельно, после сравнения плюсов/минусов с
пользователем:

- **`entities/movie`** — временное исключение (как и было в этапе 2, но
  с исправленным условием снятия): снять на этапе 4, когда `pages/movie`
  тоже станет напрямую использовать сущность (`getMovieById`/детали) —
  тогда страниц-потребителей станет две.
- **`widgets/movie-grid`** — временное исключение: снять на этапе 7,
  когда `pages/collection` подключит тот же виджет для списка коллекции.
- **`features/movie-search`** — **постоянное** исключение. По плану
  `pages/collection` не станет вторым потребителем: там вкладки статуса,
  а не поиск, второй страницы для этой фичи не появится никогда.
  Формальная эвристика FSD в этом случае советует держать код в
  `pages/search` (используется в одном месте — не выноси). Решение
  пользователя — оставить отдельным слайсом: `use-search-movie-params` и
  `SearchInput` изолированно тестируются (12 тестов на уровне фичи) и не
  путаются с остальной композицией страницы; тот же принцип уже заложен
  в план для `features/add-to-collection` и `features/rate-movie`
  (этапы 5–6) — у обоих тоже по одному архитектурному потребителю.

Все три исключения — точечные `files: [...]` в `steiger.config.js` с
комментарием о причине и (где применимо) условием снятия, тем же
механизмом, что уже использовался в этапе 1 (для тестовых файлов
`eslint.config.js`) и в этапе 2.

### Явный `page=1` в URL при новом запросе

`use-search-movie-params.setQuery` при первой реализации **удалял**
параметр `page` из URL вместо явной записи `page=1` — семантически то же
самое (клампинг читает отсутствие параметра как страницу 1), но
интеграционный тест `pages/search` показал, что URL после ввода запроса
выглядит как `?query=матрица` без видимого `page` — расходится с
описанием в `plan.md` («в URL появляется `?query=matrix&page=1`»).
Исправлено: `setQuery` явно устанавливает `page=1` в URL — ссылку можно
скопировать, и в ней сразу видно обе части состояния поиска.

## Тесты

16 test suites, 56 тестов всего в проекте (было 8/24 после этапа 2).
Новые в этом этапе:

- `get-query-error-message.test.ts` — сеть/таймаут, `CUSTOM_ERROR`,
  `PARSING_ERROR`, числовой статус, `SerializedError` с `message` и без,
  `undefined`.
- `error-message.test.tsx`, `pagination.test.tsx` — `shared/ui`.
- `clamp-search-page.test.ts` — границы `[1, 10]`, `NaN`.
- `use-search-movie-params.test.tsx` — чтение из URL, клампинг `page` из
  URL, дебаунс `setQuery` (несколько вызовов подряд → одно применение),
  сброс `page` при смене `query`, `setPage` клампится.
- `search-input.test.tsx` — доступное поле (`role="searchbox"`),
  `onQueryChange` на каждое изменение.
- `movie-grid.test.tsx` — загрузка/ошибка/пусто/данные + клик по
  пагинации.
- `search-page.test.tsx` — happy path (MSW): ввод запроса → карточка на
  экране → `query`/`page` в URL; ошибка (MSW 500): `alert` с текстом
  вместо пустой сетки.

## Ручная проверка

Продакшен-сборка (`pnpm build`) прошла чисто. Прямой запрос к реальному
`https://api.poiskkino.dev/v1.5/movie/search` с ключом из `.env`
подтвердил контракт (200, форма ответа совпадает с ожидаемой схемой).
Живой клик по интерфейсу в браузере в этой сессии **не проверен** —
инструмента управления браузером не было, а порт `5173` уже был занят
процессом дев-сервера пользователя. Ручной прогон пп. 1–3 из чек-листа
плана (`/` → «matrix» → карточки, вторая страница, клик по карточке)
остаётся за пользователем перед мержем.

## Чек-лист

- [x] `pnpm typecheck` — зелёный
- [x] `pnpm lint` — зелёный
- [x] `pnpm lint:fsd` — зелёный (три точечных исключения
      `fsd/insignificant-slice`, см. выше)
- [x] `pnpm test` — зелёный (16 suites, 56 tests)
- [x] `pnpm build` — зелёный
- [x] Лимит бесплатного ключа poiskkino.dev (страницы 1–10) учтён:
      `clampSearchPage` в URL и `totalPages` на странице
- [x] Новый код лежит в правильном слое, импорты только вниз
- [x] У каждого нового слайса/сегмента есть `index.ts`
- [x] Нет `console.log`, `debugger`, TODO без причины, закомментированного
      кода
- [x] Изменённые файлы относятся к задаче: `shared/lib`, `shared/ui`,
      `features/movie-search`, `widgets/movie-grid`, `pages/search`,
      `steiger.config.js` — плюс унесённое в ветку стороннее изменение
      README (см. «Что изменилось» п. 1, решение пользователя)
- [x] README — без изменений: раздел «Возможности» уже заранее описывал
      поиск с пагинацией в URL (README писался на конечное состояние
      приложения, см. `plan.md` → Context); теперь это описание стало
      правдой, но само оно не изменилось и ничего не
      искажает
- [x] Архитектурные решения записаны здесь; в `CLAUDE.md` →
      «Архитектурные решения» ничего не добавлено — все решения этапа
      специфичны для `features/movie-search`/`widgets/movie-grid`, не
      меняют стек или сквозной подход проекта
- [ ] Ручная проверка в браузере (пп. 1–3 чек-листа плана) — не выполнена
      в этой сессии, см. «Ручная проверка» выше
