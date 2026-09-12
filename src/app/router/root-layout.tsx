import { Outlet } from "react-router-dom";

import { Header } from "@/widgets/header";

export function RootLayout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
    </>
  );
}
