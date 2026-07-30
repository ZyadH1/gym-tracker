import {
  getState, addDay, renameDay, deleteDay, moveDay,
  addExercise, removeExercise, moveExercise, renameExercise, applyPreset,
} from "./state.js";
import { escapeHTML, openSheet, closeSheet, toast } from "./ui-kit.js";
import { PRESET_CATEGORIES, PRESETS } from "./presets.js";
import { EXERCISE_GROUPS, guideURL } from "./exercise-library.js";

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
          <a class="btn-icon guide-icon" href="${guideURL(ex.name)}" target="_blank" rel="noopener noreferrer" aria-label="How to do ${escapeHTML(ex.name)}">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.2"/><path d="M12 17h.01"/></svg>
          </a>
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
      <div class="day-card-footer">
        <button class="btn btn-ghost" data-action="open-picker">+ Add exercise</button>
      </div>
    </div>
  `;
}

/* ===== Preset browser ===== */

function presetCardHTML(preset) {
  return `
    <button class="preset-card" data-preset-id="${preset.id}">
      <div class="preset-card-top">
        <h4>${escapeHTML(preset.name)}</h4>
        <span class="freq-badge">${escapeHTML(preset.freq)}</span>
      </div>
      <p>${escapeHTML(preset.blurb)}</p>
      <p class="preset-days">${preset.days.map((d) => escapeHTML(d.name)).join(" · ")}</p>
    </button>`;
}

function openPresetSheet() {
  // Every preset is rendered once, then filtered in place — re-rendering on
  // each keystroke would drop focus and fight the on-screen keyboard.
  const searchIndex = new Map();
  PRESETS.forEach((p) => {
    searchIndex.set(p.id, [
      p.name, p.blurb, p.freq,
      ...p.days.map((d) => d.name),
      ...p.days.flatMap((d) => d.exercises),
    ].join(" ").toLowerCase());
  });

  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Choose a split</h3>
    <input type="search" class="sheet-search" id="preset-search" placeholder="Search splits or exercises…" />
    <div class="preset-scroll">
      ${PRESET_CATEGORIES.map((c) => `
        <div class="preset-cat" data-cat>
          <div class="preset-cat-name">${escapeHTML(c.name)}</div>
          <div class="preset-cat-blurb">${escapeHTML(c.blurb)}</div>
          <div class="preset-list">${c.presets.map(presetCardHTML).join("")}</div>
        </div>
      `).join("")}
      <p class="no-results hidden" id="preset-no-results">No splits match that search.</p>
    </div>
  `);

  const search = document.getElementById("preset-search");
  search.addEventListener("input", () => {
    const q = search.value.trim().toLowerCase();
    let anyVisible = false;
    document.querySelectorAll("[data-cat]").forEach((cat) => {
      let catVisible = false;
      cat.querySelectorAll("[data-preset-id]").forEach((card) => {
        const hit = !q || (searchIndex.get(card.dataset.presetId) || "").includes(q);
        card.classList.toggle("hidden", !hit);
        if (hit) catVisible = true;
      });
      cat.classList.toggle("hidden", !catVisible);
      if (catVisible) anyVisible = true;
    });
    document.getElementById("preset-no-results").classList.toggle("hidden", anyVisible);
  });

  document.querySelectorAll("[data-preset-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const preset = PRESETS.find((p) => p.id === btn.dataset.presetId);
      const apply = () => {
        applyPreset(preset);
        closeSheet();
        toast(`${preset.name} loaded`);
      };
      if (getState().days.length) confirmReplace(preset, apply);
      else apply();
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

/* ===== Exercise picker ===== */

function openExercisePicker(dayId) {
  const day = getState().days.find((d) => d.id === dayId);
  if (!day) return;
  const existing = new Set(day.exercises.map((e) => e.name.toLowerCase()));
  const known = new Set(EXERCISE_GROUPS.flatMap((g) => g.exercises).map((e) => e.toLowerCase()));

  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Add to ${escapeHTML(day.name)}</h3>
    <input type="search" class="sheet-search" id="ex-search" placeholder="Search exercises…" />
    <div class="picker-scroll">
      <button class="chip chip-custom hidden" id="add-custom-btn"></button>
      ${EXERCISE_GROUPS.map((g) => `
        <div class="picker-group" data-group>
          <div class="picker-group-name">${escapeHTML(g.name)}</div>
          <div class="chip-row">
            ${g.exercises.map((e) => `
              <button class="chip ${existing.has(e.toLowerCase()) ? "chip-added" : ""}" data-add="${escapeHTML(e)}">
                <span class="chip-label">${escapeHTML(e)}${existing.has(e.toLowerCase()) ? " ✓" : ""}</span>
                <a class="chip-guide" href="${guideURL(e)}" target="_blank" rel="noopener noreferrer" aria-label="How to do ${escapeHTML(e)}">?</a>
              </button>`).join("")}
          </div>
        </div>
      `).join("")}
    </div>
    <button class="btn btn-primary btn-block" id="picker-done">Done</button>
  `);

  const search = document.getElementById("ex-search");
  const customBtn = document.getElementById("add-custom-btn");

  search.addEventListener("input", () => {
    const raw = search.value.trim();
    const q = raw.toLowerCase();
    document.querySelectorAll("[data-group]").forEach((group) => {
      let visible = false;
      group.querySelectorAll("[data-add]").forEach((chip) => {
        const hit = !q || chip.dataset.add.toLowerCase().includes(q);
        chip.classList.toggle("hidden", !hit);
        if (hit) visible = true;
      });
      group.classList.toggle("hidden", !visible);
    });
    const showCustom = raw.length > 1 && !known.has(q);
    customBtn.classList.toggle("hidden", !showCustom);
    if (showCustom) {
      customBtn.textContent = `+ Add "${raw}" as a custom exercise`;
      customBtn.dataset.addCustom = raw;
    }
  });

  function markAdded(chip, name) {
    addExercise(dayId, name);
    toast(`${name} added`);
    chip.classList.add("chip-added");
    const label = chip.querySelector(".chip-label");
    if (label && !label.textContent.endsWith(" ✓")) label.textContent += " ✓";
  }

  document.querySelectorAll("[data-add]").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.target.closest(".chip-guide")) return; // let the guide link through
      markAdded(chip, chip.dataset.add);
    });
  });

  customBtn.addEventListener("click", () => {
    const name = customBtn.dataset.addCustom;
    if (!name) return;
    addExercise(dayId, name);
    toast(`${name} added`);
    search.value = "";
    search.dispatchEvent(new Event("input"));
  });

  document.getElementById("picker-done").addEventListener("click", closeSheet);
}

function openAddDaySheet() {
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Add a day</h3>
    <input type="text" id="new-day-name" class="sheet-search" placeholder="e.g. Push, Upper, Full Body A" />
    <div class="chip-row" id="day-name-suggestions">
      ${["Push", "Pull", "Legs", "Upper", "Lower", "Full Body", "Chest", "Back", "Shoulders", "Arms"]
        .map((n) => `<button class="chip" data-day-name="${n}">${n}</button>`).join("")}
    </div>
    <button class="btn btn-primary btn-block" id="new-day-confirm">Add Day</button>
  `);
  const input = document.getElementById("new-day-name");
  const confirm = () => {
    const name = input.value.trim();
    if (!name) return;
    addDay(name);
    closeSheet();
  };
  document.querySelectorAll("[data-day-name]").forEach((btn) => {
    btn.addEventListener("click", () => { input.value = btn.dataset.dayName; });
  });
  document.getElementById("new-day-confirm").addEventListener("click", confirm);
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") confirm(); });
}

/* ===== View ===== */

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
        <p>Start from a preset above — PPL, Upper/Lower, bro split and more — or add your own days.</p>
        <button class="btn btn-primary" id="empty-add-day-btn">+ Add Day</button>
      </div>
    `;
    document.getElementById("empty-add-day-btn").addEventListener("click", openAddDaySheet);
  } else {
    container.innerHTML = presetBtn + state.days.map((d, i) => dayCardHTML(d, i, state.days.length)).join("");
  }

  document.getElementById("browse-presets-btn").addEventListener("click", () => openPresetSheet());

  container.querySelectorAll(".day-card").forEach((card) => {
    const dayId = card.dataset.dayId;

    card.querySelector('[data-action="day-name"]').addEventListener("change", (e) => renameDay(dayId, e.target.value.trim() || "Untitled"));
    card.querySelector('[data-action="day-up"]').addEventListener("click", () => moveDay(dayId, -1));
    card.querySelector('[data-action="day-down"]').addEventListener("click", () => moveDay(dayId, 1));
    card.querySelector('[data-action="open-picker"]').addEventListener("click", () => openExercisePicker(dayId));
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
  });
}

export function initScheduleHeader() {
  document.getElementById("schedule-add-day").addEventListener("click", openAddDaySheet);
}
