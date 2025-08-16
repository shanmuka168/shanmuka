"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CibilReportAnalysis } from "@/ai/flows/analyze-cibil-flow";
import { CheckCircle, Info, TrendingUp, AlertTriangle, Gauge } from "lucide-react";

interface CibilAnalysisCardProps {
  analysis: CibilReportAnalysis;
}

const getScoreColor = (score: number) => {
    if (score >= 750) return "text-green-500";
    if (score >= 700) return "text-yellow-500";
    if (score >= 650) return "text-orange-500";
    return "text-red-500";
}

export function CibilAnalysisCard({ analysis }: CibilAnalysisCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">CIBIL Report Analysis</CardTitle>
        <CardDescription>
          An AI-powered summary of your credit report.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center pb-4 border-b">
            <p className="text-sm text-muted-foreground">Credit Score</p>
            <p className={`text-6xl font-bold ${getScoreColor(analysis.creditScore)}`}>{analysis.creditScore}</p>
        </div>
        <Accordion type="single" collapsible defaultValue="item-1">
          <AccordionItem value="item-1">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Overall Summary
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {analysis.overallSummary}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Payment History
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {analysis.paymentHistory}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Gauge className="h-5 w-5" />
                    Credit Utilization
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {analysis.creditUtilization}
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-4">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Credit Mix
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {analysis.creditMix}
            </AccordionContent>
          </AccordionItem>
           <AccordionItem value="item-5">
            <AccordionTrigger>
                <div className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    Credit Inquiries
                </div>
            </AccordionTrigger>
            <AccordionContent>
                {analysis.inquiries}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
