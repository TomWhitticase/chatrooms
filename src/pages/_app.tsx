import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider, useSession } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ChakraProvider } from "@chakra-ui/react";
import { api } from "~/utils/api";

import "~/styles/globals.css";
import { Header } from "~/components/Header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <ChakraProvider>
          <main className="flex min-h-screen flex-col">
            <Header />
            <Component {...pageProps} />
          </main>
        </ChakraProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default api.withTRPC(MyApp);
