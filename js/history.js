import {
  getState, sessionHistory, updateLog, deleteLog, deleteSession, addPastSession,
} from "./state.js";
import {
  escapeHTML, openSheet, closeSheet, toast, formatDateLong, relativeDay, dateInputValue,
} from "./ui-kit.js";

function entryValue(entry, unit) {
  return entry.skipped ? "Skipped" : `${entry.weight}${unit} × ${entry.sets} sets`;
}

/* ===== Edit / delete a single logged exercise ===== */

function openEntrySheet(entry) {
  const unit = getState().unit;
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>${escapeHTML(entry.exerciseName)}</h3>
    <p class="sheet-sub">${escapeHTML(entry.dayName)} · ${escapeHTML(formatDateLong(entry.date))}</p>

    <div class="input-block">
      <div class="field-label">Weight <span class="stepper-unit">(${unit})</span></div>
      <div class="stepper">
        <button class="stepper-btn" data-adjust="weight" data-delta="-2.5">−</button>
        <input class="stepper-value" type="number" inputmode="decimal" step="0.5" min="0" data-field="weight" placeholder="0" />
        <button class="stepper-btn" data-adjust="weight" data-delta="2.5">+</button>
      </div>
    </div>
    <div class="input-block">
      <div class="field-label">Sets</div>
      <div class="stepper">
        <button class="stepper-btn" data-adjust="sets" data-delta="-1">−</button>
        <input class="stepper-value" type="number" inputmode="numeric" step="1" min="0" data-field="sets" placeholder="0" />
        <button class="stepper-btn" data-adjust="sets" data-delta="1">+</button>
      </div>
    </div>

    <button class="btn btn-primary btn-block" id="entry-save">Save changes</button>
    <button class="btn btn-secondary btn-block" id="entry-skip">Mark as skipped</button>
    <button class="btn btn-ghost btn-block btn-danger" id="entry-delete">Delete this exercise</button>
  `);

  const sheet = document.getElementById("sheet-content");
  const weight = sheet.querySelector('[data-field="weight"]');
  const sets = sheet.querySelector('[data-field="sets"]');
  const save = document.getElementById("entry-save");

  if (!entry.skipped) {
    weight.value = entry.weight;
    sets.value = entry.sets;
  }

  function validate() {
    save.disabled = !(parseFloat(weight.value) > 0 && parseInt(sets.value, 10) > 0);
  }
  validate();
  weight.addEventListener("input", validate);
  sets.addEventListener("input", validate);

  sheet.querySelectorAll("[data-adjust]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const input = btn.dataset.adjust === "weight" ? weight : sets;
      const next = Math.max(0, (parseFloat(input.value) || 0) + parseFloat(btn.dataset.delta));
      input.value = btn.dataset.adjust === "weight" ? Math.round(next * 2) / 2 : Math.round(next);
      validate();
    });
  });

  save.addEventListener("click", () => {
    updateLog(entry.id, {
      weight: parseFloat(weight.value),
      sets: parseInt(sets.value, 10),
      skipped: false,
    });
    closeSheet();
    toast("Entry updated");
  });

  document.getElementById("entry-skip").addEventListener("click", () => {
    updateLog(entry.id, { skipped: true });
    closeSheet();
    toast("Marked as skipped");
  });

  document.getElementById("entry-delete").addEventListener("click", () => {
    deleteLog(entry.id);
    closeSheet();
    toast("Exercise deleted");
  });
}

function confirmDeleteSession(session) {
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Delete this whole workout?</h3>
    <p class="sheet-sub">${escapeHTML(session.dayName)} · ${escapeHTML(formatDateLong(session.date))}</p>
    <p style="color:var(--text-secondary);">All ${session.total} exercise${session.total === 1 ? "" : "s"} logged in this session will be removed. This can't be undone.</p>
    <button class="btn btn-secondary btn-danger btn-block" id="session-delete-yes">Delete workout</button>
    <button class="btn btn-ghost btn-block" id="session-delete-no">Cancel</button>
  `);
  document.getElementById("session-delete-yes").addEventListener("click", () => {
    deleteSession(session.date);
    closeSheet();
    toast("Workout deleted");
  });
  document.getElementById("session-delete-no").addEventListener("click", closeSheet);
}

/* ===== Add a workout onto a past date ===== */

/** Local noon avoids the date shifting across timezones; bump to stay unique. */
function timestampFor(dateStr, existingDates) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const base = new Date(y, m - 1, d, 12, 0, 0, 0);
  let iso = base.toISOString();
  while (existingDates.has(iso)) {
    base.setMinutes(base.getMinutes() + 1);
    iso = base.toISOString();
  }
  return iso;
}

function rowsHTML(day, unit) {
  if (!day) return "";
  return day.exercises.map((ex) => `
    <div class="backfill-row" data-exercise-id="${ex.id}" data-exercise-name="${escapeHTML(ex.name)}">
      <span class="backfill-name">${escapeHTML(ex.name)}</span>
      <input type="number" inputmode="decimal" step="0.5" min="0" placeholder="0" data-f="weight" />
      <span class="backfill-unit">${unit}</span>
      <input type="number" inputmode="numeric" step="1" min="0" placeholder="0" data-f="sets" />
      <span class="backfill-unit">sets</span>
    </div>
  `).join("");
}

export function openBackfillSheet() {
  const state = getState();
  const unit = state.unit;

  if (!state.days.length) {
    openSheet(`
      <div class="sheet-handle"></div>
      <h3>No schedule yet</h3>
      <p style="color:var(--text-secondary);">Set up a split first — then you can log workouts onto past dates.</p>
      <button class="btn btn-primary btn-block" id="backfill-close">OK</button>
    `);
    document.getElementById("backfill-close").addEventListener("click", closeSheet);
    return;
  }

  const today = dateInputValue();
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Add past workout</h3>
    <div class="backfill-fields">
      <label class="field-label" for="backfill-date">Date</label>
      <input type="date" id="backfill-date" class="sheet-search" value="${today}" max="${today}" />
      <label class="field-label" for="backfill-day">Which day was it?</label>
      <select id="backfill-day" class="select-field">
        ${state.days.map((d) => `<option value="${d.id}">${escapeHTML(d.name)}</option>`).join("")}
      </select>
    </div>
    <div class="backfill-scroll" id="backfill-rows">${rowsHTML(state.days[0], unit)}</div>
    <p class="backfill-hint">Leave an exercise blank if you didn't do it.</p>
    <button class="btn btn-primary btn-block" id="backfill-save">Save workout</button>
    <button class="btn btn-ghost btn-block" id="backfill-cancel">Cancel</button>
  `);

  const daySelect = document.getElementById("backfill-day");
  const rows = document.getElementById("backfill-rows");

  daySelect.addEventListener("change", () => {
    const day = getState().days.find((d) => d.id === daySelect.value);
    rows.innerHTML = rowsHTML(day, unit);
  });

  document.getElementById("backfill-cancel").addEventListener("click", closeSheet);

  document.getElementById("backfill-save").addEventListener("click", () => {
    const dateStr = document.getElementById("backfill-date").value;
    if (!dateStr) return toast("Pick a date first");
    const day = getState().days.find((d) => d.id === daySelect.value);
    if (!day) return;

    const entries = [...rows.querySelectorAll(".backfill-row")].map((row) => {
      const w = parseFloat(row.querySelector('[data-f="weight"]').value);
      const s = parseInt(row.querySelector('[data-f="sets"]').value, 10);
      const filled = w > 0 && s > 0;
      return {
        exerciseId: row.dataset.exerciseId,
        exerciseName: row.dataset.exerciseName,
        weight: filled ? w : null,
        sets: filled ? s : null,
        skipped: !filled,
      };
    });

    if (!entries.some((e) => !e.skipped)) {
      return toast("Fill in at least one exercise");
    }

    const existing = new Set(getState().logs.map((l) => l.date));
    addPastSession({
      dateISO: timestampFor(dateStr, existing),
      dayId: day.id,
      dayName: day.name,
      entries,
    });
    closeSheet();
    toast("Workout added to your log");
  });
}

/* ===== View ===== */

export function renderHistory() {
  const state = getState();
  const container = document.getElementById("history-content");
  const sessions = sessionHistory();

  if (!sessions.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding-top:56px;">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 8v4l3 2"/><circle cx="12" cy="12" r="9"/></svg>
        </div>
        <h3>No workouts logged yet</h3>
        <p>Finished sessions show up here, and you can add older workouts by date.</p>
        <button class="btn btn-primary" id="history-empty-add">+ Add past workout</button>
      </div>`;
    document.getElementById("history-empty-add").addEventListener("click", openBackfillSheet);
    return;
  }

  container.innerHTML = sessions.map((s) => `
    <div class="log-card" data-session-date="${escapeHTML(s.date)}">
      <div class="log-card-header">
        <div class="grow">
          <div class="log-day">${escapeHTML(s.dayName)}</div>
          <div class="log-date">${escapeHTML(relativeDay(s.date))} · ${escapeHTML(formatDateLong(s.date))}</div>
        </div>
        <span class="badge">${s.done}/${s.total}</span>
        <button class="btn-icon" data-action="delete-session" aria-label="Delete workout">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"/></svg>
        </button>
      </div>
      ${s.entries.map((e) => `
        <button class="log-entry ${e.skipped ? "is-skipped" : ""}" data-log-id="${e.id}">
          <span class="log-entry-name">${escapeHTML(e.exerciseName)}</span>
          <span class="log-entry-value">${escapeHTML(entryValue(e, state.unit))}</span>
          <svg class="log-entry-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 6l6 6-6 6"/></svg>
        </button>
      `).join("")}
    </div>
  `).join("");

  const byId = new Map(state.logs.map((l) => [l.id, l]));

  container.querySelectorAll(".log-entry").forEach((btn) => {
    btn.addEventListener("click", () => {
      const entry = byId.get(btn.dataset.logId);
      if (entry) openEntrySheet(entry);
    });
  });

  container.querySelectorAll('[data-action="delete-session"]').forEach((btn) => {
    btn.addEventListener("click", () => {
      const date = btn.closest(".log-card").dataset.sessionDate;
      const session = sessions.find((s) => s.date === date);
      if (session) confirmDeleteSession(session);
    });
  });
}

export function initHistoryHeader() {
  document.getElementById("history-add").addEventListener("click", openBackfillSheet);
}
