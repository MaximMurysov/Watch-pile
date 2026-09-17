import { motion } from "framer-motion";
import { forwardRef, useId, useImperativeHandle, useState } from "react";
import type { Control } from "react-hook-form";
import { useController } from "react-hook-form";

import { MAX_TAG_LENGTH } from "../config";
import type { RateMovieFormValues } from "../model";

import styles from "./tags-field.module.css";

interface TagsFieldProps {
  control: Control<RateMovieFormValues>;
}

export interface TagsFieldHandle {
  /** Переносит недопечатанный черновик тега в массив тегов формы. */
  commitDraftTag: () => void;
}

const ADD_TAG_KEY = "Enter";

/**
 * Контролируемый ввод чипами: значение поля формы — массив строк-тегов.
 * Черновик тега коммитится не по `blur` — добавление чипа меняет
 * высоту списка и сдвигает вёрстку ниже (в т.ч. кнопку «Сохранить»),
 * а `blur` наступает раньше `mouseup` клика по ней: сдвиг между
 * `mousedown` и `mouseup` уводит кнопку из-под курсора, и клик
 * промахивается. Вместо этого родитель дергает `commitDraftTag` через
 * ref прямо в обработчике сабмита — до сдвига вёрстки, а не после.
 */
export const TagsField = forwardRef<TagsFieldHandle, TagsFieldProps>(function TagsField(
  { control },
  ref,
) {
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

  useImperativeHandle(ref, () => ({ commitDraftTag: addTag }));

  function removeTag(tagToRemove: string) {
    field.onChange(field.value.filter((tag) => tag !== tagToRemove));
  }

  return (
    <div className={styles.field}>
      <label htmlFor={inputId}>Теги</label>
      {field.value.length > 0 && (
        <ul className={styles.tags}>
          {field.value.map((tag) => (
            <motion.li
              key={tag}
              className={styles.tag}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Убрать тег «${tag}»`}
              >
                ×
              </button>
            </motion.li>
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
});
