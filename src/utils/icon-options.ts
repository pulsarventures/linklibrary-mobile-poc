export type IconOption = {
  category: string;
  color?: string;
  icon: string; // Icon name for IconByVariant
  label: string;
}

// Default color mapping for icons
const ICON_COLORS: Record<string, string> = {
  // Content & Media
  "Art": "#F59E0B", // amber
  "Books": "#3B82F6", // blue
  "Gaming": "#EAB308", // yellow
  "Images": "#F97316", // orange
  "Music": "#22C55E", // green
  "News/Blogs": "#6366F1", // indigo
  "Podcast": "#8B5CF6", // purple
  "Profiles": "#EC4899", // pink
  "Videos": "#EF4444", // red
  
  // Business & Finance
  "Analytics": "#06B6D4", // cyan
  "Banking": "#3B82F6", // blue
  "Business": "#14B8A6", // teal
  "Finance": "#22C55E", // green
  "Ideas": "#8B5CF6", // purple
  "Stocks": "#10B981", // emerald
  
  // Technology
  "AI/ML": "#8B5CF6", // purple
  "Chrome": "#06B6D4", // cyan
  "Cloud": "#3B82F6", // blue
  "Firefox": "#F97316", // orange
  "Mobile": "#EC4899", // pink
  "Safari": "#EC4899", // pink
  "Security": "#EF4444", // red
  "Tech": "#6366F1", // indigo
  
  // Education & Research
  "Education": "#3B82F6", // blue
  "Notes": "#EAB308", // yellow
  "Reading": "#3B82F6", // blue
  "Research": "#8B5CF6", // purple
  "Writing": "#6366F1", // indigo
  
  // Lifestyle & Other
  "Cars": "#EF4444", // red
  "Fitness": "#22C55E", // green
  "General": "#6B7280", // gray
  "Goals": "#3B82F6", // blue
  "Travel": "#06B6D4" // cyan
}

export const ICON_OPTIONS: IconOption[] = [
  // Content & Media
  { category: "Content & Media", color: ICON_COLORS.Books, icon: "collection", label: "Books" },
  { category: "Content & Media", color: ICON_COLORS["News/Blogs"], icon: "link", label: "News/Blogs" },
  { category: "Content & Media", color: ICON_COLORS.Podcast, icon: "link", label: "Podcast" },
  { category: "Content & Media", color: ICON_COLORS.Profiles, icon: "link", label: "Profiles" },
  { category: "Content & Media", color: ICON_COLORS.Videos, icon: "fire", label: "Videos" },
  { category: "Content & Media", color: ICON_COLORS.Images, icon: "link", label: "Images" },
  { category: "Content & Media", color: ICON_COLORS.Art, icon: "link", label: "Art" },
  { category: "Content & Media", color: ICON_COLORS.Gaming, icon: "link", label: "Gaming" },
  { category: "Content & Media", color: ICON_COLORS.Music, icon: "link", label: "Music" },
  
  // Business & Finance
  { category: "Business & Finance", color: ICON_COLORS.Business, icon: "link", label: "Business" },
  { category: "Business & Finance", color: ICON_COLORS.Analytics, icon: "link", label: "Analytics" },
  { category: "Business & Finance", color: ICON_COLORS.Stocks, icon: "fire", label: "Stocks" },
  { category: "Business & Finance", color: ICON_COLORS.Finance, icon: "link", label: "Finance" },
  { category: "Business & Finance", color: ICON_COLORS.Banking, icon: "link", label: "Banking" },
  { category: "Business & Finance", color: ICON_COLORS.Ideas, icon: "fire", label: "Ideas" },
  
  // Technology
  { category: "Technology", color: ICON_COLORS.Tech, icon: "link", label: "Tech" },
  { category: "Technology", color: ICON_COLORS["AI/ML"], icon: "fire", label: "AI/ML" },
  { category: "Technology", color: ICON_COLORS.Mobile, icon: "link", label: "Mobile" },
  { category: "Technology", color: ICON_COLORS.Security, icon: "link", label: "Security" },
  { category: "Technology", color: ICON_COLORS.Cloud, icon: "link", label: "Cloud" },
  { category: "Technology", color: ICON_COLORS.Chrome, icon: "link", label: "Chrome" },
  { category: "Technology", color: ICON_COLORS.Firefox, icon: "fire", label: "Firefox" },
  { category: "Technology", color: ICON_COLORS.Safari, icon: "link", label: "Safari" },
  
  // Education & Research
  { category: "Education & Research", color: ICON_COLORS.Education, icon: "collection", label: "Education" },
  { category: "Education & Research", color: ICON_COLORS.Research, icon: "fire", label: "Research" },
  { category: "Education & Research", color: ICON_COLORS.Notes, icon: "link", label: "Notes" },
  { category: "Education & Research", color: ICON_COLORS.Writing, icon: "link", label: "Writing" },
  { category: "Education & Research", color: ICON_COLORS.Reading, icon: "collection", label: "Reading" },
  
  // Lifestyle & Other
  { category: "Lifestyle & Other", color: ICON_COLORS.Travel, icon: "link", label: "Travel" },
  { category: "Lifestyle & Other", color: ICON_COLORS.Fitness, icon: "fire", label: "Fitness" },
  { category: "Lifestyle & Other", color: ICON_COLORS.Goals, icon: "link", label: "Goals" },
  { category: "Lifestyle & Other", color: ICON_COLORS.Cars, icon: "link", label: "Cars" },
  { category: "Lifestyle & Other", color: ICON_COLORS.General, icon: "collection", label: "General" }
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