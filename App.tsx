import { StatusBar } from 'expo-status-bar';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
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
  deleteTodo,
  loadTodos,
  updateTodo,
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

function dateFromKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function replaceTodo(todos: Todo[], nextTodo: Todo) {
  return todos.map((todo) => (todo.id === nextTodo.id ? nextTodo : todo));
}

function TodoForm({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (todo: Todo) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(toDateKey(new Date()));
  const [time, setTime] = useState<Date | null>(null);
  const [tag, setTag] = useState<TodoTag>(DEFAULT_TODO_TAG);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleTimeChange = (_event: unknown, selected: Date) => {
    setShowTimePicker(false);
    setTime(selected);
  };

  const handleDateChange = (_event: unknown, selected: Date) => {
    setShowDatePicker(false);
    setDate(toDateKey(selected));
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

        <Text style={styles.fieldLabel}>Tarih</Text>
        <Pressable
          accessibilityLabel={`Tarih ${formatDate(dateFromKey(date))}`}
          accessibilityRole="button"
          disabled={saving}
          onPress={() => setShowDatePicker(true)}
          style={({ pressed }) => [styles.dateButton, pressed && styles.pressedButton]}
        >
          <Text style={styles.timeButtonText}>{formatDate(dateFromKey(date))}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            mode="date"
            onDismiss={() => setShowDatePicker(false)}
            onValueChange={handleDateChange}
            value={dateFromKey(date)}
          />
        )}

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
            onDismiss={() => setShowTimePicker(false)}
            onValueChange={handleTimeChange}
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

function TodoEditor({
  todo,
  onClose,
  onSaved,
  onDeleted,
}: {
  todo: Todo;
  onClose: () => void;
  onSaved: (todo: Todo) => void;
  onDeleted: (id: string) => void;
}) {
  const [title, setTitle] = useState(todo.title);
  const [date, setDate] = useState(todo.date);
  const [time, setTime] = useState<Date | null>(todo.time ? dateFromKey(todo.date) : null);
  const [tag, setTag] = useState<TodoTag>(todo.tag);
  const [picker, setPicker] = useState<'date' | 'time' | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (todo.time) {
      const [hours, minutes] = todo.time.split(':').map(Number);
      const nextTime = dateFromKey(todo.date);
      nextTime.setHours(hours, minutes, 0, 0);
      setTime(nextTime);
    }
  }, [todo.date, todo.time]);

  const handlePickerChange = (_event: unknown, selected: Date) => {
    const pickerType = picker;
    setPicker(null);

    if (pickerType === 'date') {
      setDate(toDateKey(selected));
    } else {
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
      const updatedTodo = await updateTodo(todo.id, {
        date,
        title: trimmedTitle,
        time: time ? formatTime(time) : null,
        tag,
      });
      if (updatedTodo) {
        onSaved(updatedTodo);
      }
    } catch {
      setError('Görev güncellenemedi. Lütfen tekrar dene.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert('Görevi silmek istediğinize emin misiniz?', undefined, [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          setSaving(true);
          try {
            await deleteTodo(todo.id);
            onDeleted(todo.id);
          } catch {
            setError('Görev silinemedi. Lütfen tekrar dene.');
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.modalRoot}>
      <View style={styles.modalCard}>
        <View style={styles.modalHeader}>
          <View>
            <Text style={styles.modalTitle}>Görevi Düzenle</Text>
          </View>
          <Pressable
            accessibilityLabel="Görev düzenleme penceresini kapat"
            accessibilityRole="button"
            disabled={saving}
            onPress={onClose}
            style={styles.closeButton}
          >
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Başlık</Text>
        <TextInput
          editable={!saving}
          maxLength={120}
          onChangeText={setTitle}
          placeholder="Ne yapman gerekiyor?"
          placeholderTextColor="#8A929D"
          style={styles.titleInput}
          value={title}
        />

        <Text style={styles.fieldLabel}>Tarih</Text>
        <Pressable
          accessibilityLabel={`Tarih ${formatDate(dateFromKey(date))}`}
          accessibilityRole="button"
          disabled={saving}
          onPress={() => setPicker('date')}
          style={({ pressed }) => [styles.dateButton, pressed && styles.pressedButton]}
        >
          <Text style={styles.timeButtonText}>{formatDate(dateFromKey(date))}</Text>
        </Pressable>

        <Text style={styles.fieldLabel}>Saat (isteğe bağlı)</Text>
        <View style={styles.timeRow}>
          <Pressable
            accessibilityLabel={time ? `Saat ${formatTime(time)}` : 'Saat seç'}
            accessibilityRole="button"
            disabled={saving}
            onPress={() => setPicker('time')}
            style={({ pressed }) => [styles.timeButton, pressed && styles.pressedButton]}
          >
            <Text style={styles.timeButtonText}>{time ? formatTime(time) : 'Saat seç'}</Text>
          </Pressable>
          {time && (
            <Pressable disabled={saving} onPress={() => setTime(null)} style={styles.clearTimeButton}>
              <Text style={styles.clearTimeText}>Temizle</Text>
            </Pressable>
          )}
        </View>
        {picker && (
          <DateTimePicker
            mode={picker}
            onDismiss={() => setPicker(null)}
            onValueChange={handlePickerChange}
            value={picker === 'date' ? dateFromKey(date) : time ?? new Date()}
          />
        )}

        <Text style={styles.fieldLabel}>Etiket</Text>
        <View style={styles.tagList}>
          {TODO_TAGS.map((item) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: tag === item }}
              disabled={saving}
              key={item}
              onPress={() => setTag(item)}
              style={[styles.tagButton, tag === item && styles.selectedTagButton]}
            >
              <Text style={[styles.tagIcon, tag === item && styles.selectedTagText]}>{TODO_TAG_ICONS[item]}</Text>
              <Text style={[styles.tagText, tag === item && styles.selectedTagText]}>{TODO_TAG_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.editorActions}>
          <Pressable accessibilityRole="button" disabled={saving} onPress={confirmDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Sil</Text>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            disabled={saving}
            onPress={handleSubmit}
            style={({ pressed }) => [styles.submitButton, styles.saveButton, pressed && styles.submitPressed, saving && styles.disabledButton]}
          >
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Kaydet</Text>}
          </Pressable>
        </View>
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
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [loading, setLoading] = useState(true);
  const dayScrollRef = useRef<ScrollView | null>(null);
  const todayOffset = useRef<number | null>(null);
  const todayHeight = useRef(0);
  const todayHeadingHeight = useRef(0);
  const dayScrollHeight = useRef(0);
  const isCurrentWeek = toDateKey(selectedMonday) === toDateKey(currentWeek.monday);
  const isEarliestWeek =
    toDateKey(selectedMonday) === toDateKey(addWeeks(currentWeek.monday, -1));

  useEffect(() => {
    setSelectedMonday(getWeek().monday);
  }, []);

  useEffect(() => {
    loadTodos()
      .then(setTodos)
      .finally(() => setLoading(false));
  }, []);

  const todosForDate = (date: string) =>
    todos
      .filter((todo) => todo.date === date)
      .sort((first, second) => first.order - second.order);

  const toggleTodo = async (todo: Todo) => {
    try {
      const updatedTodo = await updateTodo(todo.id, { completed: !todo.completed });
      if (updatedTodo) {
        setTodos((current) => replaceTodo(current, updatedTodo));
      }
    } catch {
      Alert.alert('Güncelleme başarısız', 'Görevin durumu değiştirilemedi.');
    }
  };

  const getTodayScrollOffset = () =>
    Math.max(
      0,
      (todayOffset.current ?? 0) +
        (todayHeadingHeight.current || todayHeight.current) / 2 -
        dayScrollHeight.current / 2,
    );

  const scrollToToday = () => {
    if (loading || todayOffset.current === null || dayScrollHeight.current === 0) {
      return;
    }

    dayScrollRef.current?.scrollTo({
      animated: false,
      y: getTodayScrollOffset(),
    });
  };

  const goToCurrentWeek = () => {
    setSelectedMonday(currentWeek.monday);
  };

  useEffect(() => {
    let secondFrame: number | null = null;
    const firstFrame = requestAnimationFrame(() => {
      secondFrame = requestAnimationFrame(() => {
        if (loading) {
          return;
        }

        if (isCurrentWeek) {
          scrollToToday();
        } else {
          dayScrollRef.current?.scrollTo({ animated: false, y: 0 });
        }
      });
    });

    return () => {
      cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) {
        cancelAnimationFrame(secondFrame);
      }
    };
  }, [isCurrentWeek, loading, selectedMonday]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.planContent}>
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
              onPress={goToCurrentWeek}
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
      </View>

      <ScrollView
        ref={dayScrollRef}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
        onLayout={(event) => {
          dayScrollHeight.current = event.nativeEvent.layout.height;
        }}
      >
        <View style={styles.weekList}>
          {week.map((date, index) => {
            const dateKey = toDateKey(date);
            const dayTodos = todosForDate(dateKey);
            return (
            <View
              key={dateKey}
              onLayout={(event) => {
                if (dateKey === todayKey) {
                  todayOffset.current = event.nativeEvent.layout.y;
                  todayHeight.current = event.nativeEvent.layout.height;
                }
              }}
              style={[styles.dayCard, dateKey === todayKey && styles.todayCard]}
            >
              <View
                onLayout={(event) => {
                  if (dateKey === todayKey) {
                    todayHeadingHeight.current = event.nativeEvent.layout.height;
                  }
                }}
                style={styles.dayHeading}
              >
                <Text style={styles.dayName}>{dayNames[date.getDay()]}</Text>
                <Text style={styles.dayDate}>{formatDate(date)}</Text>
              </View>
              {loading ? <ActivityIndicator color="#E76F51" style={styles.dayLoader} /> : dayTodos.length > 0 ? (
                <View style={styles.todoList}>
                  {dayTodos.map((todo) => (
                    <Pressable
                      key={todo.id}
                      accessibilityLabel={`${todo.title} görevini düzenle`}
                      accessibilityRole="button"
                      onPress={() => setEditingTodo(todo)}
                      style={({ pressed }) => [styles.todoRow, todo.completed && styles.completedTodoRow, pressed && styles.pressedTodoRow]}
                    >
                      <Pressable
                        accessibilityLabel={todo.completed ? `${todo.title} tamamlanmadı olarak işaretle` : `${todo.title} tamamlandı olarak işaretle`}
                        accessibilityRole="checkbox"
                        accessibilityState={{ checked: todo.completed }}
                        onPress={(event) => {
                          event.stopPropagation();
                          toggleTodo(todo);
                        }}
                        style={styles.todoToggle}
                      >
                        <View style={[styles.checkbox, todo.completed && styles.checkedBox]}>
                          {todo.completed && <Text style={styles.checkmark}>✓</Text>}
                        </View>
                        <Text style={styles.todoTagIcon}>{TODO_TAG_ICONS[todo.tag]}</Text>
                      </Pressable>
                      {todo.time && <Text style={[styles.todoTime, todo.completed && styles.completedText]}>{todo.time}</Text>}
                      <Text style={[styles.todoTitle, todo.completed && styles.completedText]}>{todo.title}</Text>
                    </Pressable>
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
            onClose={() => setTodoDate(null)}
            onCreated={(todo) => {
              setTodos((current) => [...current, todo]);
              setTodoDate(null);
            }}
          />
        )}
      </Modal>
      <Modal animationType="slide" onRequestClose={() => setEditingTodo(null)} transparent visible={editingTodo !== null}>
        {editingTodo && (
          <TodoEditor
            todo={editingTodo}
            onClose={() => setEditingTodo(null)}
            onDeleted={(id) => {
              setTodos((current) => current.filter((todo) => todo.id !== id));
              setEditingTodo(null);
            }}
            onSaved={(todo) => {
              setTodos((current) => replaceTodo(current, todo));
              setEditingTodo(null);
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
  },
  dayScroll: {
    flex: 1,
  },
  dayScrollContent: {
    paddingBottom: 24,
    paddingHorizontal: 14,
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
  pressedTodoRow: {
    opacity: 0.78,
  },
  todoToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 7,
  },
  completedTodoRow: {
    backgroundColor: '#E8E6E1',
  },
  checkbox: {
    alignItems: 'center',
    borderColor: '#A9B0B8',
    borderRadius: 9,
    borderWidth: 1.5,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkedBox: {
    backgroundColor: '#526174',
    borderColor: '#526174',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  completedText: {
    color: '#8A929D',
    textDecorationLine: 'line-through',
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
  dateButton: {
    alignSelf: 'flex-start',
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
  editorActions: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    marginTop: 22,
  },
  deleteButton: {
    alignItems: 'center',
    borderColor: '#E2B8B0',
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 18,
  },
  deleteText: {
    color: '#B04C4C',
    fontSize: 15,
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
    marginTop: 0,
  },
});
