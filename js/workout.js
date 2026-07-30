import { saveSessionLogs } from "./state.js";
import { showView, openSheet, closeSheet, toast, escapeHTML } from "./ui-kit.js";
import { getState } from "./state.js";
import { guideURL } from "./exercise-library.js";

let session = null; // { dayId, dayName, exercises, entries, index }

/** An in-progress session lives only in memory — never reload the page during one. */
export function isSessionActive() {
  return session !== null;
}

export function startSession(day) {
  session = {
    dayId: day.id,
    dayName: day.name,
    exercises: day.exercises.slice(),
    entries: day.exercises.map(() => null),
    index: 0,
  };
  showView("workout-view");
  renderProgress();
  renderCard(0, null);
}

function renderProgress() {
  const track = document.getElementById("session-progress");
  track.innerHTML = session.exercises
    .map((_, i) => {
      const entry = session.entries[i];
      let cls = "progress-seg";
      let width = "0%";
      if (entry && entry.skipped) { cls += " skipped"; width = "100%"; }
      else if (entry) { cls += " done"; width = "100%"; }
      else if (i === session.index) { width = "45%"; }
      return `<div class="${cls}"><div class="fill" style="width:${width}"></div></div>`;
    })
    .join("");
}

function buildCard(index) {
  const ex = session.exercises[index];
  const unit = getState().unit;
  const card = document.createElement("div");
  card.className = "exercise-card";
  card.innerHTML = `
    <div class="exercise-title">
      <div class="day-label">${escapeHTML(session.dayName)} · ${index + 1} of ${session.exercises.length}</div>
      <h2>${escapeHTML(ex.name)}</h2>
      <a class="guide-link" href="${guideURL(ex.name)}" target="_blank" rel="noopener noreferrer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 114 2c-.9.7-1.5 1.2-1.5 2.2"/><path d="M12 17h.01"/></svg>
        How do I do this?
      </a>
    </div>
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
    <div class="exercise-actions">
      ${index > 0 ? `<button class="btn btn-ghost" id="card-back-btn">‹ Back</button>` : ""}
      <button class="btn btn-primary btn-block btn-lg" id="card-next-btn" disabled>
        ${index === session.exercises.length - 1 ? "Finish" : "Next"}
      </button>
      <button class="btn btn-ghost" id="card-skip-btn">Skip this exercise</button>
    </div>
  `;

  const weightInput = card.querySelector('[data-field="weight"]');
  const setsInput = card.querySelector('[data-field="sets"]');
  const nextBtn = card.querySelector("#card-next-btn");

  const existing = session.entries[index];
  if (existing && !existing.skipped) {
    weightInput.value = existing.weight;
    setsInput.value = existing.sets;
  }

  function validate() {
    const w = parseFloat(weightInput.value);
    const s = parseInt(setsInput.value, 10);
    nextBtn.disabled = !(w > 0 && s > 0);
  }
  validate();
  weightInput.addEventListener("input", validate);
  setsInput.addEventListener("input", validate);

  card.querySelectorAll("[data-adjust]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const field = btn.dataset.adjust;
      const delta = parseFloat(btn.dataset.delta);
      const input = field === "weight" ? weightInput : setsInput;
      const current = parseFloat(input.value) || 0;
      const next = Math.max(0, current + delta);
      input.value = field === "weight" ? (Math.round(next * 2) / 2) : Math.round(next);
      validate();
    });
  });

  nextBtn.addEventListener("click", () => {
    if (nextBtn.disabled) return;
    session.entries[index] = {
      dayId: session.dayId,
      dayName: session.dayName,
      exerciseId: ex.id,
      exerciseName: ex.name,
      weight: parseFloat(weightInput.value),
      sets: parseInt(setsInput.value, 10),
      skipped: false,
    };
    advance(index);
  });

  card.querySelector("#card-skip-btn").addEventListener("click", () => {
    session.entries[index] = {
      dayId: session.dayId,
      dayName: session.dayName,
      exerciseId: ex.id,
      exerciseName: ex.name,
      weight: null,
      sets: null,
      skipped: true,
    };
    advance(index);
  });

  const backBtn = card.querySelector("#card-back-btn");
  if (backBtn) backBtn.addEventListener("click", () => goBack(index));

  attachSwipe(card, index, nextBtn);

  return card;
}

function attachSwipe(card, index, nextBtn) {
  let startX = null;
  card.addEventListener("touchstart", (e) => {
    startX = e.touches[0].clientX;
    card.style.transition = "none";
  }, { passive: true });

  card.addEventListener("touchmove", (e) => {
    if (startX === null) return;
    const dx = e.touches[0].clientX - startX;
    card.style.transform = `translateX(${dx}px)`;
  }, { passive: true });

  card.addEventListener("touchend", (e) => {
    if (startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    card.style.transition = "";
    card.style.transform = "";
    startX = null;
    if (dx < -80) {
      if (!nextBtn.disabled) nextBtn.click();
      else toast("Enter weight and sets, or tap Skip");
    } else if (dx > 80 && index > 0) {
      goBack(index);
    }
  });
}

function renderCard(index, direction) {
  const stage = document.getElementById("exercise-stage");
  const newCard = buildCard(index);

  if (!direction) {
    stage.innerHTML = "";
    stage.appendChild(newCard);
    return;
  }

  const oldCard = stage.querySelector(".exercise-card");
  const outClass = direction === "next" ? "leave-left" : "leave-right";
  const inClass = direction === "next" ? "enter-right" : "enter-left";
  newCard.classList.add(inClass);
  stage.appendChild(newCard);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      if (oldCard) oldCard.classList.add(outClass);
      newCard.classList.remove(inClass);
    });
  });
  setTimeout(() => oldCard && oldCard.remove(), 340);
}

function advance(index) {
  renderProgress();
  if (index + 1 < session.exercises.length) {
    session.index = index + 1;
    renderCard(session.index, "next");
    renderProgress();
  } else {
    finishSession();
  }
}

function goBack(index) {
  session.index = index - 1;
  renderCard(session.index, "prev");
  renderProgress();
}

function finishSession() {
  const entries = session.entries.filter(Boolean);
  saveSessionLogs(entries, session.dayId);

  const done = entries.filter((e) => !e.skipped).length;
  document.getElementById("summary-subtitle").textContent =
    `${session.dayName} · ${done}/${entries.length} exercises logged`;

  document.getElementById("summary-list").innerHTML = entries.map((e) => `
    <div class="summary-row ${e.skipped ? "skipped" : ""}">
      <div>
        <div class="name">${escapeHTML(e.exerciseName)}</div>
        ${e.skipped ? "" : `<div class="detail">${e.weight}${getState().unit} × ${e.sets} sets</div>`}
      </div>
      <span class="badge">${e.skipped ? "Skipped" : "Logged"}</span>
    </div>
  `).join("");

  showView("summary-view");
  session = null;
}

document.getElementById("summary-done").addEventListener("click", () => {
  showView("home-view");
});

document.getElementById("session-close").addEventListener("click", () => {
  const loggedCount = session ? session.entries.filter(Boolean).length : 0;
  openSheet(`
    <div class="sheet-handle"></div>
    <h3>End workout early?</h3>
    <p style="color:var(--text-secondary)">
      ${loggedCount ? `You've logged ${loggedCount} of ${session.exercises.length} exercises.` : "Nothing has been logged yet."}
    </p>
    ${loggedCount ? `<button class="btn btn-primary btn-block" id="sheet-save-exit">Save & Exit</button>` : ""}
    <button class="btn btn-secondary btn-block" id="sheet-discard">Discard & Exit</button>
    <button class="btn btn-ghost btn-block" id="sheet-cancel">Keep Going</button>
  `);
  const saveBtn = document.getElementById("sheet-save-exit");
  if (saveBtn) saveBtn.addEventListener("click", () => {
    saveSessionLogs(session.entries.filter(Boolean), session.dayId);
    session = null;
    closeSheet();
    showView("home-view");
  });
  document.getElementById("sheet-discard").addEventListener("click", () => {
    session = null;
    closeSheet();
    showView("home-view");
  });
  document.getElementById("sheet-cancel").addEventListener("click", closeSheet);
});
