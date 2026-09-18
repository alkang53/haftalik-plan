import type { Todo } from '../types/todo';

export function replaceTodo(todos: Todo[], nextTodo: Todo) {
  return todos.map((todo) => (todo.id === nextTodo.id ? nextTodo : todo));
}

export function sortTodos(todos: Todo[]) {
  const hasManualOrder = todos.some((todo) => todo.manualOrder);
  return [...todos].sort((first, second) => {
    if (hasManualOrder) return first.order - second.order;
    if (first.time === null) return 1;
    if (second.time === null) return -1;
    return first.time.localeCompare(second.time) || first.order - second.order;
  });
}
