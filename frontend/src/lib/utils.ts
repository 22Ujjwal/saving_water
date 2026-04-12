import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildingLabel(b: {
  address?: string | null;
  building_type?: string;
  city?: string;
  metro?: string;
  state?: string;
}): string {
  if (b.address && b.address.trim()) return b.address;
  const type  = (b.building_type ?? "Building").replace(/_/g, " ");
  const place = b.city || b.metro || "";
  return place ? `${type} · ${place}, ${b.state ?? ""}` : `${type} · ${b.state ?? ""}`;
}
