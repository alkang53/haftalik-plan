import { useRef, useState } from 'react';
import { Animated, PanResponder, Pressable, Text, View } from 'react-native';

import { styles } from '../styles/appStyles';
import { TODO_TAG_ICONS, type Todo } from '../types/todo';

export type TodoRowLayout = { y: number; height: number };

type Props = {
  todo: Todo;
  onEdit: () => void;
  onToggle: () => void;
  onLayout: (layout: TodoRowLayout) => void;
  onDrop: () => void;
  onDragStart: () => void;
  onDragMove: (dy: number, moveY: number) => number;
  onDragEnd: () => void;
};

export function DraggableTodoRow({
  todo,
  onEdit,
  onToggle,
  onLayout,
  onDrop,
  onDragStart,
  onDragMove,
  onDragEnd,
}: Props) {
  const [dragging, setDragging] = useState(false);
  const translation = useRef(new Animated.ValueXY()).current;
  const dragHandlers = useRef({ onDrop, onDragStart, onDragMove, onDragEnd });
  dragHandlers.current = { onDrop, onDragStart, onDragMove, onDragEnd };
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_event, gesture) =>
        Math.abs(gesture.dy) > 8 || Math.abs(gesture.dx) > 8,
      onPanResponderGrant: () => {
        setDragging(true);
        dragHandlers.current.onDragStart();
      },
      onPanResponderMove: (_event, gesture) => {
        const scrollCompensation = dragHandlers.current.onDragMove(gesture.dy, gesture.moveY);
        translation.setValue({ x: 0, y: gesture.dy + scrollCompensation });
      },
      onPanResponderRelease: () => {
        setDragging(false);
        dragHandlers.current.onDrop();
        dragHandlers.current.onDragEnd();
        Animated.spring(translation, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
      onPanResponderTerminate: () => {
        setDragging(false);
        dragHandlers.current.onDragEnd();
        Animated.spring(translation, { toValue: { x: 0, y: 0 }, useNativeDriver: true }).start();
      },
    }),
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      onLayout={(event) => onLayout({
        y: event.nativeEvent.layout.y,
        height: event.nativeEvent.layout.height,
      })}
      style={[
        styles.draggableTodo,
        dragging && styles.draggingTodo,
        { transform: [...translation.getTranslateTransform(), { scale: dragging ? 1.015 : 1 }] },
      ]}
    >
      <Pressable
         accessibilityLabel={`${todo.title} görevini düzenle`}
         accessibilityHint="Düzenlemek için dokunun, taşımak için basılı tutup sürükleyin"
        accessibilityRole="button"
        onPress={onEdit}
        style={({ pressed }) => [styles.todoRow, todo.completed && styles.completedTodoRow, pressed && styles.pressedTodoRow]}
      >
        <Pressable
          accessibilityLabel={todo.completed ? `${todo.title} tamamlanmadı olarak işaretle` : `${todo.title} tamamlandı olarak işaretle`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: todo.completed }}
          onPress={onToggle}
          style={styles.todoToggle}
        >
          <View style={[styles.checkbox, todo.completed && styles.checkedBox]}>
            {todo.completed && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.todoTagIcon}>{TODO_TAG_ICONS[todo.tag]}</Text>
        </Pressable>
        {todo.time && <Text style={[styles.todoTime, todo.completed && styles.completedText]}>{todo.time}</Text>}
         <Text numberOfLines={3} style={[styles.todoTitle, todo.completed && styles.completedText]}>{todo.title}</Text>
      </Pressable>
    </Animated.View>
  );
}
