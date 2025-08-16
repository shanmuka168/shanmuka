
"use client"

import { ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle, XCircle, Info, TrendingUp, TrendingDown, HelpCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from './ui/chart';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, LineChart, Line, Legend, Tooltip } from 'recharts';
import type { CibilReportAnalysis } from '@/ai/flows/analyze-cibil-flow';
import { useMemo } from 'react';

type BehaviorAnalysis = CibilReportAnalysis['behavioralSummary']['individual'];

interface BehaviorAnalysisCardProps {
    analysis: BehaviorAnalysis;
}

const BehaviorRating = ({ rating }: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'No Data' }) => {
    const config = {
        Excellent: { icon: ThumbsUp, color: 'text-green-500', text: 'Excellent' },
        Good: { icon: ThumbsUp, color: 'text-blue-500', text: 'Good' },
        Fair: { icon: AlertTriangle, color: 'text-yellow-500', text: 'Fair' },
        Poor: { icon: ThumbsDown, color: 'text-red-500', text: 'Poor' },
        'No Data': { icon: HelpCircle, color: 'text-muted-foreground', text: 'No Data' },
    };
    const { icon: Icon, color, text } = config[rating];

    return (
        <div className={`flex items-center gap-2 font-semibold ${color}`}>
            <Icon className="h-5 w-5" />
            <span>{text} Payment Behavior</span>
        </div>
    );
};


export function BehaviorAnalysisCard({ analysis }: BehaviorAnalysisCardProps) {
    const { rating, summary, paymentTrend, totalPayments, onTimePayments, latePayments } = analysis;

    const chartConfig = {
        onTime: {
          label: "On-Time",
          color: "hsl(var(--chart-1))",
        },
        late: {
          label: "Late",
          color: "hsl(var(--chart-2))",
        },
    }

    if (rating === "No Data") {
        return (
            <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center text-muted-foreground">
                <HelpCircle className="h-12 w-12" />
                <p className="font-bold">No Active Accounts</p>
                <p className="text-sm">There are no active accounts of this type to analyze.</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border rounded-lg flex items-center gap-4 col-span-1 md:col-span-3">
                    <BehaviorRating rating={rating} />
                </div>
                 <div className="p-4 border rounded-lg flex items-center gap-4">
                    <CheckCircle className="h-8 w-8 text-green-500" />
                    <div>
                        <p className="text-muted-foreground text-sm">On-Time Payments</p>
                        <p className="text-2xl font-bold">{onTimePayments}</p>
                    </div>
                </div>
                 <div className="p-4 border rounded-lg flex items-center gap-4">
                    <XCircle className="h-8 w-8 text-red-500" />
                    <div>
                        <p className="text-muted-foreground text-sm">Late Payments</p>
                        <p className="text-2xl font-bold">{latePayments}</p>
                    </div>
                </div>
                 <div className="p-4 border rounded-lg flex items-center gap-4">
                    <Info className="h-8 w-8 text-blue-500" />
                    <div>
                        <p className="text-muted-foreground text-sm">Total Payments</p>
                        <p className="text-2xl font-bold">{totalPayments}</p>
                    </div>
                </div>
            </div>
             <div>
                <p className="text-sm text-muted-foreground leading-relaxed">{summary}</p>
             </div>
            <div>
                 <h4 className="font-semibold text-sm mb-2">Payment Trend (Last 12 Months)</h4>
                 <ChartContainer config={chartConfig} className="h-[200px] w-full">
                    <LineChart accessibilityLayer data={paymentTrend} margin={{ top: 5, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <YAxis allowDecimals={false} tickLine={false} axisLine={false} tickMargin={8} />
                         <Tooltip content={<ChartTooltipContent />} />
                        <Legend />
                        <Line dataKey="onTime" type="monotone" stroke="var(--color-onTime)" strokeWidth={2} dot={false} name="On-Time" />
                        <Line dataKey="late" type="monotone" stroke="var(--color-late)" strokeWidth={2} dot={false} name="Late" />
                    </LineChart>
                </ChartContainer>
            </div>
        </div>
    )
}
