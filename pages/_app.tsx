import "../styles/globals.css";
import type { AppProps } from "next/app";
import { extendTheme } from "@chakra-ui/react";
import { ChakraProvider } from "@chakra-ui/react";
import { trpc } from "../utils/trpc";
import { UserProvider } from "@auth0/nextjs-auth0";

export const brandColors = {
  lightGrey: "#EDF2F7",
  sand: "#F2E1C3",
  lightGreen: "#ADFF2E",
  green: "#68D391",
  darkGreen: "#2F8B5A",
  red: "#FC8180",
  rust: "#A63922",
  skyBlue: "#B8E6F3",
  blueGrey: "#0C6279",
  darkBlue: "#172b56",
  blackBlue: "#091122",
  earthBrown: "#543034",
  sunYellow: "#F2B443",
};

export type BrandColorKeys = keyof typeof brandColors;
export type HexBrandColors = typeof brandColors[BrandColorKeys];

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
