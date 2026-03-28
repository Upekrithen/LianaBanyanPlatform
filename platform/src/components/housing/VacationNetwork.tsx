/**
 * VacationNetwork — browse cooperative vacation listings + booking flow.
 * Member Vacation Network at Cost+20% with priority tiers.
 */

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Wifi, UtensilsCrossed, Flame, Waves, Car,
  MapPin, Users, Calendar, CreditCard, Check, X, Info,
} from 'lucide-react';

interface VacationListing {
  id: string;
  property_id: string;
  available_from: string;
  available_to: string;
  nightly_rate: number;
  currency: string;
  max_guests: number;
  amenities: string[] | null;
  house_rules: string | null;
  priority_tier: string;
  property?: { title: string; city: string; state: string | null; image_url: string | null; property_type: string };
}

const AMENITY_ICONS: Record<string, typeof Wifi> = {
  wifi: Wifi, kitchen: UtensilsCrossed, fireplace: Flame,
  lake_access: Waves, parking: Car,
};

const TIER_STYLES: Record<string, { label: string; color: string }> = {
  property_contributor: { label: 'Priority', color: 'bg-amber-900/50 text-amber-300 border-amber-500/30' },
  any_contributor: { label: 'Contributor Access', color: 'bg-slate-700/50 text-slate-200 border-slate-500/30' },
  member: { label: 'Member', color: 'bg-green-900/50 text-green-300 border-green-500/30' },
  public: { label: 'Open', color: 'bg-slate-800 text-slate-400 border-slate-600' },
};

export default function VacationNetwork() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [booking, setBooking] = useState<VacationListing | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(1);
  const [saving, setSaving] = useState(false);

  const { data: listings = [] } = useQuery({
    queryKey: ['vacation-listings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('vacation_listings')
        .select('*, property:property_id (title, city, state, image_url, property_type)')
        .gte('available_to', new Date().toISOString().split('T')[0])
        .order('nightly_rate');
      return (data || []).map((l: any) => ({
        ...l,
        property: Array.isArray(l.property) ? l.property[0] : l.property,
      })) as VacationListing[];
    },
  });

  const nights = checkIn && checkOut
    ? Math.max(0, Math.ceil((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
    : 0;
  const totalCost = booking ? nights * booking.nightly_rate : 0;

  const handleBook = async () => {
    if (!user) { toast.error('Sign in to book'); return; }
    if (!booking || nights <= 0) return;
    setSaving(true);
    try {
      // Check for conflicts
      const { data: conflicts } = await supabase
        .from('vacation_bookings')
        .select('id')
        .eq('listing_id', booking.id)
        .eq('status', 'confirmed')
        .or(`check_in.lte.${checkOut},check_out.gte.${checkIn}`);
      if (conflicts && conflicts.length > 0) {
        toast.error('These dates overlap with an existing booking');
        setSaving(false);
        return;
      }
      const { error } = await supabase.from('vacation_bookings').insert({
        listing_id: booking.id,
        guest_id: user.id,
        check_in: checkIn,
        check_out: checkOut,
        total_cost: totalCost,
        currency: booking.currency,
        guests,
        status: 'pending',
      });
      if (error) throw error;
      toast.success('Booking submitted! You\'ll receive confirmation shortly.');
      setBooking(null);
      setCheckIn('');
      setCheckOut('');
      setGuests(1);
      queryClient.invalidateQueries({ queryKey: ['vacation-listings'] });
    } catch (err: any) {
      toast.error(err.message || 'Booking failed');
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Explainer */}
      <Card className="border-amber-500/20 bg-gradient-to-r from-amber-900/10 to-transparent">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-sm">Member Vacation Network</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Stay at cooperative properties for Cost+20%. Priority: Fund contributors for THIS property → any Fund contributor → any member → public (AirBnB fills gaps at market rate).
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Listing grid */}
      {listings.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">No vacation listings available yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {listings.map(listing => {
            const prop = listing.property;
            const tier = TIER_STYLES[listing.priority_tier] || TIER_STYLES.member;
            return (
              <Card key={listing.id} className="overflow-hidden bg-card border-border hover:border-primary/30 transition-colors">
                <div className={`h-28 ${prop?.image_url ? '' : 'bg-gradient-to-br from-amber-500 to-orange-600'}`}>
                  {prop?.image_url ? (
                    <img src={prop.image_url} alt={prop.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30 text-4xl">🏔️</div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <div>
                    <h3 className="font-semibold">{prop?.title || 'Vacation Property'}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="w-3 h-3" />
                      {prop?.city}{prop?.state ? `, ${prop.state}` : ''}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-lg font-bold text-foreground">{listing.nightly_rate}</span>
                      <span className="text-xs text-muted-foreground ml-1">{listing.currency}/night</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">Cost+20%</Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground">Market rate: ~$150-200/night</p>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5" />
                    <span>Max {listing.max_guests} guests</span>
                  </div>

                  {/* Amenities */}
                  {listing.amenities && listing.amenities.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {listing.amenities.map(a => {
                        const Icon = AMENITY_ICONS[a];
                        return (
                          <Badge key={a} variant="outline" className="text-[10px] gap-1 text-muted-foreground border-border">
                            {Icon && <Icon className="w-3 h-3" />} {a.replace('_', ' ')}
                          </Badge>
                        );
                      })}
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{listing.available_from} — {listing.available_to}</span>
                  </div>

                  <Badge variant="outline" className={`text-[10px] ${tier.color}`}>{tier.label}</Badge>

                  <Button size="sm" className="w-full" onClick={() => setBooking(listing)}>
                    Book This Property
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Booking modal (inline) */}
      {booking && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setBooking(null)}>
          <Card className="w-full max-w-md bg-card" onClick={e => e.stopPropagation()}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Book: {booking.property?.title}</CardTitle>
                <button onClick={() => setBooking(null)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Check-in</Label>
                  <Input
                    type="date"
                    value={checkIn}
                    onChange={e => setCheckIn(e.target.value)}
                    min={booking.available_from}
                    max={booking.available_to}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Check-out</Label>
                  <Input
                    type="date"
                    value={checkOut}
                    onChange={e => setCheckOut(e.target.value)}
                    min={checkIn || booking.available_from}
                    max={booking.available_to}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Guests</Label>
                <Input
                  type="number"
                  min={1}
                  max={booking.max_guests}
                  value={guests}
                  onChange={e => setGuests(parseInt(e.target.value) || 1)}
                  className="mt-1 w-24"
                />
              </div>

              {nights > 0 && (
                <Card className="bg-muted/30">
                  <CardContent className="p-3 space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">{nights} night{nights !== 1 ? 's' : ''} × {booking.nightly_rate} {booking.currency}</span>
                      <span className="font-medium">{totalCost} {booking.currency}</span>
                    </div>
                  </CardContent>
                </Card>
              )}

              {booking.house_rules && (
                <div className="p-3 rounded-lg bg-muted/30 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground mb-1">House Rules</p>
                  {booking.house_rules}
                </div>
              )}

              <Button
                className="w-full"
                disabled={nights <= 0 || saving || !user}
                onClick={handleBook}
              >
                {saving ? 'Booking...' : `Confirm Booking — ${totalCost} ${booking.currency}`}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
