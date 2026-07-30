import {
  getState, addDay, renameDay, deleteDay, moveDay,
  addExercise, removeExercise, moveExercise, renameExercise, applyPreset,
} from "./state.js";
import { escapeHTML, openSheet, closeSheet, toast } from "./ui-kit.js";
import { addCustomExercise, customExerciseNames, distinctExerciseNames } from "./state.js";
import { PRESET_CATEGORIES, PRESETS } from "./presets.js";
import {
  EXERCISE_GROUPS, guideURL, matchExercise, findSimilarExercise, normalize,
} from "./exercise-library.js";

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

function chipHTML(name, isAdded) {
  return `
    <button class="chip ${isAdded ? "chip-added" : ""}" data-add="${escapeHTML(name)}">
      <span class="chip-label">${escapeHTML(name)}${isAdded ? " ✓" : ""}</span>
      <span class="chip-alias hidden"></span>
      <a class="chip-guide" href="${guideURL(name)}" target="_blank" rel="noopener noreferrer" aria-label="How to do ${escapeHTML(name)}">?</a>
    </button>`;
}

function openExercisePicker(dayId) {
  const day = getState().days.find((d) => d.id === dayId);
  if (!day) return;
  const existing = new Set(day.exercises.map((e) => e.name.toLowerCase()));
  const customNames = customExerciseNames();

  const groups = [
    ...(customNames.length ? [{ id: "custom", name: "Your exercises", exercises: customNames }] : []),
    ...EXERCISE_GROUPS,
  ];

  openSheet(`
    <div class="sheet-handle"></div>
    <h3>Add to ${escapeHTML(day.name)}</h3>
    <input type="search" class="sheet-search" id="ex-search" placeholder="Search exercises…" />
    <div class="picker-scroll">
      <div class="suggest-box hidden" id="suggest-box"></div>
      <button class="chip chip-custom hidden" id="add-custom-btn"></button>
      ${groups.map((g) => `
        <div class="picker-group" data-group>
          <div class="picker-group-name">${escapeHTML(g.name)}</div>
          <div class="chip-row">
            ${g.exercises.map((e) => chipHTML(e, existing.has(e.toLowerCase()))).join("")}
          </div>
        </div>
      `).join("")}
      <p class="no-results hidden" id="picker-no-results">Nothing matched — you can still add it as a custom exercise above.</p>
    </div>
    <button class="btn btn-primary btn-block" id="picker-done">Done</button>
  `);

  const search = document.getElementById("ex-search");
  const customBtn = document.getElementById("add-custom-btn");
  const suggestBox = document.getElementById("suggest-box");
  const noResults = document.getElementById("picker-no-results");

  function markAdded(chip, name) {
    const added = addExercise(dayId, name);
    toast(added ? `${name} added` : `${name} is already in this day`);
    if (!added) return;
    chip.classList.add("chip-added");
    const label = chip.querySelector(".chip-label");
    if (label && !label.textContent.endsWith(" ✓")) label.textContent += " ✓";
  }

  function addAsCustom(name) {
    addCustomExercise(name);   // remember it for every future day
    const added = addExercise(dayId, name);
    toast(added ? `${name} added` : `${name} is already in this day`);
    closeSheet();
    openExercisePicker(dayId); // rebuild so it shows under "Your exercises"
  }

  search.addEventListener("input", () => {
    const raw = search.value.trim();
    let anyVisible = false;

    document.querySelectorAll("[data-group]").forEach((group) => {
      let groupVisible = false;
      group.querySelectorAll("[data-add]").forEach((chip) => {
        const { hit, viaAlias } = matchExercise(chip.dataset.add, raw);
        chip.classList.toggle("hidden", !hit);
        const aliasEl = chip.querySelector(".chip-alias");
        if (viaAlias) {
          aliasEl.textContent = `· ${viaAlias}`;
          aliasEl.classList.remove("hidden");
        } else {
          aliasEl.classList.add("hidden");
        }
        if (hit) groupVisible = true;
      });
      group.classList.toggle("hidden", !groupVisible);
      if (groupVisible) anyVisible = true;
    });

    noResults.classList.toggle("hidden", anyVisible || raw.length < 2);

    // Offer a custom add, but first warn if it's a near-duplicate of something
    // that already exists — otherwise stats split across two spellings.
    const alreadyExact = [...document.querySelectorAll("[data-add]")]
      .some((c) => normalize(c.dataset.add) === normalize(raw));
    const showCustom = raw.length > 1 && !alreadyExact;
    customBtn.classList.toggle("hidden", !showCustom);
    suggestBox.classList.add("hidden");

    if (showCustom) {
      customBtn.textContent = `+ Add "${raw}" as a custom exercise`;
      customBtn.dataset.addCustom = raw;

      const similar = findSimilarExercise(raw, [...customNames, ...distinctExerciseNames()]);
      if (similar) {
        suggestBox.innerHTML = `
          <span class="suggest-text">Did you mean <strong>${escapeHTML(similar.name)}</strong>?
          Using the same name keeps your progress in one chart.</span>
          <button class="btn btn-secondary suggest-btn" data-suggest="${escapeHTML(similar.name)}">Use ${escapeHTML(similar.name)}</button>`;
        suggestBox.classList.remove("hidden");
        suggestBox.querySelector("[data-suggest]").addEventListener("click", () => {
          const name = similar.name;
          const chip = [...document.querySelectorAll("[data-add]")]
            .find((c) => c.dataset.add === name);
          if (chip) markAdded(chip, name);
          else { addExercise(dayId, name); toast(`${name} added`); }
          search.value = "";
          search.dispatchEvent(new Event("input"));
        });
      }
    }
  });

  document.querySelectorAll("[data-add]").forEach((chip) => {
    chip.addEventListener("click", (e) => {
      if (e.target.closest(".chip-guide")) return; // let the guide link through
      markAdded(chip, chip.dataset.add);
    });
  });

  customBtn.addEventListener("click", () => {
    if (customBtn.dataset.addCustom) addAsCustom(customBtn.dataset.addCustom);
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
