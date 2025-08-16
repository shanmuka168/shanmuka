"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoaderCircle, FileCheck, FileScan, AlertCircle } from "lucide-react";
import { CibilAnalysisCard } from "./cibil-analysis-card";
import { Skeleton } from "./ui/skeleton";
import { CibilReportAnalysis } from "@/ai/flows/analyze-cibil-flow";

interface AnalysisTabsProps {
  cibilFile: File | null;
  handleCibilFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isCibilUploading: boolean;
  handleCibilUpload: () => void;
  cibilAnalysis: CibilReportAnalysis | null;

  statementFile: File | null;
  handleStatementFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isStatementProcessing: boolean;
  handleStatementUpload: () => void;
}

export function AnalysisTabs({
  cibilFile,
  handleCibilFileChange,
  isCibilUploading,
  handleCibilUpload,
  cibilAnalysis,
  statementFile,
  handleStatementFileChange,
  isStatementProcessing,
  handleStatementUpload,
}: AnalysisTabsProps) {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">AI Analysis</CardTitle>
            <CardDescription>Upload your documents to get AI-powered insights.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="cibil">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cibil">CIBIL Report</TabsTrigger>
                    <TabsTrigger value="statement">Bank Statement</TabsTrigger>
                </TabsList>
                <TabsContent value="cibil" className="space-y-4 pt-4">
                    <p className="text-sm text-muted-foreground">
                        Upload your CIBIL report (PDF) to get insights on your credit score.
                    </p>
                    <div className="flex items-center gap-2">
                        <Input
                        type="file"
                        onChange={handleCibilFileChange}
                        accept="application/pdf"
                        className="w-full"
                        disabled={isCibilUploading}
                        />
                    </div>
                    {cibilFile && (
                        <div className="text-sm text-muted-foreground">
                        Selected file: {cibilFile.name}
                        </div>
                    )}
                    <Button
                        onClick={handleCibilUpload}
                        className="w-full"
                        disabled={!cibilFile || isCibilUploading}
                    >
                        {isCibilUploading ? (
                        <LoaderCircle className="animate-spin" />
                        ) : (
                        <FileCheck />
                        )}
                        <span>
                        {isCibilUploading ? "Analyzing..." : "Analyze Report"}
                        </span>
                    </Button>
                    
                    {isCibilUploading && (
                        <div className="space-y-4 pt-4">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                <LoaderCircle className="animate-spin" />
                                <p>Analyzing your report...</p>
                            </div>
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    )}

                    {cibilAnalysis && !isCibilUploading && (
                       <div className="pt-4">
                        <CibilAnalysisCard analysis={cibilAnalysis} />
                        </div>
                    )}
                </TabsContent>
                <TabsContent value="statement" className="space-y-4 pt-4">
                     <p className="text-sm text-muted-foreground">
                        Upload your bank statement (PDF) to automatically extract transactions.
                    </p>
                    <div className="flex items-center gap-2">
                        <Input
                        type="file"
                        onChange={handleStatementFileChange}
                        accept="application/pdf"
                        className="w-full"
                        disabled={isStatementProcessing}
                        />
                    </div>
                    {statementFile && (
                        <div className="text-sm text-muted-foreground">
                        Selected file: {statementFile.name}
                        </div>
                    )}
                    <Button
                        onClick={handleStatementUpload}
                        className="w-full"
                        disabled={!statementFile || isStatementProcessing}
                    >
                        {isStatementProcessing ? <LoaderCircle className="animate-spin" /> : <FileScan />}
                        <span>{isStatementProcessing ? "Processing..." : "Process Statement"}</span>
                    </Button>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
    