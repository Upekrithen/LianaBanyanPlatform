/**
 * GIFT LIST MANAGER
 * =================
 * Create and manage gift wishlists. Owners see their items
 * but NOT who has claimed them (that's the secret!).
 */

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Gift, Plus, Calendar, Link, ExternalLink, 
  DollarSign, Star, Trash2, Edit2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

interface GiftListItem {
  id: string;
  name: string;
  description: string | null;
  url: string | null;
  price_estimate: number | null;
  priority: number;
  is_claimed?: boolean; // For owner view - doesn't show WHO claimed
  is_purchased?: boolean;
}

interface GiftList {
  id: string;
  title: string;
  description: string | null;
  occasion: string;
  occasion_date: string | null;
  items?: GiftListItem[];
}

interface GiftListManagerProps {
  familyId: string;
  isOwner?: boolean;
  list?: GiftList;
  onClose?: () => void;
}

const OCCASION_OPTIONS = [
  { value: 'birthday', label: '🎂 Birthday' },
  { value: 'holiday', label: '🎄 Holiday' },
  { value: 'anniversary', label: '💍 Anniversary' },
  { value: 'general', label: '📋 General Wishlist' },
  { value: 'other', label: '✨ Other' },
];

const PRIORITY_OPTIONS = [
  { value: 1, label: '⭐⭐⭐ High Priority' },
  { value: 2, label: '⭐⭐ Medium' },
  { value: 3, label: '⭐ Low Priority' },
];

export function GiftListManager({
  familyId,
  isOwner = true,
  list,
  onClose,
}: GiftListManagerProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  // List form state
  const [title, setTitle] = useState(list?.title || "");
  const [description, setDescription] = useState(list?.description || "");
  const [occasion, setOccasion] = useState(list?.occasion || "general");
  const [occasionDate, setOccasionDate] = useState(list?.occasion_date || "");

  // Item form state
  const [showAddItem, setShowAddItem] = useState(false);
  const [itemName, setItemName] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [itemUrl, setItemUrl] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemPriority, setItemPriority] = useState(2);

  const createList = useMutation({
    mutationFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/gift-list-create`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            familyId,
            title,
            description: description || undefined,
            occasion,
            occasionDate: occasionDate || undefined,
          }),
        }
      );

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create list');
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['family-gift-lists', familyId] });
      toast.success(data.message);
      if (onClose) onClose();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Please enter a title for your wishlist");
      return;
    }
    createList.mutate();
  };

  const handleAddItem = () => {
    // This would call an API to add item to list
    toast.info("Item adding will be implemented with the full gift list page");
    setShowAddItem(false);
    resetItemForm();
  };

  const resetItemForm = () => {
    setItemName("");
    setItemDescription("");
    setItemUrl("");
    setItemPrice("");
    setItemPriority(2);
  };

  return (
    <div className="space-y-6">
      {/* List Details Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div className="space-y-2">
          <Label htmlFor="title">
            Wishlist Title <span className="text-red-400">*</span>
          </Label>
          <Input
            id="title"
            placeholder="e.g., My Birthday 2026 Wishlist"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (optional)</Label>
          <Textarea
            id="description"
            placeholder="Any notes for family members..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
          />
        </div>

        {/* Occasion */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Occasion</Label>
            <Select value={occasion} onValueChange={setOccasion}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {OCCASION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="occasionDate">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date (optional)
            </Label>
            <Input
              id="occasionDate"
              type="date"
              value={occasionDate}
              onChange={(e) => setOccasionDate(e.target.value)}
            />
          </div>
        </div>

        {/* Submit */}
        <DialogFooter className="pt-4">
          {onClose && (
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={createList.isPending}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {createList.isPending ? 'Creating...' : 'Create Wishlist'}
          </Button>
        </DialogFooter>
      </form>

      {/* Items Section (for existing lists) */}
      {list && (
        <div className="space-y-4 pt-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Items</h3>
            <Button size="sm" onClick={() => setShowAddItem(true)}>
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>

          {list.items && list.items.length > 0 ? (
            <div className="space-y-2">
              {list.items.map((item) => (
                <div
                  key={item.id}
                  className={`
                    p-3 rounded-lg border transition-all
                    ${item.is_claimed 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/10'
                    }
                  `}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.name}</span>
                        {item.is_claimed && (
                          <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                            Claimed
                          </Badge>
                        )}
                        {item.is_purchased && (
                          <Badge variant="outline" className="text-xs bg-blue-500/10 text-blue-400 border-blue-500/30">
                            Purchased
                          </Badge>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                        {item.price_estimate && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {item.price_estimate}
                          </span>
                        )}
                        {item.url && (
                          <a 
                            href={item.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:text-purple-400"
                          >
                            <ExternalLink className="h-3 w-3" />
                            View
                          </a>
                        )}
                        <span className="flex items-center gap-1">
                          {Array.from({ length: 4 - item.priority }).map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                          ))}
                        </span>
                      </div>
                    </div>
                    {isOwner && (
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="Edit gift item">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-400" aria-label="Delete gift item">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Gift className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p>No items yet. Add some wishes!</p>
            </div>
          )}
        </div>
      )}

      {/* Add Item Dialog */}
      <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Item to Wishlist</DialogTitle>
            <DialogDescription>
              Add something you'd like to receive
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                placeholder="What do you want?"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Size, color, specific details..."
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  <Link className="h-4 w-4 inline mr-1" />
                  Product URL
                </Label>
                <Input
                  placeholder="https://..."
                  value={itemUrl}
                  onChange={(e) => setItemUrl(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Estimated Price
                </Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={itemPrice}
                  onChange={(e) => setItemPrice(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select 
                value={String(itemPriority)} 
                onValueChange={(v) => setItemPriority(Number(v))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PRIORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={String(opt.value)}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddItem(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
