"use client";

import { useState, useEffect } from "react";
import type { Transaction } from "@/lib/types";
import { mockTransactions } from "@/lib/mock-data";
import { Logo } from "@/components/icons";
import { SummaryCards } from "./summary-cards";
import { TransactionsTable } from "./transactions-table";
import { SpendingCharts } from "./spending-charts";
import { Button } from "./ui/button";
import { Upload, Trash2, FileCheck, LoaderCircle, FileScan } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Skeleton } from "./ui/skeleton";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";
import { analyzeCibilReport, CibilReportAnalysis } from "@/ai/flows/analyze-cibil-flow";
import { CibilAnalysisCard } from "./cibil-analysis-card";
import { AnalysisTabs } from "./analysis-tabs";
import { BankStatementAnalysis, analyzeBankStatement } from "@/ai/flows/analyze-bank-statement-flow";

const LOCAL_STORAGE_KEY = "finsight-transactions";
const CIBIL_ANALYSIS_KEY = "finsight-cibil-analysis";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cibilFile, setCibilFile] = useState<File | null>(null);
  const [isCibilUploading, setIsCibilUploading] = useState(false);
  const [cibilAnalysis, setCibilAnalysis] = useState<CibilReportAnalysis | null>(null);
  const [statementFile, setStatementFile] = useState<File | null>(null);
  const [isStatementProcessing, setIsStatementProcessing] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
      const storedCibilAnalysis = localStorage.getItem(CIBIL_ANALYSIS_KEY);
      if (storedCibilAnalysis) {
        setCibilAnalysis(JSON.parse(storedCibilAnalysis));
      }
    } catch (error) {
      console.error("Failed to load data from local storage", error);
    } finally {
        setIsLoading(false);
    }
  }, []);

  const handleSetTransactions = (newTransactions: Transaction[]) => {
    try {
      const sorted = newTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(sorted);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sorted));
    } catch (error) {
      console.error("Failed to save transactions to local storage", error);
    }
  };

  const handleSetCibilAnalysis = (analysis: CibilReportAnalysis | null) => {
    try {
        setCibilAnalysis(analysis);
        if (analysis) {
            localStorage.setItem(CIBIL_ANALYSIS_KEY, JSON.stringify(analysis));
        } else {
            localStorage.removeItem(CIBIL_ANALYSIS_KEY);
        }
    } catch (error) {
        console.error("Failed to save CIBIL analysis to local storage", error);
    }
  }
  
  const loadSampleData = () => {
    handleSetTransactions(mockTransactions);
  };

  const clearData = () => {
    handleSetTransactions([]);
    handleSetCibilAnalysis(null);
  };

  const handleCibilFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const file = event.target.files[0];
      if(file.type !== "application/pdf") {
        toast({
            title: "Invalid File Type",
            description: "Please upload a PDF file.",
            variant: "destructive",
        });
        setCibilFile(null);
        if(event.target) {
            event.target.value = "";
        }
        return;
      }
      setCibilFile(file);
    }
  };
  
  const handleStatementFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
     if (event.target.files) {
      const file = event.target.files[0];
       if(file.type !== "application/pdf") {
        toast({
            title: "Invalid File Type",
            description: "Please upload a PDF file.",
            variant: "destructive",
        });
        setStatementFile(null);
        if(event.target) {
            event.target.value = "";
        }
        return;
      }
      setStatementFile(file);
    }
  }
  
  const handleStatementUpload = async () => {
    if (statementFile) {
        setIsStatementProcessing(true);
        try {
            const reader = new FileReader();
            reader.readAsDataURL(statementFile);
            reader.onload = async () => {
                const dataUri = reader.result as string;
                try {
                    const analysis: BankStatementAnalysis = await analyzeBankStatement({ statementDataUri: dataUri });
                    handleSetTransactions([...transactions, ...analysis.transactions]);
                    toast({
                        title: "Processing Complete",
                        description: `Extracted ${analysis.transactions.length} transactions from your bank statement.`,
                    });
                } catch (error) {
                    console.error("Failed to analyze bank statement:", error);
                    toast({
                        title: "Analysis Failed",
                        description: "Could not process the bank statement. Please try again.",
                        variant: "destructive",
                    });
                } finally {
                    setIsStatementProcessing(false);
                    setStatementFile(null);
                }
            };
            reader.onerror = (error) => {
                console.error("Failed to read file:", error);
                toast({
                    title: "File Read Error",
                    description: "There was an error reading your file. Please try again.",
                    variant: "destructive",
                });
                setIsStatementProcessing(false);
            };
        } catch (error) {
             console.error("File upload error:", error);
            toast({
                title: "Upload Error",
                description: "An unexpected error occurred during file upload.",
                variant: "destructive",
            });
            setIsStatementProcessing(false);
        }
    }
  }

  const handleCibilUpload = async () => {
    if (cibilFile) {
        setIsCibilUploading(true);
        handleSetCibilAnalysis(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(cibilFile);
            reader.onload = async () => {
                const dataUri = reader.result as string;
                try {
                    const analysis = await analyzeCibilReport({ reportDataUri: dataUri });
                    handleSetCibilAnalysis(analysis);
                    toast({
                        title: "Analysis Complete",
                        description: "Your CIBIL report has been analyzed successfully.",
                    });
                } catch (error) {
                    console.error("Failed to analyze CIBIL report:", error);
                    toast({
                        title: "Analysis Failed",
                        description: "Could not analyze the CIBIL report. Please try again.",
                        variant: "destructive",
                    });
                } finally {
                    setIsCibilUploading(false);
                    setCibilFile(null);
                }
            };
            reader.onerror = (error) => {
                console.error("Failed to read file:", error);
                toast({
                    title: "File Read Error",
                    description: "There was an error reading your file. Please try again.",
                    variant: "destructive",
                });
                setIsCibilUploading(false);
            };
        } catch (error) {
            console.error("File upload error:", error);
            toast({
                title: "Upload Error",
                description: "An unexpected error occurred during file upload.",
                variant: "destructive",
            });
            setIsCibilUploading(false);
        }
    }
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
                
                <AnalysisTabs
                    cibilFile={cibilFile}
                    handleCibilFileChange={handleCibilFileChange}
                    isCibilUploading={isCibilUploading}
                    handleCibilUpload={handleCibilUpload}
                    cibilAnalysis={cibilAnalysis}
                    statementFile={statementFile}
                    handleStatementFileChange={handleStatementFileChange}
                    isStatementProcessing={isStatementProcessing}
                    handleStatementUpload={handleStatementUpload}
                />
                
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Data Actions</CardTitle>
                        <CardDescription>
                            Load sample data or clear all transactions and analysis.
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
