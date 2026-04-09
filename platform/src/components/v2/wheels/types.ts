export type WheelsMode = "local-wheels" | "lemon-lot" | "rideshare-routes";

export type LocalRideRequestDraft = {
  originCity: string;
  destinationCity: string;
  seatsNeeded: number;
  departureTime: string;
};

export type FleetDriver = {
  id: string;
  label: string;
  area: string;
  adaptLabel: string;
  completionPct: number;
};

export type RecentRideItem = {
  id: string;
  origin: string;
  destination: string;
  status: string;
  createdAt: string;
};

export type LemonListing = {
  id: string;
  year: number;
  make: string;
  model: string;
  color?: string | null;
  dailyRate: number;
  location: string;
  ownerId?: string | null;
  features: string[];
  description?: string | null;
  totalRentals?: number;
};

export type RouteOption = {
  id: string;
  originCity: string;
  destinationCity: string;
  departureTime?: string | null;
  seatsAvailable: number;
  costPerRide?: number | null;
  daysAvailable: string[];
  driverId?: string | null;
};
