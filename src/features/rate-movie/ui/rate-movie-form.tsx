import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import type { FormEvent } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";

import { collectionStatusSchema, noteSaved, selectItemByMovieId } from "@/entities/collection-item";

import { RATING_RANGE } from "../config";
import { buildDefaultValues } from "../lib";
import { rateMovieFormSchema } from "../model";
import type { RateMovieFormValues } from "../model";

import { TagsField } from "./tags-field";
import type { TagsFieldHandle } from "./tags-field";
import styles from "./rate-movie-form.module.css";

interface RateMovieFormProps {
  movieId: number;
}

const RATING_FIELD_ID = "rate-movie-rating";
const WATCHED_AT_FIELD_ID = "rate-movie-watched-at";
const TEXT_FIELD_ID = "rate-movie-text";

/**
 * Форма заметки о просмотре: RHF + zodResolver на схеме из model/schema.
 * Сама читает статус записи коллекции и не рендерится, пока он не
 * «посмотрел» — по аналогии с CollectionButton, который так же сам
 * решает, что показать, вместо того чтобы получать это пропсом.
 */
export function RateMovieForm({ movieId }: RateMovieFormProps) {
  const dispatch = useDispatch();
  const item = useSelector(selectItemByMovieId(movieId));
  const note = item?.note;
  const tagsFieldRef = useRef<TagsFieldHandle>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<RateMovieFormValues>({
    resolver: zodResolver(rateMovieFormSchema),
    defaultValues: buildDefaultValues(note),
  });

  useEffect(() => {
    reset(buildDefaultValues(note));
  }, [note, reset]);

  if (item?.status !== collectionStatusSchema.enum.watched) {
    return null;
  }

  function onSubmit(values: RateMovieFormValues) {
    dispatch(noteSaved({ movieId, note: values }));
  }

  /**
   * Черновик тега коммитится здесь, а не по `blur` поля — `blur`
   * срабатывает между `mousedown` и `mouseup` клика по кнопке «Сохранить»,
   * а появление нового чипа сдвигает вёрстку и уводит кнопку из-под
   * курсора, из-за чего клик промахивается (см. комментарий в
   * `tags-field.tsx`). Коммит на `submit` происходит уже после того, как
   * клик состоялся, и до валидации схемой.
   */
  function handleFormSubmit(event: FormEvent<HTMLFormElement>) {
    tagsFieldRef.current?.commitDraftTag();
    void handleSubmit(onSubmit)(event);
  }

  return (
    <form className={styles.form} onSubmit={handleFormSubmit} noValidate>
      <h2 className={styles.title}>Заметка о просмотре</h2>

      <div className={styles.field}>
        <label htmlFor={RATING_FIELD_ID}>Оценка</label>
        <input
          id={RATING_FIELD_ID}
          type="number"
          min={RATING_RANGE.min}
          max={RATING_RANGE.max}
          {...register("rating", { valueAsNumber: true })}
        />
        {errors.rating && <p role="alert">{errors.rating.message}</p>}
      </div>

      <div className={styles.field}>
        <label htmlFor={WATCHED_AT_FIELD_ID}>Дата просмотра</label>
        <input id={WATCHED_AT_FIELD_ID} type="date" {...register("watchedAt")} />
        {errors.watchedAt && <p role="alert">{errors.watchedAt.message}</p>}
      </div>

      <TagsField control={control} ref={tagsFieldRef} />

      <div className={styles.field}>
        <label htmlFor={TEXT_FIELD_ID}>Текст заметки</label>
        <textarea id={TEXT_FIELD_ID} {...register("text")} />
        {errors.text && <p role="alert">{errors.text.message}</p>}
      </div>

      <button type="submit">Сохранить заметку</button>
    </form>
  );
}
