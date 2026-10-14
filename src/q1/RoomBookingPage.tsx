import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, type Booking, type Room } from '../bookingApi';
import { useSearchParams } from 'react-router-dom';

const today = () => new Date().toISOString().slice(0, 10);
const overlaps = (start: string, end: string, item: Booking) => start < item.end && item.start < end;
export function RoomBookingPage() {
  const [params, setParams] = useSearchParams();
  const roomId = params.get('room') ?? 'cedar', date = params.get('date') ?? today();
  const [rooms, setRooms] = useState<Room[]>([]), [bookings, setBookings] = useState<Booking[]>([]), [title, setTitle] = useState(''), [start, setStart] = useState('09:00'), [end, setEnd] = useState('10:00'), [emails, setEmails] = useState<string[]>(['']), [errors, setErrors] = useState<Record<string, string>>({}), [notice, setNotice] = useState('');
  useEffect(() => { if (!params.has('room') || !params.has('date')) setParams({ room: roomId, date }, { replace: true }); }, [date, params, roomId, setParams]);
  const refresh = useCallback(async () => { setBookings(await api.list(roomId, date)); }, [roomId, date]);
  useEffect(() => { api.rooms().then(setRooms); }, []);
  useEffect(() => { refresh().catch(() => setNotice('Could not load bookings.')); }, [refresh]);
  function update(patch: Record<string, string>) { setParams({ room: patch.room ?? roomId, date: patch.date ?? date }); }
  async function submit(event: FormEvent) {
    event.preventDefault(); setNotice(''); const next: Record<string, string> = {};
    const attendeeList = emails.map((x) => x.trim());
    if (!title.trim()) next.title = 'Enter a meeting title.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || start < '09:00' || start >= '18:00') next.start = 'Choose a start between 09:00 and 18:00.';
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(end) || end <= start || end > '18:00') next.end = 'End must be after start and no later than 18:00.';
    if (end > start && end <= '18:00' && start >= '09:00' && (endToMinutes(end) - endToMinutes(start) > 240)) next.end = 'A booking can be at most 4 hours.';
    if (attendeeList.some((x) => !/^\S+@\S+\.\S+$/.test(x))) next.attendees = 'Enter a valid email for each attendee.';
    if (attendeeList.some((x, i) => attendeeList.slice(0, i).some((other) => other.toLowerCase() === x.toLowerCase()))) next.attendees = 'Attendee emails must be unique.';
    const conflicting = bookings.find((b) => overlaps(start, end, b));
    if (conflicting) next.start = `Overlaps “${conflicting.title}” (${conflicting.start}–${conflicting.end}).`;
    setErrors(next); if (Object.keys(next).length) return;
    try { await api.create({ roomId, date, title: title.trim(), start, end, attendees: attendeeList }); await refresh(); setTitle(''); setEmails(['']); setNotice('Booking created.'); }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Could not create booking.'); }
  }
  async function cancel(item: Booking) { if (!window.confirm(`Cancel “${item.title}”?`)) return; setBookings((old) => old.filter((b) => b.id !== item.id)); try { await api.cancel(item.id); setNotice('Booking cancelled.'); } catch { setBookings((old) => [...old, item].sort((a, b) => a.start.localeCompare(b.start))); setNotice('Could not cancel the booking; it has been restored.'); } }
  return <div className="booking-page"><div className="page-heading"><div><div className="eyebrow">QUESTION 01 · ROOM BOOKING</div><h1>Book a room</h1><p className="page-intro">Choose a room and date, then find a time for your meeting.</p></div></div><div className="booking-grid"><section className="card queue-card"><h2>Room schedule</h2><div className="filters"><label>Room<select value={roomId} onChange={(e) => update({ room: e.target.value })}>{rooms.map((r) => <option key={r.id} value={r.id}>{r.name} · {r.capacity} people</option>)}</select></label><label>Date<input type="date" value={date} onChange={(e) => update({ date: e.target.value })}/></label></div><ol className="schedule-list">{bookings.map((b) => <li key={b.id}><b>{b.start}–{b.end}</b><span>{b.title}</span><button onClick={() => void cancel(b)}>Cancel</button></li>)}</ol>{!bookings.length && <p>No bookings yet. The room is free from 09:00 to 18:00.</p>}</section><section className="card join-card"><h2>New booking</h2><form onSubmit={(e) => void submit(e)} noValidate><label>Title<input value={title} onChange={(e) => setTitle(e.target.value)} />{errors.title && <small className="form-error">{errors.title}</small>}</label><div className="filters"><label>Start<input type="time" step={900} value={start} onChange={(e) => setStart(e.target.value)} />{errors.start && <small className="form-error">{errors.start}</small>}</label><label>End<input type="time" step={900} value={end} onChange={(e) => setEnd(e.target.value)} />{errors.end && <small className="form-error">{errors.end}</small>}</label></div><label>Attendees{emails.map((email, i) => <div className="email-row" key={i}><input type="email" value={email} onChange={(e) => setEmails((old) => old.map((x, j) => i === j ? e.target.value : x))} placeholder="name@example.com"/><button type="button" onClick={() => setEmails((old) => old.length > 1 ? old.filter((_, j) => i !== j) : [''])} aria-label="Remove attendee">×</button></div>)}{errors.attendees && <small className="form-error">{errors.attendees}</small>}<button className="text-button" type="button" onClick={() => setEmails((old) => [...old, ''])}>+ Add attendee</button></label><button className="primary-button">Create booking</button>{notice && <p role="status">{notice}</p>}</form></section></div></div>;
}
function endToMinutes(value: string) { const [h, m] = value.split(':').map(Number); return h * 60 + m; }
