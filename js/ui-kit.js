const views = ["home-view", "workout-view", "summary-view", "stats-view", "schedule-view", "settings-view"];
const navViews = new Set(["home-view", "stats-view", "schedule-view", "settings-view"]);

let onEnter = {};

export function registerEnter(viewId, fn) {
  onEnter[viewId] = fn;
}

export function showView(viewId) {
  views.forEach((id) => {
    document.getElementById(id).classList.toggle("active", id === viewId);
  });
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.nav === viewId);
  });
  document.getElementById("bottom-nav").classList.toggle("hidden", !navViews.has(viewId));
  window.scrollTo(0, 0);
  if (onEnter[viewId]) onEnter[viewId]();
}

let toastTimer;
export function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

const backdrop = () => document.getElementById("sheet-backdrop");
const sheetContent = () => document.getElementById("sheet-content");

export function openSheet(html) {
  sheetContent().innerHTML = html;
  backdrop().classList.add("open");
}

export function closeSheet() {
  backdrop().classList.remove("open");
}

export function initSheetDismiss() {
  backdrop().addEventListener("click", (e) => {
    if (e.target === backdrop()) closeSheet();
  });
}

export function el(html) {
  const t = document.createElement("template");
  t.innerHTML = html.trim();
  return t.content.firstElementChild;
}

export function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

export function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function formatDateLong(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
}
