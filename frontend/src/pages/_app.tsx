import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
// import { Provider } from "@/components/ui/provider";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ChakraProvider value={defaultSystem}>
      <Component {...pageProps} />
    </ChakraProvider>
  );
}
