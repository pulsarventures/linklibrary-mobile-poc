export interface IconOption {
  icon: string; // Icon name for IconByVariant
  label: string;
  category: string;
  color?: string;
}

// Default color mapping for icons
const ICON_COLORS: Record<string, string> = {
  // Content & Media
  "Books": "#3B82F6", // blue
  "News/Blogs": "#6366F1", // indigo
  "Podcast": "#8B5CF6", // purple
  "Profiles": "#EC4899", // pink
  "Videos": "#EF4444", // red
  "Images": "#F97316", // orange
  "Art": "#F59E0B", // amber
  "Gaming": "#EAB308", // yellow
  "Music": "#22C55E", // green
  
  // Business & Finance
  "Business": "#14B8A6", // teal
  "Analytics": "#06B6D4", // cyan
  "Stocks": "#10B981", // emerald
  "Finance": "#22C55E", // green
  "Banking": "#3B82F6", // blue
  "Ideas": "#8B5CF6", // purple
  
  // Technology
  "Tech": "#6366F1", // indigo
  "AI/ML": "#8B5CF6", // purple
  "Mobile": "#EC4899", // pink
  "Security": "#EF4444", // red
  "Cloud": "#3B82F6", // blue
  "Chrome": "#06B6D4", // cyan
  "Firefox": "#F97316", // orange
  "Safari": "#EC4899", // pink
  
  // Education & Research
  "Education": "#3B82F6", // blue
  "Research": "#8B5CF6", // purple
  "Notes": "#EAB308", // yellow
  "Writing": "#6366F1", // indigo
  "Reading": "#3B82F6", // blue
  
  // Lifestyle & Other
  "Travel": "#06B6D4", // cyan
  "Fitness": "#22C55E", // green
  "Goals": "#3B82F6", // blue
  "Cars": "#EF4444", // red
  "General": "#6B7280" // gray
}

export const ICON_OPTIONS: IconOption[] = [
  // Content & Media
  { icon: "collection", label: "Books", category: "Content & Media", color: ICON_COLORS["Books"] },
  { icon: "link", label: "News/Blogs", category: "Content & Media", color: ICON_COLORS["News/Blogs"] },
  { icon: "link", label: "Podcast", category: "Content & Media", color: ICON_COLORS["Podcast"] },
  { icon: "link", label: "Profiles", category: "Content & Media", color: ICON_COLORS["Profiles"] },
  { icon: "fire", label: "Videos", category: "Content & Media", color: ICON_COLORS["Videos"] },
  { icon: "link", label: "Images", category: "Content & Media", color: ICON_COLORS["Images"] },
  { icon: "link", label: "Art", category: "Content & Media", color: ICON_COLORS["Art"] },
  { icon: "link", label: "Gaming", category: "Content & Media", color: ICON_COLORS["Gaming"] },
  { icon: "link", label: "Music", category: "Content & Media", color: ICON_COLORS["Music"] },
  
  // Business & Finance
  { icon: "link", label: "Business", category: "Business & Finance", color: ICON_COLORS["Business"] },
  { icon: "link", label: "Analytics", category: "Business & Finance", color: ICON_COLORS["Analytics"] },
  { icon: "fire", label: "Stocks", category: "Business & Finance", color: ICON_COLORS["Stocks"] },
  { icon: "link", label: "Finance", category: "Business & Finance", color: ICON_COLORS["Finance"] },
  { icon: "link", label: "Banking", category: "Business & Finance", color: ICON_COLORS["Banking"] },
  { icon: "fire", label: "Ideas", category: "Business & Finance", color: ICON_COLORS["Ideas"] },
  
  // Technology
  { icon: "link", label: "Tech", category: "Technology", color: ICON_COLORS["Tech"] },
  { icon: "fire", label: "AI/ML", category: "Technology", color: ICON_COLORS["AI/ML"] },
  { icon: "link", label: "Mobile", category: "Technology", color: ICON_COLORS["Mobile"] },
  { icon: "link", label: "Security", category: "Technology", color: ICON_COLORS["Security"] },
  { icon: "link", label: "Cloud", category: "Technology", color: ICON_COLORS["Cloud"] },
  { icon: "link", label: "Chrome", category: "Technology", color: ICON_COLORS["Chrome"] },
  { icon: "fire", label: "Firefox", category: "Technology", color: ICON_COLORS["Firefox"] },
  { icon: "link", label: "Safari", category: "Technology", color: ICON_COLORS["Safari"] },
  
  // Education & Research
  { icon: "collection", label: "Education", category: "Education & Research", color: ICON_COLORS["Education"] },
  { icon: "fire", label: "Research", category: "Education & Research", color: ICON_COLORS["Research"] },
  { icon: "link", label: "Notes", category: "Education & Research", color: ICON_COLORS["Notes"] },
  { icon: "link", label: "Writing", category: "Education & Research", color: ICON_COLORS["Writing"] },
  { icon: "collection", label: "Reading", category: "Education & Research", color: ICON_COLORS["Reading"] },
  
  // Lifestyle & Other
  { icon: "link", label: "Travel", category: "Lifestyle & Other", color: ICON_COLORS["Travel"] },
  { icon: "fire", label: "Fitness", category: "Lifestyle & Other", color: ICON_COLORS["Fitness"] },
  { icon: "link", label: "Goals", category: "Lifestyle & Other", color: ICON_COLORS["Goals"] },
  { icon: "link", label: "Cars", category: "Lifestyle & Other", color: ICON_COLORS["Cars"] },
  { icon: "collection", label: "General", category: "Lifestyle & Other", color: ICON_COLORS["General"] }
] as const;

// Type for icon labels
export type IconOptionLabel = typeof ICON_OPTIONS[number]['label'];

// Helper function to get icon by label
export const getIconByLabel = (label: IconOptionLabel): string => {
  const option = ICON_OPTIONS.find(opt => opt.label === label);
  return option?.icon || "collection";
};

// Helper function to get default color by icon label
export const getDefaultColorByLabel = (label: IconOptionLabel): string => {
  const option = ICON_OPTIONS.find(opt => opt.label === label);
  return option?.color || "#6B7280"; // gray
};

// Helper function to get all categories
export const getCategories = (): string[] => {
  const categories = ICON_OPTIONS.map(option => option.category);
  return [...new Set(categories)];
};

// Helper function to get icons by category
export const getIconsByCategory = (category: string): IconOption[] => {
  return ICON_OPTIONS.filter(option => option.category === category);
};

// Helper function to get all icon options
export const getAllIconOptions = (): IconOption[] => {
  return ICON_OPTIONS;
}; 