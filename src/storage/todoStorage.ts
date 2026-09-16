import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  TODO_TAGS,
  type NewTodo,
  type Todo,
  type TodoChanges,
  type TodoTag,
} from '../types/todo';

export const TODOS_STORAGE_KEY = '@haftalik-plan/todos';

const isTodoTag = (value: unknown): value is TodoTag =>
  typeof value === 'string' && TODO_TAGS.includes(value as TodoTag);

const isTodo = (value: unknown): value is Todo => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const todo = value as Record<string, unknown>;
  return (
    typeof todo.id === 'string' &&
    todo.id.length > 0 &&
    typeof todo.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(todo.date) &&
    typeof todo.title === 'string' &&
    todo.title.trim().length > 0 &&
    (todo.time === null ||
      (typeof todo.time === 'string' && /^\d{2}:\d{2}$/.test(todo.time))) &&
    isTodoTag(todo.tag) &&
    typeof todo.completed === 'boolean' &&
    typeof todo.order === 'number' &&
    Number.isFinite(todo.order)
  );
};

const readTodos = async (): Promise<Todo[]> => {
  try {
    const serializedTodos = await AsyncStorage.getItem(TODOS_STORAGE_KEY);
    if (!serializedTodos) {
      return [];
    }

    const parsedTodos: unknown = JSON.parse(serializedTodos);
    return Array.isArray(parsedTodos) ? parsedTodos.filter(isTodo) : [];
  } catch {
    return [];
  }
};

const writeTodos = async (todos: Todo[]) => {
  await AsyncStorage.setItem(TODOS_STORAGE_KEY, JSON.stringify(todos));
};

const createTodoId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

export const loadTodos = readTodos;

export const addTodo = async (input: NewTodo): Promise<Todo> => {
  const title = input.title.trim();
  if (!title) {
    throw new Error('Todo basligi bos olamaz.');
  }

  const todos = await readTodos();
  const todo: Todo = {
    ...input,
    id: createTodoId(),
    title,
    order: input.order ?? todos.filter(({ date }) => date === input.date).length,
  };

  await writeTodos([...todos, todo]);
  return todo;
};

export const updateTodo = async (
  id: string,
  changes: TodoChanges,
): Promise<Todo | null> => {
  const todos = await readTodos();
  const index = todos.findIndex((todo) => todo.id === id);
  if (index === -1) {
    return null;
  }

  const nextTodo = {
    ...todos[index],
    ...changes,
    ...(changes.title === undefined ? {} : { title: changes.title.trim() }),
  };

  if (!isTodo(nextTodo)) {
    throw new Error('Gecersiz todo verisi.');
  }

  const updatedTodos = [...todos];
  updatedTodos[index] = nextTodo;
  await writeTodos(updatedTodos);
  return nextTodo;
};

export const deleteTodo = async (id: string): Promise<void> => {
  const todos = await readTodos();
  await writeTodos(todos.filter((todo) => todo.id !== id));
};

export const reorderTodos = async (orderedIds: string[]): Promise<Todo[]> => {
  const todos = await readTodos();
  const idSet = new Set(orderedIds);
  const knownIds = new Set(todos.map(({ id }) => id));

  if (idSet.size !== orderedIds.length || orderedIds.some((id) => !knownIds.has(id))) {
    throw new Error('Gecersiz todo siralamasi.');
  }

  const orderById = new Map(orderedIds.map((id, index) => [id, index]));
  const reorderedTodos = todos.map((todo) =>
    orderById.has(todo.id) ? { ...todo, order: orderById.get(todo.id)! } : todo,
  );

  await writeTodos(reorderedTodos);
  return reorderedTodos;
};
