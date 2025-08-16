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

const LOCAL_STORAGE_KEY = "finsight-transactions";
const CIBIL_ANALYSIS_KEY = "finsight-cibil-analysis";

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cibilFile, setCibilFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [cibilAnalysis, setCibilAnalysis] = useState<CibilReportAnalysis | null>(null);
  const [statementFile, setStatementFile] = useState<File | null>(null);
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
      setTransactions(newTransactions);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newTransactions));
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
    toast({
        title: "Coming Soon!",
        description: "Bank statement processing is not yet implemented.",
    });
  }

  const handleCibilUpload = async () => {
    if (cibilFile) {
        setIsUploading(true);
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
                    setIsUploading(false);
                }
            };
            reader.onerror = (error) => {
                console.error("Failed to read file:", error);
                toast({
                    title: "File Read Error",
                    description: "There was an error reading your file. Please try again.",
                    variant: "destructive",
                });
                setIsUploading(false);
            };
        } catch (error) {
            console.error("File upload error:", error);
            toast({
                title: "Upload Error",
                description: "An unexpected error occurred during file upload.",
                variant: "destructive",
            });
            setIsUploading(false);
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
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Upload CIBIL Report</CardTitle>
                        <CardDescription>
                            Upload your CIBIL report (PDF) to get insights on your credit score.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input type="file" onChange={handleCibilFileChange} accept="application/pdf" className="w-full" disabled={isUploading}/>
                        </div>
                        {cibilFile && (
                            <div className="text-sm text-muted-foreground">
                                Selected file: {cibilFile.name}
                            </div>
                        )}
                        <Button onClick={handleCibilUpload} className="w-full" disabled={!cibilFile || isUploading}>
                            {isUploading ? <LoaderCircle className="animate-spin" /> : <FileCheck />}
                            <span>{isUploading ? "Analyzing..." : "Analyze Report"}</span>
                        </Button>
                    </CardContent>
                </Card>

                 <Card>
                    <CardHeader>
                        <CardTitle className="font-headline">Upload Bank Statement</CardTitle>
                        <CardDescription>
                            Upload your bank statement (PDF) to extract transactions.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Input type="file" onChange={handleStatementFileChange} accept="application/pdf" className="w-full" />
                        </div>
                        {statementFile && (
                            <div className="text-sm text-muted-foreground">
                                Selected file: {statementFile.name}
                            </div>
                        )}
                        <Button onClick={handleStatementUpload} className="w-full" disabled={!statementFile}>
                            <FileScan />
                            <span>Process Statement</span>
                        </Button>
                    </CardContent>
                </Card>
                
                {isUploading && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">CIBIL Report Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <LoaderCircle className="animate-spin" />
                                <p>Analyzing your report...</p>
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </CardContent>
                    </Card>
                )}
                
                {cibilAnalysis && !isUploading && (
                    <CibilAnalysisCard analysis={cibilAnalysis} />
                )}

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
