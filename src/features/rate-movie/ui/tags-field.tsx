import { useId, useState } from "react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";

import { MAX_TAG_LENGTH } from "../config";
import type { RateMovieFormValues } from "../model";

import styles from "./tags-field.module.css";

interface TagsFieldProps {
  control: Control<RateMovieFormValues>;
}

const ADD_TAG_KEY = "Enter";

/** Контролируемый ввод чипами: значение поля формы — массив строк-тегов. */
export function TagsField({ control }: TagsFieldProps) {
  const { field } = useController({ control, name: "tags" });
  const [draftTag, setDraftTag] = useState("");
  const inputId = useId();

  function addTag() {
    const tag = draftTag.trim().slice(0, MAX_TAG_LENGTH);
    setDraftTag("");
    if (!tag || field.value.includes(tag)) {
      return;
    }
    field.onChange([...field.value, tag]);
  }

  function removeTag(tagToRemove: string) {
    field.onChange(field.value.filter((tag) => tag !== tagToRemove));
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>Теги</label>
      {field.value.length > 0 && (
        <ul className={styles.tags}>
          {field.value.map((tag) => (
            <li key={tag} className={styles.tag}>
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Убрать тег «${tag}»`}
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className={styles.input}>
        <input
          id={inputId}
          type="text"
          value={draftTag}
          onChange={(event) => setDraftTag(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === ADD_TAG_KEY) {
              event.preventDefault();
              addTag();
            }
          }}
        />
        <button type="button" onClick={addTag}>
          Добавить тег
        </button>
      </div>
    </div>
  );
}
