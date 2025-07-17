"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Send } from "lucide-react";

const formSchema = z.object({
  question: z.string().min(10, {
    message: "Your question must be at least 10 characters.",
  }).max(500, {
    message: "Your question must not exceed 500 characters."
  }),
});

export function QuestionSubmission() {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log("Question submitted:", values);
    toast({
      title: "Question Submitted!",
      description: "Thanks for your submission. We'll answer it in a future article.",
    });
    form.reset();
  }

  return (
    <section className="py-12">
        <Card className="max-w-3xl mx-auto bg-card/50 border-2 border-dashed border-primary">
            <CardHeader className="text-center">
                <CardTitle className="font-headline text-3xl">Have a Question?</CardTitle>
                <CardDescription>
                Can't find an answer? Submit your question below, and our experts might cover it in a future article.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                    control={form.control}
                    name="question"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel className="sr-only">Your Question</FormLabel>
                        <FormControl>
                            <Textarea
                            placeholder="e.g., How do I know when to replace my brake pads?"
                            className="resize-none h-32"
                            {...field}
                            />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />
                    <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                        <Send className="mr-2 h-4 w-4" />
                        Submit Question
                    </Button>
                </form>
                </Form>
            </CardContent>
        </Card>
    </section>
  );
}
