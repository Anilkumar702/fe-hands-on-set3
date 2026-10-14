# Roomly

Roomly is a two-question React + TypeScript exercise. The base app provides a route and test harness for each question; feature work lands independently on `feature/q1-room-booking` and `feature/q2-find-a-time`.

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

- `/q1-room-booking` — the first request gets the room; later requests wait in order, can cancel while waiting, and are promoted when a meeting ends. Queue state persists in local storage.
- `/q2-find-a-time` — free meeting slots question.

No calendar, scheduler, or timeline library performs the question logic.

## Delivery plan

1. Create the strict React + TypeScript foundation, linting, routing, and test runner on `main`.
2. Branch `feature/q1-room-booking` from `main`; implement and test queue invariants, review the diff, then open and merge its PR.
3. Pull the updated `main`, branch `feature/q2-find-a-time`, implement and test interval normalization and free-slot search, review the diff, then open and merge its PR.
