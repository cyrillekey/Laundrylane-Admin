import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logos/logo.png";
import {
  LaundryIllustration,
  LaundryIllustrationMobile,
} from "@/components/shared/laundry-illustration";

export const metadata: Metadata = {
  title: "Laundry Lane — Run your laundry business",
  description:
    "Manage orders, track deliveries, handle payments, and grow your laundry business from one powerful dashboard.",
};

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src={logo}
              alt="Laundry Lane"
              className="h-9 w-auto"
              priority
            />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="hidden sm:inline-flex text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      <main className="relative flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12 md:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/50 px-3.5 py-1 text-xs font-medium text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Trusted by laundry businesses
          </div>

          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-[1.1]">
            Everything you need to run
            <br />
            <span className="text-[#A08B74]">your laundry business</span>
          </h1>

          <p className="mt-6 text-base leading-relaxed text-muted-foreground sm:text-lg max-w-xl mx-auto">
            Manage orders, track deliveries, handle payments, and grow your
            business — all from one powerful dashboard.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="inline-flex h-12 w-full sm:w-auto items-center justify-center rounded-xl bg-primary px-8 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90"
            >
              Start free trial
            </Link>
            <a
              href="#"
              className="inline-flex h-12 w-full sm:w-auto items-center gap-3 rounded-xl border border-border bg-card px-5 text-sm font-medium text-foreground transition-all hover:bg-muted"
            >
              <svg
                viewBox="0 0 24 24"
                className="size-5 shrink-0 fill-current"
              >
                <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zm12.207 10.065l3.258-3.238L3.45.195a1.466 1.466 0 0 0-.946-.179l11.04 10.973zm0 2.067l-11 10.933c.298.036.612-.016.906-.183l13.324-7.54-3.23-3.21z" />
              </svg>
              <div className="text-left">
                <div className="text-[10px] leading-tight text-muted-foreground">
                  GET IT ON
                </div>
                <div className="text-sm font-semibold leading-tight">
                  Google Play
                </div>
              </div>
            </a>
          </div>

          <p className="mt-6 text-xs text-muted-foreground">
            Free 14-day trial &middot; No credit card required
          </p>

          <div className="mt-16 md:mt-20 flex items-center justify-center gap-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 fill-emerald-500/70"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Order management
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 fill-emerald-500/70"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Payment processing
            </span>
            <span className="flex items-center gap-1.5">
              <svg
                viewBox="0 0 24 24"
                className="size-3.5 fill-emerald-500/70"
              >
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
              Staff &amp; stores
            </span>
          </div>
        </div>
      </main>

      <div className="relative h-48 md:h-72 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/15 to-background z-10" />
        <div className="absolute inset-0 hidden md:block">
          <LaundryIllustration className="w-full h-full" />
        </div>
        <div className="absolute inset-0 md:hidden">
          <LaundryIllustrationMobile className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
