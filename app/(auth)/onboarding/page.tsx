"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
  getOrganisationUserQueryKey,
  postPaymentsPayoutByStoreIdMutation,
  postPaymentsStoreMethodMutation,
  postUserOnboardMutation,
} from "@/queries/@tanstack/react-query.gen";
import AuthenticationService from "@/services/tokenService";
import {
  PaymentMethodForm,
  type PaymentMethodFormValues,
} from "@/container/forms/onboarding/payment-method-form";
import { StorePaymentMethodsForm } from "@/container/forms/onboarding/store-payment-methods-form";
import { useSelectedStore } from "@/stores/selected-store";
import { useOnboardingStep } from "@/stores/onboarding-step";
import { CatalogForm } from "@/container/forms/onboarding/catalog-form";
import { ServiceTypeForm } from "@/container/forms/onboarding/service-type-form";
import { ClothTypeForm } from "@/container/forms/onboarding/cloth-type-form";

const steps = [
  {
    id: "organisation",
    title: "Organisation",
    description: "Tell us about your organisation",
  },
  { id: "store", title: "Store", description: "Set up your store" },
  {
    id: "payment",
    title: "Payout Method",
    description: "Set up where you want to receive payments",
  },
  {
    id: "payment-methods",
    title: "Payment Methods",
    description: "Choose which payment methods your store accepts",
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

  const { mutateAsync: upsertOrg, isPending: savingOrg } = useMutation({
    ...putOrganisationByIdMutation(),
    onError(error) {
      toast.error("Error!", { description: error.message });
    },
  });

  const { mutateAsync: createStore, isPending: creatingStore } = useMutation({
    ...postStoreMutation(),
    onError(error) {
      toast.error("Error!", { description: error.message });
    },
  });

  const { mutateAsync: createPayoutMethod, isPending: creatingPayment } =
    useMutation({
      ...postPaymentsPayoutByStoreIdMutation(),
      onError(error) {
        toast.error("Error!", { description: error.message });
      },
    });

  const {
    mutateAsync: createStorePaymentMethods,
    isPending: creatingStorePaymentMethods,
  } = useMutation({
    ...postPaymentsStoreMethodMutation(),
    onError: (error) => {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to save payment methods" });
    },
  });

  const { mutateAsync: onboardUser, isPending: onboarding } = useMutation({
    ...postUserOnboardMutation(),
    onError(error) {
      toast.error("Error!", { description: (error as Error)?.message || "Failed to complete onboarding" });
    },
  });

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
          category: store.category,
          serviceNames: store.serviceNames,
          name: store.name,
          location: store.location,
          latitude: Number(store.latitude),
          longitude: Number(store.longitude),
          opening: store.opening,
          closing: store.closing,
          logo: store.logo || undefined,
          coverImage: store.coverImage || undefined,
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
      await createPayoutMethod({
        path: {
          storeId: selectedStoreId,
        },
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

  const handleCreateStorePaymentMethods = async (
    paymentMethodIds: number[],
  ) => {
    if (!selectedStoreId) return;
    try {
      await Promise.all(
        paymentMethodIds.map((paymentMethodId) =>
          createStorePaymentMethods({
            body: { paymentMethodId, storeId: selectedStoreId },
          }),
        ),
      );
      toast.success("Payment methods updated successfully!");
      setStep(4);
    } catch {
      toast.error("Failed to save payment methods. Please try again.");
    }
  };

  const handleSkipStorePaymentMethods = () => {
    setStep(4);
  };

  const handleBackToPaymentMethods = () => {
    setStep(3);
  };

  const handleCatalogSuccess = () => {
    setStep(5);
  };

  const handleSkipServiceTypes = () => {
    setStep(6);
  };

  const handleServiceTypesSuccess = () => {
    setStep(6);
  };

  const handleBackToCatalog = () => {
    setStep(4);
  };

  const markOnboarded = async () => {
    try {
      const response = await onboardUser({});
      if (response) AuthenticationService.setUser(response);
    } catch {
      return false;
    }
    return true;
  };

  const handleSkipClothTypes = async () => {
    const ok = await markOnboarded();
    if (!ok) return;
    resetStep();
    router.replace("/app");
  };

  const handleClothTypesSuccess = async () => {
    const ok = await markOnboarded();
    if (!ok) return;
    resetStep();
    router.replace("/app");
  };

  const handleBackToServiceTypes = () => {
    setStep(5);
  };

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
          <StorePaymentMethodsForm
            onSubmit={handleCreateStorePaymentMethods}
            isSubmitting={creatingStorePaymentMethods}
            onSkip={handleSkipStorePaymentMethods}
            onBack={() => setStep(2)}
          />
        )}

        {step === 4 && (
          <CatalogForm
            onSuccess={handleCatalogSuccess}
            onBack={handleBackToPaymentMethods}
          />
        )}

        {step === 5 && (
          <ServiceTypeForm
            onSuccess={handleServiceTypesSuccess}
            onSkip={handleSkipServiceTypes}
            onBack={handleBackToCatalog}
          />
        )}

        {step === 6 && (
          <ClothTypeForm
            onSuccess={handleClothTypesSuccess}
            onSkip={handleSkipClothTypes}
            onBack={handleBackToServiceTypes}
            isOnboarding={onboarding}
          />
        )}
      </div>
    </main>
  );
}
