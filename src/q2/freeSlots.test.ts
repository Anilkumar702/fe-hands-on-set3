import { describe, expect, it } from 'vitest';
import { findFreeSlots } from './freeSlots';

describe('findFreeSlots', () => {
  it('returns the acceptance case and merges nested, overlapping, unsorted bookings', () => {
    expect(findFreeSlots([{ start: '13:15', end: '13:45' }, { start: '10:00', end: '11:00' }, { start: '09:30', end: '10:30' }, { start: '13:00', end: '14:00' }], 30)).toEqual([{ start: '09:00', end: '09:30' }, { start: '11:00', end: '13:00' }, { start: '14:00', end: '18:00' }]);
    expect(findFreeSlots([{ start: '10:00', end: '12:00' }, { start: '10:30', end: '11:00' }], 30)).toContainEqual({ start: '09:00', end: '10:00' });
  });
  it('handles an empty day, a full day, and a gap exactly D long', () => {
    expect(findFreeSlots([], 30)).toEqual([{ start: '09:00', end: '18:00' }]);
    expect(findFreeSlots([{ start: '09:00', end: '18:00' }], 30)).toEqual([]);
    expect(findFreeSlots([{ start: '09:00', end: '10:00' }, { start: '10:30', end: '18:00' }], 30)).toEqual([{ start: '10:00', end: '10:30' }]);
  });
});
