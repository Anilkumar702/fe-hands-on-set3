export type BusyInterval = { start: string; end: string };
export type FreeSlot = { start: string; end: string };
const toMinutes = (time: string) => { const [h, m] = time.split(':').map(Number); return h * 60 + m; };
const toTime = (minutes: number) => `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`;
export function findFreeSlots(bookings: BusyInterval[], duration: number, dayStart = '09:00', dayEnd = '18:00'): FreeSlot[] {
  if (!Number.isFinite(duration) || duration <= 0) return [];
  const start = toMinutes(dayStart), end = toMinutes(dayEnd);
  const sorted = bookings.map((b) => ({ start: Math.max(start, toMinutes(b.start)), end: Math.min(end, toMinutes(b.end)) })).filter((b) => b.start < b.end).sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: { start: number; end: number }[] = [];
  for (const interval of sorted) { const last = merged.at(-1); if (last && interval.start <= last.end) last.end = Math.max(last.end, interval.end); else merged.push({ ...interval }); }
  const result: FreeSlot[] = []; let cursor = start;
  for (const busy of merged) { if (busy.start - cursor >= duration) result.push({ start: toTime(cursor), end: toTime(busy.start) }); cursor = Math.max(cursor, busy.end); }
  if (end - cursor >= duration) result.push({ start: toTime(cursor), end: toTime(end) });
  return result;
}
