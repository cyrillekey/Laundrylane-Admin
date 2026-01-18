import sharedValues from "@/utils/sharedValues";
import { useMutation } from "@tanstack/react-query";
import { AuthResponse, DefaultResponse } from ".";

export const useCheckEmailMutation = () =>
  useMutation({
    mutationKey: ["checkEmail"],
    mutationFn: async (
      email: string,
    ): Promise<{ success: boolean; email?: string; registered?: boolean }> => {
      const res = await fetch(`${sharedValues.baseUrl}/authentication/email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const reponse = await res.json();
      return reponse;
    },
  });
export const useSignupMutation = () =>
  useMutation({
    mutationKey: ["signup"],
    mutationFn: async (payload: {
      email: string;
      password: string;
      name: string;
    }): Promise<AuthResponse> => {
      const res = await fetch(`${sharedValues.baseUrl}/authentication/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const reponse = await res.json();
      return reponse;
    },
  });

export const useLoginMutation = () =>
  useMutation({
    mutationKey: ["login"],
    mutationFn: async (payload: {
      email: string;
      password: string;
    }): Promise<AuthResponse> => {
      const res = await fetch(`${sharedValues.baseUrl}/authentication/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          value: payload.email,
          password: payload.password,
        }),
      });
      const reponse = await res.json();
      return reponse;
    },
  });

export const useRequestPasswordReset = () =>
  useMutation({
    mutationKey: ["requestPasswordReset"],
    mutationFn: async (payload: {
      email: string;
    }): Promise<DefaultResponse> => {
      const res = await fetch(
        `${sharedValues.baseUrl}/authentication/resetPassword`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const reposense = await res.json();
      return reposense;
    },
  });

export const useSocialLoginMutation = () => {
  return useMutation({
    mutationKey: ["socialLogin"],
    mutationFn: async (payload: { token: string }): Promise<AuthResponse> => {
      const res = await fetch(
        `${sharedValues.baseUrl}/authentication/social-auth `,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const reponse = await res.json();
      return reponse;
    },
  });
};
export const useVerifyPasswordOtpMutation = () => {
  return useMutation({
    mutationKey: ["verifyPasswordOtp"],
    mutationFn: async (payload: {
      email: string;
      otp: string;
    }): Promise<DefaultResponse> => {
      const res = await fetch(
        `${sharedValues.baseUrl}/authentication/resetpassword/validate-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        },
      );
      const reposense = await res.json();
      return reposense;
    },
  });
};

export const useUpdateUserPasswordMutation = () =>
  useMutation({
    mutationKey: ["updateUserPassword"],
    mutationFn: async (payload: {
      body: { password: string; confirmPassword: string };
      token: string;
    }): Promise<AuthResponse> => {
      const res = await fetch(
        `${sharedValues.baseUrl}/authentication/resetpassword/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${payload.token}`,
          },
          body: JSON.stringify(payload.body),
        },
      );
      const reposense = await res.json();
      return reposense;
    },
  });
