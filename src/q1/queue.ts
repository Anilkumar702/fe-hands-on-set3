export interface MeetingRequest {
  id: string;
  name: string;
  purpose: string;
  durationMinutes: number;
  joinedAt: number;
}

export interface ActiveMeeting extends MeetingRequest {
  startedAt: number;
}

export interface CompletedMeeting extends MeetingRequest {
  startedAt: number;
  endedAt: number;
}

export interface QueueState {
  current: ActiveMeeting | null;
  waiting: MeetingRequest[];
  completed: CompletedMeeting[];
}

export type QueueAction =
  | { type: 'join'; request: MeetingRequest; now: number }
  | { type: 'finish'; now: number }
  | { type: 'cancel'; id: string };

export const initialQueueState: QueueState = { current: null, waiting: [], completed: [] };

export function queueReducer(state: QueueState, action: QueueAction): QueueState {
  switch (action.type) {
    case 'join': {
      if (state.current?.id === action.request.id || state.waiting.some(({ id }) => id === action.request.id)) return state;
      if (!state.current) return { ...state, current: { ...action.request, startedAt: action.now } };
      return { ...state, waiting: [...state.waiting, action.request] };
    }
    case 'finish': {
      if (!state.current) return state;
      const completed = [...state.completed, { ...state.current, endedAt: action.now }].slice(-5).reverse();
      const [next, ...waiting] = state.waiting;
      return {
        current: next ? { ...next, startedAt: action.now } : null,
        waiting,
        completed,
      };
    }
    case 'cancel':
      return { ...state, waiting: state.waiting.filter(({ id }) => id !== action.id) };
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value !== null;

function isRequest(value: unknown): value is MeetingRequest {
  if (!isRecord(value)) return false;
  return typeof value.id === 'string' && typeof value.name === 'string' && typeof value.purpose === 'string'
    && typeof value.durationMinutes === 'number' && typeof value.joinedAt === 'number';
}

function isActiveMeeting(value: unknown): value is ActiveMeeting {
  return isRequest(value) && isRecord(value) && typeof value.startedAt === 'number';
}

function isCompletedMeeting(value: unknown): value is CompletedMeeting {
  return isRequest(value) && isRecord(value) && typeof value.startedAt === 'number' && typeof value.endedAt === 'number';
}

export function parseQueueState(raw: string | null): QueueState {
  if (!raw) return initialQueueState;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!isRecord(parsed)) return initialQueueState;
    const current = isActiveMeeting(parsed.current) ? parsed.current : null;
    const waiting = Array.isArray(parsed.waiting) ? parsed.waiting.filter(isRequest) : [];
    const completed = Array.isArray(parsed.completed) ? parsed.completed.filter(isCompletedMeeting) : [];
    return { current, waiting, completed: completed.slice(0, 5) };
  } catch {
    return initialQueueState;
  }
}

export function createId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
