"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { Toaster } from "../ui/sonner";

import sharedValues from "@/utils/sharedValues";
import { client } from "@/queries/client.gen";
import AuthenticationService from "@/services/tokenService";

client.setConfig({
  baseUrl: sharedValues.baseUrl,
  throwOnError: true,
  auth: AuthenticationService.getToken() || undefined,
});

const queryClient = new QueryClient();
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TanStackDevtools />
      <Toaster position="top-center" />
      <>{children}</>
    </QueryClientProvider>
  );
};

export default AppProvider;
