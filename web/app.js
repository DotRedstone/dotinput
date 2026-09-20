const colorRoles = [
  "surface",
  "surface_container_low",
  "surface_container_high",
  "on_surface",
  "primary",
  "on_primary",
  "outline",
  "outline_variant",
];

const defaults = {
  name: "my-fcitx-theme",
  mode: "dark",
  variant: "rounded",
  palette: {
    light: {
      surface: "#FFFBFE", surface_container_low: "#F7F2FA", surface_container_high: "#EDE7F0",
      on_surface: "#1D1B20", primary: "#6750A4", on_primary: "#FFFFFF",
      outline: "#79747E", outline_variant: "#CAC4D0",
    },
    dark: {
      surface: "#1D1B20", surface_container_low: "#1D1B20", surface_container_high: "#2B2930",
      on_surface: "#E6E1E5", primary: "#D0BCFF", on_primary: "#381E72",
      outline: "#938F99", outline_variant: "#49454F",
    },
  },
  design: {
    panel_radius: 12, highlight_radius: 9, panel_outline_width: 1.25,
    panel_inner_opacity: 0.5, highlight_inner_opacity: 0.24,
  },
};

let state = structuredClone(defaults);
const designControls = {
  "panel-radius": ["panel_radius", "panel-radius-value"],
  "highlight-radius": ["highlight_radius", "highlight-radius-value"],
  "outline-width": ["panel_outline_width", "outline-width-value"],
  "panel-opacity": ["panel_inner_opacity", "panel-opacity-value"],
  "highlight-opacity": ["highlight_inner_opacity", "highlight-opacity-value"],
};

const byId = (id) => document.getElementById(id);
const copied = (button) => {
  const icon = button.querySelector("svg");
  if (!icon) return;
  const previous = icon.outerHTML;
  icon.outerHTML = '<i data-lucide="check"></i>';
  window.lucide.createIcons();
  window.setTimeout(() => { button.innerHTML = previous; window.lucide.createIcons(); }, 1200);
};

function exportConfig() {
  return {
    name: safeName(state.name),
    mode: state.mode,
    variant: state.variant,
    palette: state.palette,
    design: state.design,
  };
}

function safeName(name) {
  const cleaned = name.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "");
  return cleaned || "my-fcitx-theme";
}

function setPreviewVariables() {
  const colors = state.palette[state.mode];
  const root = document.documentElement.style;
  root.setProperty("--surface", colors.surface);
  root.setProperty("--surface-low", colors.surface_container_low);
  root.setProperty("--surface-high", colors.surface_container_high);
  root.setProperty("--on-surface", colors.on_surface);
  root.setProperty("--primary", colors.primary);
  root.setProperty("--on-primary", colors.on_primary);
  root.setProperty("--outline", colors.outline);
  root.setProperty("--outline-variant", colors.outline_variant);
  root.setProperty("--panel-radius", `${state.design.panel_radius}px`);
  root.setProperty("--highlight-radius", `${state.design.highlight_radius}px`);
  root.setProperty("--panel-outline-width", `${state.design.panel_outline_width}px`);
  root.setProperty("--panel-inset-opacity", state.design.panel_inner_opacity);
  root.setProperty("--highlight-inset-opacity", state.design.highlight_inner_opacity);
}

function renderControls() {
  byId("theme-name").value = state.name;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  document.querySelectorAll("[data-variant]").forEach((button) => button.classList.toggle("active", button.dataset.variant === state.variant));
  byId("variant-label").textContent = state.variant === "rounded" ? "Rounded" : "Angular";
  byId("palette-mode").textContent = state.mode === "dark" ? "Dark" : "Light";
  byId("preview-status").textContent = `${state.mode[0].toUpperCase()}${state.mode.slice(1)} / ${state.variant[0].toUpperCase()}${state.variant.slice(1)}`;
  byId("rounded-controls").hidden = state.variant !== "rounded";
  Object.entries(designControls).forEach(([id, [key, output]]) => {
    byId(id).value = state.design[key];
    byId(output).value = state.design[key];
  });
  const colors = state.palette[state.mode];
  byId("color-controls").replaceChildren(...colorRoles.map((role) => {
    const row = document.createElement("div");
    row.className = "color-row";
    const label = document.createElement("label");
    label.htmlFor = `color-${role}`;
    label.textContent = role;
    const hex = document.createElement("input");
    hex.className = "hex-input";
    hex.type = "text";
    hex.maxLength = 7;
    hex.value = colors[role];
    hex.setAttribute("aria-label", `${role} hex value`);
    const updateHex = () => {
      if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) return false;
      state.palette[state.mode][role] = hex.value.toUpperCase();
      render();
      return true;
    };
    hex.addEventListener("input", updateHex);
    hex.addEventListener("change", () => { if (!updateHex()) render(); });
    const input = document.createElement("input");
    input.id = `color-${role}`;
    input.className = "color-input";
    input.type = "color";
    input.value = colors[role];
    input.addEventListener("input", () => { state.palette[state.mode][role] = input.value.toUpperCase(); render(); });
    row.append(label, hex, input);
    return row;
  }));
}

function render() {
  setPreviewVariables();
  renderControls();
  byId("candidate-panel").classList.toggle("angular", state.variant === "angular");
  byId("json-output").textContent = JSON.stringify(exportConfig(), null, 2);
  byId("install-command").textContent = `fcitx5-dynamic-themes render --config ~/Downloads/${safeName(state.name)}.json --reload`;
}

function mergeImportedTheme(payload) {
  if (!payload || typeof payload !== "object" || !payload.palette || !payload.palette.light || !payload.palette.dark) {
    throw new Error("Theme JSON needs light and dark palettes.");
  }
  for (const mode of ["light", "dark"]) {
    for (const role of colorRoles) {
      if (!/^#[0-9a-fA-F]{6}$/.test(payload.palette[mode][role] || "")) throw new Error(`Invalid ${mode}.${role} color.`);
    }
  }
  state = structuredClone(defaults);
  state.name = typeof payload.name === "string" ? payload.name.slice(0, 64) : state.name;
  state.mode = payload.mode === "light" ? "light" : "dark";
  state.variant = payload.variant === "angular" ? "angular" : "rounded";
  state.palette = payload.palette;
  if (payload.design && typeof payload.design === "object") {
    for (const [key, value] of Object.entries(payload.design)) {
      if (key in state.design && typeof value === "number" && Number.isFinite(value)) state.design[key] = value;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  byId("theme-name").addEventListener("input", (event) => { state.name = event.target.value; render(); });
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; render(); }));
  document.querySelectorAll("[data-variant]").forEach((button) => button.addEventListener("click", () => { state.variant = button.dataset.variant; render(); }));
  Object.entries(designControls).forEach(([id, [key]]) => byId(id).addEventListener("input", (event) => { state.design[key] = Number(event.target.value); render(); }));
  byId("reset").addEventListener("click", () => { state = structuredClone(defaults); render(); });
  byId("download").addEventListener("click", () => {
    const file = new Blob([JSON.stringify(exportConfig(), null, 2) + "\n"], { type: "application/json" });
    const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: `${safeName(state.name)}.json` });
    link.click();
    URL.revokeObjectURL(link.href);
  });
  byId("copy-config").addEventListener("click", async (event) => { await navigator.clipboard.writeText(JSON.stringify(exportConfig(), null, 2)); copied(event.currentTarget); });
  byId("copy-command").addEventListener("click", async (event) => { await navigator.clipboard.writeText(byId("install-command").textContent); copied(event.currentTarget); });
  byId("import").addEventListener("change", async (event) => {
    const [file] = event.target.files;
    if (!file) return;
    try { mergeImportedTheme(JSON.parse(await file.text())); render(); } catch (error) { window.alert(error.message); }
    event.target.value = "";
  });
  render();
  window.lucide.createIcons();
});
