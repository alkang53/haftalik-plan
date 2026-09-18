import DateTimePicker from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Pressable, Text, TextInput, View } from 'react-native';

import { addTodo } from '../storage/todoStorage';
import { styles } from '../styles/appStyles';
import {
  DEFAULT_TODO_TAG,
  TODO_TAG_ICONS,
  TODO_TAG_LABELS,
  TODO_TAGS,
  type Todo,
  type TodoTag,
} from '../types/todo';
import { dateFromKey, formatDate, formatTime } from '../utils/date';
import { toDateKey } from '../utils/week';

type Props = {
  initialDate: string;
  onClose: () => void;
  onCreated: (todo: Todo) => void;
};

export function TodoForm({ initialDate, onClose, onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(initialDate);
  const [time, setTime] = useState<Date | null>(null);
  const [tag, setTag] = useState<TodoTag>(DEFAULT_TODO_TAG);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
          <Text style={styles.modalTitle}>Planına Ekle</Text>
          <Pressable accessibilityLabel="Görev ekleme penceresini kapat" accessibilityRole="button" onPress={onClose} style={styles.closeButton}>
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
             onValueChange={(_event, selected) => {
               setShowDatePicker(false);
               if (selected) setDate(toDateKey(selected));
            }}
            value={dateFromKey(date)}
          />
        )}

        <Text style={styles.fieldLabel}>Saat (isteğe bağlı)</Text>
        <View style={styles.timeRow}>
          <Pressable accessibilityLabel={time ? `Saat ${formatTime(time)}` : 'Saat seç'} accessibilityRole="button" onPress={() => setShowTimePicker(true)} style={({ pressed }) => [styles.timeButton, pressed && styles.pressedButton]}>
            <Text style={styles.timeButtonText}>{time ? formatTime(time) : 'Saat seç'}</Text>
          </Pressable>
           {time && <Pressable accessibilityLabel="Seçilen saati temizle" accessibilityRole="button" onPress={() => setTime(null)} style={styles.clearTimeButton}><Text style={styles.clearTimeText}>Temizle</Text></Pressable>}
        </View>
        {showTimePicker && (
          <DateTimePicker
            mode="time"
            onDismiss={() => setShowTimePicker(false)}
             onValueChange={(_event, selected) => {
               setShowTimePicker(false);
               if (selected) setTime(selected);
            }}
            value={time ?? new Date()}
          />
        )}

        <Text style={styles.fieldLabel}>Etiket</Text>
        <View style={styles.tagList}>
          {TODO_TAGS.map((item) => (
             <Pressable accessibilityLabel={`${TODO_TAG_LABELS[item]} etiketini seç`} accessibilityRole="radio" accessibilityState={{ selected: tag === item }} key={item} onPress={() => setTag(item)} style={[styles.tagButton, tag === item && styles.selectedTagButton]}>
              <Text style={[styles.tagIcon, tag === item && styles.selectedTagText]}>{TODO_TAG_ICONS[item]}</Text>
              <Text style={[styles.tagText, tag === item && styles.selectedTagText]}>{TODO_TAG_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <Pressable accessibilityLabel="Görevi ekle" accessibilityRole="button" disabled={saving} onPress={handleSubmit} style={({ pressed }) => [styles.submitButton, pressed && styles.submitPressed, saving && styles.disabledButton]}>
          {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Ekle</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
