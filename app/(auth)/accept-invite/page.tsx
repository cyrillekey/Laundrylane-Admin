import { AcceptInviteForm } from "@/container/forms/accept-invite-form";
import { Suspense } from "react";

export default function AcceptInvitePage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense>
          <AcceptInviteForm />
        </Suspense>
      </div>
    </div>
  );
}
