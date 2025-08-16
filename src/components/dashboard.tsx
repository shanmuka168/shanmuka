"use client";

import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/types";
import { mockTransactions } from "@/lib/mock-data";
import { Logo } from "@/components/icons";
import { SummaryCards } from "./summary-cards";
import { TransactionsTable } from "./transactions-table";
import { SpendingCharts } from "./spending-charts";
import { Button } from "./ui/button";
import { Upload, Trash2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";

const LOCAL_STORAGE_KEY = "finsight-transactions";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } catch (error) {
      console.error("Failed to load transactions from local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleSetTransactions = (newTransactions: Transaction[]) => {
    try {
      setTransactions(newTransactions);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
    } catch (error) {
      console.error("Failed to save transactions to local storage", error);
    }
  };
  
  const loadSampleData = () => {
    handleSetTransactions(mockTransactions);
  };

  const clearData = () => {
    handleSetTransactions([]);
  };

  if (isLoading) {
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

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background/95 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
        <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold font-headline tracking-tight">
                FinSight Analyzer
            </h1>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-3">
                <SummaryCards transactions={transactions} />
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Transactions</CardTitle>
                        <CardDescription>
                            Your recent transactions. Use the AI to categorize them automatically.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                       <TransactionsTable transactions={transactions} setTransactions={handleSetTransactions} />
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1 space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Data Actions</CardTitle>
                        <CardDescription>
                            Load sample data or clear all transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col sm:flex-row lg:flex-col gap-2">
                        <Button onClick={loadSampleData} className="w-full">
                            <Upload />
                            <span>Load Sample Data</span>
                        </Button>
                        <Button onClick={clearData} variant="destructive" className="w-full">
                            <Trash2 />
                            <span>Clear All Data</span>
                        </Button>
                    </CardContent>
                </Card>
                <SpendingCharts transactions={transactions} />
            </div>
        </div>
      </main>
    </div>
  );
}
