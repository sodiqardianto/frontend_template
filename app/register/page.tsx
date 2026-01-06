"use client";

import { RegisterForm } from "@/features/auth";

export default function RegisterPage() {
  return (
    <section>
      <div className="flex min-h-screen w-full flex-col items-center justify-center py-8">
        {/* Grid Pattern Background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute inset-y-0 left-1/2 h-full w-[1200px] -translate-x-1/2">
            <svg
              className="pointer-events-none absolute inset-0 text-black/20 mask-intersect mask-[linear-gradient(black,transparent),radial-gradient(black,transparent)] dark:text-white/20"
              width="100%"
              height="100%"
            >
              <defs>
                <pattern
                  id="grid-pattern"
                  x="-1"
                  y="-1"
                  width="60"
                  height="60"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 60 0 L 0 0 0 60"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect fill="url(#grid-pattern)" width="100%" height="100%" />
            </svg>
          </div>
        </div>

        {/* Main Content */}
        <div className="relative flex w-full flex-col items-center justify-center px-4">
          <RegisterForm />
        </div>
      </div>
    </section>
  );
}
