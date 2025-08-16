
"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { Button } from "./ui/button";
import { LogOut, Home, FileText, Fingerprint, Files, Bot, LoaderCircle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";


export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
        setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  
  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const navItems = [
    { name: "Dashboard", icon: Home },
    { name: "Credit", icon: FileText },
    { name: "Verify", icon: Fingerprint },
    { name: "Cross-Verify", icon: Files },
    { name: "Trainer", icon: Bot },
  ]

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="flex items-center gap-2 mb-4">
                <Logo className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold font-headline">CreditWise AI</h1>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
                <LoaderCircle className="animate-spin h-5 w-5" />
                <span>Redirecting to your dashboard...</span>
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
                CreditWise AI
            </h1>
        </div>
        <div className="ml-auto">
            <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut />
                <span className="hidden sm:inline">Logout</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6">
        {/* Content for the selected tab can go here */}
      </main>
      <footer className="sticky bottom-0 z-30 flex h-16 items-center justify-center gap-4 border-t bg-background/95 p-2 backdrop-blur-sm">
        <nav className="flex w-full items-center justify-around">
            {navItems.map((item) => (
                <button 
                    key={item.name} 
                    onClick={() => setActiveTab(item.name)}
                    className={cn(
                        "flex flex-col items-center justify-center gap-1 text-xs w-16 transition-colors",
                        activeTab === item.name ? "text-primary" : "text-muted-foreground hover:text-primary"
                    )}
                >
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                </button>
            ))}
        </nav>
      </footer>
    </div>
  );
}
