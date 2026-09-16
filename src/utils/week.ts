export type WeekRange = {
  monday: Date;
  sunday: Date;
};

const atLocalNoon = (date: Date) => {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  return result;
};

export const getMonday = (date: Date = new Date()): Date => {
  const monday = atLocalNoon(date);
  const day = monday.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  monday.setDate(monday.getDate() + mondayOffset);
  return monday;
};

export const getWeek = (date: Date = new Date()): WeekRange => {
  const monday = getMonday(date);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
};

export const addWeeks = (date: Date, amount: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + amount * 7);
  return result;
};

export const toDateKey = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getWeekDates = (monday: Date): Date[] =>
  Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
