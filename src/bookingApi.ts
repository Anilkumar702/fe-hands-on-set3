export type Booking = { id: string; roomId: string; date: string; title: string; start: string; end: string; attendees: string[] };
export type Room = { id: string; name: string; capacity: number };
const rooms: Room[] = [{ id: 'cedar', name: 'Cedar', capacity: 4 }, { id: 'maple', name: 'Maple', capacity: 8 }, { id: 'oak', name: 'Oak', capacity: 12 }];
const today = new Date().toISOString().slice(0, 10);
let bookings: Booking[] = [
  { id: 'b1', roomId: 'cedar', date: today, title: 'Product sync', start: '10:00', end: '11:00', attendees: ['alex@example.com'] },
  { id: 'b2', roomId: 'maple', date: today, title: 'Design review', start: '13:00', end: '14:00', attendees: ['sam@example.com'] },
];
const delay = () => new Promise<void>((resolve) => window.setTimeout(resolve, 300 + Math.random() * 500));
export class ApiError extends Error {}
export const api = {
  async rooms(): Promise<Room[]> { await delay(); return rooms; },
  async list(roomId: string, date: string): Promise<Booking[]> { await delay(); return bookings.filter((b) => b.roomId === roomId && b.date === date).sort((a, b) => a.start.localeCompare(b.start)); },
  async allForPeople(people: string[], date: string): Promise<Booking[]> { await delay(); const wanted = new Set(people.map((p) => p.toLowerCase())); return bookings.filter((b) => b.date === date && b.attendees.some((a) => wanted.has(a.toLowerCase()))); },
  async create(input: Omit<Booking, 'id'>, conflictChance = 0): Promise<Booking> { await delay(); if (Math.random() < conflictChance) throw new ApiError('Someone else booked this time. Availability has been refreshed.'); if (Math.random() < 0.1) throw new ApiError('The booking could not be saved. Please try again.'); if (bookings.some((b) => b.roomId === input.roomId && b.date === input.date && input.start < b.end && b.start < input.end)) throw new ApiError('This room was booked in the meantime.'); const result = { ...input, id: crypto.randomUUID() }; bookings = [...bookings, result]; return result; },
  async cancel(id: string): Promise<void> { await delay(); if (Math.random() < 0.1) throw new ApiError('The cancellation could not be saved.'); bookings = bookings.filter((b) => b.id !== id); },
};
