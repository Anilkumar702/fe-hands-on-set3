import { describe, expect, it } from 'vitest';
import { initialQueueState, parseQueueState, queueReducer, type MeetingRequest } from './queue';

const request = (id: string, name = id): MeetingRequest => ({ id, name, purpose: 'Planning', durationMinutes: 30, joinedAt: 1 });

describe('queueReducer', () => {
  it('starts the first request and appends later requests in FIFO order', () => {
    const first = queueReducer(initialQueueState, { type: 'join', request: request('a'), now: 10 });
    const second = queueReducer(first, { type: 'join', request: request('b'), now: 20 });
    const third = queueReducer(second, { type: 'join', request: request('c'), now: 30 });
    expect(third.current?.id).toBe('a');
    expect(third.waiting.map(({ id }) => id)).toEqual(['b', 'c']);
  });

  it('hands the room to exactly the first waiting person when a meeting ends', () => {
    const state = { current: { ...request('a'), startedAt: 10 }, waiting: [request('b'), request('c')], completed: [] };
    const next = queueReducer(state, { type: 'finish', now: 100 });
    expect(next.current).toMatchObject({ id: 'b', startedAt: 100 });
    expect(next.waiting.map(({ id }) => id)).toEqual(['c']);
    expect(next.completed[0]).toMatchObject({ id: 'a', endedAt: 100 });
  });

  it('keeps the room empty after finishing the last meeting and safely ignores duplicate ids', () => {
    const current = queueReducer(initialQueueState, { type: 'join', request: request('a'), now: 10 });
    expect(queueReducer(current, { type: 'join', request: request('a'), now: 20 })).toBe(current);
    expect(queueReducer(current, { type: 'finish', now: 30 }).current).toBeNull();
  });

  it('removes only the cancelled waiting request', () => {
    const state = { current: { ...request('a'), startedAt: 10 }, waiting: [request('b'), request('c')], completed: [] };
    expect(queueReducer(state, { type: 'cancel', id: 'b' }).waiting.map(({ id }) => id)).toEqual(['c']);
  });
});

describe('parseQueueState', () => {
  it('recovers to an empty queue when saved data is malformed', () => {
    expect(parseQueueState('{not json')).toEqual(initialQueueState);
    expect(parseQueueState('null')).toEqual(initialQueueState);
  });
});
