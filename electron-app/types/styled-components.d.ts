import { Theme } from "../src/ui/lib/theme";

declare module "../types/styled-components" {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface

  interface DefaultTheme extends Theme {}
}
