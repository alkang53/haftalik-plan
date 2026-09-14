import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Button, StyleSheet, Text, View } from 'react-native';

export default function App() {
  const [started, setStarted] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Haftalık Plan</Text>
      <Text style={styles.description}>
        Haftanı daha düzenli planlamana yardımcı olur.
      </Text>
      <Button
        title="Başla"
        onPress={() => setStarted(true)}
        accessibilityLabel="Haftalık Plan uygulamasını başlat"
      />
      {started && (
        <Text style={styles.started}>İlk planını oluşturmaya hazırsın! Hey Hey</Text>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 12,
  },
  description: {
    color: '#555',
    fontSize: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  started: {
    color: '#16794a',
    fontSize: 16,
    marginTop: 16,
  },
});
