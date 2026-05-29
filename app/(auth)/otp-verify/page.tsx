import { OTPForm } from "@/container/forms/opt-form";
import { Suspense } from "react";

export default function Page() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <OTPForm />
        </Suspense>
      </div>
    </div>
  );
}
