
"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { AnalysisTabs } from "./analysis-tabs";


export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  if (isLoading) {
    return (
        <div className="p-4 md:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-10 w-10 rounded-lg" />
                    <Skeleton className="h-8 w-64" />
                </div>
                <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-6 mt-6">
                <Skeleton className="h-64 w-full rounded-lg" />
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight">
                FinSight Analyzer
            </h1>
        </div>
        <div className="ml-auto">
            <Button onClick={handleLogout} variant="outline">
                <LogOut />
                <span>Logout</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        <AnalysisTabs />
      </main>
    </div>
  );
}
