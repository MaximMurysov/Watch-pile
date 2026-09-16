import styles from "./spinner.module.css";

export function Spinner() {
  return (
    <div role="status" className={styles.spinner}>
      <span className={styles.visuallyHidden}>Загрузка…</span>
    </div>
  );
}
