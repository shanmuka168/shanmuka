
"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { FileUp, FileText, BarChart, FileSearch, PieChart, Info, LoaderCircle } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { useToast } from "@/hooks/use-toast";
import { analyzeCibilReport, CibilReportAnalysis } from "@/ai/flows/analyze-cibil-flow";
import { CibilAnalysisCard } from "./cibil-analysis-card";


function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex justify-between items-center text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    )
}

function SummaryCard({ title, value }: { title: string, value: string | number }) {
    return (
        <div className="border rounded-lg p-3 text-center">
            <p className="text-xs text-muted-foreground">{title}</p>
            <p className="text-lg font-bold">{value}</p>
        </div>
    )
}

export function CreditAnalysisPage() {
    const { toast } = useToast();
    const [analysis, setAnalysis] = useState<CibilReportAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast({
                title: "Invalid File Type",
                description: "Please upload a PDF file.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);
        setAnalysis(null);

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const reportDataUri = reader.result as string;
                const result = await analyzeCibilReport({ reportDataUri });
                setAnalysis(result);
                 toast({
                    title: "Analysis Complete",
                    description: "Your CIBIL report has been analyzed.",
                });
            };
        } catch (error) {
            console.error(error);
            toast({
                title: "Analysis Failed",
                description: "Something went wrong. Please try again.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold font-headline">Credit Analysis</h1>
                <p className="text-muted-foreground">Upload your CIBIL report PDF to unlock instant AI-powered insights, personalized scoring, and actionable advice.</p>
            </div>

            <Card>
                <CardHeader>
                    <div className="flex items-center gap-2">
                        <FileUp className="h-5 w-5 text-primary"/>
                        <CardTitle className="text-base font-semibold">Upload Your CIBIL Report (PDF)</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                     <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        accept="application/pdf"
                        disabled={isLoading}
                    />
                    <Button onClick={handleUploadClick} disabled={isLoading}>
                        {isLoading ? (
                            <>
                                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <FileText className="mr-2 h-4 w-4" />
                                Choose PDF File
                            </>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {analysis ? (
                <CibilAnalysisCard analysis={analysis} />
            ) : !isLoading ? (
                <Card>
                     <CardHeader>
                        <div className="flex items-center gap-2">
                             <Info className="h-5 w-5 text-primary"/>
                             <CardTitle className="text-base font-semibold">Your Analysis Will Appear Here</CardTitle>
                        </div>
                    </CardHeader>
                     <CardContent>
                        <p className="text-muted-foreground">Upload your CIBIL report to get started.</p>
                    </CardContent>
                </Card>
            ) : (
                 <Card>
                    <CardHeader>
                        <CardTitle>Analyzing Report</CardTitle>
                        <CardDescription>The AI is processing your CIBIL report. This may take a moment...</CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center p-8">
                        <LoaderCircle className="h-12 w-12 animate-spin text-primary" />
                    </CardContent>
                </Card>
            )
            }
        </div>
    )
}
