import { subscribe } from "./state.js";
import { showView, initSheetDismiss, registerEnter, toast } from "./ui-kit.js";
import { renderHome } from "./home.js";
import { renderStats } from "./stats.js";
import { renderSchedule, initScheduleHeader } from "./schedule.js";
import { renderSettings, initImportInput } from "./settings.js";
import { renderHistory, initHistoryHeader } from "./history.js";
import { isSessionActive } from "./workout.js";

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
  // Cache-first serving means an installed copy would otherwise show stale files
  // for one extra visit after a deploy. Reload once when a new worker takes over
  // — but never mid-workout, since the active session is only held in memory.
  const hadController = !!navigator.serviceWorker.controller;
  let updatePending = false;
  let reloading = false;

  function applyUpdate() {
    if (!updatePending || reloading) return;
    if (isSessionActive()) return;      // finish the workout first
    reloading = true;
    location.reload();
  }

  function noteUpdate() {
    if (!hadController) return;          // first install — nothing to refresh
    updatePending = true;
    if (isSessionActive()) toast("Update ready — applies after this workout");
    applyUpdate();
  }

  registerEnter("home-view", applyUpdate);
  navigator.serviceWorker.addEventListener("controllerchange", noteUpdate);

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("service-worker.js").then((reg) => {
      // controllerchange alone can be missed depending on activation timing, so
      // also watch a newly-found worker until it reaches "activated".
      reg.addEventListener("updatefound", () => {
        const incoming = reg.installing || reg.waiting;
        if (!incoming) return;
        incoming.addEventListener("statechange", () => {
          if (incoming.state === "activated") noteUpdate();
        });
      });
    }).catch(() => {});
  });
}
