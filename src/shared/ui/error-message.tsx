import styles from "./error-message.module.css";

interface ErrorMessageProps {
  message: string;
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <p role="alert" className={styles.message}>
      {message}
    </p>
  );
}
