import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  addWeeks,
  getWeek,
  getWeekDates,
  toDateKey,
} from './src/utils/week';

const dayNames = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
];

const monthNames = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
];

function formatDate(date: Date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function WeeklyPlanScreen() {
  const currentWeek = getWeek();
  const [selectedMonday, setSelectedMonday] = useState(currentWeek.monday);
  const week = getWeekDates(selectedMonday);
  const firstDay = week[0];
  const lastDay = week[6];
  const todayKey = toDateKey(new Date());
  const isEarliestWeek =
    toDateKey(selectedMonday) === toDateKey(addWeeks(currentWeek.monday, -1));

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.planContent}>
        <View style={styles.planTopBar}>
          <Text style={styles.topBarLabel}>SEVEN</Text>
        </View>

        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>
            {formatDate(firstDay)} - {formatDate(lastDay)}
          </Text>
          <View style={styles.navigation}>
            <Pressable
              accessibilityLabel="Önceki haftaya git"
              accessibilityRole="button"
              disabled={isEarliestWeek}
              onPress={() => setSelectedMonday(addWeeks(selectedMonday, -1))}
              style={({ pressed }) => [
                styles.arrowButton,
                isEarliestWeek && styles.disabledButton,
                pressed && !isEarliestWeek && styles.pressedButton,
              ]}
            >
              <Text style={[styles.arrow, isEarliestWeek && styles.disabledText]}>‹</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Bugüne dön"
              accessibilityRole="button"
              onPress={() => setSelectedMonday(currentWeek.monday)}
              style={({ pressed }) => [styles.titleButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.navigationLabel}>Bugün</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Sonraki haftaya git"
              accessibilityRole="button"
              onPress={() => setSelectedMonday(addWeeks(selectedMonday, 1))}
              style={({ pressed }) => [styles.arrowButton, pressed && styles.pressedButton]}
            >
              <Text style={styles.arrow}>›</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.weekList}>
          {week.map((date, index) => (
            <View
              key={toDateKey(date)}
              style={[styles.dayCard, toDateKey(date) === todayKey && styles.todayCard]}
            >
              <View style={styles.dayHeading}>
                <Text style={styles.dayName}>{dayNames[date.getDay()]}</Text>
                <Text style={styles.dayDate}>{formatDate(date)}</Text>
              </View>
              <View style={styles.emptyDay}>
                <Text style={styles.emptyDayText}>Bugün için plan yok</Text>
                {index === 0 && (
                  <Text style={styles.emptyDayHint}>Yakında bir görev ekleyebilirsin.</Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <WeeklyPlanScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F8F3',
  },
  planContent: {
    padding: 24,
    paddingBottom: 40,
  },
  planTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 40,
  },
  topBarLabel: {
    color: '#6C8875',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    marginTop: 12,
  },
  titleButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  planTitle: {
    color: '#1D3027',
    fontSize: 22,
    flexShrink: 1,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  navigation: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  arrowButton: {
    alignItems: 'center',
    borderRadius: 12,
    height: 52,
    justifyContent: 'center',
    width: 52,
  },
  arrow: {
    color: '#858B87',
    fontSize: 40,
    fontWeight: '300',
    lineHeight: 42,
  },
  navigationLabel: {
    color: '#6C8875',
    fontSize: 12,
    fontWeight: '700',
  },
  pressedButton: {
    backgroundColor: '#EAF2E9',
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledText: {
    color: '#9AA59D',
  },
  weekList: {
    gap: 14,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E5EAE3',
    borderRadius: 18,
    borderWidth: 1,
    padding: 17,
  },
  todayCard: {
    borderColor: '#A9C3AB',
    borderWidth: 2,
  },
  dayHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  dayName: {
    color: '#2E5B45',
    fontSize: 17,
    fontWeight: '700',
  },
  dayDate: {
    color: '#9AA59D',
    fontSize: 13,
  },
  emptyDay: {
    backgroundColor: '#F7F8F3',
    borderRadius: 12,
    minHeight: 64,
    padding: 14,
  },
  emptyDayText: {
    color: '#718078',
    fontSize: 14,
  },
  emptyDayHint: {
    color: '#A2ADA5',
    fontSize: 12,
    marginTop: 5,
  },
});
