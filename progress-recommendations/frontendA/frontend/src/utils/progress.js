// Pure helper functions for dates and progress numbers. No React, no network.
// Dates are plain "YYYY-MM-DD" strings (local time), so string comparison works.

export const toStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const todayStr = () => toStr(new Date());

export const parseDate = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s, n) => {
  const d = parseDate(s);
  d.setDate(d.getDate() + n);
  return toStr(d);
};

export const inRange = (entries, from, to) => entries.filter((e) => e.date >= from && e.date <= to);

// One workout entry = {date, exercise, sets, reps, weight}
export function summarize(entries) {
  return {
    sessions: new Set(entries.map((e) => e.date)).size,
    sets: entries.reduce((a, e) => a + e.sets, 0),
    reps: entries.reduce((a, e) => a + e.sets * e.reps, 0),
    volume: Math.round(entries.reduce((a, e) => a + e.sets * e.reps * e.weight, 0)),
  };
}

// Last 7 days (including today) versus the 7 days before that.
export function compareWeeks(workouts, today = todayStr()) {
  return {
    current: summarize(inRange(workouts, addDays(today, -6), today)),
    previous: summarize(inRange(workouts, addDays(today, -13), addDays(today, -7))),
  };
}

// Oldest to newest. Each item is one 7-day block, labelled with its last day (MM-DD).
export function weeklyBlocks(workouts, today = todayStr(), weeks = 6) {
  const out = [];
  for (let i = weeks - 1; i >= 0; i--) {
    const to = addDays(today, -7 * i);
    const s = summarize(inRange(workouts, addDays(to, -6), to));
    out.push({ label: to.slice(5), ...s });
  }
  return out;
}

// Returns a number (percent), or null when there is nothing to compare with.
export function percentChange(current, previous) {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 100);
}

// Best set per exercise: highest weight, then most reps.
export function personalBests(workouts) {
  const best = {};
  for (const w of workouts) {
    const b = best[w.exercise];
    if (!b || w.weight > b.weight || (w.weight === b.weight && w.reps > b.reps)) {
      best[w.exercise] = { exercise: w.exercise, weight: w.weight, reps: w.reps, date: w.date };
    }
  }
  return Object.values(best).sort((a, b) => b.weight - a.weight || b.reps - a.reps);
}
