import { getState, distinctExerciseNames, logsForExercise, personalRecords } from "./state.js";
import { renderWeightChart } from "./charts.js";
import { escapeHTML, formatDate } from "./ui-kit.js";

let selectedExercise = null;

export function renderStats() {
  const state = getState();
  const container = document.getElementById("stats-content");
  const names = distinctExerciseNames();

  if (!names.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding-top:64px;">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M12 20V4M20 20v-7"/></svg>
        </div>
        <h3>No data yet</h3>
        <p>Log a few workouts and your progress charts will show up here.</p>
      </div>`;
    return;
  }

  if (!selectedExercise || !names.includes(selectedExercise)) {
    const withLogs = names.find((n) => logsForExercise(n).length > 0);
    selectedExercise = withLogs || names[0];
  }

  container.innerHTML = `
    <select class="select-field" id="exercise-select">
      ${names.map((n) => `<option value="${escapeHTML(n)}" ${n === selectedExercise ? "selected" : ""}>${escapeHTML(n)}</option>`).join("")}
    </select>
    <div class="chart-card" id="chart-container"></div>
    <div class="section-title">Personal records</div>
    <div class="pr-list" id="pr-list"></div>
  `;

  const points = logsForExercise(selectedExercise).map((l) => ({ date: l.date, value: l.weight }));
  renderWeightChart(document.getElementById("chart-container"), points, state.unit);

  const prs = personalRecords();
  const prList = document.getElementById("pr-list");
  if (!prs.length) {
    prList.innerHTML = `<p style="color:var(--text-secondary);">No personal records logged yet.</p>`;
  } else {
    prList.innerHTML = prs.map((pr) => `
      <div class="pr-row">
        <div>
          <div class="ex-name">${escapeHTML(pr.exerciseName)}</div>
          <div class="ex-date">${formatDate(pr.date)}</div>
        </div>
        <div class="ex-value">${pr.weight}${state.unit}</div>
      </div>
    `).join("");
  }

  document.getElementById("exercise-select").addEventListener("change", (e) => {
    selectedExercise = e.target.value;
    const pts = logsForExercise(selectedExercise).map((l) => ({ date: l.date, value: l.weight }));
    renderWeightChart(document.getElementById("chart-container"), pts, state.unit);
  });
}
