import {
  getState, addDay, renameDay, deleteDay, moveDay,
  addExercise, removeExercise, moveExercise, renameExercise, applyPreset,
} from "./state.js";
import { escapeHTML, openSheet, closeSheet, toast } from "./ui-kit.js";
import { PRESETS } from "./presets.js";

function dayCardHTML(day, index, total) {
  return `
    <div class="day-card" data-day-id="${day.id}">
      <div class="day-card-header">
        <div class="reorder-col">
          <button class="reorder-btn" data-action="day-up" ${index === 0 ? "disabled" : ""}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 15l6-6 6 6"/></svg>
          </button>
          <button class="reorder-btn" data-action="day-down" ${index === total - 1 ? "disabled" : ""}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </button>
        </div>
        <input class="day-name-input" data-action="day-name" value="${escapeHTML(day.name)}" />
        <button class="btn-icon" data-action="day-delete" aria-label="Delete day">
          <svg viewBox="0 0 24 24" fill="none" stroke="var(--danger)" stroke-width="2" stroke-linecap="round"><path d="M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2m2 0-1 13a1 1 0 01-1 1H8a1 1 0 01-1-1L6 7"/></svg>
        </button>
      </div>
      ${day.exercises.map((ex, i) => `
        <div class="exercise-row" data-exercise-id="${ex.id}">
          <span class="ex-index">${i + 1}</span>
          <input value="${escapeHTML(ex.name)}" data-action="ex-name" />
          <div class="reorder-col">
            <button class="reorder-btn" data-action="ex-up" ${i === 0 ? "disabled" : ""}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 15l6-6 6 6"/></svg>
            </button>
            <button class="reorder-btn" data-action="ex-down" ${i === day.exercises.length - 1 ? "disabled" : ""}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
            </button>
          </div>
          <button class="btn-icon" data-action="ex-remove" aria-label="Remove exercise" style="min-height:32px;min-width:32px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" stroke-width="2.5" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>
          </button>
        </div>
      `).join("")}
      <div class="add-exercise-row">
        <input type="text" placeholder="Add exercise…" data-action="new-exercise-input" />
        <button class="btn btn-secondary" data-action="new-exercise-add" style="min-height:40px;padding:0 16px;">Add</button>
      </div>
    </div>
  `;
}

function presetSheetHTML() {
  return `
    <div class="sheet-handle"></div>
    <h3>Choose a split</h3>
    <div class="preset-list">
      ${PRESETS.map((p) => `
        <button class="preset-card" data-preset-id="${p.id}">
          <h4>${escapeHTML(p.name)}</h4>
          <p>${escapeHTML(p.blurb)}</p>
          <p style="color:var(--text-tertiary);font-size:13px;margin-top:6px;">${p.days.map((d) => escapeHTML(d.name)).join(" · ")}</p>
        </button>
      `).join("")}
    </div>
  `;
}

function openPresetSheet() {
  openSheet(presetSheetHTML());
  document.querySelectorAll("[data-preset-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = PRESETS.find((p) => p.id === btn.dataset.presetId);
      const apply = () => {
        applyPreset(preset);
        closeSheet();
        toast(`${preset.name} loaded`);
      };
      if (getState().days.length) {
        confirmReplace(preset, apply);
      } else {
        apply();
      }
    });
  });
}

function confirmReplace(preset, onConfirm) {
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Replace current schedule?</h3>
    <p style="color:var(--text-secondary);">Switching to "${escapeHTML(preset.name)}" will replace your current days and exercises. Your logged history stays intact.</p>
    <button class="btn btn-primary btn-block" id="confirm-replace-yes">Replace Schedule</button>
    <button class="btn btn-ghost btn-block" id="confirm-replace-no">Cancel</button>
  `);
  document.getElementById("confirm-replace-yes").addEventListener("click", onConfirm);
  document.getElementById("confirm-replace-no").addEventListener("click", () => openPresetSheet());
}

function openAddDaySheet() {
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Add a day</h3>
    <input type="text" id="new-day-name" placeholder="e.g. Push, Upper, Full Body A" style="width:100%;min-height:48px;border:1px solid var(--border);border-radius:12px;background:var(--bg-sunken);padding:0 14px;font-size:16px;" />
    <button class="btn btn-primary btn-block" id="new-day-confirm">Add Day</button>
  `);
  const input = document.getElementById("new-day-name");
  input.focus();
  const confirm = () => {
    const name = input.value.trim();
    if (!name) return;
    addDay(name);
    closeSheet();
  };
  document.getElementById("new-day-confirm").addEventListener("click", confirm);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") confirm(); });
}

export function renderSchedule() {
  const state = getState();
  const container = document.getElementById("schedule-content");

  const presetBtn = `<button class="btn btn-secondary btn-block" id="browse-presets-btn" style="margin-bottom:var(--space-5);">Browse Preset Splits</button>`;

  if (!state.days.length) {
    container.innerHTML = `
      ${presetBtn}
      <div class="empty-state">
        <div class="icon-circle">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
        </div>
        <h3>Build your split</h3>
        <p>Start from a preset above, or add your own days below.</p>
        <button class="btn btn-primary" id="empty-add-day-btn">+ Add Day</button>
      </div>
    `;
    document.getElementById("empty-add-day-btn").addEventListener("click", openAddDaySheet);
  } else {
    container.innerHTML = presetBtn + state.days.map((d, i) => dayCardHTML(d, i, state.days.length)).join("");
  }

  document.getElementById("browse-presets-btn").addEventListener("click", openPresetSheet);

  container.querySelectorAll(".day-card").forEach((card) => {
    const dayId = card.dataset.dayId;

    card.querySelector('[data-action="day-name"]').addEventListener("change", (e) => renameDay(dayId, e.target.value.trim() || "Untitled"));
    card.querySelector('[data-action="day-up"]').addEventListener("click", () => moveDay(dayId, -1));
    card.querySelector('[data-action="day-down"]').addEventListener("click", () => moveDay(dayId, 1));
    card.querySelector('[data-action="day-delete"]').addEventListener("click", () => {
      openSheet(`
        <div class="sheet-handle"></div>
        <h3>Delete this day?</h3>
        <p style="color:var(--text-secondary);">This removes it from your rotation. Past logged workouts are kept.</p>
        <button class="btn btn-danger btn-block btn-secondary" id="confirm-delete-day">Delete Day</button>
        <button class="btn btn-ghost btn-block" id="cancel-delete-day">Cancel</button>
      `);
      document.getElementById("confirm-delete-day").addEventListener("click", () => { deleteDay(dayId); closeSheet(); });
      document.getElementById("cancel-delete-day").addEventListener("click", closeSheet);
    });

    card.querySelectorAll(".exercise-row").forEach((row) => {
      const exerciseId = row.dataset.exerciseId;
      row.querySelector('[data-action="ex-name"]').addEventListener("change", (e) => renameExercise(dayId, exerciseId, e.target.value));
      row.querySelector('[data-action="ex-up"]').addEventListener("click", () => moveExercise(dayId, exerciseId, -1));
      row.querySelector('[data-action="ex-down"]').addEventListener("click", () => moveExercise(dayId, exerciseId, 1));
      row.querySelector('[data-action="ex-remove"]').addEventListener("click", () => removeExercise(dayId, exerciseId));
    });

    const newExInput = card.querySelector('[data-action="new-exercise-input"]');
    const addNewEx = () => {
      if (!newExInput.value.trim()) return;
      addExercise(dayId, newExInput.value);
    };
    card.querySelector('[data-action="new-exercise-add"]').addEventListener("click", addNewEx);
    newExInput.addEventListener("keydown", (e) => { if (e.key === "Enter") addNewEx(); });
  });
}

export function initScheduleHeader() {
  document.getElementById("schedule-add-day").addEventListener("click", openAddDaySheet);
}
