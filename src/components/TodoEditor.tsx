import DateTimePicker from '@react-native-community/datetimepicker';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Pressable, Text, TextInput, View } from 'react-native';

import { deleteTodo, updateTodo } from '../storage/todoStorage';
import { styles } from '../styles/appStyles';
import { TODO_TAG_ICONS, TODO_TAG_LABELS, TODO_TAGS, type Todo, type TodoTag } from '../types/todo';
import { dateFromKey, formatDate, formatTime } from '../utils/date';
import { toDateKey } from '../utils/week';

type Props = {
  todo: Todo;
  onClose: () => void;
  onSaved: (todo: Todo) => void;
  onDeleted: (id: string) => void;
};

export function TodoEditor({ todo, onClose, onSaved, onDeleted }: Props) {
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
      if (updatedTodo) onSaved(updatedTodo);
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
          <Text style={styles.modalTitle}>Görevi Düzenle</Text>
          <Pressable accessibilityLabel="Görev düzenleme penceresini kapat" accessibilityRole="button" disabled={saving} onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>×</Text>
          </Pressable>
        </View>

        <Text style={styles.fieldLabel}>Başlık</Text>
        <TextInput editable={!saving} maxLength={120} onChangeText={setTitle} placeholder="Ne yapman gerekiyor?" placeholderTextColor="#8A929D" style={styles.titleInput} value={title} />

        <Text style={styles.fieldLabel}>Tarih</Text>
        <Pressable accessibilityLabel={`Tarih ${formatDate(dateFromKey(date))}`} accessibilityRole="button" disabled={saving} onPress={() => setPicker('date')} style={({ pressed }) => [styles.dateButton, pressed && styles.pressedButton]}>
          <Text style={styles.timeButtonText}>{formatDate(dateFromKey(date))}</Text>
        </Pressable>

        <Text style={styles.fieldLabel}>Saat (isteğe bağlı)</Text>
        <View style={styles.timeRow}>
          <Pressable accessibilityLabel={time ? `Saat ${formatTime(time)}` : 'Saat seç'} accessibilityRole="button" disabled={saving} onPress={() => setPicker('time')} style={({ pressed }) => [styles.timeButton, pressed && styles.pressedButton]}>
            <Text style={styles.timeButtonText}>{time ? formatTime(time) : 'Saat seç'}</Text>
          </Pressable>
           {time && <Pressable accessibilityLabel="Seçilen saati temizle" accessibilityRole="button" disabled={saving} onPress={() => setTime(null)} style={styles.clearTimeButton}><Text style={styles.clearTimeText}>Temizle</Text></Pressable>}
        </View>
        {picker && (
          <DateTimePicker
            mode={picker}
            onDismiss={() => setPicker(null)}
            onValueChange={(_event, selected) => {
              const pickerType = picker;
              setPicker(null);
               if (!selected) return;
               if (pickerType === 'date') setDate(toDateKey(selected));
               else setTime(selected);
            }}
            value={picker === 'date' ? dateFromKey(date) : time ?? new Date()}
          />
        )}

        <Text style={styles.fieldLabel}>Etiket</Text>
        <View style={styles.tagList}>
          {TODO_TAGS.map((item) => (
             <Pressable accessibilityLabel={`${TODO_TAG_LABELS[item]} etiketini seç`} accessibilityRole="radio" accessibilityState={{ selected: tag === item }} disabled={saving} key={item} onPress={() => setTag(item)} style={[styles.tagButton, tag === item && styles.selectedTagButton]}>
              <Text style={[styles.tagIcon, tag === item && styles.selectedTagText]}>{TODO_TAG_ICONS[item]}</Text>
              <Text style={[styles.tagText, tag === item && styles.selectedTagText]}>{TODO_TAG_LABELS[item]}</Text>
            </Pressable>
          ))}
        </View>

        {!!error && <Text style={styles.errorText}>{error}</Text>}
        <View style={styles.editorActions}>
           <Pressable accessibilityLabel="Görevi sil" accessibilityRole="button" disabled={saving} onPress={confirmDelete} style={styles.deleteButton}><Text style={styles.deleteText}>Sil</Text></Pressable>
           <Pressable accessibilityLabel="Görev değişikliklerini kaydet" accessibilityRole="button" disabled={saving} onPress={handleSubmit} style={({ pressed }) => [styles.submitButton, styles.saveButton, pressed && styles.submitPressed, saving && styles.disabledButton]}>
            {saving ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.submitText}>Kaydet</Text>}
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
