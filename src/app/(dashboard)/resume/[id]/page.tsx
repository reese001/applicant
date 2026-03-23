"use client";

import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PremiumGate } from "@/components/shared/premium-gate";

export default function ResumeEditPage() {
  const params = useParams();

  return (
    <PremiumGate featureName="Resume Editor">
      <div className="space-y-6">
        <h1 className="text-2xl font-bold tracking-tight">Edit Resume</h1>
        <Card>
          <CardHeader>
            <CardTitle>Resume Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Resume editing for ID: {params.id}</p>
          </CardContent>
        </Card>
      </div>
    </PremiumGate>
  );
}
