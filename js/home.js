import { getState, getActiveDay, currentStreak, workoutsInLastDays, lastPerformedByDay } from "./state.js";
import { formatDate, showView, escapeHTML } from "./ui-kit.js";
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

function relativeDay(iso) {
  const then = new Date(iso);
  const today = new Date();
  const days = Math.round((today.setHours(0, 0, 0, 0) - then.setHours(0, 0, 0, 0)) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  return formatDate(iso);
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
        <p>Pick a split — there are presets for every common program — and your workout days show up here.</p>
        <button class="btn btn-primary" id="home-setup-btn">Choose a split</button>
      </div>`;
    document.getElementById("home-setup-btn").onclick = () => showView("schedule-view");
    return;
  }

  const nextDay = getActiveDay();
  const lastByDay = lastPerformedByDay();
  const streak = currentStreak();
  const thisWeek = workoutsInLastDays(7);
  const recent = groupedRecentSessions(state.logs, 3);

  container.innerHTML = `
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

    <div class="section-title">Pick today's workout</div>
    <div class="day-grid">
      ${state.days.map((day) => {
        const isNext = nextDay && day.id === nextDay.id;
        const last = lastByDay.get(day.id);
        return `
          <button class="day-box ${isNext ? "is-next" : ""}" data-day-id="${day.id}" ${day.exercises.length ? "" : "disabled"}>
            ${isNext ? `<span class="day-box-badge">Up next</span>` : ""}
            <span class="day-box-name">${escapeHTML(day.name)}</span>
            <span class="day-box-meta">${day.exercises.length} exercise${day.exercises.length === 1 ? "" : "s"}</span>
            <span class="day-box-last">${last ? relativeDay(last) : "Not done yet"}</span>
          </button>`;
      }).join("")}
    </div>

    ${recent.length ? `
      <div class="section-title">Recent activity</div>
      <div class="summary-list">
        ${recent.map((r) => `
          <div class="summary-row">
            <div>
              <div class="name">${escapeHTML(r.dayName)}</div>
              <div class="detail">${formatDate(r.date)}</div>
            </div>
            <span class="badge">${r.done}/${r.total} logged</span>
          </div>
        `).join("")}
      </div>
    ` : ""}
  `;

  container.querySelectorAll(".day-box").forEach((box) => {
    box.addEventListener("click", () => {
      const day = getState().days.find((d) => d.id === box.dataset.dayId);
      if (day) startSession(day);
    });
  });
}
