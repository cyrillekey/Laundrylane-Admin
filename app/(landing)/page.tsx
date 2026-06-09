import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logos/logo.png";

export const metadata: Metadata = {
  title: "Laundry Lane — Run your laundry business",
  description:
    "Manage orders, track deliveries, handle payments, and grow your laundry business from one powerful dashboard.",
};

const stagger = [
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.1s_both]",
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.2s_both]",
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.35s_both]",
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.5s_both]",
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.65s_both]",
  "animate-[fadeInUp_0.7s_cubic-bezier(0.22,1,0.36,1)_0.8s_both]",
];

export default function LandingPage() {
  return (
    <div className="min-h-svh bg-background flex flex-col">
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes drawLine {
          from { stroke-dashoffset: 100; }
          to   { stroke-dashoffset: 0; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50%      { transform: translateY(-8px) rotate(0.5deg); }
        }
        @keyframes wash {
          0%, 100% { transform: rotate(-2deg); }
          50%      { transform: rotate(2deg); }
        }
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          20%      { transform: translate(-2%, 1%); }
          40%      { transform: translate(1%, -1%); }
          60%      { transform: translate(-1%, 2%); }
          80%      { transform: translate(2%, -2%); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E");
        }
        .draw {
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: drawLine 1.5s ease-out 1s forwards;
        }
        .shimmer-bg {
          background: linear-gradient(110deg, transparent 30%, rgba(255,255,255,0.4) 50%, transparent 70%);
          background-size: 200% 100%;
          animation: shimmer 3s ease-in-out infinite;
        }
      `}</style>

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

      <main className="relative flex-1 overflow-hidden">
        <div
          className="grain pointer-events-none absolute inset-0 -z-10 opacity-[0.08]"
          style={{ animation: "grain 8s steps(5) infinite" }}
        />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <svg
            viewBox="0 0 1440 900"
            className="absolute -right-40 -top-40 h-[140%] w-auto opacity-[0.06]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M0 700 Q 360 400, 720 600 T 1440 500"
              stroke="#A08B74"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M0 750 Q 360 500, 720 650 T 1440 580"
              stroke="#A08B74"
              strokeWidth="1"
              fill="none"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="mx-auto grid min-h-svh max-w-7xl grid-cols-1 lg:grid-cols-[3fr_2fr]">
          <section className="relative flex flex-col justify-center px-6 pt-28 pb-12 lg:px-16 lg:pt-0">
            <div className={`${stagger[0]} flex items-center gap-3 mb-10`}>
              <span
                className="font-serif italic text-sm text-[#A08B74]/80"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                № 01
              </span>
              <span className="h-px w-12 bg-[#A08B74]/30" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#A08B74]/70 font-medium">
                The operating system
              </span>
            </div>

            <h1
              className={`${stagger[1]} text-4xl font-bold tracking-[-0.02em] text-foreground sm:text-5xl lg:text-[5.5rem] lg:leading-[0.95]`}
            >
              The quiet
              <br />
              operator behind
              <br />
              <span
                className="italic font-light text-[#A08B74]"
                style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                every&nbsp;laundry
              </span>
              <br />
              in the city.
            </h1>

            <p
              className={`${stagger[2]} mt-8 text-base leading-[1.7] text-muted-foreground sm:text-lg max-w-md`}
            >
              A measured, modern back office for laundry businesses — orders
              move, payments settle, deliveries track, and your staff finally
              have one place to work.
            </p>

            <div className={`${stagger[3]} mt-12 flex flex-col sm:flex-row items-start gap-4`}>
              <Link
                href="/signup"
                className="group relative inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 overflow-hidden rounded-full bg-[#2A241E] px-8 text-sm font-semibold text-[#F5F1EC] shadow-[0_4px_24px_-8px_rgba(42,36,30,0.5)] transition-all hover:bg-[#1F1A15] active:scale-[0.98]"
              >
                <span className="relative z-10">Open an account</span>
                <svg
                  viewBox="0 0 24 24"
                  className="relative z-10 size-4 fill-current transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <div className="shimmer-bg absolute inset-0" />
              </Link>
              <Link
                href="#"
                className="group inline-flex h-12 w-full sm:w-auto items-center justify-center gap-2 px-2 text-sm font-medium text-foreground transition-colors"
              >
                <span className="border-b border-foreground/40 pb-0.5 transition-colors group-hover:border-[#A08B74] group-hover:text-[#A08B74]">
                  Watch a 90-second tour
                </span>
                <svg
                  viewBox="0 0 24 24"
                  className="size-3.5 fill-current transition-transform group-hover:translate-x-0.5"
                >
                  <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>

            <div
              className={`${stagger[4]} mt-16 flex items-stretch gap-0 border-y border-[#A08B74]/15 py-6 max-w-md`}
            >
              <div className="flex-1 pr-6">
                <div
                  className="font-serif text-3xl font-light text-foreground"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  2.4k
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Stores onboard
                </div>
              </div>
              <div className="w-px self-stretch bg-[#A08B74]/15" />
              <div className="flex-1 px-6">
                <div
                  className="font-serif text-3xl font-light text-foreground"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  1.2m
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Orders washed
                </div>
              </div>
              <div className="w-px self-stretch bg-[#A08B74]/15" />
              <div className="flex-1 pl-6">
                <div
                  className="font-serif text-3xl font-light text-foreground"
                  style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
                >
                  99.9%
                </div>
                <div className="mt-1 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                  Uptime kept
                </div>
              </div>
            </div>
          </section>

          <section className="relative hidden lg:flex items-center justify-center px-8 py-24">
            <div className="relative w-full max-w-md">
              <div
                className="absolute -left-12 top-12 h-32 w-32 rounded-full border border-[#A08B74]/20"
                style={{ animation: "float 6s ease-in-out infinite" }}
              />
              <div
                className="absolute -right-8 bottom-16 h-20 w-20 rounded-full border border-[#A08B74]/20"
                style={{ animation: "float 7s ease-in-out infinite reverse" }}
              />

              <div className="relative grid grid-cols-6 grid-rows-6 gap-3 aspect-square">
                <div
                  className="col-span-4 row-span-3 relative overflow-hidden rounded-2xl border border-[#A08B74]/15 bg-gradient-to-br from-[#F5F1EC] via-[#EDE6DD] to-[#E0D6C8] shadow-[0_24px_48px_-24px_rgba(122,107,88,0.35)]"
                  style={{ animation: "wash 8s ease-in-out infinite" }}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.5)_0%,transparent_50%)]" />
                  <div className="relative flex h-full flex-col justify-between p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="size-1.5 rounded-full bg-[#A08B74]" />
                        <span className="text-[10px] uppercase tracking-[0.2em] text-[#A08B74]/80 font-medium">
                          Live
                        </span>
                      </div>
                      <span
                        className="font-serif italic text-xs text-[#A08B74]/60"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        12:42 PM
                      </span>
                    </div>
                    <div>
                      <div
                        className="font-serif text-3xl text-foreground leading-none"
                        style={{ fontFamily: "Georgia, serif" }}
                      >
                        1,284
                      </div>
                      <div className="mt-1 text-[11px] text-[#7A6B58]">
                        orders this week
                      </div>
                    </div>
                  </div>
                </div>

                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl border border-[#A08B74]/15 bg-[#2A241E] p-4 text-[#F5F1EC] shadow-[0_24px_48px_-24px_rgba(42,36,30,0.6)]">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-[#A08B74]/70 font-medium">
                    Revenue
                  </div>
                  <div
                    className="mt-2 font-serif text-2xl leading-none"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    KES
                  </div>
                  <div className="mt-1 font-serif text-2xl leading-none text-[#F5F1EC]">
                    84,200
                  </div>
                  <div className="mt-3 flex items-center gap-1 text-[10px] text-emerald-400">
                    <svg viewBox="0 0 24 24" className="size-2.5 fill-current">
                      <path d="M7 14l5-5 5 5z" />
                    </svg>
                    <span>+12.4%</span>
                  </div>
                </div>

                <div className="col-span-2 row-span-2 relative overflow-hidden rounded-2xl border border-[#A08B74]/15 bg-card p-4 shadow-sm">
                  <div className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-medium">
                    Deliveries
                  </div>
                  <div className="mt-2 flex items-end gap-1 h-12">
                    {[40, 65, 35, 80, 55, 90, 70].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 rounded-t bg-[#A08B74]/70"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="mt-2 text-[10px] text-muted-foreground">
                    Last 7 days
                  </div>
                </div>

                <div className="col-span-3 row-span-2 relative overflow-hidden rounded-2xl border border-[#A08B74]/15 bg-card p-4 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex size-6 items-center justify-center rounded-full bg-[#A08B74]/10">
                      <svg viewBox="0 0 24 24" className="size-3 fill-[#A08B74]">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                      </svg>
                    </div>
                    <div className="text-[11px] font-medium text-foreground">
                      Order #1842 — picked up
                    </div>
                  </div>
                  <div className="mt-1.5 text-[10px] text-muted-foreground pl-8">
                    Westlands · 2 min ago
                  </div>
                  <div className="mt-2.5 flex items-center gap-2 pl-8">
                    <div className="h-1 flex-1 rounded-full bg-[#A08B74]/10">
                      <div className="h-full w-2/3 rounded-full bg-[#A08B74]" />
                    </div>
                    <span className="text-[10px] text-muted-foreground">66%</span>
                  </div>
                </div>

                <div className="col-span-3 row-span-1 relative overflow-hidden rounded-2xl border border-[#A08B74]/15 bg-gradient-to-r from-[#A08B74]/8 to-transparent p-3 flex items-center gap-3">
                  <div className="flex -space-x-1.5">
                    <div className="size-5 rounded-full bg-[#C4B09A] ring-2 ring-card" />
                    <div className="size-5 rounded-full bg-[#A08B74] ring-2 ring-card" />
                    <div className="size-5 rounded-full bg-[#7A6B58] ring-2 ring-card" />
                  </div>
                  <span className="text-[10px] text-[#7A6B58]">
                    <span className="font-semibold text-foreground">+18</span> staff active now
                  </span>
                </div>
              </div>

              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-[#A08B74]/20 bg-background/80 px-3 py-1.5 backdrop-blur-md">
                <div className="size-1.5 rounded-full bg-emerald-500" style={{ animation: "float 3s ease-in-out infinite" }} />
                <span className="text-[10px] uppercase tracking-[0.15em] text-[#7A6B58] font-medium">
                  Synced just now
                </span>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
