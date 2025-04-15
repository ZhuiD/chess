import { ClerkProvider, useAuth } from '@clerk/clerk-expo';
import { Slot, useRouter, useSegments } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';
import * as WebBrowser from 'expo-web-browser';

// 设置Web浏览器回调处理
WebBrowser.maybeCompleteAuthSession();

// 从环境变量获取Clerk发布密钥
const CLERK_PUBLISHABLE_KEY = Constants.expoConfig?.extra?.clerkPublishableKey || 
                              process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY || 
                              "pk_test_bmV4dC1raWQtODUuY2xlcmsuYWNjb3VudHMuZGV2JA";

// SecureStore适配器，用于存储Clerk认证令牌
const tokenCache = {
  async getToken(key: string) {
    try {
      return SecureStore.getItemAsync(key);
    } catch (err) {
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

// 创建一个上下文用于绕过认证
const BypassAuthContext = React.createContext<{
  bypassAuth: boolean;
  setBypassAuth: React.Dispatch<React.SetStateAction<boolean>>;
}>({
  bypassAuth: false,
  setBypassAuth: () => {},
});

export const useBypassAuth = () => React.useContext(BypassAuthContext);

// 认证保护组件
function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { bypassAuth } = useBypassAuth();

  useEffect(() => {
    if (!isLoaded) return;
    if (bypassAuth) return; // 如果绕过认证，跳过认证检查

    const inAuthGroup = segments[0] === '(auth)';

    if (!isSignedIn && !inAuthGroup) {
      // 如果用户未登录且不在认证路由组，重定向到登录页
      router.replace('/(auth)/login');
    } else if (isSignedIn && inAuthGroup) {
      // 如果用户已登录且在认证路由组，重定向到主页
      router.replace('/');
    }
  }, [isLoaded, isSignedIn, segments, bypassAuth]);

  if (!isLoaded && !bypassAuth) {
    // 加载状态
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={{ marginTop: 10 }}>加载中...</Text>
      </View>
    );
  }

  return <>{children}</>;
}

export default function RootLayout() {
  const [bypassAuth, setBypassAuth] = useState(false); // 默认不绕过认证

  return (
    <BypassAuthContext.Provider value={{ bypassAuth, setBypassAuth }}>
      <ClerkProvider 
        publishableKey={CLERK_PUBLISHABLE_KEY}
        tokenCache={tokenCache}
      >
        <AuthGuard>
          <Slot />
        </AuthGuard>
      </ClerkProvider>
    </BypassAuthContext.Provider>
  );
}
