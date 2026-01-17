import sharedValues from "@/utils/sharedValues";
import { useMutation } from "@tanstack/react-query";

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
    }): Promise<AuthReponse> => {
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
    }): Promise<AuthReponse> => {
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
