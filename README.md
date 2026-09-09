# Watchpile

Поиск фильмов и ведение личной коллекции. Учебный проект: цель —
собрать SPA на React с полноценной архитектурой FSD, типизацией
и тестами.

Данные — [The Movie Database (TMDB)](https://www.themoviedb.org).

## Возможности

- поиск фильмов с пагинацией, состояние поиска хранится в URL
- страница фильма с подробной информацией
- личная коллекция: «хочу посмотреть» / «посмотрел»
- заметка о фильме: оценка, дата просмотра, теги, текст

## Стек

| Что               | Чем                                           |
| ----------------- | --------------------------------------------- |
| UI                | React 19, TypeScript (strict)                 |
| Сборка            | Vite 8                                        |
| Состояние и API   | Redux Toolkit 2, RTK Query                    |
| Формы и валидация | React Hook Form, Zod                          |
| Роутинг           | React Router 7                                |
| Тесты             | Jest, React Testing Library, MSW              |
| Стили             | CSS Modules                                   |
| Архитектура       | Feature-Sliced Design (проверяется `steiger`) |

Пакетный менеджер — **pnpm**.

## Запуск

Нужен Node.js 20+ и pnpm.

```bash
pnpm install
cp .env.example .env
pnpm dev
```

### Ключ TMDB

1. Зарегистрируйтесь на [themoviedb.org](https://www.themoviedb.org).
2. Settings → API → Request an API Key, план Developer (бесплатный).
3. В поле Application URL можно указать ссылку на GitHub-профиль
   или `https://localhost`.
4. Скопируйте **Read Access Token (v4)** и положите в `.env`:

```
VITE_TMDB_TOKEN=ваш_токен
```

> Токен с префиксом `VITE_` попадает в клиентский бандл и виден
> любому пользователю. Для учебного проекта с бесплатным ключом это
> допустимо; в продакшене запросы к API прячут за собственным
> бэкендом-прокси.

## Команды

```bash
pnpm dev         # дев-сервер
pnpm build       # прод-сборка
pnpm preview     # просмотр собранной версии
pnpm typecheck   # tsc -b --noEmit
pnpm lint        # eslint
pnpm format      # prettier по всему проекту
pnpm lint:fsd    # steiger, проверка правил слоёв
pnpm test        # jest
pnpm test:watch  # jest в режиме наблюдения
```

## Архитектура

Проект следует Feature-Sliced Design. Слои снизу вверх:

```
shared → entities → features → widgets → pages → app
```

```
src/
  app/         провайдеры (store, router), глобальные стили
  pages/       search, movie, collection
  widgets/     movie-grid, movie-details, header
  features/    movie-search, add-to-collection, rate-movie
  entities/    movie, collection-item
  shared/      api (baseApi), ui, lib, config
```

Правила:

- импорт разрешён только на нижние слои, никогда наверх;
- слайсы одного слоя не импортируют друг друга;
- импорт только из корня слайса (`@/entities/movie`), у каждого
  слайса есть `index.ts` с публичным API;
- сегменты внутри слайса: `ui`, `model`, `api`, `lib`, `config`.

Соблюдение проверяется командой `pnpm lint:fsd`.

### Состояние

Четыре вида состояния живут в разных местах и не дублируют друг
друга:

| Что                              | Где                        |
| -------------------------------- | -------------------------- |
| Данные с сервера (фильмы, поиск) | кэш RTK Query              |
| Запрос, страница, фильтры        | URL (`useSearchParams`)    |
| Коллекция и заметки              | Redux-слайс + localStorage |
| Значения формы                   | React Hook Form            |

### Работа с API

`createApi` объявлен в `shared/api` с пустым `endpoints`.
Конкретные эндпоинты добавляются через `injectEndpoints` в
`entities/<name>/api`.

Ответы TMDB валидируются схемами Zod в `transformResponse`. Типы
данных выводятся из схем через `z.infer` и не пишутся руками — схема
остаётся единственным источником правды. Та же схема используется
в формах через `zodResolver`.

## Тесты

```bash
pnpm test
```

- Каждая законченная фича покрыта минимум двумя тестами: happy path
  и поведение при ошибке API.
- Сеть мокается через MSW. `fetch` вручную не мокается, хуки RTK
  Query не подменяются.
- Тестируется поведение, а не реализация: элементы ищутся по ролям
  и видимому тексту.
- Общая обёртка для рендера (`Provider` + `MemoryRouter`) лежит
  в `shared/lib/test`.

## Соглашения

- Файлы — `kebab-case`, компоненты — `PascalCase`, хуки — `useXxx`.
- `any`, `@ts-ignore` и `@ts-nocheck` запрещены.
- Валидация на границе (ответ API, форма, парсинг); внутри доверяем
  типам.
- Секреты только в `.env`, в репозитории — `.env.example`.

Полный свод правил, включая инструкции для AI-агентов, —
в [`CLAUDE.md`](./CLAUDE.md).

## Лицензия и данные

Проект использует TMDB API, но не одобрен и не сертифицирован TMDB.
Учебный проект, не предназначен для коммерческого использования.
