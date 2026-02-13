"use client";

import { useClerk } from "@clerk/nextjs";
import { ShieldX, LogOut, Home } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function NotAllowedPage() {
  const { signOut } = useClerk();

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <Card className="w-[90%] max-w-md p-8 text-center">
        <div className="flex justify-center mb-6">
          <ShieldX className="h-16 w-16 text-red-500" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Access Not Authorized
        </h2>

        <p className="text-gray-600 mb-6">
          Your email address is not on the approved access list for this
          platform.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-amber-800">
            Please contact your administrator to request access. Once your email
            is added to the allowlist, you can sign in again.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => signOut({ redirectUrl: "/admin/signin" })}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => (window.location.href = "/home")}
          >
            <Home className="h-4 w-4 mr-2" />
            Go to Home
          </Button>
        </div>
      </Card>
    </div>
  );
}
