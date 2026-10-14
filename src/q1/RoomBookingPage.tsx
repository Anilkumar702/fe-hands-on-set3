import { useEffect, useMemo, useReducer, useState, type FormEvent } from 'react';
import { AlarmClock, ArrowRight, Check, CircleHelp, Clock3, DoorOpen, Hourglass, Plus, Users, X } from 'lucide-react';
import { createId, initialQueueState, parseQueueState, queueReducer, type MeetingRequest } from './queue';

const STORAGE_KEY = 'roomly.queue.v1';

function readStoredQueue() {
  try { return parseQueueState(window.localStorage.getItem(STORAGE_KEY)); }
  catch { return initialQueueState; }
}

function formatElapsed(startedAt: number, now: number) {
  const elapsed = Math.max(0, Math.floor((now - startedAt) / 60_000));
  return `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`;
}

function formatClock(timestamp: number) {
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' }).format(timestamp);
}

export function RoomBookingPage() {
  const [state, dispatch] = useReducer(queueReducer, undefined, readStoredQueue);
  const [now, setNow] = useState(Date.now());
  const [name, setName] = useState('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
    catch { /* The in-memory queue still works when storage is unavailable. */ }
  }, [state]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const estimatedWait = useMemo(() => {
    const activeRemaining = state.current
      ? Math.max(0, state.current.durationMinutes - Math.floor((now - state.current.startedAt) / 60_000)) : 0;
    return activeRemaining + state.waiting.reduce((total, item) => total + item.durationMinutes, 0);
  }, [now, state]);

  function joinQueue(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanName = name.trim();
    const cleanPurpose = purpose.trim();
    if (!cleanName || !cleanPurpose) {
      setError('Add your name and what you need the room for.');
      return;
    }
    const request: MeetingRequest = {
      id: createId(), name: cleanName, purpose: cleanPurpose,
      durationMinutes: duration, joinedAt: Date.now(),
    };
    dispatch({ type: 'join', request, now: Date.now() });
    setName('');
    setPurpose('');
    setError('');
  }

  return (
    <div className="booking-page">
      <div className="page-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> QUESTION 01 <span className="eyebrow-dot">·</span> ROOM BOOKING</div>
          <h1>A room for every<br /><span>good conversation.</span></h1>
          <p className="page-intro">One room, one line. Join the queue and we’ll make sure everyone gets a fair turn.</p>
        </div>
        <div className="heading-stats">
          <div className="stat-label">YOUR PLACE IN LINE</div>
          <div className="stat-number">{state.waiting.length + (state.current ? 1 : 0)}<span> people</span></div>
          <div className="stat-note"><Clock3 size={13} /> ~{estimatedWait} min until you’re free</div>
        </div>
      </div>

      <div className="booking-grid">
        <section className="card queue-card" aria-labelledby="queue-title">
          <div className="section-heading">
            <div><span className="section-kicker">LIVE ROOM STATUS</span><h2 id="queue-title">The queue</h2></div>
            <span className={state.current ? 'live-pill busy' : 'live-pill free'}><span className="status-dot" />{state.current ? 'IN SESSION' : 'ROOM FREE'}</span>
          </div>

          {state.current ? (
            <div className="current-session">
              <div className="session-topline"><span className="session-label"><span className="pulse-dot" /> HAPPENING NOW</span><span className="session-started">Started {formatClock(state.current.startedAt)}</span></div>
              <div className="current-person"><div className="avatar avatar-violet">{state.current.name.charAt(0).toUpperCase()}</div><div className="person-copy"><strong>{state.current.name}</strong><span>{state.current.purpose}</span></div><div className="elapsed"><span>{formatElapsed(state.current.startedAt, now)}</span><small>ELAPSED</small></div></div>
              <div className="session-bottom"><span><AlarmClock size={14} /> {state.current.durationMinutes} min planned</span><button className="finish-button" onClick={() => dispatch({ type: 'finish', now: Date.now() })}>End meeting <Check size={14} /></button></div>
            </div>
          ) : (
            <div className="room-free"><div className="free-icon"><DoorOpen size={21} /></div><div><strong>The room is open</strong><span>Be the first to claim a spot.</span></div></div>
          )}

          <div className="queue-divider"><span>UP NEXT</span><span>{state.waiting.length} {state.waiting.length === 1 ? 'person' : 'people'} waiting</span></div>
          {state.waiting.length ? (
            <ol className="waiting-list">
              {state.waiting.map((person, index) => (
                <li className="waiting-row" key={person.id}>
                  <span className="queue-position">{String(index + 1).padStart(2, '0')}</span>
                  <div className="avatar avatar-sand">{person.name.charAt(0).toUpperCase()}</div>
                  <div className="person-copy"><strong>{person.name}</strong><span>{person.purpose}</span></div>
                  <span className="waiting-duration"><Hourglass size={13} /> {person.durationMinutes}m</span>
                  <button className="icon-button remove-button" aria-label={`Remove ${person.name} from queue`} onClick={() => dispatch({ type: 'cancel', id: person.id })}><X size={15} /></button>
                </li>
              ))}
            </ol>
          ) : (
            <div className="queue-empty"><Users size={18} /><span>It’s quiet in here. The next meeting starts the moment someone joins.</span></div>
          )}

          {state.completed.length > 0 && <div className="recent-activity"><span className="section-kicker">RECENTLY WRAPPED</span>{state.completed.slice(0, 2).map((meeting) => <div className="history-row" key={`${meeting.id}-${meeting.endedAt}`}><span className="history-check"><Check size={12} /></span><span><strong>{meeting.name}</strong> finished at {formatClock(meeting.endedAt)}</span></div>)}</div>}
        </section>

        <aside className="join-column">
          <section className="card join-card" aria-labelledby="join-title">
            <div className="join-heading"><div className="join-icon"><Plus size={19} /></div><span className="section-kicker">YOUR TURN STARTS HERE</span></div>
            <h2 id="join-title">Join the queue</h2>
            <p className="card-description">We’ll hold your place. When the room clears, you’re next.</p>
            <form onSubmit={joinQueue} noValidate>
              <label className="field-label" htmlFor="name">YOUR NAME</label>
              <input id="name" value={name} onChange={(event) => setName(event.target.value)} maxLength={48} placeholder="e.g. Alex Morgan" autoComplete="name" />
              <label className="field-label" htmlFor="purpose">WHAT’S THE MEETING FOR?</label>
              <input id="purpose" value={purpose} onChange={(event) => setPurpose(event.target.value)} maxLength={80} placeholder="e.g. Project kick-off" />
              <label className="field-label" htmlFor="duration">HOW LONG DO YOU NEED?</label>
              <div className="duration-options" id="duration">
                {[15, 30, 45, 60].map((minutes) => <button type="button" key={minutes} className={duration === minutes ? 'duration-option selected' : 'duration-option'} aria-pressed={duration === minutes} onClick={() => setDuration(minutes)}>{minutes}<small>min</small></button>)}
              </div>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="primary-button" type="submit">{state.current ? 'Take my place' : 'Start my meeting'} <ArrowRight size={16} /></button>
            </form>
            <div className="fairness-note"><CircleHelp size={15} /><span>First come, first served. Joining the queue won’t interrupt the person in the room.</span></div>
          </section>
          <div className="queue-tip"><span className="tip-mark">✳</span><p><strong>A little room etiquette</strong><br />Keep meetings focused so everyone gets their time.</p></div>
        </aside>
      </div>
    </div>
  );
}
