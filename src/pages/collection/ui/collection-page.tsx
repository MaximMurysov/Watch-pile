import { useSelector } from "react-redux";
import { Link, useSearchParams } from "react-router-dom";

import {
  collectionStatusSchema,
  selectItemsByStatus,
} from "@/entities/collection-item";
import type { CollectionStatus } from "@/entities/collection-item";
import { ROUTES } from "@/shared/config";
import { EmptyState } from "@/shared/ui";
import { MovieGrid } from "@/widgets/movie-grid";

import { collectionItemToMovie } from "../lib";

import styles from "./collection-page.module.css";

const STATUS_PARAM = "status";
const DEFAULT_STATUS: CollectionStatus = "want";

const TAB_LABELS: Record<CollectionStatus, string> = {
  want: "Хочу посмотреть",
  watched: "Посмотрел",
};

const EMPTY_MESSAGES: Record<CollectionStatus, string> = {
  want: "Пока нет фильмов, которые хотите посмотреть",
  watched: "Пока нет просмотренных фильмов",
};

const TAB_STATUSES = Object.keys(TAB_LABELS) as CollectionStatus[];

/** Коллекция не постранична — MovieGrid вызывается с totalPages=1, где Pagination не рендерится, onPageChange не сработает никогда. */
function handlePageChangeNoop(): void {}

function parseStatus(value: string | null): CollectionStatus {
  const result = collectionStatusSchema.safeParse(value);
  return result.success ? result.data : DEFAULT_STATUS;
}

export function CollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const status = parseStatus(searchParams.get(STATUS_PARAM));
  const items = useSelector(selectItemsByStatus(status));

  function handleStatusChange(nextStatus: CollectionStatus): void {
    setSearchParams({ [STATUS_PARAM]: nextStatus });
  }

  return (
    <section>
      <h1>Коллекция</h1>
      <div role="tablist" aria-label="Статус коллекции" className={styles.tabs}>
        {TAB_STATUSES.map((tabStatus) => (
          <button
            key={tabStatus}
            type="button"
            role="tab"
            aria-selected={status === tabStatus}
            className={
              status === tabStatus ? `${styles.tab} ${styles.tabActive}` : styles.tab
            }
            onClick={() => handleStatusChange(tabStatus)}
          >
            {TAB_LABELS[tabStatus]}
          </button>
        ))}
      </div>
      {items.length === 0 ? (
        <EmptyState message={EMPTY_MESSAGES[status]}>
          <Link to={ROUTES.search}>Искать фильмы</Link>
        </EmptyState>
      ) : (
        <MovieGrid
          movies={items.map(collectionItemToMovie)}
          page={1}
          totalPages={1}
          onPageChange={handlePageChangeNoop}
          isLoading={false}
          emptyMessage=""
          error={undefined}
        />
      )}
    </section>
  );
}
