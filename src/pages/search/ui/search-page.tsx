import { useSearchMoviesQuery } from "@/entities/movie";
import {
  MAX_SEARCH_RESULT_PAGE,
  SearchInput,
  useSearchMovieParams,
} from "@/features/movie-search";
import { useDocumentTitle } from "@/shared/lib";
import { MovieGrid } from "@/widgets/movie-grid";

import { FeaturedMovies } from "./featured-movies";

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

  return (
    <section>
      <h1>Поиск фильмов</h1>
      <SearchInput key={query} defaultValue={query} onQueryChange={setQuery} />
      {query === "" ? (
        <FeaturedMovies />
      ) : (
        <MovieGrid
          movies={data?.docs ?? []}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          isLoading={isFetching}
          error={error}
          emptyMessage={NO_RESULTS_MESSAGE}
        />
      )}
    </section>
  );
}
