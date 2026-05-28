"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "../ui/sonner";

import sharedValues from "@/utils/sharedValues";
import { client } from "@/queries/client.gen";
import AuthenticationService from "@/services/tokenService";

const appHeader = new Headers();

appHeader.set("Content-Type", "application/json");
appHeader.set("Authorization", `Bearer ${AuthenticationService.getToken()}`);
client.setConfig({
  baseUrl: sharedValues.baseUrl,
  throwOnError: true,
  auth: AuthenticationService.getToken() || undefined,
  headers: appHeader,
});

const queryClient = new QueryClient();
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={true} />
      <Toaster position="top-center" />
      <>{children}</>
    </QueryClientProvider>
  );
};

export default AppProvider;
