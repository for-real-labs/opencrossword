import { useState } from "react";
import { View, Text, Pressable } from "react-native";
export function GamePlayer({ html }: { html: string }) {
  const [key, setKey] = useState(0);
  return (
    <View style={{ flex: 1, minHeight: 300 }}>
      <Pressable onPress={() => setKey((k) => k + 1)} style={{ padding: 10 }}>
        <Text>Restart game</Text>
      </Pressable>
      <iframe
        key={key}
        title="Your game"
        srcDoc={html}
        sandbox="allow-scripts allow-pointer-lock"
        allow="autoplay; fullscreen"
        style={{ flex: 1, border: 0, width: "100%", minHeight: 300 }}
      />
    </View>
  );
}
