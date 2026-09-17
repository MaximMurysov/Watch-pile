import "./styles/index.css";

import { MotionConfig } from "framer-motion";

import { RouterProvider } from "./router";
import { StoreProvider } from "./model";

export function App() {
  return (
    <MotionConfig reducedMotion="user">
      <StoreProvider>
        <RouterProvider />
      </StoreProvider>
    </MotionConfig>
  );
}
