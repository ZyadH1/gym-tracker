const STORAGE_KEY = "ironlog.v1";

function uid() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 9);
}

function localDateKey(input) {
  const d = typeof input === "string" ? new Date(input) : input;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function defaultState() {
  return {
    days: [],           // [{ id, name, exercises: [{ id, name }] }]
    currentDayIndex: 0,
    logs: [],           // [{ id, date, dayId, dayName, exerciseId, exerciseName, weight, sets, skipped }]
    customExercises: [], // [{ id, name }] — user-added, reusable across days
    unit: "kg",
  };
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return { ...defaultState(), ...parsed };
  } catch {
    return defaultState();
  }
}

let state = load();
const listeners = new Set();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function notify() {
  persist();
  listeners.forEach((fn) => fn(state));
}

export function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getState() {
  return state;
}

export function getActiveDay() {
  if (!state.days.length) return null;
  const idx = state.currentDayIndex % state.days.length;
  return state.days[idx];
}

// ---- Schedule mutation ----

export function applyPreset(preset) {
  state.days = preset.days.map((d) => ({
    id: uid(),
    name: d.name,
    exercises: d.exercises.map((name) => ({ id: uid(), name })),
  }));
  state.currentDayIndex = 0;
  notify();
}

export function addDay(name) {
  state.days.push({ id: uid(), name: name || "New Day", exercises: [] });
  notify();
}

export function renameDay(dayId, name) {
  const day = state.days.find((d) => d.id === dayId);
  if (day) day.name = name;
  notify();
}

export function deleteDay(dayId) {
  const idx = state.days.findIndex((d) => d.id === dayId);
  if (idx === -1) return;
  state.days.splice(idx, 1);
  if (state.currentDayIndex >= state.days.length) state.currentDayIndex = 0;
  notify();
}

export function moveDay(dayId, delta) {
  const idx = state.days.findIndex((d) => d.id === dayId);
  const target = idx + delta;
  if (idx === -1 || target < 0 || target >= state.days.length) return;
  const [day] = state.days.splice(idx, 1);
  state.days.splice(target, 0, day);
  notify();
}

/** Returns false if the day already has that exercise (a double-tap, say). */
export function addExercise(dayId, name) {
  const day = state.days.find((d) => d.id === dayId);
  const clean = (name || "").trim();
  if (!day || !clean) return false;
  if (day.exercises.some((e) => e.name.toLowerCase() === clean.toLowerCase())) return false;
  day.exercises.push({ id: uid(), name: clean });
  notify();
  return true;
}

export function renameExercise(dayId, exerciseId, name) {
  const day = state.days.find((d) => d.id === dayId);
  const ex = day && day.exercises.find((e) => e.id === exerciseId);
  if (ex && name.trim()) ex.name = name.trim();
  notify();
}

export function removeExercise(dayId, exerciseId) {
  const day = state.days.find((d) => d.id === dayId);
  if (!day) return;
  day.exercises = day.exercises.filter((e) => e.id !== exerciseId);
  notify();
}

export function moveExercise(dayId, exerciseId, delta) {
  const day = state.days.find((d) => d.id === dayId);
  if (!day) return;
  const idx = day.exercises.findIndex((e) => e.id === exerciseId);
  const target = idx + delta;
  if (idx === -1 || target < 0 || target >= day.exercises.length) return;
  const [ex] = day.exercises.splice(idx, 1);
  day.exercises.splice(target, 0, ex);
  notify();
}

// ---- Logging ----

export function saveSessionLogs(entries, completedDayId) {
  const now = new Date().toISOString();
  entries.forEach((e) => {
    state.logs.push({ id: uid(), date: now, ...e });
  });
  // Advance the rotation relative to the day actually trained, so starting
  // mid-split (e.g. jumping straight to Pull) keeps "up next" correct.
  if (state.days.length) {
    const doneIdx = state.days.findIndex((d) => d.id === completedDayId);
    const from = doneIdx === -1 ? state.currentDayIndex : doneIdx;
    state.currentDayIndex = (from + 1) % state.days.length;
  }
  notify();
}

export function deleteLog(logId) {
  state.logs = state.logs.filter((l) => l.id !== logId);
  notify();
}

/** Edit a past entry's numbers, or flip it to/from skipped. */
export function updateLog(logId, { weight, sets, skipped }) {
  const log = state.logs.find((l) => l.id === logId);
  if (!log) return;
  if (skipped) {
    log.skipped = true;
    log.weight = null;
    log.sets = null;
  } else {
    log.skipped = false;
    log.weight = weight;
    log.sets = sets;
  }
  notify();
}

/** All entries of one logged session share a timestamp — that's the session key. */
export function deleteSession(dateKey) {
  state.logs = state.logs.filter((l) => l.date !== dateKey);
  notify();
}

/** Sessions grouped for the log view, newest first. */
export function sessionHistory() {
  const byDate = new Map();
  state.logs.forEach((l) => {
    if (!byDate.has(l.date)) byDate.set(l.date, []);
    byDate.get(l.date).push(l);
  });
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .map(([date, entries]) => ({
      date,
      dayName: entries[0].dayName,
      dayId: entries[0].dayId,
      entries,
      done: entries.filter((e) => !e.skipped).length,
      total: entries.length,
    }));
}

/**
 * Back-fill a workout onto a past date. Deliberately does NOT touch
 * currentDayIndex — logging an old session must not change what's up next.
 */
export function addPastSession({ dateISO, dayId, dayName, entries }) {
  entries.forEach((e) => {
    state.logs.push({ id: uid(), date: dateISO, dayId, dayName, ...e });
  });
  notify();
}

// ---- Custom exercise library ----

export function addCustomExercise(name) {
  const clean = name.trim();
  if (!clean) return;
  const exists = state.customExercises.some(
    (e) => e.name.toLowerCase() === clean.toLowerCase()
  );
  if (!exists) state.customExercises.push({ id: uid(), name: clean });
  notify();
}

export function removeCustomExercise(id) {
  state.customExercises = state.customExercises.filter((e) => e.id !== id);
  notify();
}

export function customExerciseNames() {
  return state.customExercises.map((e) => e.name);
}

// ---- Settings / stats helpers ----

export function setUnit(unit) {
  state.unit = unit;
  notify();
}

export function distinctExerciseNames() {
  const names = new Set();
  state.days.forEach((d) => d.exercises.forEach((e) => names.add(e.name)));
  state.logs.forEach((l) => names.add(l.exerciseName));
  return [...names].sort((a, b) => a.localeCompare(b));
}

export function logsForExercise(name) {
  return state.logs
    .filter((l) => l.exerciseName === name && !l.skipped)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

export function personalRecords() {
  const best = new Map();
  state.logs.forEach((l) => {
    if (l.skipped) return;
    const current = best.get(l.exerciseName);
    if (!current || l.weight > current.weight) best.set(l.exerciseName, l);
  });
  return [...best.values()].sort((a, b) => b.weight - a.weight);
}

export function workoutsInLastDays(days) {
  const cutoff = Date.now() - days * 86400000;
  const dates = new Set(
    state.logs
      .filter((l) => !l.skipped && new Date(l.date).getTime() >= cutoff)
      .map((l) => localDateKey(l.date))
  );
  return dates.size;
}

/** Most recent training date per day id, for labelling the day picker. */
export function lastPerformedByDay() {
  const map = new Map();
  state.logs.forEach((l) => {
    if (l.skipped) return;
    const prev = map.get(l.dayId);
    if (!prev || l.date > prev) map.set(l.dayId, l.date);
  });
  return map;
}

export function lastWorkoutDate() {
  if (!state.logs.length) return null;
  return state.logs.reduce((max, l) => (l.date > max ? l.date : max), state.logs[0].date);
}

export function currentStreak() {
  const dateSet = new Set(state.logs.filter((l) => !l.skipped).map((l) => localDateKey(l.date)));
  const cursor = new Date();
  if (!dateSet.has(localDateKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  let streak = 0;
  for (;;) {
    if (!dateSet.has(localDateKey(cursor))) break;
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

// ---- Backup ----

export function exportJSON() {
  return JSON.stringify(state, null, 2);
}

export function importJSON(json) {
  const parsed = JSON.parse(json);
  if (!parsed || !Array.isArray(parsed.days) || !Array.isArray(parsed.logs)) {
    throw new Error("That file doesn't look like an IronLog backup.");
  }
  state = { ...defaultState(), ...parsed };
  notify();
}

export function resetAll() {
  state = defaultState();
  notify();
}

export { uid };
