import { z } from "zod";

export const collectionStatusSchema = z.enum(["want", "watched"]);

export type CollectionStatus = z.infer<typeof collectionStatusSchema>;

/**
 * Заметка о фильме живёт внутри записи коллекции (не отдельная сущность,
 * решение зафиксировано в CLAUDE.md). Все поля опциональны на уровне
 * хранения — этап 6 ужесточит схему для формы (обязательная оценка,
 * дата не в будущем), не меняя эту.
 */
export const collectionNoteSchema = z.object({
  rating: z.number().nullish(),
  watchedAt: z.string().nullish(),
  tags: z.array(z.string()).nullish(),
  text: z.string().nullish(),
});

export type CollectionNote = z.infer<typeof collectionNoteSchema>;

export const collectionItemSchema = z.object({
  movieId: z.number({ error: "У записи коллекции должен быть числовой movieId" }),
  title: z.string().nullish(),
  posterUrl: z.string().nullish(),
  status: collectionStatusSchema,
  addedAt: z.string(),
  note: collectionNoteSchema.nullish(),
});

export type CollectionItem = z.infer<typeof collectionItemSchema>;

/**
 * Разбирает записи, прочитанные из localStorage, отбрасывая те, что не
 * прошли collectionItemSchema, вместо того чтобы ронять всю коллекцию.
 * Причина отбрасывания — предупреждение в консоли, не пустой catch
 * (правило CLAUDE.md «ошибки видимы»).
 */
export function parseCollectionItems(items: unknown[]): CollectionItem[] {
  return items.flatMap((item) => {
    const result = collectionItemSchema.safeParse(item);
    if (!result.success) {
      console.warn(
        "Запись коллекции пропущена — не прошла валидацию схемы",
        result.error.issues,
      );
      return [];
    }
    return [result.data];
  });
}
