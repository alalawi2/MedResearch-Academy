import type { ConfigContext, ExpoConfig } from 'expo/config';

// A hosted web prefix must never be applied to native bundle assets. On iOS a
// folder named suppclarity collides with the app executable on case-insensitive
// filesystems. Native builds and Expo Go use the ordinary unprefixed asset path.
export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: config.name ?? 'SuppClarity',
  slug: config.slug ?? 'suppclarity',
  experiments: {
    ...config.experiments,
    ...(process.env.SUPPCLARITY_WEB_BASE_PATH
      ? { baseUrl: process.env.SUPPCLARITY_WEB_BASE_PATH }
      : {}),
  },
});
