# Этап 9 — карбоновая тема (`feat/carbon-theme`)

Не было в исходной карте `plan.md` — визуальный рестайлинг по прямому
запросу пользователя после этапа 8 («полировка»): карбоновый тёмный фон,
минимум красных акцентов, плавные переходы между страницами и при
добавлении фильма в коллекцию.

## Что сделано

```
src/app/
  app.tsx (изменён — MotionConfig reducedMotion="user")
  router/root-layout.tsx (изменён — AnimatePresence + motion.div вокруг Outlet)
  styles/index.css (переписан — карбоновые токены, единая тёмная тема)

src/widgets/
  header/ui/header.tsx (изменён — layoutId-подчёркивание активной ссылки)
  header/ui/header.module.css (изменён)
  movie-grid/ui/movie-grid.tsx (изменён — stagger-появление карточек)
  movie-details/ui/movie-details.module.css (изменён — карбоновая панель, жанры)

src/entities/movie/ui/
  movie-card.tsx (изменён — CSS hover/active вместо framer-motion жестов)
  movie-card.module.css (изменён)

src/features/
  add-to-collection/ui/collection-button.tsx (изменён — motion.span пуш при смене статуса)
  add-to-collection/ui/collection-button.module.css (новый)
  movie-search/ui/search-input.module.css (изменён — фокус-кольцо)
  rate-movie/ui/rate-movie-form.tsx (изменён — entrance-анимация формы)
  rate-movie/ui/rate-movie-form.module.css (изменён — акцентная кнопка сабмита)
  rate-movie/ui/tags-field.tsx (изменён — entrance-анимация чипа тега)
  rate-movie/ui/tags-field.module.css (изменён)

src/pages/
  collection/ui/collection-page.tsx (изменён — layoutId-подчёркивание таба)
  collection/ui/collection-page.module.css (изменён)
  not-found/ui/not-found-page.tsx (изменён)
  not-found/ui/not-found-page.module.css (новый)

src/shared/lib/test/setup.ts (изменён — мок window.matchMedia)

package.json, pnpm-lock.yaml (изменены — framer-motion в dependencies)
README.md, CLAUDE.md (изменены)
```

## Почему так

### Выбор механизма переходов: Framer Motion, не View Transitions API

Изначально обсуждались два варианта без новой зависимости (нативный
View Transitions API браузера, `viewTransition` проп у `Link`/`NavLink`
react-router) и с зависимостью (`framer-motion`). Пользователь по ходу
диалога явно выбрал framer-motion — до этого успел попросить Ant Design
(полноценный UI-кит), что оказалось недоразумением/опечаткой и было
переспрошено и отклонено, чтобы не расширять объём задачи и не
конфликтовать со стеком проекта (`CSS Modules`, без UI-библиотек).
Пользователь также установил сторонний скилл `framer-motion-animator`
(через Skills SH) не в ту директорию (`.agents/skills/`) — перемещён в
`.claude/skills/framer-motion-animator/`, рядом со скиллом FSD, и
использован как справочник по паттернам библиотеки.

### Единая тёмная тема, без `prefers-color-scheme`

Карбон — тёмная эстетика по своей сути; пользователь подтвердил отказ
от светлого варианта. `color-scheme: dark` фиксирован в `:root`, блок
`@media (prefers-color-scheme: dark)` убран целиком — тема больше не
зависит от системных настроек.

### Токены (`app/styles/index.css`)

`--bg`/`--bg-texture` — карбоновая текстура: два наложенных
`repeating-linear-gradient` под противоположными углами почти нулевой
непрозрачности + едва заметный красноватый `radial-gradient` сверху,
без внешних изображений. `--surface`/`--surface-raised` — поверхности
карточек/панелей чуть светлее фона. `--accent`/`--accent-strong` —
приглушённый красный, используется точечно: рейтinг, активная
вкладка/ссылка, фокус, кнопка «Посмотрел», жанры/теги, кнопка
сохранения заметки. `--danger` — отдельный токен для `ErrorMessage`
(семантически не то же самое, что декоративный акцент, хотя оба
красные). Базовые стили `button`/`input`/`textarea`/`select` в
`index.css` — раньше эти элементы не были стилизованы вовсе (голый
UA-стиль), теперь получают карбоновый вид по умолчанию, компонентные
`*.module.css` только переопределяют частности.

### Framer Motion: что используется, а что — сознательно нет

- `AnimatePresence` + `motion.div` (`root-layout.tsx`) — единственный
  механизм переходов между страницами, fade + небольшой сдвиг по `key={location.pathname}`.
- `layoutId` для скользящего подчёркивания активной ссылки/вкладки
  (`header.tsx`, `collection-page.tsx`).
- `motion.span key={label}` в `CollectionButton` — «пуш»-анимация при
  смене подписи (хочу/посмотрел/убрать), без `AnimatePresence`: старый
  и новый текст не существуют в DOM одновременно, замена мгновенная и
  синхронная — важно для accessible name кнопки (см. ниже про тесты).
- `variants`-stagger в `movie-grid.tsx` — карточки появляются с
  небольшой задержкой друг за другом, только entrance, без exit.
- Entrance-анимации без `AnimatePresence`: `RateMovieForm` (fade-up при
  монтировании), тег в `TagsField` (pop при добавлении).

**Осознанно не используются нигде в проекте: `whileHover`, `whileTap`,
`onTap`, `drag`.** Причина — техническая несовместимость, а не вкусовая:
эти пропсы регистрируют нативные `addEventListener(type, handler,
{ signal })` (`motion-dom`, gestures/hover.ts и press/index.ts). Тестовое
окружение проекта — `jest-fixed-jsdom`, которое **осознанно** подменяет
глобальные `AbortController`/`AbortSignal` на нативные из Node (нужно
для MSW/`fetch`, см. его `index.js`). jsdom бракует такой `signal` при
`addEventListener` («parameter 3 dictionary has member 'signal' that is
not of type 'AbortSignal'») — падают все тесты, где рендерится
motion-компонент с `whileHover`/`whileTap` (сначала уронило 7 test
suites: `MovieCard`, `CollectionButton` и всё, что их рендерит
транзитивно). Исправлено не патчем `EventTarget.prototype` (слишком
инвазивно и маскирует потенциальные реальные баги), а отказом от
gesture-пропсов: hover/tap-фидбек сделан на чистом CSS (`:hover`,
`:active`, `transition`) — визуально не хуже, задача («плавность») не
теряется. `layout`/`variants`/`initial`/`animate`/`AnimatePresence` без
gesture-пропсов этой проблемы не создают (не регистрируют такие
слушатели) и используются свободно. Решение и мотивировка зафиксированы
в `CLAUDE.md` → «Архитектурные решения», чтобы не наступить повторно.

### Найдено на ревью code-reviewer, [важно]: дублирующий механизм переходов

Помимо `AnimatePresence`, на `Link`/`NavLink` в `header.tsx`,
`movie-card.tsx`, `not-found-page.tsx`, `collection-page.tsx` был
добавлен проп `viewTransition` (нативный View Transitions API
react-router) — второй, независимый механизм анимации поверх той же
навигации. В Chromium это давало потенциально два наложенных перехода
(браузerный кросс-фейд документа + fade/translate от framer-motion).
Добавлено по инерции, не было частью согласованного решения (выбрали
framer-motion как единственный механизм). **Исправлено**: `viewTransition`
убран отовсюду, остался один механизм — `AnimatePresence` в
`root-layout.tsx`.

Три замечания [мелочь] от того же ревью **оставлены без изменений** по
решению пользователя (попросил исправить только [важно]):

- неиспользуемые CSS custom properties `--surface-raised` и
  `--social-bg` в `index.css`;
- внешний `motion.button` в `CollectionButton` не имеет собственных
  `initial`/`animate` (анимирует только вложенный `motion.span`) —
  избыточная, но безвредная обёртка;
- красный акцент используется чуть шире буквального «минимально»
  (жанры/теги залиты им целиком, не только обводкой) — подтверждено
  визуально скриншотами, возражений не было.

### Ограничения области: только визуал

Диф не трогает `entities/collection-item`, RTK Query, схемы Zod,
URL-параметры — вся логика данных вне периметра задачи.

## Тесты

Новых поведенческих тестов не добавлено — задача чисто визуальная
(CSS + анимации), которая не поддаётся содержательной проверке через
RTL (аналогично фокус-стилям/скелетонам на этапе 8). Существующие 31
suite / 101 test остаются зелёными без изменений набора; изменение —
только один инфраструктурный мок:

- `shared/lib/test/setup.ts` — `window.matchMedia` (jsdom его не
  реализует), нужен `MotionConfig reducedMotion="user"` в `app.tsx`.

При реализации специально проверялось (вручную, не автотестом), что ни
один exit-анимационный паттерн (`AnimatePresence` с реальным удалением
из DOM) не задет местами, где тесты синхронно проверяют исчезновение
элемента без `waitFor`: `collection-page.test.tsx` (переключение
таба), `rate-movie-form.test.tsx` (удаление тега),
`collection-button.test.tsx` (смена подписи без `waitFor` сразу после
клика). Во всех трёх местах анимация — только entrance/re-mount по
`key`, без `AnimatePresence`.

## Ручная проверка

`pnpm dev` + headless Playwright (одноразовый скрипт, не сохранён в
репозитории, аналогично этапу 8), реальный `.env`:

- `/` → поиск «матрица» → карточки на карбоновом фоне, красные рейтинги,
  hover-подъём карточки;
- клик по карточке → `/movie/:id` (плавный переход) → карбоновая панель
  деталей, жанры красными чипами;
- «Хочу посмотреть» → «Посмотрел» (два клика) → кнопка меняет цвет,
  появляется форма «Заметка о просмотре» с карбоновыми полями и
  акцентной кнопкой сохранения;
- `/collection` → вкладки с красным скользящим подчёркиванием, карточка
  добавленного фильма на месте;
- несуществующий путь → 404 с рабочей ссылкой на поиск, header на месте.

`console --errors` — пусто на всех шагах. `pnpm build` — зелёный
(бандл вырос из-за framer-motion, предупреждение о размере чанка не
устраняется — вне объёма задачи, code-splitting не запрашивался).

## Чек-лист

- [x] `pnpm typecheck` — зелёный
- [x] `pnpm lint` — зелёный
- [x] `pnpm lint:fsd` — зелёный
- [x] `pnpm test` — зелёный (31 suite, 101 test)
- [x] `pnpm build` — зелёный
- [x] Ревью субагентом `code-reviewer` — критичных замечаний нет; 1
      [важно] исправлено (дублирующий `viewTransition`); 3 [мелочь]
      осознанно оставлены без изменений по решению пользователя
- [x] Новый код лежит в правильном слое, импорты только вниз
- [x] Новые файлы (`collection-button.module.css`,
      `not-found-page.module.css`) — часть существующих слайсов, свой
      `index.ts` не требуется (не новые слайсы)
- [x] Нет `console.log`, `debugger`, TODO без причины,
      закомментированного кода
- [x] Изменены только файлы, относящиеся к задаче
- [x] README обновлён (новая возможность в списке, Framer Motion в
      таблице стека)
- [x] Архитектурные решения дописаны в CLAUDE.md: единая тёмная тема,
      единственный механизм переходов (Framer Motion, не
      `viewTransition`), несовместимость `whileHover`/`whileTap` с
      `jest-fixed-jsdom`
- [x] Прогресс отмечен в `.claude/plans/checklist.md`
- [x] Ручная проверка в браузере — сделана (см. «Ручная проверка» выше)
