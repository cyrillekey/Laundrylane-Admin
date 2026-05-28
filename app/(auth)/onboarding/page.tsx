"use client";

import { useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import logo from "@/public/logos/logo.png";
import {
  OrganisationForm,
  type OrganisationFormValues,
} from "@/container/forms/onboarding/organisation-form";
import {
  StoreForm,
  type StoreFormValues,
} from "@/container/forms/onboarding/store-form";
import {
  putOrganisationByIdMutation,
  postStoreMutation,
  getOrganisationUserOptions,
  getOrganisationUserQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { Spinner } from "@/components/ui/spinner";
import AuthenticationService from "@/services/tokenService";

const steps = [
  {
    id: "organisation",
    title: "Organisation",
    description: "Tell us about your organisation",
  },
  { id: "store", title: "Store", description: "Set up your store" },
];

export default function OnboardingStepper() {
  const router = useRouter();
  const user = AuthenticationService.getUser();
  const [step, setStep] = useState(0);
  const queryClient = useQueryClient();

  const { data: orgs, isFetching: loadingOrg } = useQuery({
    ...getOrganisationUserOptions(),
  });

  const { mutateAsync: upsertOrg, isPending: savingOrg } = useMutation({
    ...putOrganisationByIdMutation(),
  });

  const { mutateAsync: createStore, isPending: creatingStore } = useMutation({
    ...postStoreMutation(),
  });

  const org = orgs;

  const handleOrganisationSubmit = async (values: OrganisationFormValues) => {
    const response = await upsertOrg({
      path: { id: user!.organisationId! },
      body: {
        name: values.organisationName,
        address: values.organisationAddress,
        email: values.organisationEmail,
        tel: values.organisationTel,
        website: values.organisationWebsite || undefined,
      },
    });
    if (response.id) {
      queryClient.invalidateQueries({
        queryKey: getOrganisationUserQueryKey(),
      });
      setStep(1);
    } else {
      toast.error("Failed to create organisation. Please try again.");
    }
  };

  const handleCreateStore = useCallback(
    async (store: StoreFormValues) => {
      try {
        await createStore({
          body: {
            name: store.name,
            location: store.location,
            latitude: Number(store.latitude),
            longitude: Number(store.longitude),
            opening: store.opening,
            closing: store.closing,
            logo: store.logo || undefined,
            radius: store.radius ? Number(store.radius) : undefined,
            daysOff:
              store.daysOff && store.daysOff.length > 0
                ? store.daysOff
                : undefined,
          },
        });
        toast.success("Store created successfully!");
        router.push("/app");
      } catch {
        toast.error("Failed to create store. Please try again.");
      }
    },
    [createStore, router],
  );

  if (loadingOrg) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <a href="#" className="flex items-center gap-2 font-medium mb-8">
        <Image src={logo} alt="Laundry Lane" className="h-10 w-auto" />
        Laundry Lane
      </a>

      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((s, i) => (
          <div key={s.id} className="flex items-center gap-2">
            <div
              className={`flex size-8 items-center justify-center rounded-full text-sm font-medium transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/20 text-primary"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-sm hidden sm:inline ${
                i === step
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }`}
            >
              {s.title}
            </span>
            {i < steps.length - 1 && (
              <div
                className={`hidden sm:block w-8 h-px ${
                  i < step ? "bg-primary" : "bg-border"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="text-center mb-8">
        <h1 className="text-xl font-bold">{steps[step].title}</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {steps[step].description}
        </p>
      </div>

      <div className="w-full max-w-md">
        {step === 0 && (
          <OrganisationForm
            initialValues={
              org
                ? {
                    organisationName: org.name,
                    organisationAddress: org.address,
                    organisationEmail: org.email ?? undefined,
                    organisationTel: org.tel ?? undefined,
                    organisationWebsite: org.website ?? undefined,
                  }
                : undefined
            }
            onSubmit={handleOrganisationSubmit}
            isSubmitting={savingOrg}
          />
        )}

        {step === 1 && (
          <StoreForm
            onBack={() => setStep(0)}
            onSubmit={handleCreateStore}
            isCreating={creatingStore}
          />
        )}
      </div>
    </div>
  );
}
