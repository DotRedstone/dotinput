const colorRoles = ["surface", "surface_container_low", "surface_container_high", "on_surface", "primary", "on_primary", "outline", "outline_variant"];
const candidateWords = ["你好", "你号", "拟好", "泥号", "倪好", "霓好", "逆号", "匿好", "妮好"];

const copy = {
  en: { pageTitle: "Fcitx5 Dynamic Themes Studio", theme: "Theme", themeName: "Theme name", appearance: "Appearance", colorMode: "Color mode", light: "Light", dark: "Dark", shape: "Shape", rounded: "Rounded", angular: "Angular", geometry: "Geometry", panelRadius: "Panel radius", highlightRadius: "Highlight radius", outlineWidth: "Outline width", panelInset: "Panel inset", highlightInset: "Highlight inset", palette: "Palette", livePreview: "Live preview", candidateWindow: "Candidate window", preview: "Preview", previewOnly: "Preview only", candidateLayout: "Candidate layout", horizontal: "Horizontal", vertical: "Vertical", candidateCount: "Candidate count", selectHint: "Select a candidate", themeJson: "Theme JSON", downloadJson: "Download JSON", install: "Install", fewerCandidates: "Fewer candidates", moreCandidates: "More candidates", copyJson: "Copy JSON", copyCommand: "Copy command", reset: "Reset", import: "Import theme JSON", repository: "Open GitHub repository", status: (mode, variant) => `${mode} · ${variant}` },
  zh: { pageTitle: "Fcitx5 动态主题工作室", theme: "主题", themeName: "主题名称", appearance: "外观", colorMode: "颜色模式", light: "浅色", dark: "深色", shape: "形状", rounded: "圆角", angular: "切角", geometry: "几何参数", panelRadius: "面板圆角", highlightRadius: "高亮圆角", outlineWidth: "描边宽度", panelInset: "面板内环", highlightInset: "高亮内环", palette: "配色", livePreview: "实时预览", candidateWindow: "候选窗", preview: "预览", previewOnly: "仅预览", candidateLayout: "候选词布局", horizontal: "横向", vertical: "纵向", candidateCount: "候选词数量", selectHint: "选择候选词", themeJson: "主题 JSON", downloadJson: "下载 JSON", install: "安装", fewerCandidates: "减少候选词", moreCandidates: "增加候选词", copyJson: "复制 JSON", copyCommand: "复制命令", reset: "重置", import: "导入主题 JSON", repository: "打开 GitHub 仓库", status: (mode, variant) => `${mode} · ${variant}` },
};

const defaults = {
  name: "my-fcitx-theme",
  mode: "dark",
  variant: "rounded",
  palette: {
    light: { surface: "#FFFBFE", surface_container_low: "#F7F2FA", surface_container_high: "#EDE7F0", on_surface: "#1D1B20", primary: "#6750A4", on_primary: "#FFFFFF", outline: "#79747E", outline_variant: "#CAC4D0" },
    dark: { surface: "#1D1B20", surface_container_low: "#1D1B20", surface_container_high: "#2B2930", on_surface: "#E6E1E5", primary: "#D0BCFF", on_primary: "#381E72", outline: "#938F99", outline_variant: "#49454F" },
  },
  design: { panel_radius: 12, highlight_radius: 9, panel_outline_width: 1.25, panel_inner_opacity: 0.5, highlight_inner_opacity: 0.24 },
};

let state = structuredClone(defaults);
let preview = { layout: "horizontal", candidateCount: 5 };
let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
const designControls = { "panel-radius": ["panel_radius", "panel-radius-value"], "highlight-radius": ["highlight_radius", "highlight-radius-value"], "outline-width": ["panel_outline_width", "outline-width-value"], "panel-opacity": ["panel_inner_opacity", "panel-opacity-value"], "highlight-opacity": ["highlight_inner_opacity", "highlight-opacity-value"] };
const byId = (id) => document.getElementById(id);
const t = (key) => copy[language][key];

function safeName(name) { const cleaned = name.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, ""); return cleaned || "my-fcitx-theme"; }
function exportConfig() { return { name: safeName(state.name), mode: state.mode, variant: state.variant, palette: state.palette, design: state.design }; }

function setPreviewVariables() {
  const colors = state.palette[state.mode];
  const root = document.documentElement.style;
  root.setProperty("--theme-surface", colors.surface); root.setProperty("--theme-surface-low", colors.surface_container_low); root.setProperty("--theme-on-surface", colors.on_surface); root.setProperty("--theme-primary", colors.primary); root.setProperty("--theme-on-primary", colors.on_primary); root.setProperty("--theme-outline", colors.outline); root.setProperty("--theme-outline-variant", colors.outline_variant);
  root.setProperty("--panel-radius", `${state.design.panel_radius}px`); root.setProperty("--highlight-radius", `${state.design.highlight_radius}px`); root.setProperty("--panel-outline-width", `${state.design.panel_outline_width}px`); root.setProperty("--panel-inset-opacity", state.design.panel_inner_opacity); root.setProperty("--highlight-inset-opacity", state.design.highlight_inner_opacity); root.setProperty("--candidate-columns", preview.candidateCount); root.setProperty("--preview-stage-height", `${preview.layout === "vertical" ? 250 + preview.candidateCount * 47 : 500}px`);
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  [["reset", "reset"], ["import-label", "import"], ["repository-link", "repository"], ["candidate-less", "fewerCandidates"], ["candidate-more", "moreCandidates"], ["copy-config", "copyJson"], ["copy-command", "copyCommand"]].forEach(([id, key]) => { byId(id).title = byId(id).ariaLabel = t(key); });
  document.querySelectorAll("[data-language]").forEach((button) => button.classList.toggle("active", button.dataset.language === language));
}

function renderColorControls() {
  const colors = state.palette[state.mode];
  byId("color-controls").replaceChildren(...colorRoles.map((role) => {
    const row = document.createElement("div"); row.className = "color-row";
    const label = document.createElement("label"); label.htmlFor = `color-${role}`; label.textContent = role;
    const hex = document.createElement("input"); hex.className = "hex-input"; hex.type = "text"; hex.maxLength = 7; hex.value = colors[role]; hex.setAttribute("aria-label", `${role} hex value`);
    const updateHex = () => { if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) return false; state.palette[state.mode][role] = hex.value.toUpperCase(); render(); return true; };
    hex.addEventListener("input", updateHex); hex.addEventListener("change", () => { if (!updateHex()) render(); });
    const picker = document.createElement("input"); picker.id = `color-${role}`; picker.className = "color-input"; picker.type = "color"; picker.value = colors[role]; picker.addEventListener("input", () => { state.palette[state.mode][role] = picker.value.toUpperCase(); render(); });
    row.append(label, hex, picker); return row;
  }));
}

function renderCandidates() {
  byId("candidates").replaceChildren(...candidateWords.slice(0, preview.candidateCount).map((word, index) => {
    const item = document.createElement("div"); item.className = `candidate${index === 0 ? " selected" : ""}`; item.innerHTML = `<b>${index + 1}</b><span>${word}</span>`; return item;
  }));
}

function render() {
  setPreviewVariables(); applyLanguage(); byId("theme-name").value = state.name;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  document.querySelectorAll("[data-variant]").forEach((button) => button.classList.toggle("active", button.dataset.variant === state.variant));
  document.querySelectorAll("[data-preview-layout]").forEach((button) => button.classList.toggle("active", button.dataset.previewLayout === preview.layout));
  const mode = t(state.mode); const variant = t(state.variant); byId("variant-label").textContent = variant; byId("palette-mode").textContent = mode; byId("preview-status").textContent = t("status")(mode, variant);
  byId("rounded-controls").hidden = state.variant !== "rounded";
  Object.entries(designControls).forEach(([id, [key, output]]) => { byId(id).value = state.design[key]; byId(output).value = state.design[key]; });
  byId("candidate-count").value = preview.candidateCount; byId("candidate-less").disabled = preview.candidateCount <= 3; byId("candidate-more").disabled = preview.candidateCount >= candidateWords.length;
  const panel = byId("candidate-panel"); panel.classList.toggle("angular", state.variant === "angular"); panel.classList.toggle("horizontal", preview.layout === "horizontal"); byId("candidate-panel").parentElement.classList.toggle("vertical-preview", preview.layout === "vertical");
  renderColorControls(); renderCandidates(); byId("json-output").textContent = JSON.stringify(exportConfig(), null, 2); byId("install-command").textContent = `fcitx5-dynamic-themes render --config ~/Downloads/${safeName(state.name)}.json --reload`; window.lucide.createIcons();
}

function mergeImportedTheme(payload) {
  if (!payload || typeof payload !== "object" || !payload.palette || !payload.palette.light || !payload.palette.dark) throw new Error("Theme JSON needs light and dark palettes.");
  for (const mode of ["light", "dark"]) for (const role of colorRoles) if (!/^#[0-9a-fA-F]{6}$/.test(payload.palette[mode][role] || "")) throw new Error(`Invalid ${mode}.${role} color.`);
  state = structuredClone(defaults); state.name = typeof payload.name === "string" ? payload.name.slice(0, 64) : state.name; state.mode = payload.mode === "light" ? "light" : "dark"; state.variant = payload.variant === "angular" ? "angular" : "rounded"; state.palette = payload.palette;
  if (payload.design && typeof payload.design === "object") for (const [key, value] of Object.entries(payload.design)) if (key in state.design && typeof value === "number" && Number.isFinite(value)) state.design[key] = value;
}

function copied(button) { const icon = button.querySelector("svg"); if (!icon) return; const previous = icon.outerHTML; icon.outerHTML = '<i data-lucide="check"></i>'; window.lucide.createIcons(); window.setTimeout(() => { button.innerHTML = previous; window.lucide.createIcons(); }, 1200); }

document.addEventListener("DOMContentLoaded", () => {
  byId("theme-name").addEventListener("input", (event) => { state.name = event.target.value; render(); });
  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => { language = button.dataset.language; render(); }));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; render(); }));
  document.querySelectorAll("[data-variant]").forEach((button) => button.addEventListener("click", () => { state.variant = button.dataset.variant; render(); }));
  document.querySelectorAll("[data-preview-layout]").forEach((button) => button.addEventListener("click", () => { preview.layout = button.dataset.previewLayout; render(); }));
  Object.entries(designControls).forEach(([id, [key]]) => byId(id).addEventListener("input", (event) => { state.design[key] = Number(event.target.value); render(); }));
  byId("candidate-less").addEventListener("click", () => { preview.candidateCount = Math.max(3, preview.candidateCount - 1); render(); }); byId("candidate-more").addEventListener("click", () => { preview.candidateCount = Math.min(candidateWords.length, preview.candidateCount + 1); render(); });
  byId("reset").addEventListener("click", () => { state = structuredClone(defaults); preview = { layout: "horizontal", candidateCount: 5 }; render(); });
  byId("download").addEventListener("click", () => { const file = new Blob([JSON.stringify(exportConfig(), null, 2) + "\n"], { type: "application/json" }); const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: `${safeName(state.name)}.json` }); link.click(); URL.revokeObjectURL(link.href); });
  byId("copy-config").addEventListener("click", async (event) => { await navigator.clipboard.writeText(JSON.stringify(exportConfig(), null, 2)); copied(event.currentTarget); }); byId("copy-command").addEventListener("click", async (event) => { await navigator.clipboard.writeText(byId("install-command").textContent); copied(event.currentTarget); });
  byId("import").addEventListener("change", async (event) => { const [file] = event.target.files; if (!file) return; try { mergeImportedTheme(JSON.parse(await file.text())); render(); } catch (error) { window.alert(error.message); } event.target.value = ""; }); render();
});
