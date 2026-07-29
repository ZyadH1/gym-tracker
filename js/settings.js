import { getState, setUnit, exportJSON, importJSON, resetAll } from "./state.js";
import { openSheet, closeSheet, toast } from "./ui-kit.js";

export function renderSettings() {
  const state = getState();
  const container = document.getElementById("settings-content");

  container.innerHTML = `
    <div class="settings-group">
      <div class="settings-row">
        <div>
          <div class="label">Weight unit</div>
        </div>
        <div class="segmented" id="unit-toggle">
          <button data-unit="kg" class="${state.unit === "kg" ? "active" : ""}">kg</button>
          <button data-unit="lb" class="${state.unit === "lb" ? "active" : ""}">lb</button>
        </div>
      </div>
    </div>

    <div class="settings-group">
      <button class="settings-row btn-block" id="export-btn" style="width:100%;text-align:left;">
        <div>
          <div class="label">Export backup</div>
          <div class="hint">Save your data as a JSON file</div>
        </div>
      </button>
      <button class="settings-row btn-block" id="import-btn" style="width:100%;text-align:left;">
        <div>
          <div class="label">Import backup</div>
          <div class="hint">Restore from a JSON file</div>
        </div>
      </button>
    </div>

    <div class="settings-group">
      <button class="settings-row btn-block btn-danger" id="reset-btn" style="width:100%;text-align:left;">
        <div class="label">Reset all data</div>
      </button>
    </div>

    <p class="text-center" style="color:var(--text-tertiary);font-size:13px;margin-top:var(--space-4);">IronLog · ${state.logs.length} exercises logged</p>
  `;

  document.getElementById("unit-toggle").addEventListener("click", (e) => {
    const btn = e.target.closest("[data-unit]");
    if (btn) setUnit(btn.dataset.unit);
  });

  document.getElementById("export-btn").addEventListener("click", () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `ironlog-backup-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast("Backup downloaded");
  });

  document.getElementById("import-btn").addEventListener("click", () => {
    openSheet(`
      <div class="sheet-handle"></div>
      <h3>Import backup?</h3>
      <p style="color:var(--text-secondary);">This replaces all current data on this device with the contents of the file you choose.</p>
      <button class="btn btn-primary btn-block" id="confirm-import">Choose File…</button>
      <button class="btn btn-ghost btn-block" id="cancel-import">Cancel</button>
    `);
    document.getElementById("cancel-import").addEventListener("click", closeSheet);
    document.getElementById("confirm-import").addEventListener("click", () => {
      closeSheet();
      document.getElementById("import-file-input").click();
    });
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    openSheet(`
      <div class="sheet-handle"></div>
      <h3>Reset all data?</h3>
      <p style="color:var(--text-secondary);">This permanently deletes your schedule and every logged workout on this device. This can't be undone unless you have a backup.</p>
      <button class="btn btn-secondary btn-danger btn-block" id="confirm-reset">Delete Everything</button>
      <button class="btn btn-ghost btn-block" id="cancel-reset">Cancel</button>
    `);
    document.getElementById("cancel-reset").addEventListener("click", closeSheet);
    document.getElementById("confirm-reset").addEventListener("click", () => {
      resetAll();
      closeSheet();
      toast("All data cleared");
    });
  });
}

export function initImportInput() {
  document.getElementById("import-file-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const text = await file.text();
      importJSON(text);
      toast("Data imported");
    } catch (err) {
      toast(err.message || "Couldn't read that file");
    }
    e.target.value = "";
  });
}
