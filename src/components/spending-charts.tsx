"use client";

import type { Transaction } from "@/lib/types";
import { Bar, BarChart, Pie, PieChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";
import { useMemo } from "react";
import { format, parseISO } from "date-fns";

interface SpendingChartsProps {
  transactions: Transaction[];
}

export function SpendingCharts({ transactions }: SpendingChartsProps) {
  const expenseTransactions = transactions.filter((t) => t.type === "expense");

  const categoryData = useMemo(() => {
    const categoryMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      const category = t.category || "Uncategorized";
      categoryMap.set(category, (categoryMap.get(category) || 0) + t.amount);
    });
    return Array.from(categoryMap, ([name, value]) => ({ name, value, fill: `hsl(var(--chart-${(Array.from(categoryMap.keys()).indexOf(name) % 5) + 1}))` })).sort((a,b) => b.value - a.value);
  }, [expenseTransactions]);

  const monthlyData = useMemo(() => {
    const monthMap = new Map<string, number>();
    expenseTransactions.forEach((t) => {
      const month = format(parseISO(t.date), "MMM yyyy");
      monthMap.set(month, (monthMap.get(month) || 0) + t.amount);
    });
     const data = Array.from(monthMap, ([month, total]) => ({ month, total }));
     // A bit of a hack to make sure we have a consistent sort order
     return data.sort((a,b) => new Date(a.month).getTime() - new Date(b.month).getTime());
  }, [expenseTransactions]);

  const chartConfig = {
    value: {
      label: "Value",
    },
    ...Object.fromEntries(categoryData.map(c => [c.name, {label: c.name}]))
  }

  const chartConfigMonthly = {
    total: {
      label: "Total Expenses",
      color: "hsl(var(--chart-1))",
    },
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Category Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryData.length > 0 ? (
            <ChartContainer config={chartConfig} className="mx-auto aspect-square h-[250px]">
              <PieChart>
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={60}
                  strokeWidth={5}
                />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          ) : (
            <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              No expense data to display.
            </div>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Monthly Expenses</CardTitle>
        </CardHeader>
        <CardContent>
          {monthlyData.length > 0 ? (
          <ChartContainer config={chartConfigMonthly} className="h-[250px] w-full">
            <BarChart accessibilityLayer data={monthlyData} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} tickFormatter={(value) => `$${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="total" fill="var(--color-total)" radius={4} />
            </BarChart>
          </ChartContainer>
          ) : (
             <div className="flex h-[250px] items-center justify-center text-muted-foreground">
              No expense data to display.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
