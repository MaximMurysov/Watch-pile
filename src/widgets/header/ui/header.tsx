import { NavLink } from "react-router-dom";

import { ROUTES } from "@/shared/config";

import styles from "./header.module.css";

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavLink
          to={ROUTES.search}
          end
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Поиск
        </NavLink>
        <NavLink
          to={ROUTES.collection}
          className={({ isActive }) =>
            isActive ? `${styles.link} ${styles.linkActive}` : styles.link
          }
        >
          Коллекция
        </NavLink>
      </nav>
    </header>
  );
}
