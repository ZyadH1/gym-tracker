import { subscribe } from "./state.js";
import { showView, initSheetDismiss } from "./ui-kit.js";
import { renderHome } from "./home.js";
import { renderStats } from "./stats.js";
import { renderSchedule, initScheduleHeader } from "./schedule.js";
import { renderSettings, initImportInput } from "./settings.js";
import { renderHistory, initHistoryHeader } from "./history.js";
import "./workout.js";

function renderAll() {
  renderHome();
  renderHistory();
  renderStats();
  renderSchedule();
  renderSettings();
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});

initSheetDismiss();
initScheduleHeader();
initHistoryHeader();
initImportInput();
subscribe(renderAll);
renderAll();
showView("home-view");

if ("serviceWorker" in navigator) {
  // Cache-first means an already-installed copy would otherwise serve stale
  // files for one extra visit after a deploy. If a new worker takes over a page
  // that already had one, reload once so the update applies immediately.
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hadController || reloading) return;
    reloading = true;
    location.reload();
  });
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
