import { useState } from "react";
import { View, Text, Pressable } from "react-native";
import { WebView } from "react-native-webview";
import { playerDocument } from "../studio/document";
export function GamePlayer({ html }: { html: string }) {
  const [key, setKey] = useState(0);
  return (
    <View style={{ flex: 1, minHeight: 300 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setKey((k) => k + 1)}
        style={{ padding: 10 }}
      >
        <Text>Restart game</Text>
      </Pressable>
      <WebView
        key={key}
        style={{ flex: 1 }}
        source={{ html: playerDocument(html) }}
        javaScriptEnabled
        domStorageEnabled
        scrollEnabled={false}
        originWhitelist={["*"]}
        onShouldStartLoadWithRequest={(r) =>
          r.url === "about:blank" || r.url === "about:srcdoc"
        }
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        allowFileAccess={false}
        allowUniversalAccessFromFileURLs={false}
        javaScriptCanOpenWindowsAutomatically={false}
        setSupportMultipleWindows
        onOpenWindow={() => {}}
        onContentProcessDidTerminate={() => setKey((k) => k + 1)}
      />
    </View>
  );
}
