# Theme Studio Frontend Contract

This document is the handoff for a frontend redesign. Change the visual
language, layout, component structure, and implementation freely, but preserve
the product behavior below. Theme Studio is a small, static editor for the
Fcitx5 renderer in this repository, not a generic design mockup.

## Chinese Summary

这是交给前端重设计 AI 的功能契约。可以彻底重做视觉、布局和组件，但不能破坏：

- 导出的主题 JSON 必须符合 `../core/theme.schema.json`。
- Base64 只是 JSON 的无文件命令行传递格式；只能在用户点击“生成应用命令”时计算。
- 调参、导入 JSON、切换样式或配色后，旧命令必须失效，不能复制旧参数。
- 生成命令必须包含 `--activate --reload`，以便选中主题并热加载 Fcitx5 Classic UI。
- 候选词数量和横/纵布局仅用于网页预览，绝不能写进主题 JSON 或命令。

## Product Boundary

Theme Studio lets a user edit one portable theme configuration and turn it into
a command that can be pasted into a terminal. It is intentionally static:

- It has no account, server, telemetry, storage API, or upload endpoint.
- It must work when opened directly as `file:///.../web/index.html` and when
  served from GitHub Pages.
- It cannot directly execute a local command or restart Fcitx5. The terminal
  command is the explicit boundary between browser and desktop.
- The first renderer is Fcitx5 Classic UI. Do not claim IBus support in this
  UI until a real renderer exists.

The current implementation is plain HTML, CSS, and browser JavaScript. Keep a
redesign build-free unless a build tool removes clear, concrete complexity. A
static output that can still be opened from `file://` is required.

## Canonical Sources

Read these before changing data handling or preview geometry:

| Source | Authority |
| --- | --- |
| [`../core/theme.schema.json`](../core/theme.schema.json) | Portable theme JSON shape and numeric limits. |
| [`../core/palette.schema.json`](../core/palette.schema.json) | Required semantic palette roles. |
| [`../src/dotinput/renderer.py`](../src/dotinput/renderer.py) | Actual SVG and `theme.conf` generation. |
| [`../src/dotinput/cli.py`](../src/dotinput/cli.py) | Command-line behavior, activation, and hot reload. |
| [`app.js`](app.js) | Current state flow, presets, i18n, and command encoding. |

The JSON schema and renderer are the source of truth. The website must not
invent fields that the renderer rejects, silently drop supported fields, or
export values outside the schema limits.

## Portable Theme Data

Every export has this shape:

```json
{
  "name": "my-input-theme",
  "mode": "dark",
  "variant": "rounded",
  "palette": {
    "light": { "surface": "#...", "surface_container_low": "#..." },
    "dark": { "surface": "#...", "surface_container_low": "#..." }
  },
  "design": {
    "panel_radius": 12,
    "highlight_radius": 9,
    "panel_outline_width": 1.25,
    "content_padding": 12,
    "text_margin_horizontal": 9,
    "text_margin_vertical": 6,
    "text_margin_bottom": 7,
    "panel_inner_opacity": 0.5,
    "highlight_inner_opacity": 0.24,
    "panel_slice_margin": 15,
    "highlight_slice_margin_horizontal": 15,
    "highlight_slice_margin_vertical": 10,
    "full_width_highlight": true,
    "candidate_comment_scale": 1
  }
}
```

`palette.light` and `palette.dark` must each contain all eight roles:

`surface`, `surface_container_low`, `surface_container_high`, `on_surface`,
`primary`, `on_primary`, `outline`, and `outline_variant`.

Theme names must match `^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$`. A redesign may
offer friendlier validation than the current sanitization, but it must never
generate a command with an unsafe name.

### Values That Are Not Theme Data

Candidate layout (horizontal/vertical) and candidate count only demonstrate the
preview. They are Fcitx5 behavior settings, not theme settings, and must never
enter exported JSON, Base64 payloads, or CLI commands.

## Command Generation Contract

Base64 is not persistence and is not a download format. It is merely a way to
pass the exact JSON currently in the browser to a local command without first
creating a file.

The generated command is exactly this shape:

```bash
dotinput render --config-base64 '<URL-safe-base64-UTF-8-JSON>' --activate --reload
```

Encoding requirements:

1. Serialize the same object used for JSON export.
2. UTF-8 encode it.
3. Use URL-safe Base64: replace `+` with `-`, `/` with `_`, and remove trailing
   `=` padding.
4. Wrap the payload in single quotes in the shell command.

### Explicit Generation Only

Do **not** encode Base64 as part of every reactive render, drag, color-picker
event, or animation frame. The correct flow is:

1. The user edits a draft theme and sees the lightweight CSS preview update.
2. The command area says that a command needs to be generated; copy is disabled.
3. The user clicks **Generate apply command**.
4. The application takes one immutable snapshot of the exportable theme data,
   encodes it once, displays the full command, and enables **Copy apply command**.
5. Any change to exported data invalidates that snapshot, clears or marks the
   command stale, and disables copy again.

Changing language or preview-only candidate controls must not invalidate the
command. Changing the name, mode, variant, palette, any `design` field,
selecting a preset, resetting, or importing JSON must invalidate it.

The full generated command should remain inspectable and selectable. It may be
in a bounded, scrollable code region, but do not replace it with an ellipsis or
a fake placeholder after generation.

## CLI Apply and Hot Reload Contract

The backend command deliberately separates three actions:

| Flag | Effect |
| --- | --- |
| `render` | Writes `theme.conf`, `panel.svg`, and `highlight.svg` under the user Fcitx5 theme directory. |
| `--activate` | Updates `~/.config/fcitx5/conf/classicui.conf` without rewriting unrelated settings. For dark mode with `UseDarkTheme=True`, it updates `DarkTheme`; otherwise it updates `Theme`. |
| `--reload` | Calls the Fcitx5 D-Bus `ReloadAddonConfig` method for `classicui` and prints either `Classic UI reloaded` or a warning. |

The website's apply command must include both `--activate` and `--reload`. A
user importing a JSON file into the browser has only updated their draft; the
terminal command is what makes that draft real on their desktop.

Do not reimplement these behaviors in browser JavaScript. If the CLI contract
needs to change, change `src/dotinput/cli.py`, add unit tests, then update this
document and the website together.

## Preview Fidelity

The preview should be a faithful, useful approximation of the generated Fcitx5
candidate panel, not a generic pill list.

- Rounded assets are emitted at `30x30` pixels with a `60x60` SVG viewBox. In
  the browser preview, `panel_radius`, `highlight_radius`, and
  `panel_outline_width` use half their renderer values so their visible geometry
  aligns with the generated SVG.
- `content_padding` and all text margins are raw Fcitx5 pixels. Do not halve
  them in the preview.
- `panel_slice_margin` and highlight slice margins are renderer metadata. They
  affect Fcitx5 nine-slice behavior and may be exposed as advanced controls,
  but they do not need to visibly change the browser frame.
- `full_width_highlight` only matters for vertical candidates.
- The rounded and angular variants are renderer concepts. If a redesign hides
  an unsupported variant from normal editing, imported configs still need a
  safe round-trip path; do not silently rewrite `variant`.

When preview CSS and renderer behavior disagree, fix the preview or document a
specific renderer limitation. Do not change SVG geometry just to make a mockup
look nicer without comparing generated Fcitx5 output.

## Required User Workflows

The redesign must retain all of these:

1. Start from a sensible default theme.
2. Choose a style preset and a color preset independently.
3. Edit semantic colors and supported geometry values.
4. Toggle light/dark output mode.
5. Preview candidates without changing exported theme data.
6. Reset to the documented default.
7. Import a portable theme JSON and export or download a backup JSON.
8. Generate, inspect, and copy an apply command only on explicit request.
9. Switch between English and Simplified Chinese without losing the draft.

Preset selection should not obscure whether later manual edits have diverged
from a preset. Preserve or improve the current distinction between selected
presets and custom values.

## Localization and Accessibility

- Every visible UI string needs English and Simplified Chinese text.
- Keep DOM controls as actual buttons, inputs, labels, checkboxes, sliders, and
  segmented controls; do not replace basic controls with inaccessible divs.
- Give icon-only controls localized `title` and `aria-label` values.
- Keep keyboard focus visible and text selectable in the generated command.
- Preserve a usable layout from 320px mobile width through wide desktop.
- Long Base64 commands must wrap or scroll inside their region rather than
  overflowing or resizing the page unpredictably.

## Visual Direction

Visual design is intentionally open. This is an editor, not a landing page:
prioritize a calm, dense, work-focused surface and a high-fidelity candidate
preview. Rounded MD3-like controls are welcome, but do not preserve the current
layout merely because it exists. Avoid decorative gradients or visual effects
that make color judgment harder. The candidate panel is the primary artifact;
its dimensions, contrast, selection state, and margins should be easy to judge.

Use familiar icons for actions such as reset, import, copy, and command
generation. Lucide is already loaded by the static page; a redesign may keep it
or replace it with another local/static icon strategy.

## Verification Checklist

Before handing a redesign back:

1. Open `web/index.html` directly with `file://` and test the whole flow.
2. Test Chinese and English, desktop and a narrow mobile viewport.
3. Import a valid JSON, alter a color, generate a command, and decode its
   Base64 payload to confirm it equals the current export JSON.
4. Change a real theme value after generation and verify copy is disabled until
   a new command is generated.
5. Confirm preview-only candidate count and layout never appear in the payload.
6. Run `node --check web/app.js`, `git diff --check`, and
   `PYTHONPATH=src python -m unittest discover -s tests -v`.
7. Run a generated command with a disposable theme name and verify it reports
   `Classic UI reloaded` when Fcitx5 is running.

## Non-Goals for This Redesign

- Do not add a cloud backend, user accounts, telemetry, command execution API,
  or a theme-sharing service.
- Do not add IBus UI controls before the renderer exists.
- Do not make wallpaper color extraction a hidden web feature. That belongs to
  future palette providers and must still produce the documented semantic
  palette contract.
- Do not turn preview-only layout controls into Fcitx5 configuration writes.
