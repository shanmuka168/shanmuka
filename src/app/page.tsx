
"use client";

import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import Dashboard from "@/components/dashboard";
import LoginPage from "./login/page";
import { Skeleton } from "@/components/ui/skeleton";

export default function Home() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <Skeleton className="h-8 w-64" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
                <Skeleton className="h-28 rounded-lg" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-12 w-full rounded-lg" />
                    <Skeleton className="h-96 w-full rounded-lg" />
                </div>
                <div className="space-y-6">
                    <Skeleton className="h-80 w-full rounded-lg" />
                    <Skeleton className="h-80 w-full rounded-lg" />
                </div>
            </div>
        </div>
    );
  }

  if (user) {
    return (
      <main>
        <Dashboard />
      </main>
    );
  }

  return <LoginPage />;
}
