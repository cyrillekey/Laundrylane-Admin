import { LoginForm } from "@/container/forms/login-form";
import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Laundry Lane Admin",
  description: "Laundry Lane Admin Dashboard",
};
export default function Page() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
