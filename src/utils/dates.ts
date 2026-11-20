import { format, formatDistanceToNow, isToday, isTomorrow, isPast, isFuture, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export function formatDate(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy', { locale: fr });
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), 'dd MMM yyyy à HH:mm', { locale: fr });
}

export function formatTime(iso: string): string {
  return format(new Date(iso), 'HH:mm', { locale: fr });
}

export function formatRelative(iso: string): string {
  return formatDistanceToNow(new Date(iso), { addSuffix: true, locale: fr });
}

export function isDateToday(iso: string): boolean {
  return isToday(new Date(iso));
}

export function isDateTomorrow(iso: string): boolean {
  return isTomorrow(new Date(iso));
}

export function isDatePast(iso: string): boolean {
  return isPast(new Date(iso));
}

export function isDateFuture(iso: string): boolean {
  return isFuture(new Date(iso));
}

export function isSameDayDate(a: string, b: string): boolean {
  return isSameDay(new Date(a), new Date(b));
}

export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

export function getMonthDays(year: number, month: number): (Date | null)[] {
  const start = startOfMonth(new Date(year, month));
  const end = endOfMonth(new Date(year, month));
  const days = eachDayOfInterval({ start, end });

  const startDay = getDay(start); // 0 = Sunday
  const padding: null[] = new Array(startDay).fill(null);

  return [...padding, ...days];
}

export { format, addMonths, subMonths, startOfMonth, endOfMonth };