// Delivery zones around the kitchen at 1636 Greenwood Ave, Torrance, CA. Fees in cents.
export const PICKUP_ADDRESS = "1636 Greenwood Ave, Torrance, CA";

export const ZONES = [
  { name: "Torrance", feeCents: 300, zips: ["90501", "90502", "90503", "90504", "90505"] },
  { name: "Nearby", feeCents: 600, zips: ["90277", "90278", "90254", "90260", "90247", "90248", "90249", "90717", "90745", "90746", "90274", "90275"] },
  { name: "Extended", feeCents: 900, zips: ["90266", "90250", "90710", "90731", "90732", "90744", "90810"] },
];

export const zoneFor = (zip: string) => ZONES.find((z) => z.zips.includes(zip.trim()));
