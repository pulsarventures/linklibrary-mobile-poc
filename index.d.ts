// FIXME: https://github.com/import-js/eslint-plugin-import/issues/3169
declare module 'eslint-plugin-import' {
  import type { Linter } from 'eslint';

  export const flatConfigs: {
    [key: string]: Linter.Config | undefined;
    recommended: Linter.Config;
    typescript: Linter.Config;
  };
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '@env' {
  export const API_URL_DEV: string;
  export const API_URL_PROD: string;
  export const GOOGLE_CLIENT_ID: string;
}
