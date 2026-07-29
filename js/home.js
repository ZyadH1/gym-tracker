import { getState, getActiveDay, currentStreak, workoutsInLastDays } from "./state.js";
import { formatDate, showView } from "./ui-kit.js";
import { startSession } from "./workout.js";

function groupedRecentSessions(logs, limit) {
  const byDate = new Map();
  logs.forEach((l) => {
    if (!byDate.has(l.date)) byDate.set(l.date, []);
    byDate.get(l.date).push(l);
  });
  return [...byDate.entries()]
    .sort((a, b) => (a[0] < b[0] ? 1 : -1))
    .slice(0, limit)
    .map(([date, entries]) => ({
      date,
      dayName: entries[0].dayName,
      done: entries.filter((e) => !e.skipped).length,
      total: entries.length,
    }));
}

export function renderHome() {
  const state = getState();
  const container = document.getElementById("home-content");
  document.getElementById("home-date").textContent = new Date().toLocaleDateString(undefined, {
    weekday: "long", month: "long", day: "numeric",
  });

  if (!state.days.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding-top:64px;">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        </div>
        <h3>No schedule yet</h3>
        <p>Set up a split — pick a preset or build your own — so your workouts show up here.</p>
        <button class="btn btn-primary" id="home-setup-btn">Set up schedule</button>
      </div>`;
    document.getElementById("home-setup-btn").onclick = () => showView("schedule-view");
    return;
  }

  const day = getActiveDay();
  const streak = currentStreak();
  const thisWeek = workoutsInLastDays(7);
  const recent = groupedRecentSessions(state.logs, 3);

  container.innerHTML = `
    <div class="hero-card">
      <div class="eyebrow">Up next</div>
      <h2>${day.name}</h2>
      <div class="meta">${day.exercises.length} exercise${day.exercises.length === 1 ? "" : "s"}</div>
      <button class="btn btn-primary btn-block btn-lg" id="start-workout-btn" ${day.exercises.length ? "" : "disabled"}>
        Start Workout
      </button>
    </div>
    <div class="stat-row">
      <div class="stat-chip">
        <div class="value">${streak}</div>
        <div class="label">Day streak</div>
      </div>
      <div class="stat-chip">
        <div class="value">${thisWeek}</div>
        <div class="label">This week</div>
      </div>
    </div>
    ${recent.length ? `
      <div class="section-title">Recent activity</div>
      <div class="summary-list">
        ${recent.map((r) => `
          <div class="summary-row">
            <div>
              <div class="name">${r.dayName}</div>
              <div class="detail">${formatDate(r.date)}</div>
            </div>
            <span class="badge">${r.done}/${r.total} logged</span>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;

  const startBtn = document.getElementById("start-workout-btn");
  if (startBtn) startBtn.onclick = () => startSession(day);
}
