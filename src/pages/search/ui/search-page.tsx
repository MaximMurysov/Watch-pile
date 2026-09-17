import { useSearchMoviesQuery } from "@/entities/movie";
import {
  MAX_SEARCH_RESULT_PAGE,
  SearchInput,
  useSearchMovieParams,
} from "@/features/movie-search";
import { useDocumentTitle } from "@/shared/lib";
import { MovieGrid } from "@/widgets/movie-grid";

const EMPTY_QUERY_MESSAGE = "Введите запрос, чтобы начать поиск";
const NO_RESULTS_MESSAGE = "По запросу ничего не найдено";
const PAGE_TITLE = "Поиск фильмов";

export function SearchPage() {
  useDocumentTitle(PAGE_TITLE);

  const { query, page, setQuery, setPage } = useSearchMovieParams();
  const { data, isFetching, error } = useSearchMoviesQuery(
    { query, page },
    { skip: query === "" },
  );

  const totalPages = Math.min(data?.pages ?? 0, MAX_SEARCH_RESULT_PAGE);
  const emptyMessage = query === "" ? EMPTY_QUERY_MESSAGE : NO_RESULTS_MESSAGE;

  return (
    <section>
      <h1>Поиск фильмов</h1>
      <SearchInput key={query} defaultValue={query} onQueryChange={setQuery} />
      <MovieGrid
        movies={data?.docs ?? []}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={isFetching}
        error={error}
        emptyMessage={emptyMessage}
      />
    </section>
  );
}
