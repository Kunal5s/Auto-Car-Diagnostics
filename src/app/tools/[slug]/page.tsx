
"use client";

import { notFound } from "next/navigation";
import { tools } from "@/lib/config";
import { Header } from "@/components/common/header";
import { Footer } from "@/components/common/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BatteryHealthCheck } from "@/components/tools/battery-health-check";
import { TirePressureGuide } from "@/components/tools/tire-pressure-guide";
import { FuelCostCalculator } from "@/components/tools/fuel-cost-calculator";
import { EngineTempMonitor } from "@/components/tools/engine-temp-monitor";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { AirFilterChecker } from "@/components/tools/air-filter-checker";
import { EngineNoiseAnalyzer } from "@/components/tools/engine-noise-analyzer";
import { BeltConditionEstimator } from "@/components/tools/belt-condition-estimator";
import { AcPerformanceChecker } from "@/components/tools/ac-performance-checker";
import { WarningLightGuide } from "@/components/tools/warning-light-guide";
import { SmokeDiagnosis } from "@/components/tools/smoke-diagnosis";
import { use } from "react";

const toolComponents: { [key: string]: React.ComponentType } = {
  "warning-light-guide": WarningLightGuide,
  "smoke-color-diagnosis": SmokeDiagnosis,
  "battery-health-check": BatteryHealthCheck,
  "tire-pressure-guide": TirePressureGuide,
  "fuel-cost-calculator": FuelCostCalculator,
  "engine-temp-monitor": EngineTempMonitor,
  "air-filter-checker": AirFilterChecker,
  "engine-noise-analyzer": EngineNoiseAnalyzer,
  "belt-condition-estimator": BeltConditionEstimator,
  "ac-performance-checker": AcPerformanceChecker,
};

export default function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);

  const tool = tools.find((t) => t.slug === slug);
  const ToolComponent = toolComponents[slug];

  if (!tool || !ToolComponent) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container py-8">
        <Button asChild variant="ghost" className="mb-8">
          <Link href="/tools">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to all tools
          </Link>
        </Button>
        <div className="flex justify-center">
            <Card className="w-full max-w-2xl">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-muted p-3 rounded-lg w-fit mb-4">
                        <tool.icon className="h-12 w-12 text-primary" />
                    </div>
                    <CardTitle className="font-headline text-3xl">{tool.name}</CardTitle>
                    <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <ToolComponent />
                </CardContent>
            </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
