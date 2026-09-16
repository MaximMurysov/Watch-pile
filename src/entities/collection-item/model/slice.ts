import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";

import type { CollectionItem, CollectionNote, CollectionStatus } from "./schema";

export const collectionAdapter = createEntityAdapter<CollectionItem, number>({
  selectId: (item) => item.movieId,
});

export type CollectionState = ReturnType<typeof collectionAdapter.getInitialState>;

interface ItemAddedPayload {
  movieId: number;
  title: CollectionItem["title"];
  posterUrl: CollectionItem["posterUrl"];
  status: CollectionStatus;
}

const collectionSlice = createSlice({
  name: "collectionItems",
  initialState: collectionAdapter.getInitialState(),
  reducers: {
    itemAdded: {
      prepare: (payload: ItemAddedPayload) => ({
        payload: { ...payload, addedAt: new Date().toISOString() },
      }),
      reducer: (state, action: PayloadAction<CollectionItem>) => {
        collectionAdapter.addOne(state, action.payload);
      },
    },
    statusChanged: (
      state,
      action: PayloadAction<{ movieId: number; status: CollectionStatus }>,
    ) => {
      collectionAdapter.updateOne(state, {
        id: action.payload.movieId,
        changes: { status: action.payload.status },
      });
    },
    itemRemoved: (state, action: PayloadAction<{ movieId: number }>) => {
      collectionAdapter.removeOne(state, action.payload.movieId);
    },
    noteSaved: (
      state,
      action: PayloadAction<{ movieId: number; note: CollectionNote }>,
    ) => {
      collectionAdapter.updateOne(state, {
        id: action.payload.movieId,
        changes: { note: action.payload.note },
      });
    },
  },
});

export const { itemAdded, statusChanged, itemRemoved, noteSaved } =
  collectionSlice.actions;
export const collectionReducer = collectionSlice.reducer;
