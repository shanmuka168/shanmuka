
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Construction } from "lucide-react";

export function AnalysisTabs() {
  return (
    <Card>
        <CardHeader>
            <CardTitle className="font-headline">AI Analysis</CardTitle>
            <CardDescription>AI-powered insights for your financial documents.</CardDescription>
        </CardHeader>
        <CardContent>
            <Tabs defaultValue="cibil">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="cibil">CIBIL Analysis</TabsTrigger>
                    <TabsTrigger value="statement">Bank Analysis</TabsTrigger>
                </TabsList>
                <TabsContent value="cibil" className="space-y-4 pt-4">
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center text-muted-foreground">
                        <Construction className="h-12 w-12" />
                        <p className="font-bold">Under Construction</p>
                        <p className="text-sm">This feature is coming soon. Stay tuned!</p>
                    </div>
                </TabsContent>
                <TabsContent value="statement" className="space-y-4 pt-4">
                    <div className="flex flex-col items-center justify-center p-8 space-y-4 text-center text-muted-foreground">
                        <Construction className="h-12 w-12" />
                        <p className="font-bold">Under Construction</p>
                        <p className="text-sm">This feature is coming soon. Stay tuned!</p>
                    </div>
                </TabsContent>
            </Tabs>
        </CardContent>
    </Card>
  );
}
