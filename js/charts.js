import { escapeHTML } from "./ui-kit.js";

const NS = "http://www.w3.org/2000/svg";

function sv(tag, attrs) {
  const node = document.createElementNS(NS, tag);
  Object.entries(attrs || {}).forEach(([k, v]) => {
    if (k === "style") node.setAttribute("style", v);
    else node.setAttribute(k, v);
  });
  return node;
}

function niceStep(range) {
  const raw = range / 4;
  const mag = Math.pow(10, Math.floor(Math.log10(raw || 1)));
  const norm = raw / mag;
  const step = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return step * mag;
}

/**
 * points: [{ date: isoString, value: number }] sorted ascending by date
 */
export function renderWeightChart(container, points, unit) {
  container.innerHTML = "";

  if (points.length === 0) {
    container.innerHTML = `<p style="color:var(--text-secondary);text-align:center;padding:32px 0;">No data yet for this exercise.</p>`;
    return;
  }
  if (points.length === 1) {
    container.innerHTML = `
      <div class="text-center" style="padding:24px 0;">
        <div style="font-size:34px;font-weight:800;">${points[0].value}${unit}</div>
        <p style="color:var(--text-secondary);margin-top:4px;">Logged once — log it again to see a trend line.</p>
      </div>`;
    return;
  }

  const W = 320, H = 180;
  const padL = 40, padR = 12, padT = 16, padB = 24;
  const plotW = W - padL - padR, plotH = H - padT - padB;

  const values = points.map((p) => p.value);
  let min = Math.min(...values), max = Math.max(...values);
  if (min === max) { min -= 1; max += 1; }
  const pad = (max - min) * 0.15;
  min = Math.max(0, min - pad);
  max = max + pad;

  const xAt = (i) => padL + (i / (points.length - 1)) * plotW;
  const yAt = (v) => padT + plotH - ((v - min) / (max - min)) * plotH;

  const svg = sv("svg", { viewBox: `0 0 ${W} ${H}`, class: "weight-chart", role: "img", "aria-label": "Weight progress chart" });

  // gridlines
  const gridStep = niceStep(max - min);
  const gridStart = Math.ceil(min / gridStep) * gridStep;
  for (let v = gridStart; v <= max; v += gridStep) {
    const y = yAt(v);
    svg.appendChild(sv("line", { x1: padL, x2: W - padR, y1: y, y2: y, style: "stroke:var(--border);stroke-width:1" }));
    const label = sv("text", { x: 4, y: y + 3, style: "fill:var(--text-tertiary);font-size:8px;font-family:var(--font)" });
    label.textContent = Math.round(v);
    svg.appendChild(label);
  }

  // area fill
  const areaPts = points.map((p, i) => `${xAt(i)},${yAt(p.value)}`).join(" L");
  const area = sv("path", {
    d: `M${padL},${padT + plotH} L${areaPts} L${W - padR},${padT + plotH} Z`,
    style: "fill:var(--accent-dim);stroke:none",
  });
  svg.appendChild(area);

  // line
  const linePts = points.map((p, i) => `${xAt(i)},${yAt(p.value)}`).join(" L");
  svg.appendChild(sv("path", {
    d: `M${linePts}`,
    style: "fill:none;stroke:var(--accent);stroke-width:2.5",
    "stroke-linecap": "round",
    "stroke-linejoin": "round",
  }));

  // PR marker
  const peak = Math.max(...values);
  points.forEach((p, i) => {
    const isPR = p.value === peak;
    svg.appendChild(sv("circle", {
      cx: xAt(i), cy: yAt(p.value), r: isPR ? 5 : 3.5,
      style: `fill:${isPR ? "var(--success)" : "var(--accent)"};stroke:var(--bg-elevated);stroke-width:1.5`,
    }));
  });

  // x-axis first/last labels
  [0, points.length - 1].forEach((i) => {
    const label = sv("text", {
      x: i === 0 ? xAt(i) : xAt(i),
      y: H - 6,
      style: "fill:var(--text-tertiary);font-size:8px;font-family:var(--font)",
      "text-anchor": i === 0 ? "start" : "end",
    });
    label.textContent = new Date(points[i].date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
    svg.appendChild(label);
  });

  // hover / touch interaction
  const cursorLine = sv("line", { y1: padT, y2: padT + plotH, style: "stroke:var(--text-tertiary);stroke-width:1;opacity:0" });
  svg.appendChild(cursorLine);
  const hitRect = sv("rect", { x: padL, y: padT, width: plotW, height: plotH, style: "fill:transparent" });
  svg.appendChild(hitRect);

  const tooltip = document.createElement("div");
  tooltip.className = "chart-tooltip";
  tooltip.style.cssText = "position:absolute;pointer-events:none;opacity:0;transition:opacity .12s;background:var(--text);color:var(--bg);font-size:12px;font-weight:600;padding:4px 8px;border-radius:8px;white-space:nowrap;transform:translate(-50%,-130%);";

  const wrap = document.createElement("div");
  wrap.style.position = "relative";
  wrap.appendChild(svg);
  wrap.appendChild(tooltip);
  container.appendChild(wrap);

  function nearestIndex(clientX) {
    const rect = svg.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * W;
    let closest = 0, closestDist = Infinity;
    points.forEach((p, i) => {
      const d = Math.abs(xAt(i) - x);
      if (d < closestDist) { closestDist = d; closest = i; }
    });
    return closest;
  }

  function showAt(i, clientX) {
    const p = points[i];
    cursorLine.setAttribute("x1", xAt(i));
    cursorLine.setAttribute("x2", xAt(i));
    cursorLine.style.opacity = "1";
    const rect = svg.getBoundingClientRect();
    const px = ((xAt(i) / W) * rect.width);
    const py = ((yAt(p.value) / H) * rect.height);
    tooltip.style.left = `${px}px`;
    tooltip.style.top = `${py}px`;
    tooltip.style.opacity = "1";
    tooltip.textContent = `${p.value}${unit} · ${new Date(p.date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}`;
  }
  function hide() {
    cursorLine.style.opacity = "0";
    tooltip.style.opacity = "0";
  }

  hitRect.addEventListener("pointermove", (e) => showAt(nearestIndex(e.clientX)));
  hitRect.addEventListener("pointerdown", (e) => showAt(nearestIndex(e.clientX)));
  hitRect.addEventListener("pointerleave", hide);

  // accessible data table (hidden by default)
  const table = document.createElement("table");
  table.className = "chart-table hidden";
  table.innerHTML = `
    <thead><tr><th>Date</th><th>Weight</th></tr></thead>
    <tbody>${points.map((p) => `<tr><td>${escapeHTML(new Date(p.date).toLocaleDateString())}</td><td>${p.value}${unit}</td></tr>`).join("")}</tbody>
  `;
  const toggleBtn = document.createElement("button");
  toggleBtn.className = "btn-ghost";
  toggleBtn.style.cssText = "font-size:13px;margin-top:4px;";
  toggleBtn.textContent = "View as table";
  toggleBtn.addEventListener("click", () => {
    table.classList.toggle("hidden");
    toggleBtn.textContent = table.classList.contains("hidden") ? "View as table" : "Hide table";
  });
  container.appendChild(toggleBtn);
  container.appendChild(table);
}
