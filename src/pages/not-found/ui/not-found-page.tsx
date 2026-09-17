import { Link } from "react-router-dom";

import { ROUTES } from "@/shared/config";
import { useDocumentTitle } from "@/shared/lib";

import styles from "./not-found-page.module.css";

const PAGE_TITLE = "Страница не найдена";

export function NotFoundPage() {
  useDocumentTitle(PAGE_TITLE);

  return (
    <section className={styles.section}>
      <h1>{PAGE_TITLE}</h1>
      <p>Такой страницы нет — проверьте адрес или начните с поиска.</p>
      <Link to={ROUTES.search}>Искать фильмы</Link>
    </section>
  );
}
