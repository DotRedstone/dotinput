const colorRoles = ["surface", "surface_container_low", "surface_container_high", "on_surface", "primary", "on_primary", "outline", "outline_variant"];
const candidateWords = ["你好", "你号", "拟好", "泥号", "倪好", "霓好", "逆号", "匿好", "妮好"];
const previewScale = 0.5;

const copy = {
  en: {
    pageTitle: "DotInput Themes Studio", theme: "Theme", themeName: "Theme name", restoreDefaults: "Restore theme defaults", appearance: "Appearance", colorMode: "Color mode", light: "Light", dark: "Dark", shape: "Shape", rounded: "Rounded", angular: "Angular", geometry: "Geometry", panelRadius: "Panel radius", highlightRadius: "Highlight radius", outlineWidth: "Outline width", contentPadding: "Candidate inset", textMarginHorizontal: "Text margin, horizontal", textMarginVertical: "Text margin, top", textMarginBottom: "Text margin, bottom", panelInset: "Panel inner line", highlightInset: "Highlight inner line", advanced: "Advanced Fcitx5 parameters", panelSliceMargin: "Panel image slice", highlightSliceMarginHorizontal: "Highlight image slice, horizontal", highlightSliceMarginVertical: "Highlight image slice, vertical", fullWidthHighlight: "Fill row when vertical", candidateLabelScale: "Candidate label scale", candidateCommentScale: "Candidate comment scale", palette: "Palette", livePreview: "Live preview", candidateWindow: "Candidate window", preview: "Preview", previewOnly: "Preview only", candidateLayout: "Candidate layout", horizontal: "Horizontal", vertical: "Vertical", candidateCount: "Candidate count", themeJson: "Theme JSON", themeJsonBackup: "Theme JSON backup", downloadJson: "Download JSON", quickInstall: "Apply theme", copyInstallCommand: "Copy apply command", fewerCandidates: "Fewer candidates", moreCandidates: "More candidates", copyJson: "Copy JSON", copyCommand: "Copy command", reset: "Restore theme defaults", import: "Import theme JSON", repository: "Open GitHub repository", raw: "theme units", visible: "preview px", status: (mode, variant) => `${mode} · ${variant}`,
  },
  zh: {
    pageTitle: "DotInput Themes 工作室", theme: "主题", themeName: "主题名称", restoreDefaults: "恢复默认主题", appearance: "外观", colorMode: "颜色模式", light: "浅色", dark: "深色", shape: "形状", rounded: "圆角", angular: "切角", geometry: "几何参数", panelRadius: "面板圆角", highlightRadius: "高亮圆角", outlineWidth: "描边宽度", contentPadding: "候选内边距", textMarginHorizontal: "文字边距（横向）", textMarginVertical: "文字上边距", textMarginBottom: "文字下边距", panelInset: "面板内环", highlightInset: "高亮内环", advanced: "高级 Fcitx5 参数", panelSliceMargin: "面板图片切片边距", highlightSliceMarginHorizontal: "高亮图片切片边距（横向）", highlightSliceMarginVertical: "高亮图片切片边距（纵向）", fullWidthHighlight: "纵向时高亮铺满整行", candidateLabelScale: "候选序号缩放", candidateCommentScale: "候选注释缩放", palette: "配色", livePreview: "实时预览", candidateWindow: "候选窗", preview: "预览", previewOnly: "仅预览", candidateLayout: "候选词布局", horizontal: "横向", vertical: "纵向", candidateCount: "候选词数量", themeJson: "主题 JSON", themeJsonBackup: "主题 JSON 备份", downloadJson: "下载 JSON", quickInstall: "应用主题", copyInstallCommand: "复制应用命令", fewerCandidates: "减少候选词", moreCandidates: "增加候选词", copyJson: "复制 JSON", copyCommand: "复制命令", reset: "恢复默认主题", import: "导入主题 JSON", repository: "打开 GitHub 仓库", raw: "主题单位", visible: "预览像素", status: (mode, variant) => `${mode} · ${variant}`,
  },
};

copy.en.styleThemes = "Style";
copy.zh.styleThemes = "样式主题";
copy.en.colorThemes = "Color";
copy.zh.colorThemes = "配色主题";

const defaults = {
  name: "my-input-theme",
  mode: "dark",
  variant: "rounded",
  palette: {
    light: { surface: "#FFFBFE", surface_container_low: "#F7F2FA", surface_container_high: "#EDE7F0", on_surface: "#1D1B20", primary: "#6750A4", on_primary: "#FFFFFF", outline: "#79747E", outline_variant: "#CAC4D0" },
    dark: { surface: "#1D1B20", surface_container_low: "#1D1B20", surface_container_high: "#2B2930", on_surface: "#E6E1E5", primary: "#D0BCFF", on_primary: "#381E72", outline: "#938F99", outline_variant: "#49454F" },
  },
  design: {
    panel_radius: 12, highlight_radius: 9, panel_outline_width: 1.25, content_padding: 12,
    text_margin_horizontal: 9, text_margin_vertical: 6, text_margin_bottom: 7, panel_inner_opacity: 0.5,
    highlight_inner_opacity: 0.24, panel_slice_margin: 15, highlight_slice_margin_horizontal: 15, highlight_slice_margin_vertical: 10,
    full_width_highlight: true, candidate_comment_scale: 1,
  },
};

const styleThemes = [
  { id: "studio", names: { en: "Studio", zh: "工作室" }, design: structuredClone(defaults.design) },
  { id: "compact", names: { en: "Compact", zh: "紧凑" }, design: { panel_radius: 14, highlight_radius: 12, panel_outline_width: 2, content_padding: 0, text_margin_horizontal: 10, text_margin_vertical: 5, text_margin_bottom: 6, panel_inner_opacity: 0.42, highlight_inner_opacity: 0.18, panel_slice_margin: 15, highlight_slice_margin_horizontal: 15, highlight_slice_margin_vertical: 10, full_width_highlight: true, candidate_comment_scale: 1 } },
  { id: "soft", names: { en: "Soft", zh: "柔润" }, design: { panel_radius: 26, highlight_radius: 25, panel_outline_width: 3, content_padding: 4, text_margin_horizontal: 12, text_margin_vertical: 6, text_margin_bottom: 7, panel_inner_opacity: 0.5, highlight_inner_opacity: 0.24, panel_slice_margin: 15, highlight_slice_margin_horizontal: 15, highlight_slice_margin_vertical: 10, full_width_highlight: true, candidate_comment_scale: 1 } },
  { id: "outlined", names: { en: "Outlined", zh: "描边" }, design: { panel_radius: 20, highlight_radius: 18, panel_outline_width: 5, content_padding: 3, text_margin_horizontal: 12, text_margin_vertical: 6, text_margin_bottom: 7, panel_inner_opacity: 0.58, highlight_inner_opacity: 0.3, panel_slice_margin: 15, highlight_slice_margin_horizontal: 15, highlight_slice_margin_vertical: 10, full_width_highlight: true, candidate_comment_scale: 1 } },
];

const colorThemes = [
  { id: "studio", names: { en: "Studio", zh: "工作室" }, mode: "dark", palette: structuredClone(defaults.palette) },
  { id: "sea-glass", names: { en: "Sea Glass", zh: "海玻璃" }, mode: "dark", palette: { light: { surface: "#F7FBF8", surface_container_low: "#EAF5F0", surface_container_high: "#DDECE5", on_surface: "#17201D", primary: "#176B59", on_primary: "#FFFFFF", outline: "#65756E", outline_variant: "#C1D0C8" }, dark: { surface: "#18201D", surface_container_low: "#1D2722", surface_container_high: "#29342E", on_surface: "#E1E8E2", primary: "#7FD8B4", on_primary: "#003824", outline: "#8B9B92", outline_variant: "#3E4C45" } } },
  { id: "orchid-ink", names: { en: "Orchid Ink", zh: "兰墨" }, mode: "dark", palette: { light: { surface: "#FCF8FC", surface_container_low: "#F7EFF7", surface_container_high: "#EEDFED", on_surface: "#251A25", primary: "#844D83", on_primary: "#FFFFFF", outline: "#806F7E", outline_variant: "#D1C2CF" }, dark: { surface: "#231B24", surface_container_low: "#2C222D", surface_container_high: "#392C3A", on_surface: "#F0E4EF", primary: "#ECB8E8", on_primary: "#4E1A50", outline: "#A996A5", outline_variant: "#544654" } } },
  { id: "citrus-note", names: { en: "Citrus Note", zh: "柑橘便签" }, mode: "light", palette: { light: { surface: "#FFF9F0", surface_container_low: "#FFF1DB", surface_container_high: "#FCE2C0", on_surface: "#2B2114", primary: "#9A4F00", on_primary: "#FFFFFF", outline: "#866F55", outline_variant: "#DBC5A8" }, dark: { surface: "#2A2117", surface_container_low: "#34291D", surface_container_high: "#443523", on_surface: "#F6E7D0", primary: "#FFB869", on_primary: "#542400", outline: "#B59B7D", outline_variant: "#5E4B38" } } },
  { id: "rose-quartz", names: { en: "Rose Quartz", zh: "蔷薇石英" }, mode: "dark", palette: { light: { surface: "#FFF8F8", surface_container_low: "#FDEEF0", surface_container_high: "#F6DFE3", on_surface: "#28191D", primary: "#A43D63", on_primary: "#FFFFFF", outline: "#886D75", outline_variant: "#DDC1C9" }, dark: { surface: "#291B20", surface_container_low: "#342127", surface_container_high: "#432B33", on_surface: "#F6E2E8", primary: "#FFB1C6", on_primary: "#651331", outline: "#B49AA3", outline_variant: "#5E444D" } } },
  { id: "forest-canopy", names: { en: "Canopy", zh: "林冠" }, mode: "dark", palette: { light: { surface: "#F5FAF1", surface_container_low: "#E9F3E3", surface_container_high: "#DCE9D5", on_surface: "#1A2317", primary: "#416E2A", on_primary: "#FFFFFF", outline: "#6E7C65", outline_variant: "#C4D0BA" }, dark: { surface: "#1B2417", surface_container_low: "#222D1D", surface_container_high: "#2E3B27", on_surface: "#E4ECD9", primary: "#A6D783", on_primary: "#173900", outline: "#99A58D", outline_variant: "#465140" } } },
  { id: "blueprint", names: { en: "Blueprint", zh: "蓝图" }, mode: "dark", palette: { light: { surface: "#F8FAFF", surface_container_low: "#EDF2FC", surface_container_high: "#E0E8F7", on_surface: "#19202C", primary: "#365C9C", on_primary: "#FFFFFF", outline: "#68778D", outline_variant: "#C0CADB" }, dark: { surface: "#1C222D", surface_container_low: "#232B38", surface_container_high: "#2E3747", on_surface: "#E4E9F4", primary: "#B3C5FF", on_primary: "#123268", outline: "#98A7BF", outline_variant: "#445064" } } },
  { id: "ember", names: { en: "Ember", zh: "余烬" }, mode: "dark", palette: { light: { surface: "#FFF8F5", surface_container_low: "#FFEDE7", surface_container_high: "#FBDDD3", on_surface: "#2D1D1A", primary: "#A94632", on_primary: "#FFFFFF", outline: "#8B6D65", outline_variant: "#DFC2B9" }, dark: { surface: "#2B1D1A", surface_container_low: "#36231E", surface_container_high: "#452D26", on_surface: "#F8E3DC", primary: "#FFB3A1", on_primary: "#61210F", outline: "#B69A92", outline_variant: "#5E443D" } } },
  { id: "peacock", names: { en: "Peacock", zh: "孔雀" }, mode: "dark", palette: { light: { surface: "#F4FBFB", surface_container_low: "#E5F4F3", surface_container_high: "#D7E9E9", on_surface: "#172324", primary: "#007D82", on_primary: "#FFFFFF", outline: "#617A7B", outline_variant: "#B8D0D0" }, dark: { surface: "#172526", surface_container_low: "#1D3031", surface_container_high: "#284041", on_surface: "#D9ECEB", primary: "#6DDBDB", on_primary: "#003D3F", outline: "#90A9A9", outline_variant: "#405657" } } },
  { id: "paper-sage", names: { en: "Paper Sage", zh: "纸上鼠尾草" }, mode: "light", palette: { light: { surface: "#FBFCF7", surface_container_low: "#F1F4E9", surface_container_high: "#E6EADF", on_surface: "#20231C", primary: "#5D6E32", on_primary: "#FFFFFF", outline: "#727866", outline_variant: "#CCD1C0" }, dark: { surface: "#23271E", surface_container_low: "#2C3125", surface_container_high: "#383E2F", on_surface: "#E8EADD", primary: "#C2D58E", on_primary: "#2B3907", outline: "#A6AA98", outline_variant: "#505545" } } },
];

let state = structuredClone(defaults);
let preview = { layout: "horizontal", candidateCount: 5 };
let language = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
let selectedStyleTheme = "studio";
let selectedColorTheme = "studio";
const designControls = {
  "panel-radius": ["panel_radius", "panel-radius-value"],
  "highlight-radius": ["highlight_radius", "highlight-radius-value"],
  "outline-width": ["panel_outline_width", "outline-width-value"],
  "content-padding": ["content_padding", "content-padding-value"],
  "text-margin-horizontal": ["text_margin_horizontal", "text-margin-horizontal-value"],
  "text-margin-vertical": ["text_margin_vertical", "text-margin-vertical-value"],
  "text-margin-bottom": ["text_margin_bottom", "text-margin-bottom-value"],
  "panel-opacity": ["panel_inner_opacity", "panel-opacity-value"],
  "highlight-opacity": ["highlight_inner_opacity", "highlight-opacity-value"],
  "panel-slice-margin": ["panel_slice_margin", "panel-slice-margin-value"],
  "highlight-slice-margin-horizontal": ["highlight_slice_margin_horizontal", "highlight-slice-margin-horizontal-value"],
  "highlight-slice-margin-vertical": ["highlight_slice_margin_vertical", "highlight-slice-margin-vertical-value"],
  "candidate-comment-scale": ["candidate_comment_scale", "candidate-comment-scale-value"],
};
// SVG coordinates use a 60px viewBox in a 30px asset; Fcitx margins are raw pixels.
const scaledControls = new Set(["panel-radius", "highlight-radius", "outline-width"]);
const byId = (id) => document.getElementById(id);
const t = (key) => copy[language][key];
const asNumber = (value) => Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));

function safeName(name) { const cleaned = name.trim().replace(/[^A-Za-z0-9._-]+/g, "-").replace(/^-+|-+$/g, ""); return cleaned || "my-input-theme"; }
function exportConfig() { return { name: safeName(state.name), mode: state.mode, variant: state.variant, palette: state.palette, design: state.design }; }
function encodeConfig() {
  const bytes = new TextEncoder().encode(JSON.stringify(exportConfig()));
  let binary = "";
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function installCommand() { return `dotinput render --config-base64 '${encodeConfig()}' --reload`; }
async function copyText(value) {
  try {
    await navigator.clipboard.writeText(value);
    return;
  } catch (_) {
    const fallback = document.createElement("textarea");
    fallback.value = value;
    fallback.setAttribute("readonly", "");
    fallback.style.position = "fixed";
    fallback.style.opacity = "0";
    document.body.append(fallback);
    fallback.select();
    const copied = document.execCommand("copy");
    fallback.remove();
    if (!copied) throw new Error("Clipboard access is unavailable.");
  }
}
function displayValue(id, value) {
  if (scaledControls.has(id)) return `${asNumber(value)} ${t("raw")} / ${asNumber(value * previewScale)} ${t("visible")}`;
  return asNumber(value);
}

function setPreviewVariables() {
  const colors = state.palette[state.mode];
  const root = document.documentElement.style;
  root.setProperty("--theme-surface", colors.surface);
  root.setProperty("--theme-surface-low", colors.surface_container_low);
  root.setProperty("--theme-on-surface", colors.on_surface);
  root.setProperty("--theme-primary", colors.primary);
  root.setProperty("--theme-on-primary", colors.on_primary);
  root.setProperty("--theme-outline", colors.outline);
  root.setProperty("--theme-outline-variant", colors.outline_variant);
  root.setProperty("--panel-radius", `${state.design.panel_radius * previewScale}px`);
  root.setProperty("--highlight-radius", `${state.design.highlight_radius * previewScale}px`);
  root.setProperty("--panel-outline-width", `${state.design.panel_outline_width * previewScale}px`);
  root.setProperty("--content-padding", `${state.design.content_padding}px`);
  root.setProperty("--text-margin-horizontal", `${state.design.text_margin_horizontal}px`);
  root.setProperty("--text-margin-vertical", `${state.design.text_margin_vertical}px`);
  root.setProperty("--text-margin-bottom", `${state.design.text_margin_bottom}px`);
  root.setProperty("--panel-inset-opacity", state.design.panel_inner_opacity);
  root.setProperty("--highlight-inset-opacity", state.design.highlight_inner_opacity);
  root.setProperty("--candidate-comment-scale", state.design.candidate_comment_scale);
  root.setProperty("--preview-stage-height", `${preview.layout === "vertical" ? Math.max(430, 170 + preview.candidateCount * 38) : 420}px`);
}

function applyLanguage() {
  document.documentElement.lang = language === "zh" ? "zh-CN" : "en";
  document.title = t("pageTitle");
  document.querySelectorAll("[data-i18n]").forEach((element) => { element.textContent = t(element.dataset.i18n); });
  [["reset", "reset"], ["reset-theme", "restoreDefaults"], ["import-label", "import"], ["repository-link", "repository"], ["candidate-less", "fewerCandidates"], ["candidate-more", "moreCandidates"], ["copy-config", "copyJson"], ["copy-command", "copyInstallCommand"]].forEach(([id, key]) => { byId(id).title = byId(id).ariaLabel = t(key); });
  document.querySelectorAll("[data-language]").forEach((button) => button.classList.toggle("active", button.dataset.language === language));
}

function renderColorControls() {
  const colors = state.palette[state.mode];
  byId("color-controls").replaceChildren(...colorRoles.map((role) => {
    const row = document.createElement("div"); row.className = "color-row";
    const label = document.createElement("label"); label.htmlFor = `color-${role}`; label.textContent = role;
    const hex = document.createElement("input"); hex.className = "hex-input"; hex.type = "text"; hex.maxLength = 7; hex.value = colors[role]; hex.setAttribute("aria-label", `${role} hex value`);
    const updateHex = () => { if (!/^#[0-9a-fA-F]{6}$/.test(hex.value)) return false; state.palette[state.mode][role] = hex.value.toUpperCase(); selectedColorTheme = null; render(); return true; };
    hex.addEventListener("input", updateHex); hex.addEventListener("change", () => { if (!updateHex()) render(); });
    const picker = document.createElement("input"); picker.id = `color-${role}`; picker.className = "color-input"; picker.type = "color"; picker.value = colors[role]; picker.addEventListener("input", () => { state.palette[state.mode][role] = picker.value.toUpperCase(); selectedColorTheme = null; render(); });
    row.append(label, hex, picker); return row;
  }));
}

function renderStyleThemes() {
  byId("style-grid").replaceChildren(...styleThemes.map((theme) => {
    const button = document.createElement("button"); button.type = "button"; button.className = `preset-button${selectedStyleTheme === theme.id ? " active" : ""}`; button.setAttribute("role", "listitem"); button.title = theme.names[language]; button.setAttribute("aria-label", theme.names[language]);
    const silhouette = document.createElement("span"); silhouette.className = "style-silhouette"; silhouette.style.setProperty("--style-radius", `${theme.design.panel_radius / 2}px`); silhouette.style.setProperty("--style-outline", `${Math.max(theme.design.panel_outline_width / 2, 1)}px`);
    const name = document.createElement("span"); name.className = "preset-name"; name.textContent = theme.names[language]; button.append(silhouette, name); button.addEventListener("click", () => { state.design = structuredClone(theme.design); selectedStyleTheme = theme.id; render(); }); return button;
  }));
}

function renderColorThemes() {
  byId("color-theme-grid").replaceChildren(...colorThemes.map((theme) => {
    const button = document.createElement("button"); button.type = "button"; button.className = `color-theme-button${selectedColorTheme === theme.id ? " active" : ""}`; button.setAttribute("role", "listitem"); button.title = theme.names[language]; button.setAttribute("aria-label", theme.names[language]);
    const swatches = document.createElement("span"); swatches.className = "preset-swatches";
    ["surface", "primary", "outline_variant"].forEach((role) => { const swatch = document.createElement("span"); swatch.className = "preset-swatch"; swatch.style.background = theme.palette[state.mode][role]; swatches.append(swatch); });
    const name = document.createElement("span"); name.className = "preset-name"; name.textContent = theme.names[language]; button.append(swatches, name); button.addEventListener("click", () => { state.palette = structuredClone(theme.palette); selectedColorTheme = theme.id; render(); }); return button;
  }));
}

function renderCandidates() {
  byId("candidates").replaceChildren(...candidateWords.slice(0, preview.candidateCount).map((word, index) => {
    const item = document.createElement("div"); item.className = `candidate${index === 0 ? " selected" : ""}`;
    const content = document.createElement("span"); content.className = "candidate-content";
    const number = document.createElement("b"); number.textContent = String(index + 1);
    const text = document.createElement("span"); text.textContent = word;
    content.append(number, text); item.append(content); return item;
  }));
}

function render() {
  setPreviewVariables(); applyLanguage(); byId("theme-name").value = state.name;
  document.querySelectorAll("[data-mode]").forEach((button) => button.classList.toggle("active", button.dataset.mode === state.mode));
  document.querySelectorAll("[data-preview-layout]").forEach((button) => button.classList.toggle("active", button.dataset.previewLayout === preview.layout));
  const mode = t(state.mode); byId("palette-mode").textContent = mode; byId("preview-status").textContent = mode;
  Object.entries(designControls).forEach(([id, [key, output]]) => { byId(id).value = state.design[key]; byId(output).value = displayValue(id, state.design[key]); });
  byId("full-width-highlight").checked = state.design.full_width_highlight;
  byId("candidate-count").value = preview.candidateCount; byId("candidate-less").disabled = preview.candidateCount <= 3; byId("candidate-more").disabled = preview.candidateCount >= candidateWords.length;
  const panel = byId("candidate-panel"); panel.classList.toggle("horizontal", preview.layout === "horizontal"); panel.classList.toggle("full-width-highlight", state.design.full_width_highlight);
  renderStyleThemes(); renderColorThemes(); renderColorControls(); renderCandidates(); byId("json-output").textContent = JSON.stringify(exportConfig(), null, 2); byId("install-command").textContent = installCommand(); window.lucide.createIcons();
}

function mergeImportedTheme(payload) {
  if (!payload || typeof payload !== "object" || !payload.palette || !payload.palette.light || !payload.palette.dark) throw new Error("Theme JSON needs light and dark palettes.");
  for (const mode of ["light", "dark"]) for (const role of colorRoles) if (!/^#[0-9a-fA-F]{6}$/.test(payload.palette[mode][role] || "")) throw new Error(`Invalid ${mode}.${role} color.`);
  state = structuredClone(defaults); state.name = typeof payload.name === "string" ? payload.name.slice(0, 64) : state.name; state.mode = payload.mode === "light" ? "light" : "dark"; state.palette = payload.palette; selectedStyleTheme = null; selectedColorTheme = null;
  if (payload.design && typeof payload.design === "object") for (const [key, value] of Object.entries(payload.design)) {
    if (key === "full_width_highlight" && typeof value === "boolean") state.design[key] = value;
    else if (key in state.design && typeof value === "number" && Number.isFinite(value)) state.design[key] = value;
  }
}

function copied(button) { const icon = button.querySelector("svg"); if (!icon) return; const previous = icon.outerHTML; icon.outerHTML = '<i data-lucide="check"></i>'; window.lucide.createIcons(); window.setTimeout(() => { button.innerHTML = previous; window.lucide.createIcons(); }, 1200); }
function resetTheme() { state = structuredClone(defaults); selectedStyleTheme = "studio"; selectedColorTheme = "studio"; render(); }

document.addEventListener("DOMContentLoaded", () => {
  byId("theme-name").addEventListener("input", (event) => { state.name = event.target.value; render(); });
  document.querySelectorAll("[data-language]").forEach((button) => button.addEventListener("click", () => { language = button.dataset.language; render(); }));
  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { state.mode = button.dataset.mode; render(); }));
  document.querySelectorAll("[data-preview-layout]").forEach((button) => button.addEventListener("click", () => { preview.layout = button.dataset.previewLayout; render(); }));
  Object.entries(designControls).forEach(([id, [key]]) => byId(id).addEventListener("input", (event) => { state.design[key] = Number(event.target.value); selectedStyleTheme = null; render(); }));
  byId("full-width-highlight").addEventListener("change", (event) => { state.design.full_width_highlight = event.target.checked; selectedStyleTheme = null; render(); });
  byId("candidate-less").addEventListener("click", () => { preview.candidateCount = Math.max(3, preview.candidateCount - 1); render(); }); byId("candidate-more").addEventListener("click", () => { preview.candidateCount = Math.min(candidateWords.length, preview.candidateCount + 1); render(); });
  byId("reset").addEventListener("click", resetTheme); byId("reset-theme").addEventListener("click", resetTheme);
  byId("download").addEventListener("click", () => { const file = new Blob([JSON.stringify(exportConfig(), null, 2) + "\n"], { type: "application/json" }); const link = Object.assign(document.createElement("a"), { href: URL.createObjectURL(file), download: `${safeName(state.name)}.json` }); link.click(); URL.revokeObjectURL(link.href); });
  byId("copy-config").addEventListener("click", async (event) => { await copyText(JSON.stringify(exportConfig(), null, 2)); copied(event.currentTarget); }); byId("copy-command").addEventListener("click", async (event) => { await copyText(installCommand()); copied(event.currentTarget); });
  byId("import").addEventListener("change", async (event) => { const [file] = event.target.files; if (!file) return; try { mergeImportedTheme(JSON.parse(await file.text())); render(); } catch (error) { window.alert(error.message); } event.target.value = ""; }); render();
});
