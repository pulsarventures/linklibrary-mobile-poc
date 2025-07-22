/* eslint-disable unicorn/prefer-module */
export type AssetType = 'icons' | 'images';

const getAssetsContext = (type: AssetType) => {
  try {
    return type === 'images'
      ? require.context('./images', true, /\.(png|jpg|jpeg|gif|webp)$/)
      : require.context('./icons', true, /\.svg$/);
  } catch (error) {
    // Ensure we have a proper Error object
    const error_ = error instanceof Error ? error : new Error(`Failed to load ${type} context`);
    console.error(`Error loading ${type} context:`, error_.message);
    // Return a dummy context function that safely returns undefined
    return (request: string) => {
      console.warn(`Attempted to load ${request} but asset context is unavailable`);
      return undefined;
    };
  }
};

export default getAssetsContext;
