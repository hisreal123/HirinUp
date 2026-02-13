"use client";

import { useState } from "react";
import { SignUp } from "@clerk/nextjs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, ShieldX, Loader2 } from "lucide-react";

function AdminSignUpPage() {
  const [email, setEmail] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setIsChecking(true);

    try {
      const res = await fetch("/api/check-allowlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!data.ok) {
        setError("This email is not authorized to sign up. Please contact your administrator for access.");
        setIsChecking(false);
        return;
      }

      // Store verified email in state — no URL param to tamper with
      setVerifiedEmail(email.trim());
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsChecking(false);
    }
  }

  // Email verified via API — show Clerk SignUp
  if (verifiedEmail) {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
        <div className="hidden md:block align-middle my-auto">
          <SignUp
            forceRedirectUrl="/dashboard"
            initialValues={{ emailAddress: verifiedEmail }}
          />
        </div>
        <div className="block md:hidden px-3 h-[60%] my-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Welcome to Hirin<span className="text-indigo-600">Up</span>
          </h1>
          <h1 className="text-md my-3 text-center text-gray-800">
            Mobile version is currently under construction. 🚧
          </h1>
          <p className="text-center text-gray-600 mt-3">
            Please sign in using a PC for the best experience. Sorry for the
            inconvenience.
          </p>
        </div>
      </div>
    );
  }

  // Show the email gate form
  return (
    <div className="flex items-center justify-center h-screen w-full bg-white absolute top-0 left-0 z-50">
      <div className="hidden md:flex flex-col items-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome to Hirin<span className="text-indigo-600">Up</span>
            </h1>
            <p className="mt-2 text-gray-600">
              Enter your work email to get started
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Work Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg p-3">
                <ShieldX className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={isChecking}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a href="/admin/signin" className="text-indigo-600 hover:text-indigo-500 font-medium">
              Sign in
            </a>
          </p>
        </div>
      </div>

      <div className="block md:hidden px-3 h-[60%] my-auto">
        <h1 className="text-2xl font-bold text-center text-gray-800">
          Welcome to Hirin<span className="text-indigo-600">Up</span>
        </h1>
        <h1 className="text-md my-3 text-center text-gray-800">
          Mobile version is currently under construction. 🚧
        </h1>
        <p className="text-center text-gray-600 mt-3">
          Please sign in using a PC for the best experience. Sorry for the
          inconvenience.
        </p>
      </div>
    </div>
  );
}

export default AdminSignUpPage;
