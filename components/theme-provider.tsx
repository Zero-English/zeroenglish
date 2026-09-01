"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

export function ThemeProvider(
  props: ComponentProps<typeof NextThemesProvider>,
) {
  // next-themes renders an inline <script> to set the theme before paint and
  // avoid a flash. React 19 warns when a component renders a <script> in the
  // tree, since such scripts never execute on the client. On the server we
  // keep the default type so it runs during the SSR HTML parse; on the client
  // we mark it application/json so React warns no longer fires.
  const scriptProps =
    typeof window === "undefined"
      ? undefined
      : ({ type: "application/json" } as const);

  return <NextThemesProvider {...props} scriptProps={scriptProps} />;
}