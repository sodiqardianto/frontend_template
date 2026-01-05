"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Mail } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      console.log("Login attempt:", { email, password });
      setIsLoading(false);
      // Redirect to admin panel after successful login
      window.location.href = "/admin";
    }, 1500);
  };

  return (
    <section>
      <div className="flex h-screen w-full flex-col items-center justify-center">
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
          <div className="w-full max-w-sm">
            <h3 className="text-center text-xl font-semibold">
              Log in to your dashboard
            </h3>

            <div className="mt-8">
              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-3 p-1">
                  {/* Email & Password Form */}
                  <form
                    onSubmit={handleSubmit}
                    className="flex flex-col gap-y-4"
                  >
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="email@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-2"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <a
                          href="#"
                          className="text-xs text-primary hover:text-primary/80 transition-colors"
                        >
                          Forgot password?
                        </a>
                      </div>
                      <div className="relative mt-2">
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pr-10"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            />
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                          </svg>
                          Signing in...
                        </span>
                      ) : (
                        "Log in with email"
                      )}
                    </Button>
                  </form>

                  {/* Divider */}
                  <div className="my-3 flex shrink items-center justify-center gap-2">
                    <div className="grow basis-0 border-b" />
                    <span className="text-xs font-medium uppercase leading-none text-muted-foreground">
                      or
                    </span>
                    <div className="grow basis-0 border-b" />
                  </div>

                  {/* Google Login */}
                  <div>
                    <Button className="w-full" variant="outline" type="button">
                      <Mail className="size-4" />
                      Continue with Google
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
