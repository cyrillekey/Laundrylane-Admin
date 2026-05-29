"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
  postPaymentsMethodByStoreIdMutation,
  postCatalogByStoreIdMutation,
  postCatalogServiceTypesByStoreIdMutation,
  postCatalogClothesByStoreIdMutation,
  getOrganisationUserOptions,
  getOrganisationUserQueryKey,
} from "@/queries/@tanstack/react-query.gen";
import { Spinner } from "@/components/ui/spinner";
import AuthenticationService from "@/services/tokenService";
import {
  PaymentMethodForm,
  type PaymentMethodFormValues,
} from "@/container/forms/onboarding/payment-method-form";
import { useSelectedStore } from "@/stores/selected-store";
import { useOnboardingStep } from "@/stores/onboarding-step";
import {
  CatalogForm,
  type CatalogFormValues,
} from "@/container/forms/onboarding/catalog-form";
import {
  ServiceTypeForm,
  type ServiceTypeFormValues,
} from "@/container/forms/onboarding/service-type-form";
import {
  ClothTypeForm,
  type ClothTypeFormValues,
} from "@/container/forms/onboarding/cloth-type-form";

const steps = [
  {
    id: "organisation",
    title: "Organisation",
    description: "Tell us about your organisation",
  },
  { id: "store", title: "Store", description: "Set up your store" },
  {
    id: "payment",
    title: "Payment Method",
    description: "Set up a payment method",
  },
  {
    id: "catalog",
    title: "Catalog",
    description: "Add your product catalog",
  },
  {
    id: "service-types",
    title: "Service Types",
    description: "Define service turnaround times",
  },
  {
    id: "cloth-types",
    title: "Cloth Types",
    description: "Define cloth types you support",
  },
];

export default function OnboardingStepper() {
  const router = useRouter();
  const user = AuthenticationService.getUser();
  const { step, setStep, resetStep } = useOnboardingStep();
  const { selectedStoreId, setSelectedStoreId } = useSelectedStore();
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

  const { mutateAsync: createPaymentMethod, isPending: creatingPayment } =
    useMutation({
      ...postPaymentsMethodByStoreIdMutation(),
    });

  const { mutateAsync: createCatalog, isPending: creatingCatalog } =
    useMutation({
      ...postCatalogByStoreIdMutation(),
    });

  const { mutateAsync: createServiceTypes, isPending: creatingServiceTypes } =
    useMutation({
      ...postCatalogServiceTypesByStoreIdMutation(),
    });

  const { mutateAsync: createClothTypes, isPending: creatingClothTypes } =
    useMutation({
      ...postCatalogClothesByStoreIdMutation(),
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

  const handleCreateStore = async (store: StoreFormValues) => {
    try {
      const storeResponse = await createStore({
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
      if (storeResponse.id) {
        setSelectedStoreId(storeResponse.id);
        setStep(2);
      }
      toast.success("Store created successfully!");
    } catch {
      toast.error("Failed to create store. Please try again.");
    }
  };

  const handleCreatePaymentMethod = async (values: PaymentMethodFormValues) => {
    if (!selectedStoreId) return;
    try {
      await createPaymentMethod({
        path: { storeId: selectedStoreId },
        body: {
          name: values.name,
          description: values.description,
          type: values.type,
          enabled: true,
          configuration: values.configuration,
        },
      });
      toast.success("Payment method created successfully!");
      setStep(3);
    } catch {
      toast.error("Failed to create payment method. Please try again.");
    }
  };

  const handleSkipPayment = () => {
    setStep(3);
  };

  const handleCreateCatalog = async (items: CatalogFormValues) => {
    if (!selectedStoreId) return;
    try {
      await createCatalog({
        path: { storeId: selectedStoreId },
        body: items,
      });
      toast.success("Catalog created successfully!");
      setStep(4);
    } catch {
      toast.error("Failed to create catalog. Please try again.");
    }
  };

  const handleSkipCatalog = () => {
    setStep(4);
  };

  const handleBackToPayment = () => {
    setStep(2);
  };

  const handleCreateServiceTypes = async (items: ServiceTypeFormValues) => {
    if (!selectedStoreId) return;
    try {
      await createServiceTypes({
        path: { storeId: selectedStoreId },
        body: items,
      });
      toast.success("Service types created successfully!");
      setStep(5);
    } catch {
      toast.error("Failed to create service types. Please try again.");
    }
  };

  const handleSkipServiceTypes = () => {
    setStep(5);
  };

  const handleBackToCatalog = () => {
    setStep(3);
  };

  const handleCreateClothTypes = async (items: ClothTypeFormValues) => {
    if (!selectedStoreId) return;
    try {
      await createClothTypes({
        path: { storeId: selectedStoreId },
        body: items,
      });
      toast.success("Cloth types created successfully!");
      resetStep();
      router.push("/app");
    } catch {
      toast.error("Failed to create cloth types. Please try again.");
    }
  };

  const handleSkipClothTypes = () => {
    resetStep();
    router.push("/app");
  };

  const handleBackToServiceTypes = () => {
    setStep(4);
  };

  if (loadingOrg) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Spinner className="size-6" />
      </div>
    );
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center p-6 md:p-10">
      <a
        href="#"
        className="flex items-center gap-2 font-medium mb-8 lg:hidden"
      >
        <Image src={logo} alt="Laundry Lane" className="h-10 w-auto" />
        Laundry Lane
      </a>

      <div className="flex items-center justify-center gap-1.5 mb-6 w-full max-w-md">
        {steps.map((s, i) => (
          <div key={s.id} className="flex-1">
            <div
              className={`h-2 w-full rounded-full transition-all duration-300 ${
                i < step
                  ? "bg-primary"
                  : i === step
                    ? "bg-primary/60 shadow-sm"
                    : "bg-muted"
              }`}
            />
          </div>
        ))}
      </div>

      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold">{steps[step].title}</h1>
          {steps[step].description && (
            <p className="text-sm text-muted-foreground mt-1">
              {steps[step].description}
            </p>
          )}
        </div>
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

        {step === 2 && (
          <PaymentMethodForm
            onSubmit={handleCreatePaymentMethod}
            isSubmitting={creatingPayment}
            onSkip={handleSkipPayment}
          />
        )}

        {step === 3 && (
          <CatalogForm
            onSubmit={handleCreateCatalog}
            isSubmitting={creatingCatalog}
            onSkip={handleSkipCatalog}
            onBack={handleBackToPayment}
          />
        )}

        {step === 4 && (
          <ServiceTypeForm
            onSubmit={handleCreateServiceTypes}
            isSubmitting={creatingServiceTypes}
            onSkip={handleSkipServiceTypes}
            onBack={handleBackToCatalog}
          />
        )}

        {step === 5 && (
          <ClothTypeForm
            onSubmit={handleCreateClothTypes}
            isSubmitting={creatingClothTypes}
            onSkip={handleSkipClothTypes}
            onBack={handleBackToServiceTypes}
          />
        )}
      </div>
    </main>
  );
}
