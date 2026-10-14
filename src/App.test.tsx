import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

describe('app routes', () => {
  it('provides a separate route for each question', () => {
    const { unmount } = render(<MemoryRouter initialEntries={['/q1-room-booking']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Room booking' })).toBeInTheDocument();
    unmount();
    render(<MemoryRouter initialEntries={['/q2-find-a-time']}><App /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Find a time' })).toBeInTheDocument();
  });
});
