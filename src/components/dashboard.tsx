
"use client";

import { useState, useEffect } from "react";
import { Logo } from "@/components/icons";
import { Button } from "./ui/button";
import { LogOut, Home, FileText, Fingerprint, Files, Bot, LoaderCircle, FileUp } from "lucide-react";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "./ui/card";


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

  const renderContent = () => {
    switch (activeTab) {
        case "Dashboard":
            return (
                <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <h2 className="text-3xl font-bold font-headline">Welcome to CreditWise AI</h2>
                    <p className="text-muted-foreground mb-8">Your suite of tools for intelligent credit analysis.</p>
                    <Card className="w-full max-w-2xl">
                        <CardContent className="p-6">
                            <div className="flex flex-col items-start text-left mb-6">
                                <h3 className="text-lg font-semibold">Get Started</h3>
                                <p className="text-sm text-muted-foreground">Begin by analyzing your first credit report to see your AI-powered insights.</p>
                            </div>
                            <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center space-y-4">
                                <FileUp className="h-10 w-10 text-muted-foreground" />
                                <h4 className="font-semibold">Ready to Analyze?</h4>
                                <p className="text-sm text-muted-foreground max-w-xs">Upload a credit report to unlock powerful insights and financial analysis.</p>
                                <Button onClick={() => setActiveTab("Credit")}>Analyze Your First Report</Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            );
        case "Credit":
            return (
                <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold">Credit Analysis</h2>
                    <p>Content for credit analysis goes here.</p>
                </div>
            )
        // Add cases for other tabs here
        default:
            return (
                 <div className="flex-1 flex flex-col items-center justify-center">
                    <h2 className="text-2xl font-bold">{activeTab}</h2>
                    <p>Content for {activeTab} goes here.</p>
                 </div>
            )
    }
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
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 flex">
        {renderContent()}
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
