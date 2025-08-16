
"use client";

import * as React from "react";
import { useState, useMemo } from 'react';
import type { CibilReportAnalysis } from '@/ai/flows/analyze-cibil-flow';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { ArrowLeft, TrendingUp, TrendingDown, CheckCircle, XCircle, Info, ThumbsUp, ThumbsDown, AlertTriangle } from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from '@/lib/utils';

interface CreditSummaryProps {
  analysis: CibilReportAnalysis;
  onBack: () => void;
}

const SummaryCard = ({ title, value, subValue }: { title: string; value: string | number; subValue?: string }) => (
    <div className="bg-background border rounded-lg p-4 flex-1 text-center min-w-[120px]">
        <p className="text-sm text-muted-foreground">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
);

const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case 'active': return 'bg-green-500';
        case 'closed': return 'bg-gray-500';
        default: return 'bg-red-500';
    }
};

const DpdCircle = ({ value }: { value: string | number }) => {
    const isDelayed = value !== 'STD' && value !== '000' && value !== 'XXX' && value !== 0 && value !== '0';
    
    let displayValue = value;
    if (value === 'STD' || value === '000') displayValue = '0';
    if (value === 'XXX') displayValue = 'X';


    return (
        <div title={`DPD: ${value}`} className={cn("w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-mono",
            isDelayed ? 'bg-red-500' : 'bg-green-500'
        )}>
            <span className="scale-75">{displayValue}</span>
        </div>
    )
}

const BehaviorRating = ({ rating }: { rating: 'Excellent' | 'Good' | 'Fair' | 'Poor' }) => {
    const config = {
        Excellent: { icon: ThumbsUp, color: 'text-green-500', text: 'Excellent' },
        Good: { icon: ThumbsUp, color: 'text-blue-500', text: 'Good' },
        Fair: { icon: AlertTriangle, color: 'text-yellow-500', text: 'Fair' },
        Poor: { icon: ThumbsDown, color: 'text-red-500', text: 'Poor' },
    };
    const { icon: Icon, color, text } = config[rating];

    return (
        <div className={`flex items-center gap-2 font-semibold ${color}`}>
            <Icon className="h-5 w-5" />
            <span>{text} Payment Behavior</span>
        </div>
    );
};


export function CreditSummary({ analysis, onBack }: CreditSummaryProps) {
    const [dpdFilter, setDpdFilter] = useState('12');
    const { detailedAccounts } = analysis;

    const activeAccounts = useMemo(() => detailedAccounts.filter(acc => acc.status === 'Active'), [detailedAccounts]);

    const summaryData = useMemo(() => {
        const totalSanctioned = detailedAccounts.reduce((sum, acc) => sum + acc.sanctionedAmount, 0);
        const totalOutstanding = detailedAccounts.reduce((sum, acc) => sum + acc.currentBalance, 0);
        const totalEmi = activeAccounts.reduce((sum, acc) => sum + (acc.emi || 0), 0);
        const creditUtilization = totalSanctioned > 0 ? (totalOutstanding / totalSanctioned) * 100 : 0;
        
        const statusCounts = detailedAccounts.reduce((counts, acc) => {
            const status = acc.status.toLowerCase();
            if (status.includes('written off')) counts.writtenOff++;
            else if (status.includes('doubtful')) counts.doubtful++;
            else if (status.includes('settled')) counts.settled++;
            else if (status.includes('closed')) counts.closed++;
            else if (status.includes('active')) counts.active++;
            return counts;
        }, { active: 0, closed: 0, writtenOff: 0, doubtful: 0, settled: 0 });

        return {
            totalAccounts: detailedAccounts.length,
            activeAccounts: statusCounts.active,
            closedAccounts: statusCounts.closed,
            totalSanctioned: `₹${totalSanctioned.toLocaleString('en-IN')}`,
            totalOutstanding: `₹${totalOutstanding.toLocaleString('en-IN')}`,
            creditUtilization: `${creditUtilization.toFixed(2)}%`,
            writtenOff: statusCounts.writtenOff,
            doubtful: statusCounts.doubtful,
            settled: statusCounts.settled,
            totalEmi: `₹${totalEmi.toLocaleString('en-IN')}`
        };
    }, [detailedAccounts, activeAccounts]);
    
    const dpdAnalysis = useMemo(() => {
        const months = parseInt(dpdFilter);
        const analysis = { '1-30': 0, '31-60': 0, '61-90': 0, '90+': 0, 'ontime': 0, 'total': 0 };
        activeAccounts.forEach(acc => {
            const history = acc.paymentHistory.slice(0, months);
            history.forEach(dpdStr => {
                 if (dpdStr === 'XXX') return;
                 analysis.total++;

                if (dpdStr === 'STD' || dpdStr === '0' || dpdStr === '000') {
                    analysis.ontime++;
                    return;
                }
                const dpd = parseInt(dpdStr);
                if(isNaN(dpd)) return;

                if (dpd > 0 && dpd <= 30) analysis['1-30']++;
                else if (dpd > 30 && dpd <= 60) analysis['31-60']++;
                else if (dpd > 60 && dpd <= 90) analysis['61-90']++;
                else if (dpd > 90) analysis['90+']++;
            });
        });
        return analysis;
    }, [activeAccounts, dpdFilter]);

    const behaviorAnalysis = useMemo(() => {
        const totalPayments = dpdAnalysis.total;
        if(totalPayments === 0) return {
            rating: 'Fair' as const,
            summary: 'Not enough payment data available for this period to generate a detailed analysis.',
            onTimePayments: 0,
            totalPayments: 0,
            latePayments: 0
        };

        const latePayments = totalPayments - dpdAnalysis.ontime;
        const onTimePercentage = (dpdAnalysis.ontime / totalPayments) * 100;

        let rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
        let summary: string;

        if (onTimePercentage >= 99) {
            rating = 'Excellent';
            summary = 'Payment history is pristine with virtually all payments made on time. This indicates outstanding financial discipline and reliability as a borrower.';
        } else if (onTimePercentage >= 95) {
            rating = 'Good';
            summary = 'Consistently makes payments on time with very few delays. This demonstrates strong credit management and financial responsibility.';
        } else if (onTimePercentage >= 85) {
            rating = 'Fair';
            summary = 'There are some instances of late payments. While most payments are on time, the occasional delays could be a point of concern for lenders.';
        } else {
            rating = 'Poor';
            summary = 'A significant number of payments have been delayed, indicating potential issues with credit management. This could negatively impact creditworthiness.';
        }

        return {
            rating,
            summary,
            onTimePayments: dpdAnalysis.ontime,
            totalPayments,
            latePayments,
        };
    }, [dpdAnalysis]);

    const pieChartData = [
        { name: 'Active', value: summaryData.activeAccounts, fill: 'hsl(var(--chart-1))' },
        { name: 'Closed', value: summaryData.closedAccounts, fill: 'hsl(var(--chart-2))' },
        { name: 'Written Off', value: summaryData.writtenOff, fill: 'hsl(var(--chart-3))' },
        { name: 'Settled', value: summaryData.settled, fill: 'hsl(var(--chart-4))' },
        { name: 'Doubtful', value: summaryData.doubtful, fill: 'hsl(var(--chart-5))' },
    ].filter(d => d.value > 0);

    const chartConfig = {
        value: { label: "Accounts" },
        Active: { label: "Active", color: "hsl(var(--chart-1))" },
        Closed: { label: "Closed", color: "hsl(var(--chart-2))" },
        "Written Off": { label: "Written Off", color: "hsl(var(--chart-3))" },
        Settled: { label: "Settled", color: "hsl(var(--chart-4))" },
        Doubtful: { label: "Doubtful", color: "hsl(var(--chart-5))" },
    } as const;
    

  return (
    <div className="space-y-6">
        <Button variant="outline" onClick={onBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4"/> Back to Main View
        </Button>
        <Card>
            <CardHeader>
                <CardTitle>Credit Summary</CardTitle>
                <CardDescription>A high-level overview of your credit accounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex flex-wrap gap-4">
                    <SummaryCard title="Total Accounts" value={summaryData.totalAccounts} />
                    <SummaryCard title="Active Accounts" value={summaryData.activeAccounts} />
                    <SummaryCard title="Closed Accounts" value={summaryData.closedAccounts} />
                    <SummaryCard title="Total Sanctioned" value={summaryData.totalSanctioned} />
                    <SummaryCard title="Total Outstanding" value={summaryData.totalOutstanding} />
                    <SummaryCard title="Credit Utilization" value={summaryData.creditUtilization} />
                    <SummaryCard title="Written Off" value={summaryData.writtenOff} />
                    <SummaryCard title="Doubtful" value={summaryData.doubtful} />
                    <SummaryCard title="Settled" value={summaryData.settled} />
                    <SummaryCard title="Total EMI" value={summaryData.totalEmi} subValue="(Active Accounts)" />
                </div>
            </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="lg:col-span-2">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle>DPD Analysis</CardTitle>
                            <CardDescription>Days Past Due breakdown over the selected period.</CardDescription>
                        </div>
                         <Select value={dpdFilter} onValueChange={setDpdFilter}>
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="3">Last 3 Months</SelectItem>
                                <SelectItem value="6">Last 6 Months</SelectItem>
                                <SelectItem value="9">Last 9 Months</SelectItem>
                                <SelectItem value="12">Last 12 Months</SelectItem>
                                <SelectItem value="18">Last 18 Months</SelectItem>
                                <SelectItem value="24">Last 24 Months</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">1-30 DPD</p>
                            <p className="text-2xl font-bold text-orange-500">{dpdAnalysis['1-30']}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">31-60 DPD</p>
                            <p className="text-2xl font-bold text-red-500">{dpdAnalysis['31-60']}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">61-90 DPD</p>
                            <p className="text-2xl font-bold text-red-700">{dpdAnalysis['61-90']}</p>
                        </div>
                        <div className="p-4 border rounded-lg">
                            <p className="text-sm text-muted-foreground">90+ DPD</p>
                            <p className="text-2xl font-bold text-black">{dpdAnalysis['90+']}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Account Status Breakdown</CardTitle>
                    <CardDescription>Distribution of your credit accounts by status.</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center items-center">
                    <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[200px]">
                        <PieChart>
                            <ChartTooltip content={<ChartTooltipContent nameKey="name" hideLabel />} />
                            <Pie data={pieChartData} dataKey="value" nameKey="name" innerRadius={50} paddingAngle={5}>
                                 {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                        </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Customer Payment Behavior</CardTitle>
                <CardDescription>Analysis for active loans over the last {dpdFilter} months.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                 <div>
                    <BehaviorRating rating={behaviorAnalysis.rating} />
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg flex items-center gap-4">
                        <CheckCircle className="h-8 w-8 text-green-500" />
                        <div>
                            <p className="text-muted-foreground text-sm">On-Time Payments</p>
                            <p className="text-2xl font-bold">{behaviorAnalysis.onTimePayments}</p>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg flex items-center gap-4">
                        <XCircle className="h-8 w-8 text-red-500" />
                        <div>
                            <p className="text-muted-foreground text-sm">Late Payments</p>
                            <p className="text-2xl font-bold">{behaviorAnalysis.latePayments}</p>
                        </div>
                    </div>
                     <div className="p-4 border rounded-lg flex items-center gap-4">
                        <Info className="h-8 w-8 text-blue-500" />
                        <div>
                            <p className="text-muted-foreground text-sm">Total Payments</p>
                            <p className="text-2xl font-bold">{behaviorAnalysis.totalPayments}</p>
                        </div>
                    </div>
                 </div>
                 <div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{behaviorAnalysis.summary}</p>
                 </div>
            </CardContent>
        </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detailed Account Summary</CardTitle>
          <CardDescription>A comprehensive list of all accounts reported by the credit bureau.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sanctioned</TableHead>
                  <TableHead className="text-right">Outstanding</TableHead>
                  <TableHead className="text-right">Overdue</TableHead>
                  <TableHead className="text-right">EMI</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detailedAccounts.map((acc, index) => (
                  <React.Fragment key={index}>
                    <TableRow>
                      <TableCell className="font-medium">
                        <div>{acc.accountType}</div>
                        <div className="text-xs text-muted-foreground">({acc.ownershipType})</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`border-none text-white ${getStatusColor(acc.status)}`}>
                          {acc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">₹{acc.sanctionedAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{acc.currentBalance.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right text-red-500">₹{acc.overdueAmount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="text-right">₹{(acc.emi || 0).toLocaleString('en-IN')}</TableCell>
                      <TableCell>{acc.status.toLowerCase() === 'closed' ? acc.dateClosed : acc.dateOpened}</TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell colSpan={7} className="p-2">
                           <div className="flex gap-1 flex-wrap p-2 bg-muted rounded-md">
                                <span className="text-xs font-semibold mr-2 flex items-center">Payment History (Last 12 months):</span>
                                {acc.paymentHistory.slice(0, 12).map((dpd, i) => (
                                <DpdCircle key={i} value={dpd} />
                                ))}
                            </div>
                        </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
