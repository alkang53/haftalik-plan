import { StatusBar } from 'expo-status-bar';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

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

function getCurrentWeek() {
  const today = new Date();
  const mondayOffset = today.getDay() === 0 ? -6 : 1 - today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);

  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}

function formatDate(date: Date) {
  return `${date.getDate()} ${monthNames[date.getMonth()]}`;
}

function WeeklyPlanScreen() {
  const week = getCurrentWeek();
  const firstDay = week[0];
  const lastDay = week[6];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.planContent}>
        <View style={styles.planTopBar}>
          <Text style={styles.topBarLabel}>SEVEN</Text>
        </View>

        <View style={styles.planHeader}>
          <Text style={styles.planTitle}>Bu hafta</Text>
          <Text style={styles.dateRange}>
            {formatDate(firstDay)} - {formatDate(lastDay)}
          </Text>
        </View>

        <View style={styles.weekList}>
          {week.map((date, index) => (
            <View key={date.toISOString()} style={styles.dayCard}>
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
  return <WeeklyPlanScreen />;
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
    marginBottom: 28,
    marginTop: 34,
  },
  planTitle: {
    color: '#1D3027',
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.7,
  },
  dateRange: {
    color: '#718078',
    fontSize: 15,
    marginTop: 8,
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
