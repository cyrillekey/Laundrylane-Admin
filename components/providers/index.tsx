"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools";
import { Toaster } from "../ui/sonner";
const queryClient = new QueryClient();
const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <TanStackDevtools plugins={[formDevtoolsPlugin()]} />
      <Toaster position="top-center"   />
      <>{children}</>
    </QueryClientProvider>
  );
};

export default AppProvider;
