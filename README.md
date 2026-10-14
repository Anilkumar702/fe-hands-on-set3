# Roomly

A React + TypeScript meeting room booking app with two question routes.

## Run locally

```sh
npm install
npm run dev
```

## Checks

```sh
npm test
npm run lint
npm run build
```

## Routes

- `/q1-room-booking` — choose a room and date, review bookings, create a meeting with attendees, or cancel a booking. Room and date are kept in the URL.
- `/q2-find-a-time` — enter attendees and a meeting length, inspect busy schedules and shared free slots, and book a slot in a room with sufficient capacity.

The app uses an in-memory mock API with simulated latency and booking failures. Free-slot calculation is a standalone pure function in `src/q2/freeSlots.ts`.
