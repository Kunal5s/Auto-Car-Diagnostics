
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { decodeVin, type VinOutput } from "@/ai/flows/vin-decoder";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  vin: z.string().length(17, { message: "VIN must be exactly 17 characters long." }).regex(/^[A-HJ-NPR-Z0-9]{17}$/, { message: "Invalid characters in VIN." }),
});

export function VinDecoder() {
  const [result, setResult] = useState<VinOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { vin: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const decodedData = await decodeVin({ vin: values.vin.toUpperCase() });
      setResult(decodedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      toast({
        variant: "destructive",
        title: "Error Decoding VIN",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
    value ? <div className="flex justify-between items-center py-2 border-b border-dashed"><dt className="text-muted-foreground">{label}</dt><dd className="font-semibold text-right text-sm">{value}</dd></div> : null
  );

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="vin"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="sr-only">VIN</FormLabel>
                <FormControl>
                    <div className="flex gap-2">
                        <Input placeholder="Enter your 17-character VIN" {...field} className="text-base uppercase" />
                        <Button type="submit" disabled={isLoading} className="min-w-[120px]">
                            {isLoading ? <Loader2 className="animate-spin" /> : "Decode VIN"}
                        </Button>
                    </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      {error && (
        <Card className="border-destructive">
            <CardContent className="p-4 text-center text-destructive font-semibold flex items-center justify-center gap-2">
                <AlertTriangle /> {error}
            </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-1">
                <DetailItem label="Year" value={result.vehicleInfo.year} />
                <DetailItem label="Make" value={result.vehicleInfo.make} />
                <DetailItem label="Model" value={result.vehicleInfo.model} />
                <DetailItem label="Body Style" value={result.vehicleInfo.body} />
                <DetailItem label="Engine" value={result.vehicleInfo.engine} />
                <DetailItem label="Transmission" value={result.vehicleInfo.transmission} />
                <DetailItem label="Drivetrain" value={result.vehicleInfo.drivetrain} />
                <DetailItem label="Fuel Type" value={result.vehicleInfo.fuel_type} />
                <DetailItem label="Exterior Color" value={result.vehicleInfo.ext_color} />
                <DetailItem label="Interior Color" value={result.vehicleInfo.int_color} />
                <DetailItem label="MPG City" value={result.vehicleInfo.mileage_city} />
                <DetailItem label="MPG Highway" value={result.vehicleInfo.mileage_highway} />
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Safety Recalls</CardTitle>
              <CardDescription>
                {result.recalls.length} recall(s) found for this vehicle.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {result.recalls.length === 0 ? (
                <div className="text-center text-muted-foreground bg-muted p-6 rounded-lg flex items-center justify-center gap-2">
                  <CheckCircle2 className="text-green-500" />
                  No open recalls found for this vehicle.
                </div>
              ) : (
                <div className="space-y-4">
                  {result.recalls.map((recall) => (
                    <div key={recall.nhtsa_id} className="p-4 border rounded-lg">
                      <h3 className="font-bold text-lg">{recall.component}</h3>
                      <p className="text-sm text-muted-foreground">Campaign #: {recall.nhtsa_id} | Date: {recall.report_date}</p>
                      <p className="mt-2 text-sm"><strong className="font-semibold">Description:</strong> {recall.description}</p>
                      <p className="mt-2 text-sm"><strong className="font-semibold">Consequence:</strong> {recall.consequence}</p>
                      {recall.remedy && <p className="mt-2 text-sm"><strong className="font-semibold">Remedy:</strong> {recall.remedy}</p>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
