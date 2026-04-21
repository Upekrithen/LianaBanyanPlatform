import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

interface CreateIslandListingProps {
  islandId: string;
  onSuccess?: () => void;
}

interface ListingFormData {
  business_name: string;
  business_description: string;
  listing_type: "rental" | "purchase" | "lease";
  business_category: string;
  price_credits: number;
  rental_period_days?: number;
  listing_url?: string;
  contact_email?: string;
  contact_phone?: string;
}

export const CreateIslandListing = ({ islandId, onSuccess }: CreateIslandListingProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<ListingFormData>();

  const listingType = watch("listing_type");

  const onSubmit = async (data: ListingFormData) => {
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error("You must be logged in to create a listing");
      }

      const { error } = await supabase
        .from("island_marketplace_listings")
        .insert({
          island_id: islandId,
          owner_id: user.id,
          business_name: data.business_name,
          business_description: data.business_description,
          listing_type: data.listing_type,
          business_category: data.business_category,
          price_credits: data.price_credits,
          rental_period_days: data.rental_period_days,
          listing_url: data.listing_url,
          contact_info: {
            email: data.contact_email,
            phone: data.contact_phone,
          },
          status: "active",
          listed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Listing Created!",
        description: "Your business listing is now live on the island.",
      });

      reset();
      setIsOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error creating listing:", error);
      toast({
        title: "Failed to Create Listing",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" size="lg">
          <Plus className="w-4 h-4 mr-2" />
          Post Your Business Listing
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Island Business Listing</DialogTitle>
          <CardDescription>
            Rent or purchase virtual real estate on this island to promote your business
          </CardDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Business Name */}
          <div className="space-y-2">
            <Label htmlFor="business_name">Business Name *</Label>
            <Input
              id="business_name"
              {...register("business_name", { required: "Business name is required" })}
              placeholder="Your Business Name"
            />
            {errors.business_name && (
              <p className="text-sm text-destructive">{errors.business_name.message}</p>
            )}
          </div>

          {/* Business Description */}
          <div className="space-y-2">
            <Label htmlFor="business_description">Description</Label>
            <Textarea
              id="business_description"
              {...register("business_description")}
              placeholder="Describe your business or service..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="business_category">Category *</Label>
            <Select onValueChange={(value) => setValue("business_category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="aquatic_beach">🏖️ Aquatic & Beach Services</SelectItem>
                <SelectItem value="family_services">👶 Family Services</SelectItem>
                <SelectItem value="influencer_creator">⭐ Influencer & Creator</SelectItem>
                <SelectItem value="general_business">🏪 General Business</SelectItem>
                <SelectItem value="other">💼 Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Listing Type */}
          <div className="space-y-2">
            <Label htmlFor="listing_type">Listing Type *</Label>
            <Select onValueChange={(value) => setValue("listing_type", value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rental">Rental (Monthly)</SelectItem>
                <SelectItem value="lease">Lease (Long-term)</SelectItem>
                <SelectItem value="purchase">Purchase (Permanent)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Price */}
          <div className="space-y-2">
            <Label htmlFor="price_credits">
              Price (Credits) * {listingType === "rental" ? "per month" : ""}
            </Label>
            <Input
              id="price_credits"
              type="number"
              {...register("price_credits", {
                required: "Price is required",
                min: { value: 1, message: "Price must be at least 1 credit" }
              })}
              placeholder="100"
            />
            {errors.price_credits && (
              <p className="text-sm text-destructive">{errors.price_credits.message}</p>
            )}
          </div>

          {/* Rental Period (if rental) */}
          {listingType === "rental" && (
            <div className="space-y-2">
              <Label htmlFor="rental_period_days">Rental Period (Days)</Label>
              <Input
                id="rental_period_days"
                type="number"
                {...register("rental_period_days")}
                placeholder="30"
                defaultValue={30}
              />
            </div>
          )}

          {/* Listing URL */}
          <div className="space-y-2">
            <Label htmlFor="listing_url">Business Website URL</Label>
            <Input
              id="listing_url"
              type="url"
              {...register("listing_url")}
              placeholder="https://yourbusiness.com"
            />
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_email">Contact Email</Label>
              <Input
                id="contact_email"
                type="email"
                {...register("contact_email")}
                placeholder="contact@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Contact Phone</Label>
              <Input
                id="contact_phone"
                type="tel"
                {...register("contact_phone")}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Creating Listing..." : "Create Listing"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
