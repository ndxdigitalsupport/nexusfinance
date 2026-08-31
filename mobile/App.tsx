import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { WebView } from 'react-native-webview';

const APP_URL = 'https://nexusfinancefintech.vercel.app';

// Hide the "Sign in with Google" button — Google OAuth redirect flow does
// not work inside a WebView. Email/password login is the supported path.
const HIDE_GOOGLE_JS = `
  (function () {
    function hideGoogle() {
      document.querySelectorAll('button').forEach(function (btn) {
        if (btn.textContent && btn.textContent.indexOf('Sign in with Google') !== -1) {
          btn.style.display = 'none';
        }
      });
    }
    hideGoogle();
    var observer = new MutationObserver(hideGoogle);
    observer.observe(document.body, { childList: true, subtree: true });
  })();
  true;
`;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  // Handle deep links (nexusfinance://...)
  useEffect(() => {
    const handleDeepLink = (url: string) => {
      // Extract the path from the deep link and navigate the WebView
      const path = url.replace('nexusfinance://', '/');
      if (webViewRef.current) {
        webViewRef.current.injectJavaScript(`window.location.href = '${path}';`);
      }
    };

    // Handle links that opened the app
    Linking.getInitialURL().then((url) => {
      if (url && url.startsWith('nexusfinance://')) {
        // Small delay to let WebView load first
        setTimeout(() => handleDeepLink(url), 1500);
      }
    });

    // Listen for new deep links while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  const webViewRef = useRef<WebView>(null);

  const handleShouldStartLoad = useCallback((request: any) => {
    const url = request.url;
    if (!url) return true;

    // Allow HTTPS navigation inside the app
    if (url.startsWith('https://')) return true;

    // Open external schemes (bakong://, tel:, mailto:, etc.) in the system app
    Linking.openURL(url).catch(() => {});
    return false;
  }, []);

  const retry = useCallback(() => {
    setFailed(false);
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <WebView
        ref={webViewRef}
        key={reloadKey}
        source={{ uri: APP_URL }}
        style={styles.webview}
        originWhitelist={['*']}
        javaScriptEnabled
        domStorageEnabled
        allowFileAccess
        setSupportMultipleWindows={false}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={() => {
          setLoading(false);
          setFailed(true);
        }}
        injectedJavaScript={HIDE_GOOGLE_JS}
        injectedJavaScriptBeforeContentLoaded={HIDE_GOOGLE_JS}
        onShouldStartLoadWithRequest={handleShouldStartLoad}
        sharedCookiesEnabled
      />

      {loading && (
        <View style={styles.loadingOverlay} pointerEvents="none">
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color="#00BDAA" />
            <Text style={styles.loadingText}>Loading NexusFinance...</Text>
          </View>
        </View>
      )}

      {failed && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Can't connect</Text>
          <Text style={styles.errorText}>
            NexusFinance couldn't be reached. Check your internet connection and try again.
          </Text>
          <TouchableOpacity style={styles.retryButton} onPress={retry}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F171C',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0F171C',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F171C',
  },
  loadingCard: {
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: '600',
  },
  errorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F171C',
    paddingHorizontal: 40,
    gap: 12,
  },
  errorTitle: {
    color: '#F1F5F9',
    fontSize: 20,
    fontWeight: '700',
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    marginTop: 12,
    backgroundColor: '#00BDAA',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryText: {
    color: '#011B2A',
    fontSize: 15,
    fontWeight: '700',
  },
});