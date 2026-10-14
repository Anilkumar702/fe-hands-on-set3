import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { RoomBookingPage } from './RoomBookingPage';

afterEach(() => {
  cleanup();
});

describe('RoomBookingPage', () => {
  it('starts the first person immediately and places the second person into the waiting line', () => {
    render(<RoomBookingPage />);
    fireEvent.change(screen.getByLabelText('YOUR NAME'), { target: { value: 'Alex' } });
    fireEvent.change(screen.getByLabelText('WHAT’S THE MEETING FOR?'), { target: { value: 'Planning' } });
    fireEvent.click(screen.getByRole('button', { name: /Start my meeting/i }));
    expect(screen.getByText('Alex')).toBeInTheDocument();
    expect(screen.getByText('HAPPENING NOW')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('YOUR NAME'), { target: { value: 'Sam' } });
    fireEvent.change(screen.getByLabelText('WHAT’S THE MEETING FOR?'), { target: { value: 'Review' } });
    fireEvent.click(screen.getByRole('button', { name: /Take my place/i }));
    expect(screen.getByText('UP NEXT')).toBeInTheDocument();
    expect(screen.getByText('Sam')).toBeInTheDocument();
  });

  it('keeps an incomplete request out of the queue', () => {
    render(<RoomBookingPage />);
    fireEvent.click(screen.getByRole('button', { name: /Start my meeting/i }));
    expect(screen.getByRole('alert')).toHaveTextContent('Add your name and what you need the room for.');
    expect(screen.getByText('The room is open')).toBeInTheDocument();
  });
});
