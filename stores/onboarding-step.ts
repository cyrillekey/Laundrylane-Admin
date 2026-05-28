import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface OnboardingStepState {
  step: number;
  setStep: (step: number) => void;
  resetStep: () => void;
}

export const useOnboardingStep = create<OnboardingStepState>()(
  persist(
    (set) => ({
      step: 0,
      setStep: (step) => set({ step }),
      resetStep: () => set({ step: 0 }),
    }),
    {
      name: "laundry-lane-onboarding-step",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);
