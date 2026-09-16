export const TODO_TAGS = [
  'meeting',
  'work',
  'privateLife',
  'health',
  'personal',
  'other',
] as const;

export type TodoTag = (typeof TODO_TAGS)[number];

export const TODO_TAG_LABELS: Record<TodoTag, string> = {
  meeting: 'Toplantı',
  work: 'İş',
  privateLife: 'Özel Hayat',
  health: 'Sağlık',
  personal: 'Kişisel',
  other: 'Diğer',
};

export const DEFAULT_TODO_TAG: TodoTag = 'other';

export type Todo = {
  id: string;
  date: string;
  title: string;
  time: string | null;
  tag: TodoTag;
  completed: boolean;
  order: number;
};

export type NewTodo = Omit<Todo, 'id' | 'order'> & { order?: number };
export type TodoChanges = Partial<Omit<Todo, 'id'>>;
