import "./styles/index.css";

import { RouterProvider } from "./router";
import { StoreProvider } from "./model";

export function App() {
  return (
    <StoreProvider>
      <RouterProvider />
    </StoreProvider>
  );
}
