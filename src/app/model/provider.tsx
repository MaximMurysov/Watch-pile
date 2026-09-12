import type { ReactNode } from "react";
import { useState } from "react";
import { Provider } from "react-redux";

import { createAppStore } from "./store";

interface StoreProviderProps {
  children: ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [store] = useState(() => createAppStore());

  return <Provider store={store}>{children}</Provider>;
}
