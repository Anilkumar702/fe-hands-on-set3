import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RoomBookingPage } from './RoomBookingPage';

afterEach(cleanup);
describe('RoomBookingPage', () => {
  it('blocks overlap while allowing a back-to-back booking', async () => {
    render(<MemoryRouter><RoomBookingPage /></MemoryRouter>);
    fireEvent.change(screen.getByLabelText('Title'), { target: { value: 'Overlap' } });
    fireEvent.change(screen.getByLabelText('Start'), { target: { value: '10:30' } });
    fireEvent.change(screen.getByLabelText('End'), { target: { value: '11:30' } });
    fireEvent.change(screen.getByPlaceholderText('name@example.com'), { target: { value: 'alex@example.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create booking' }));
    expect(await screen.findByText(/Overlaps/)).toBeInTheDocument();
  });
});
