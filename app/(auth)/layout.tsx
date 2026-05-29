import type { Metadata } from "next";
import logo from "@/public/logos/logo.png";
import {
  LaundryIllustrationMobile,
  LaundryIllustrationTall,
} from "@/components/shared/laundry-illustration";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Laundry Lane Authentication",
  description: "Laundry Lane Admin Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-svh max-h-screen bg-background flex flex-col md:flex-row">
      {/* Left panel — desktop only */}
      <div className="hidden md:flex relative w-1/2 min-h-svh flex-col justify-between overflow-hidden">
        <LaundryIllustrationTall className="absolute inset-0 w-full h-full" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background/10 z-10" />
        <div className="relative z-20 flex flex-col justify-between h-full p-12 lg:p-16">
          <div>
            <Image src={logo} alt="Laundry Lane" className="h-10 w-auto" />
          </div>
          <div className="max-w-md">
            <h2 className="text-3xl lg:text-4xl font-bold tracking-tight text-[#4A3F35] leading-tight">
              Everything you need to run your laundry business
            </h2>
            <div className="mt-4 h-px w-16 bg-[#D0C0AC]" />
            <p className="mt-4 text-sm lg:text-base text-[#8B7D6B] leading-relaxed max-w-sm">
              Manage orders, staff, payments, and more from one powerful
              dashboard.
            </p>
            <div className="mt-8 flex items-center gap-6">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="size-8 rounded-full border-2 border-[#F5F1EC] bg-gradient-to-br from-[#EDE6DD] to-[#D0C0AC]"
                  />
                ))}
              </div>
              <p className="text-xs text-[#A08B74]">
                Trusted by laundry businesses
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full">{children}</div>
      </div>

      {/* Mobile bottom illustration */}
      <div className="relative h-48 md:hidden overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-transparent via-background/15 to-background z-10" />
        <LaundryIllustrationMobile className="absolute inset-0 w-full h-full" />
      </div>
    </div>
  );
}
