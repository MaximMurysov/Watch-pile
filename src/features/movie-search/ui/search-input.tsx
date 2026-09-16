import type { ChangeEvent } from "react";

import styles from "./search-input.module.css";

interface SearchInputProps {
  defaultValue: string;
  onQueryChange: (query: string) => void;
}

/**
 * Неконтролируемое поле — value живёт в DOM, а не в React state (в
 * этой фиче нет useState, query — только в URL). При смене query
 * извне (например, кнопкой «назад» в браузере) страница монтирует
 * компонент заново через key={query}, поэтому значение поля переезжает
 * вслед за URL.
 */
export function SearchInput({ defaultValue, onQueryChange }: SearchInputProps) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    onQueryChange(event.target.value);
  }

  return (
    <label className={styles.label}>
      Поиск фильмов
      <input
        role="searchbox"
        type="search"
        defaultValue={defaultValue}
        onChange={handleChange}
        placeholder="Название фильма"
        className={styles.input}
      />
    </label>
  );
}
