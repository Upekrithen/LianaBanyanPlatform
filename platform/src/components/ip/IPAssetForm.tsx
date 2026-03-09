import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

const ipAssetSchema = z.object({
  asset_name: z.string().min(3, "Asset name must be at least 3 characters"),
  asset_description: z.string().min(10, "Please provide a detailed description"),
  asset_type: z.enum(["patent", "copyright", "trademark", "trade_secret", "design", "know_how"]),
  patent_number: z.string().optional(),
  filing_date: z.string().optional(),
  grant_date: z.string().optional(),
  expiration_date: z.string().optional(),
  jurisdiction: z.string().optional(),
  prohibited_categories: z.array(z.string()).max(5, "Maximum 5 prohibited categories").optional(),
});

type IPAssetFormData = z.infer<typeof ipAssetSchema>;

const AVAILABLE_CATEGORIES = [
  "Political Campaigns",
  "Adult Content",
  "Military/Defense Applications",
  "Religious Organizations",
  "Tobacco Products",
  "Fossil Fuel Industry",
  "Gambling/Gaming",
  "Alcohol Beverages",
  "Pharmaceutical Marketing",
  "Social Media Platforms",
];

interface IPAssetFormProps {
  selectedTier: "tier_a" | "tier_b" | "tier_c";
}

export function IPAssetForm({ selectedTier }: IPAssetFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  const equitySplits = {
    tier_a: { creator: 49, lb: 51 },
    tier_b: { creator: 60, lb: 40 },
    tier_c: { creator: 75, lb: 25 },
  };

  const form = useForm<IPAssetFormData>({
    resolver: zodResolver(ipAssetSchema),
    defaultValues: {
      asset_name: "",
      asset_description: "",
      asset_type: "patent",
      patent_number: "",
      filing_date: "",
      grant_date: "",
      expiration_date: "",
      jurisdiction: "",
      prohibited_categories: [],
    },
  });

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) => {
      if (prev.includes(category)) {
        return prev.filter((c) => c !== category);
      } else if (prev.length < 5) {
        return [...prev, category];
      }
      return prev;
    });
  };

  const onSubmit = async (data: IPAssetFormData) => {
    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to register IP assets",
          variant: "destructive",
        });
        return;
      }

      // Store IP registration in the ip_ledger (blockchain-style record)
      const recordData = {
        asset_name: data.asset_name,
        asset_description: data.asset_description,
        asset_type: data.asset_type,
        control_tier: selectedTier,
        equity_split_creator: equitySplits[selectedTier].creator,
        equity_split_lb: equitySplits[selectedTier].lb,
        patent_number: data.patent_number || null,
        filing_date: data.filing_date || null,
        grant_date: data.grant_date || null,
        expiration_date: data.expiration_date || null,
        jurisdiction: data.jurisdiction || null,
        prohibited_categories: selectedTier === "tier_b" ? selectedCategories : null,
      };

      // Get next sequence number
      const { data: lastRecord } = await supabase
        .from("ip_ledger")
        .select("sequence_number")
        .order("sequence_number", { ascending: false })
        .limit(1)
        .single();

      const nextSeq = (lastRecord?.sequence_number ?? 0) + 1;
      const recordHash = btoa(JSON.stringify({ ...recordData, seq: nextSeq, ts: Date.now() }));

      const { error } = await supabase
        .from("ip_ledger")
        .insert({
          user_id: user.id,
          record_type: "ip_asset_registration",
          record_data: recordData,
          record_hash: recordHash,
          sequence_number: nextSeq,
        });

      if (error) throw error;

      toast({
        title: "IP Asset Registered",
        description: `Your ${data.asset_type} has been successfully registered as ${selectedTier.toUpperCase()}`,
      });

      navigate("/portfolio");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
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
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Register IP Asset - {selectedTier.toUpperCase()}</CardTitle>
            <CardDescription>
              Participation Split: {equitySplits[selectedTier].creator}% Creator / {equitySplits[selectedTier].lb}% LB
            </CardDescription>
          </div>
          <Badge variant="secondary">{selectedTier.replace("_", " ").toUpperCase()}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Asset Type */}
            <FormField
              control={form.control}
              name="asset_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>IP Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select IP type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="patent">Patent</SelectItem>
                      <SelectItem value="copyright">Copyright</SelectItem>
                      <SelectItem value="trademark">Trademark</SelectItem>
                      <SelectItem value="trade_secret">Trade Secret</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="know_how">Know-How</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asset Name */}
            <FormField
              control={form.control}
              name="asset_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Asset Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Advanced Manufacturing Process for Composite Materials" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive name for this intellectual property
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Asset Description */}
            <FormField
              control={form.control}
              name="asset_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a detailed description of your IP, its applications, and unique value..."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Patent Details (if applicable) */}
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="patent_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Patent/Registration Number (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="US1234567890" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jurisdiction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jurisdiction (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., United States, EU, Worldwide" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Dates */}
            <div className="grid md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="filing_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filing Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="grant_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grant Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expiration_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiration Date (Optional)</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tier B: Prohibited Categories */}
            {selectedTier === "tier_b" && (
              <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                <div>
                  <h4 className="font-semibold mb-2">Prohibited Use Categories (Select up to 5)</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Choose categories where you do NOT want your IP to be used. LB will respect these restrictions.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {AVAILABLE_CATEGORIES.map((category) => (
                    <div key={category} className="flex items-center space-x-2">
                      <Checkbox
                        id={category}
                        checked={selectedCategories.includes(category)}
                        onCheckedChange={() => handleCategoryToggle(category)}
                        disabled={
                          !selectedCategories.includes(category) && selectedCategories.length >= 5
                        }
                      />
                      <label
                        htmlFor={category}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        {category}
                      </label>
                    </div>
                  ))}
                </div>

                {selectedCategories.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-sm font-medium">Selected:</span>
                    {selectedCategories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                {selectedCategories.length === 5 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Maximum of 5 prohibited categories reached
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Submit */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Register IP Asset
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
