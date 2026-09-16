import { StatusBar } from 'expo-status-bar';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  addWeeks,
  getWeek,
  getWeekDates,
  toDateKey,
} from './src/utils/week';
import {
  addTodo,
  loadTodos,
} from './src/storage/todoStorage';
import {
  DEFAULT_TODO_TAG,
  TODO_TAG_ICONS,
  TODO_TAGS,
  TODO_TAG_LABELS,
  type Todo,
  type TodoTag,
} from './src/types/todo';

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

function formatTime(date: Date) {
  return `${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`;
}

function TodoForm({
  date,
  onClose,
  onCreated,
}: {
  date: string;
  onClose: () => void;
  onCreated: (todo: Todo) => void;
}) {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState<Date | null>(null);
  const [tag, setTag] = useState<TodoTag>(DEFAULT_TODO_TAG);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTimeChange = (event: DateTimePickerEvent, selected?: Date) => {
    setShowTimePicker(false);
    if (event.type === 'set' && selected) {
      setTime(selected);
    }
  };

  const handleSubmit = async () => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError('Görev başlığı gerekli.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const todo = await addTodo({
        date,
        title: trimmedTitle,
        time: time ? formatTime(time) : null,
        tag,
        completed: false,
      });
      onCreated(todo);
    } catch {
      setError('Görev kaydedilemedi. Lütfen tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.modalRoot}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Planına Ekle</Text>
          </View>
          <Pressable
            accessibilityLabel="Görev ekleme penceresini kapat"
            accessibilityRole="button"
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Başlık</Text>
        <TextInput
          autoFocus
          editable={!saving}
          maxLength={120}
          onChangeText={setTitle}
          onSubmitEditing={handleSubmit}
          placeholder="Ne yapman gerekiyor?"
          placeholderTextColor="#8A929D"
          returnKeyType="done"
          style={styles.titleInput}
          value={title}
        />

        <Text style={styles.fieldLabel}>Saat (isteğe bağlı)</Text>
        <View style={styles.timeRow}>
          <Pressable
            accessibilityLabel={time ? `Saat ${formatTime(time)}` : 'Saat seç'}
            accessibilityRole="button"
            onPress={() => setShowTimePicker(true)}
            style={({ pressed }) => [styles.timeButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.timeButtonText}>{time ? formatTime(time) : 'Saat seç'}</Text>
          </Pressable>
          {time && (
            <Pressable onPress={() => setTime(null)} style={styles.clearTimeButton}>
              <Text style={styles.clearTimeText}>Temizle</Text>
            </Pressable>
          )}
        </View>
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            onChange={handleTimeChange}
            value={time ?? new Date()}
          />
        )}

        <Text style={styles.fieldLabel}>Etiket</Text>
        <View style={styles.tagList}>
          {TODO_TAGS.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: tag === item }}
              key={item}
              onPress={() => setTag(item)}
              style={[styles.tagButton, tag === item && styles.selectedTagButton]}
            >
              <Text style={[styles.tagIcon, tag === item && styles.selectedTagText]}>
                {TODO_TAG_ICONS[item]}
              </Text>
              <Text style={[styles.tagText, tag === item && styles.selectedTagText]}>
                {TODO_TAG_LABELS[item]}
              </Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <Pressable
          accessibilityRole="button"
          disabled={saving}
          onPress={handleSubmit}
          style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed, saving && styles.disabledButton]}
        >
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Ekle</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function WeeklyPlanScreen() {
  const currentWeek = getWeek();
  const [selectedMonday, setSelectedMonday] = useState(currentWeek.monday);
  const week = getWeekDates(selectedMonday);
  const firstDay = week[0];
  const lastDay = week[6];
  const todayKey = toDateKey(new Date());
  const [todos, setTodos] = useState<Todo[]>([]);
  const [todoDate, setTodoDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isEarliestWeek =
    toDateKey(selectedMonday) === toDateKey(addWeeks(currentWeek.monday, -1));

  useEffect(() => {
    loadTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const todosForDate = (date: string) =>
    todos
      .filter((todo) => todo.date === date)
      .sort((first, second) => first.order - second.order);

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
          {week.map((date, index) => {
            const dateKey = toDateKey(date);
            const dayTodos = todosForDate(dateKey);
            return (
            <View
              key={dateKey}
              style={[styles.dayCard, dateKey === todayKey && styles.todayCard]}
            >
              <View style={styles.dayHeading}>
                <Text style={styles.dayName}>{dayNames[date.getDay()]}</Text>
                <Text style={styles.dayDate}>{formatDate(date)}</Text>
              </View>
              {loading ? <ActivityIndicator color="#E76F51" style={styles.dayLoader} /> : dayTodos.length > 0 ? (
                <View style={styles.todoList}>
                  {dayTodos.map((todo) => (
                    <View key={todo.id} style={styles.todoRow}>
                      <Text
                        accessibilityLabel={`${TODO_TAG_LABELS[todo.tag]} etiketi`}
                        style={styles.todoTagIcon}
                      >
                        {TODO_TAG_ICONS[todo.tag]}
                      </Text>
                      {todo.time && <Text style={styles.todoTime}>{todo.time}</Text>}
                      <Text style={styles.todoTitle}>{todo.title}</Text>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyDay}>
                  <Text style={styles.emptyDayText}>Bugün için bir plan bulunmuyor</Text>
                  {index === 0 && <Text style={styles.emptyDayHint}>Bir görev ekleyerek başlayabilirsin.</Text>}
                </View>
              )}
              <Pressable
                accessibilityLabel={`${dayNames[date.getDay()]} gününe görev ekle`}
                accessibilityRole="button"
                onPress={() => setTodoDate(dateKey)}
                style={({ pressed }) => [styles.addTodoButton, pressed && styles.pressedButton]}
              >
                <Text style={styles.addTodoIcon}>+</Text>
              </Pressable>
            </View>
            );
          })}
        </View>
      </ScrollView>
      <Modal animationType="slide" onRequestClose={() => setTodoDate(null)} transparent visible={todoDate !== null}>
        {todoDate && (
          <TodoForm
            date={todoDate}
            onClose={() => setTodoDate(null)}
            onCreated={(todo) => {
              setTodos((current) => [...current, todo]);
              setTodoDate(null);
            }}
          />
        )}
      </Modal>
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
    backgroundColor: '#F3F0EA',
  },
  planContent: {
    padding: 14,
    paddingBottom: 24,
  },
  planTopBar: {
    alignItems: 'center',
    flexDirection: 'row',
    height: 28,
  },
  topBarLabel: {
    color: '#E76F51',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.7,
  },
  planHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginTop: 8,
  },
  titleButton: {
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 10,
  },
  planTitle: {
    color: '#162235',
    fontSize: 20,
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
    color: '#526174',
    fontSize: 34,
    fontWeight: '300',
    lineHeight: 42,
  },
  navigationLabel: {
    color: '#E76F51',
    fontSize: 12,
    fontWeight: '700',
  },
  pressedButton: {
    backgroundColor: '#FBE0D8',
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledText: {
    color: '#A9B0B8',
  },
  weekList: {
    gap: 8,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D9D5CE',
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  todayCard: {
    borderColor: '#E76F51',
    borderWidth: 2,
  },
  dayHeading: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayName: {
    color: '#162235',
    fontSize: 16,
    fontWeight: '800',
  },
  dayDate: {
    backgroundColor: '#FBE0D8',
    borderRadius: 8,
    color: '#B94F38',
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  emptyDay: {
    backgroundColor: '#F3F0EA',
    borderRadius: 10,
    minHeight: 42,
    padding: 10,
  },
  emptyDayText: {
    color: '#697586',
    fontSize: 13,
  },
  emptyDayHint: {
    color: '#8A929D',
    fontSize: 11,
    marginTop: 3,
  },
  addTodoButton: {
    alignItems: 'center',
    backgroundColor: '#162235',
    borderColor: '#162235',
    borderRadius: 16,
    borderWidth: 1,
    height: 32,
    marginTop: 8,
    justifyContent: 'center',
    width: 32,
  },
  addTodoIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '300',
    lineHeight: 24,
  },
  dayLoader: {
    minHeight: 42,
  },
  todoList: {
    gap: 5,
  },
  todoRow: {
    alignItems: 'center',
    backgroundColor: '#F3F0EA',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 7,
    minHeight: 40,
    paddingHorizontal: 9,
    paddingVertical: 7,
  },
  todoTime: {
    color: '#526174',
    fontSize: 12,
    fontWeight: '700',
    width: 38,
  },
  todoTitle: {
    color: '#162235',
    flex: 1,
    fontSize: 14,
  },
  todoTagIcon: {
    color: '#526174',
    fontSize: 17,
    textAlign: 'center',
    width: 20,
  },
  modalRoot: {
    backgroundColor: 'rgba(22, 34, 53, 0.48)',
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 26,
  },
  modalHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  modalEyebrow: {
    color: '#E76F51',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modalTitle: {
    color: '#162235',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 5,
  },
  closeButton: {
    alignItems: 'center',
    backgroundColor: '#F3F0EA',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  closeText: {
    color: '#526174',
    fontSize: 28,
    fontWeight: '300',
    lineHeight: 30,
  },
  fieldLabel: {
    color: '#34445A',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    marginTop: 14,
  },
  titleInput: {
    backgroundColor: '#F3F0EA',
    borderColor: '#D9D5CE',
    borderRadius: 12,
    borderWidth: 1,
    color: '#162235',
    fontSize: 16,
    padding: 14,
  },
  timeRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  timeButton: {
    backgroundColor: '#F3F0EA',
    borderColor: '#D9D5CE',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  timeButtonText: {
    color: '#B94F38',
    fontSize: 14,
    fontWeight: '700',
  },
  clearTimeButton: {
    padding: 8,
  },
  clearTimeText: {
    color: '#7B8490',
    fontSize: 13,
  },
  tagList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    alignItems: 'center',
    borderColor: '#D9D5CE',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedTagButton: {
    backgroundColor: '#162235',
    borderColor: '#162235',
  },
  tagText: {
    color: '#697586',
    fontSize: 12,
  },
  tagIcon: {
    color: '#526174',
    fontSize: 14,
    fontWeight: '700',
  },
  selectedTagText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  errorText: {
    color: '#B04C4C',
    fontSize: 13,
    marginTop: 14,
  },
  submitButton: {
    alignItems: 'center',
    backgroundColor: '#E76F51',
    borderRadius: 14,
    justifyContent: 'center',
    marginTop: 22,
    minHeight: 52,
  },
  submitPressed: {
    backgroundColor: '#C8573D',
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});
