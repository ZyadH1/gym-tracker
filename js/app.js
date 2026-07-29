import { subscribe } from "./state.js";
import { showView, initSheetDismiss } from "./ui-kit.js";
import { renderHome } from "./home.js";
import { renderStats } from "./stats.js";
import { renderSchedule, initScheduleHeader } from "./schedule.js";
import { renderSettings, initImportInput } from "./settings.js";
import "./workout.js";

function renderAll() {
  renderHome();
  renderStats();
  renderSchedule();
  renderSettings();
}

document.querySelectorAll(".nav-btn").forEach((btn) => {
  btn.addEventListener("click", () => showView(btn.dataset.nav));
});

initSheetDismiss();
initScheduleHeader();
initImportInput();
subscribe(renderAll);
renderAll();
showView("home-view");

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  });
}
