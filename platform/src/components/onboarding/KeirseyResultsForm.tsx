import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const keirseySchema = z.object({
  temperament: z.enum(["guardian", "artisan", "idealist", "rational"], {
    required_error: "Please select your temperament type",
  }),
  variant: z.enum([
    "supervisor", "inspector", "provider", "protector",
    "promoter", "crafter", "performer", "composer",
    "teacher", "counselor", "champion", "healer",
    "fieldmarshal", "mastermind", "inventor", "architect"
  ], {
    required_error: "Please select your variant type",
  }),
  assessment_url: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
  notes: z.string().optional(),
});

type KeirseyFormData = z.infer<typeof keirseySchema>;

interface KeirseyResultsFormProps {
  onboardingId: string;
  onCancel: () => void;
  onSuccess: () => void;
}

export function KeirseyResultsForm({ onboardingId, onCancel, onSuccess }: KeirseyResultsFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<KeirseyFormData>({
    resolver: zodResolver(keirseySchema),
    defaultValues: {
      assessment_url: "",
      notes: "",
    },
  });

  const selectedTemperament = form.watch("temperament");

  const getVariantsByTemperament = (temperament: string) => {
    const variants = {
      guardian: ["supervisor", "inspector", "provider", "protector"],
      artisan: ["promoter", "crafter", "performer", "composer"],
      idealist: ["teacher", "counselor", "champion", "healer"],
      rational: ["fieldmarshal", "mastermind", "inventor", "architect"],
    };
    return variants[temperament as keyof typeof variants] || [];
  };

  const formatVariantName = (variant: string) => {
    return variant.split("").map((c, i) => i === 0 ? c.toUpperCase() : c).join("");
  };

  const onSubmit = async (data: KeirseyFormData) => {
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("agent_onboarding")
        .update({
          keirsey_temperament: data.temperament,
          keirsey_variant: data.variant,
          keirsey_assessment_url: data.assessment_url || null,
          keirsey_score_summary: data.notes ? { notes: data.notes } : null,
        })
        .eq("id", onboardingId);

      if (error) throw error;

      toast({
        title: "Assessment Results Submitted",
        description: "Your Keirsey temperament results have been recorded successfully",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Submission Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Keirsey Results</CardTitle>
        <CardDescription>
          Enter your temperament type and variant from the assessment
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Temperament */}
            <FormField
              control={form.control}
              name="temperament"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Temperament Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your temperament" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="guardian">Guardian (SJ) - Responsible & Traditional</SelectItem>
                      <SelectItem value="artisan">Artisan (SP) - Practical & Adaptable</SelectItem>
                      <SelectItem value="idealist">Idealist (NF) - Empathetic & Authentic</SelectItem>
                      <SelectItem value="rational">Rational (NT) - Logical & Strategic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the temperament that matches your assessment results
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Variant */}
            <FormField
              control={form.control}
              name="variant"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={!selectedTemperament}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your variant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {selectedTemperament && getVariantsByTemperament(selectedTemperament).map((variant) => (
                        <SelectItem key={variant} value={variant}>
                          {formatVariantName(variant)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Select your specific variant within the {selectedTemperament || "selected"} temperament
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assessment URL (Optional) */}
            <FormField
              control={form.control}
              name="assessment_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assessment Results URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://keirsey.com/results/..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    If you have a shareable link to your full results, paste it here
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Notes (Optional) */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional insights or score details from your assessment..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Share any specific scores or insights you found meaningful
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Results
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
