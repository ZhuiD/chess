import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Image } from 'react-native';
import { useOAuth } from '@clerk/clerk-expo';
import { useRouter } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { useBypassAuth } from '../_layout';

// 设置Web浏览器回调处理
WebBrowser.maybeCompleteAuthSession();

export default function LoginScreen() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });
  const router = useRouter();
  const { setBypassAuth } = useBypassAuth();

  // Google OAuth登录
  const onPressGoogle = React.useCallback(async () => {
    try {
      if (!startOAuthFlow) {
        console.error("OAuth 未加载");
        return;
      }
      
      const result = await startOAuthFlow();
      
      if (result && result.createdSessionId && result.setActive) {
        result.setActive({ session: result.createdSessionId });
        router.push('/');
      }
    } catch (err) {
      console.error("OAuth错误:", err);
    }
  }, [startOAuthFlow]);
  
  // 绕过登录
  const bypassLogin = () => {
    setBypassAuth(true);
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>国际象棋历史记录</Text>
        <Text style={styles.subtitle}>登录以查看您的棋局历史</Text>
      </View>
      
      <View style={styles.logoContainer}>
        <View style={styles.chessIcon}>
          <Text style={styles.chessIconText}>♞</Text>
        </View>
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.googleButton]}
          onPress={onPressGoogle}
        >
          <Text style={[styles.buttonText, { color: '#333' }]}>使用Google登录</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, { backgroundColor: '#4CAF50' }]}
          onPress={bypassLogin}
        >
          <Text style={styles.buttonText}>跳过登录直接访问</Text>
        </TouchableOpacity>
      </View>
      
      <Text style={styles.footer}>版权所有 © 2025 国际象棋历史</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
  },
  chessIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chessIconText: {
    fontSize: 80,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 20,
    gap: 15,
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    color: '#999',
    fontSize: 12,
  },
}); 