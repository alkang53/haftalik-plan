import { SafeAreaProvider } from 'react-native-safe-area-context';

import { WeeklyPlanScreen } from './src/screens/WeeklyPlanScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <WeeklyPlanScreen />
    </SafeAreaProvider>
  );
}
