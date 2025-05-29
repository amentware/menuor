export type PriceVariation = {
  name: string;  // e.g., "Quarter", "Half", "Full"
  price: number;
};

export type SectionVariation = {
  name: string;  // e.g., "Quarter", "Half", "Full"
};

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  isDisabled?: boolean;
  outOfStock?: boolean;
  priceVariations?: PriceVariation[];
};

export type PriceVariationCategory = {
  id: string;
  name: string;
};

export type MenuSection = {
  id: string;
  name: string;
  items: MenuItem[];
  isDisabled?: boolean;
  variations?: SectionVariation[]; // Section level variations (name only)
  priceVariationCategories?: PriceVariationCategory[];
};

export type DailyScan = {
  date: string;  // Format: YYYY-MM-DD
  count: number;
};

export type Restaurant = {
  id: string;
  ownerId: string;
  name: string;
  location: string;
  contact: string;
  description: string;
  email: string;
  isPublic: boolean;
  isBlocked: boolean;
  createdAt: any; // Timestamp
  menuSections: MenuSection[];
  currencySymbol?: string;
  qrScans?: number;
  viewCount?: number;
  dailyViews?: { [date: string]: number };
  dailyScans?: DailyScan[];  // Last 7 days of QR scan data
  lastScanDate?: any;  // Timestamp
  lastScanDay?: string;  // YYYY-MM-DD format
};

export type RestaurantSummary = {
  id: string;
  name: string;
  location: string;
  isPublic: boolean;
  isBlocked: boolean;
};
