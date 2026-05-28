import auth from "@/firebase";

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { Button } from "../ui/button";
import { Fragment, useState } from "react";
import { Spinner } from "../ui/spinner";
import { FirebaseError } from "firebase/app";
import { toast } from "sonner";

import { useRouter } from "next/navigation";
import AuthenticationService from "@/services/tokenService";
import { captureException } from "@sentry/nextjs";
import { useMutation } from "@tanstack/react-query";
import { postAuthenticationSocialAuthMutation } from "@/queries/@tanstack/react-query.gen";

const GoogleAuthButton = () => {
  const [isLoading, setIsloading] = useState<boolean>(false);
  const { mutateAsync: socialLogin } = useMutation({
    ...postAuthenticationSocialAuthMutation(),
  });
  const router = useRouter();
  return (
    <Button
      variant="outline"
      type="button"
      onClick={async () => {
        try {
          setIsloading(true);
          const provider = new GoogleAuthProvider();
          provider.addScope("profile");
          provider.addScope("email");
          const response = await signInWithPopup(auth, provider);
          if (response.user.uid) {
            const authResponse = await socialLogin({
              body: {
                token: await response.user.getIdToken(),
              },
            });
            if (authResponse.success) {
              if (
                authResponse?.user?.role == "ORGANISATION_ADMIN" ||
                authResponse?.user?.role == "ORGANISATION_USER"
              ) {
                AuthenticationService.setToken(authResponse.token!);
                AuthenticationService.setUser(authResponse.user!);
                router.push("/app");
              } else
                toast.error("Error!", {
                  description: "Only admin can login to the admin portal",
                });
            } else {
              toast.error(authResponse.message);
            }
          } else {
            toast.error("Something went wrong, please try again later");
          }
        } catch (error) {
          captureException(error);
          setIsloading(false);
          if (error instanceof FirebaseError) {
            switch (error.code) {
              case "auth/popup-closed-by-user":
                toast.error("Popup closed by user");
                break;
              case "auth/cancelled-popup-request":
                toast.error("Popup closed by user");
                break;
              case "auth/user-not-found":
                toast.error("User not found");
                break;
              case "auth/user-disabled":
                toast.error("User disabled");
                break;
              case "auth/too-many-requests":
                toast.error("Too many requests, please try again later");
                break;
              case "auth/operation-not-allowed":
                toast.error("Operation not allowed");
                break;
              case "auth/internal-error":
                toast.error("Internal error, please try again later");
                break;
              case "auth/insufficient-permission":
                toast.error("Insufficient permission, please try again later");
                break;
              default:
                toast.error("Something went wrong, please try again later");
                break;
            }
          } else {
            toast.error("Something went wrong, please try again later");
          }
        }
      }}
    >
      {isLoading == false ? (
        <Fragment>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
            <path
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
              fill="currentColor"
            />
          </svg>
          Continue with Google
        </Fragment>
      ) : (
        <Spinner />
      )}
    </Button>
  );
};

export default GoogleAuthButton;
