import { NextRequest, NextResponse } from "next/server";
import sharedValues from "./utils/sharedValues";

export default function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/app")) {
    const cookie = request.cookies.get(sharedValues.token_key);
    if (!cookie) {
        return NextResponse.redirect(new URL("/login", request.url));
    }
    return NextResponse.next();
  }
  return NextResponse.next();
}
