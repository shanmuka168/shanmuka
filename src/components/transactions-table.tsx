"use client";

import type { Transaction } from "@/lib/types";
import { useState, useMemo, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, LoaderCircle, Sparkles } from "lucide-react";
import { format } from "date-fns";
import { categorizeTransaction } from "@/ai/flows/categorize-transaction";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

interface TransactionsTableProps {
  transactions: Transaction[];
  setTransactions: (transactions: Transaction[]) => void;
}

type SortKey = "date" | "amount";

export function TransactionsTable({
  transactions,
  setTransactions,
}: TransactionsTableProps) {
  const { toast } = useToast();
  const [isCategorizing, startCategorizing] = useTransition();
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const sortedTransactions = useMemo(() => {
    return [...transactions].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [transactions, sortKey, sortOrder]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortOrder("desc");
    }
  };

  const uncategorizedCount = useMemo(() => {
    return transactions.filter((t) => t.category === "Uncategorized").length;
  }, [transactions]);

  const runCategorization = () => {
    startCategorizing(async () => {
      const transactionsToCategorize = transactions.filter(
        (t) => t.category === "Uncategorized"
      );
      if (transactionsToCategorize.length === 0) {
        toast({
          title: "No transactions to categorize",
          description: "All transactions already have a category.",
        });
        return;
      }

      const newTransactions = [...transactions];
      let successCount = 0;
      let errorCount = 0;

      await Promise.all(
        transactionsToCategorize.map(async (tx) => {
          try {
            const result = await categorizeTransaction({
              description: tx.description,
            });
            const txIndex = newTransactions.findIndex((t) => t.id === tx.id);
            if (txIndex !== -1) {
              newTransactions[txIndex].category = result.category;
              successCount++;
            }
          } catch (error) {
            console.error(`Failed to categorize transaction ${tx.id}:`, error);
            errorCount++;
          }
        })
      );

      setTransactions(newTransactions);

      toast({
        title: "Categorization Complete",
        description: `${successCount} transactions categorized. ${
          errorCount > 0 ? `${errorCount} failed.` : ""
        }`,
      });
    });
  };

  const getCategoryColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 50%, 80%)`;
  }
  const getCategoryTextColor = (category: string) => {
    let hash = 0;
    for (let i = 0; i < category.length; i++) {
        hash = category.charCodeAt(i) + ((hash << 5) - hash);
    }
    const h = hash % 360;
    return `hsl(${h}, 70%, 20%)`;
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-2 mb-4">
        <Button
          onClick={runCategorization}
          disabled={isCategorizing || uncategorizedCount === 0}
        >
          {isCategorizing ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            <Sparkles />
          )}
          <span>Categorize with AI ({uncategorizedCount})</span>
        </Button>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead onClick={() => handleSort("date")} className="cursor-pointer">
                <div className="flex items-center gap-2">
                  Date <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Category</TableHead>
              <TableHead
                onClick={() => handleSort("amount")}
                className="text-right cursor-pointer"
              >
                <div className="flex items-center justify-end gap-2">
                  Amount <ArrowUpDown className="h-4 w-4" />
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedTransactions.map((tx) => (
              <TableRow key={tx.id}>
                <TableCell className="text-muted-foreground">
                  {format(new Date(tx.date), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="font-medium">{tx.description}</TableCell>
                <TableCell>
                    <Badge variant="outline" style={{ backgroundColor: getCategoryColor(tx.category), color: getCategoryTextColor(tx.category), borderColor: getCategoryTextColor(tx.category)}}>
                        {tx.category}
                    </Badge>
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    tx.type === "income" ? "text-green-500" : "text-foreground"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(tx.amount)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {transactions.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
                No transactions found. Load some sample data to get started.
            </div>
        )}
      </div>
    </div>
  );
}
