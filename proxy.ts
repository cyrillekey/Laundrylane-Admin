import { NextRequest, NextResponse } from "next/server";
import sharedValues from "./utils/sharedValues";
import { IUser } from "./hooks";

export default function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname == "/" ||
    request.nextUrl.pathname == "/login" ||
    request.nextUrl.pathname == "/signup"
  ) {
    const cookie = request.cookies.get(sharedValues.token_key);

    if (cookie) {
      return NextResponse.redirect(new URL("/app", request.url));
    }
    return NextResponse.next();
  }
  if (
    request.nextUrl.pathname.startsWith("/app") ||
    request.nextUrl.pathname.startsWith("/onboarding")
  ) {
    const cookie = request.cookies.get(sharedValues.token_key)?.value;
    const user = request.cookies.get(sharedValues.user_key)?.value;
    if (!cookie && !user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    const userJson: IUser = JSON.parse(
      request.cookies.get(sharedValues.user_key)!.value,
    );
    if (!userJson?.isVerified) {
      return NextResponse.redirect(new URL("/email-verify", request.url));
    }

    if (userJson?.onboarded && request.nextUrl.pathname.startsWith("/onboarding")) {
      return NextResponse.redirect(new URL("/app", request.url));
    }

    if (!userJson?.onboarded && request.nextUrl.pathname.startsWith("/app")) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }

    return NextResponse.next();
  }
  return NextResponse.next();
}
