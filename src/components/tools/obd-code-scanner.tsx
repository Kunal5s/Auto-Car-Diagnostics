
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle } from "lucide-react";
import { lookupObdCode } from "@/ai/flows/obd-code-lookup";
import type { ObdCodeOutput } from "@/ai/flows/obd-code-lookup";

const formSchema = z.object({
  code: z.string().min(4, { message: "Code must be 4-5 characters."}).max(5, { message: "Code must be 4-5 characters."}).regex(/^[A-Z0-9]+$/i, { message: "Invalid characters in code." }),
});

export function ObdCodeScanner() {
  const [result, setResult] = useState<ObdCodeOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { code: "" },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await lookupObdCode({ code: values.code.toUpperCase() });
      setResult(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex gap-2">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel className="sr-only">OBD Code</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter OBD Code (e.g. P0300)"
                    {...field}
                    className="text-base uppercase"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading} className="min-w-[100px]">
            {isLoading ? <Loader2 className="animate-spin" /> : "Lookup"}
          </Button>
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
        <Card className="bg-muted">
          <CardContent className="p-4">
            <p className="font-semibold text-center">{result.definition}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
