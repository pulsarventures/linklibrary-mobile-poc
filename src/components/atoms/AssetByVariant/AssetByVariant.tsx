import type { ImageProps, ImageSourcePropType } from 'react-native';

import { useMemo } from 'react';
import { Image } from 'react-native';
import { z } from 'zod';

import { useTheme } from '@/theme';
import getAssetsContext from '@/theme/assets/getAssetsContext';

type Properties = {
  readonly extension?: string;
  readonly path: string;
} & Omit<ImageProps, 'source'>;

const images = getAssetsContext('images');

function AssetByVariant({ extension = 'png', path, ...props }: Properties) {
  const { variant } = useTheme();

  const image = useMemo(() => {
    const getDefaultSource = () => {
      try {
        return z.custom<ImageSourcePropType>().parse(images(`./${path}.${extension}`));
      } catch (error) {
        const error_ = error instanceof Error ? error : new Error('Failed to load default image');
        console.error(`Couldn't load default image: ${path}.${extension}`, error_.message);
        return undefined;
      }
    };

    try {
      if (variant === 'default') {
        return getDefaultSource();
      }

      try {
        return z
          .custom<ImageSourcePropType>()
          .parse(images(`./${variant}/${path}.${extension}`));
      } catch (error) {
        const error_ = error instanceof Error ? error : new Error('Failed to load variant image');
        console.warn(
          `Couldn't load the image: ${path}.${extension} for the variant ${variant}, Fallback to default`,
          error_.message,
        );
        return getDefaultSource();
      }
    } catch (error) {
      const error_ = error instanceof Error ? error : new Error('Failed to load image');
      console.error(`Couldn't load the image: ${path}`, error_.message);
      return undefined;
    }
  }, [path, extension, variant]);

  return image ? <Image source={image} testID="variant-image" {...props} /> : null;
}

export default AssetByVariant;
