import 'dotenv/config';

export default {
  expo: {
    name: "Chess History",
    slug: "chess-history",
    version: "1.0.0",
    orientation: "portrait",
    userInterfaceStyle: "automatic",
    ios: {
      supportsTablet: true
    },
    android: {
      adaptiveIcon: {
        backgroundColor: "#ffffff"
      }
    },
    web: {
      bundler: "metro"
    },
    plugins: [
      "expo-router",
      "expo-secure-store"
    ],
    scheme: "chess-history",
    experiments: {
      typedRoutes: true
    },
    extra: {
      clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    }
  }
}; 