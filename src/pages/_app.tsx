import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Button, ChakraProvider } from "@chakra-ui/react";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "~/components/Layout";
import toast, { Toaster } from "react-hot-toast";
import useAlertStore from "~/stores/alertStore";
import { useEffect } from "react";
import Avatar from "~/components/user/Avatar";
import { UsersOnlineController } from "~/components/UsersOnlineController";
import "@tremor/react/dist/esm/tremor.css";
const queryClient = new QueryClient();

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  const { alerts, clearAlerts } = useAlertStore();

  useEffect(() => {
    if (alerts.length === 0) return;
    alerts.forEach((alert) => {
      toast((t) => (
        <span className="flex items-center justify-between gap-4">
          <Avatar user={alert.user} />
          <div className="flex flex-col gap-1">
            <b>{alert.user.name}</b>
            {alert.type === "user-joined" ? "is online" : "is offline"}
          </div>
          <Button onClick={() => toast.dismiss(t.id)}>Close</Button>
        </span>
      ));
    });
    clearAlerts();
  }, [alerts, clearAlerts]);

  return (
    <QueryClientProvider client={queryClient}>
      <SessionProvider session={session}>
        <ChakraProvider>
          <Toaster position="top-left" reverseOrder={false} />
          <UsersOnlineController />
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </ChakraProvider>
      </SessionProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
};

export default api.withTRPC(MyApp);
