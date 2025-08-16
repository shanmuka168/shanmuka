
"use client";

import { useState, useRef } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { FileUp, FileText, LoaderCircle, CheckCircle, Info } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { analyzeCibilReport, CibilReportAnalysis } from "@/ai/flows/analyze-cibil-flow";
import { CibilAnalysisCard } from "./cibil-analysis-card";
import { CreditSummary } from "./credit-summary";


export function CreditAnalysisPage() {
    const { toast } = useToast();
    const [analysis, setAnalysis] = useState<CibilReportAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [view, setView] = useState<'main' | 'details'>('main');

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
        setFileName(file.name);
        setView('main');

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
                    variant: "default"
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

    const handleChooseAnother = () => {
        setAnalysis(null);
        setFileName("");
        setView('main');
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const renderContent = () => {
        if (view === 'details' && analysis) {
            return <CreditSummary analysis={analysis} onBack={() => setView('main')} />;
        }
        
        return (
            <div className="space-y-6">
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
                        {!fileName && !isLoading && (
                            <Button onClick={handleUploadClick}>
                                <FileText className="mr-2 h-4 w-4" />
                                Choose PDF File
                            </Button>
                        )}
                        {isLoading && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <LoaderCircle className="h-5 w-5 animate-spin" />
                                <span>Analyzing "{fileName}"... This may take a moment.</span>
                            </div>
                        )}
                        {analysis && !isLoading && (
                            <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                                <div className="flex items-center gap-3">
                                    <CheckCircle className="h-6 w-6 text-green-500"/>
                                    <div>
                                        <p className="font-semibold text-green-700">Analysis Complete!</p>
                                        <p className="text-sm text-green-600">Your AI-powered insights are ready. Use the dashboard below to explore.</p>
                                    </div>
                                </div>
                                <Button onClick={handleChooseAnother} variant="outline" size="sm">Choose Another File</Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {analysis ? (
                    <CibilAnalysisCard analysis={analysis} onViewDetails={() => setView('details')} />
                ) : !isLoading && (
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
                )}
            </div>
        )
    }

    return (
        <div className="container mx-auto p-4 sm:p-6 bg-background/80">
            {renderContent()}
        </div>
    )
}
