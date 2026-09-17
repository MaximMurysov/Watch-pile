import { motion } from "framer-motion";
import { NavLink } from "react-router-dom";

import { ROUTES } from "@/shared/config";

import styles from "./header.module.css";

const UNDERLINE_LAYOUT_ID = "nav-active-underline";

interface NavItemProps {
  to: string;
  end?: boolean;
  children: string;
}

function NavItem({ to, end, children }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        isActive ? `${styles.link} ${styles.linkActive}` : styles.link
      }
    >
      {({ isActive }) => (
        <>
          {children}
          {isActive && (
            <motion.span
              layoutId={UNDERLINE_LAYOUT_ID}
              className={styles.underline}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
            />
          )}
        </>
      )}
    </NavLink>
  );
}

export function Header() {
  return (
    <header className={styles.header}>
      <nav className={styles.nav}>
        <NavItem to={ROUTES.search} end>
          Поиск
        </NavItem>
        <NavItem to={ROUTES.collection}>Коллекция</NavItem>
      </nav>
    </header>
  );
}
