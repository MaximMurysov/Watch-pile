import type { ReactNode } from "react";

import styles from "./empty-state.module.css";

interface EmptyStateProps {
  message: string;
  children?: ReactNode;
}

export function EmptyState({ message, children }: EmptyStateProps) {
  return (
    <div className={styles.emptyState}>
      <p>{message}</p>
      {children}
    </div>
  );
}
