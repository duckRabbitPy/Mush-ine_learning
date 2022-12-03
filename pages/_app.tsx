import "../styles/globals.css";
import type { AppProps } from "next/app";
import { extendTheme } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { UserProvider } from "@auth0/nextjs-auth0";

export const brandColors = {
  100: "#F2E1C3",
  200: "#543034",
  300: "#0C6279",
  900: "#172b56",
};
export type brandColors = keyof typeof brandColors;
export const theme = extendTheme({
  colors: {
    brand: { ...brandColors },
  },
  fonts: {
    header: `'rounded', sans-serif`,
    body: `'rounded', sans-serif`,
  },
});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <UserProvider>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </UserProvider>
  );
}

export default trpc.withTRPC(MyApp);
