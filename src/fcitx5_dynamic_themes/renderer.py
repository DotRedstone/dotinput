"""Render original Fcitx5 Classic UI assets from a semantic palette."""

from __future__ import annotations

from pathlib import Path
import re

REQUIRED_COLORS = (
    "surface",
    "surface_container_low",
    "surface_container_high",
    "on_surface",
    "primary",
    "on_primary",
    "outline",
    "outline_variant",
)
HEX_COLOR = re.compile(r"^#[0-9A-Fa-f]{6}(?:[0-9A-Fa-f]{2})?$")
DEFAULT_DESIGN = {
    "panel_radius": 12.0,
    "highlight_radius": 9.0,
    "panel_outline_width": 1.25,
    "content_padding": 12.0,
    "text_margin_horizontal": 9.0,
    "text_margin_vertical": 6.0,
    "text_margin_bottom": 7.0,
    "panel_inner_opacity": 0.5,
    "highlight_inner_opacity": 0.24,
    "panel_slice_margin": 15.0,
    "highlight_slice_margin_horizontal": 15.0,
    "highlight_slice_margin_vertical": 10.0,
    "full_width_highlight": True,
    "candidate_label_scale": 1.0,
    "candidate_comment_scale": 1.0,
}
DESIGN_LIMITS = {
    "panel_radius": (0.0, 26.0),
    "highlight_radius": (0.0, 25.0),
    "panel_outline_width": (0.0, 6.0),
    "content_padding": (0.0, 48.0),
    "text_margin_horizontal": (0.0, 24.0),
    "text_margin_vertical": (0.0, 24.0),
    "text_margin_bottom": (0.0, 24.0),
    "panel_inner_opacity": (0.0, 1.0),
    "highlight_inner_opacity": (0.0, 1.0),
    "panel_slice_margin": (4.0, 15.0),
    "highlight_slice_margin_horizontal": (4.0, 15.0),
    "highlight_slice_margin_vertical": (4.0, 15.0),
    "candidate_label_scale": (0.5, 1.5),
    "candidate_comment_scale": (0.5, 1.5),
}


def validate_palette(palette: dict[str, object], mode: str) -> dict[str, str]:
    """Return a checked color map for one mode or raise ValueError."""
    if mode not in {"light", "dark"}:
        raise ValueError("mode must be 'light' or 'dark'")
    colors = palette.get(mode)
    if not isinstance(colors, dict):
        raise ValueError(f"palette is missing a '{mode}' color map")

    checked: dict[str, str] = {}
    for name in REQUIRED_COLORS:
        value = colors.get(name)
        if not isinstance(value, str) or not HEX_COLOR.fullmatch(value):
            raise ValueError(f"{mode}.{name} must be a #RRGGBB or #RRGGBBAA color")
        checked[name] = value
    return checked


def validate_design(design: object | None) -> dict[str, float | bool]:
    """Merge optional shape controls with defaults or raise ValueError."""
    if design is None:
        return DEFAULT_DESIGN.copy()
    if not isinstance(design, dict):
        raise ValueError("design must be an object")

    checked: dict[str, float | bool] = DEFAULT_DESIGN.copy()
    for name, value in design.items():
        if name not in DESIGN_LIMITS:
            if name == "full_width_highlight":
                if not isinstance(value, bool):
                    raise ValueError("design.full_width_highlight must be a boolean")
                checked[name] = value
                continue
            raise ValueError(f"unknown design field: {name}")
        if isinstance(value, bool) or not isinstance(value, (int, float)):
            raise ValueError(f"design.{name} must be a number")
        lower, upper = DESIGN_LIMITS[name]
        numeric = float(value)
        if not lower <= numeric <= upper:
            raise ValueError(f"design.{name} must be between {lower:g} and {upper:g}")
        checked[name] = numeric
    return checked


def _number(value: float) -> str:
    return f"{value:g}"


def _panel_svg(colors: dict[str, str], variant: str, design: dict[str, float | bool]) -> str:
    if variant == "rounded":
        radius = _number(design["panel_radius"])
        inner_radius = _number(max(design["panel_radius"] - 2.5, 0.0))
        outline_width = _number(design["panel_outline_width"])
        inner_opacity = _number(design["panel_inner_opacity"])
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="52" height="52" rx="{radius}" fill="{colors['surface_container_low']}" stroke="{colors['outline_variant']}" stroke-width="{outline_width}"/>
  <rect x="6.5" y="6.5" width="47" height="47" rx="{inner_radius}" fill="none" stroke="{colors['outline_variant']}" stroke-width="0.7" stroke-opacity="{inner_opacity}"/>
</svg>
'''
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4H48L56 12V48L48 56H12L4 48V12L12 4Z" fill="{colors['surface']}" stroke="{colors['outline']}" stroke-width="1.5"/>
  <path d="M14 8H46L52 14V46L46 52H14L8 46V14L14 8Z" fill="none" stroke="{colors['outline']}" stroke-width="0.8" stroke-opacity="0.58"/>
  <path d="M12 4H48L56 12H4L12 4Z" fill="{colors['surface_container_high']}"/>
</svg>
'''


def _highlight_svg(colors: dict[str, str], variant: str, design: dict[str, float | bool]) -> str:
    if variant == "rounded":
        radius = _number(design["highlight_radius"])
        inner_radius = _number(max(design["highlight_radius"] - 2.0, 0.0))
        inner_opacity = _number(design["highlight_inner_opacity"])
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="50" height="50" rx="{radius}" fill="{colors['primary']}"/>
  <rect x="7" y="7" width="46" height="46" rx="{inner_radius}" fill="none" stroke="{colors['on_primary']}" stroke-width="0.9" stroke-opacity="{inner_opacity}"/>
</svg>
'''
    shape = "M13 4H47L56 13V47L47 56H13L4 47V13L13 4Z"
    inset = "M15 8H45L52 15V45L45 52H15L8 45V15L15 8Z"
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <path d="{shape}" fill="{colors['primary']}"/>
  <path d="{inset}" fill="none" stroke="{colors['on_primary']}" stroke-width="1" stroke-opacity="0.26"/>
</svg>
'''


def _theme_conf(
    colors: dict[str, str], name: str, variant: str, design: dict[str, float | bool]
) -> str:
    compatibility = "native Wayland apps" if variant == "rounded" else "XWayland-compatible apps"
    content_padding = _number(float(design["content_padding"]))
    text_margin_horizontal = _number(float(design["text_margin_horizontal"]))
    text_margin_vertical = _number(float(design["text_margin_vertical"]))
    text_margin_bottom = _number(float(design["text_margin_bottom"]))
    panel_slice_margin = _number(float(design["panel_slice_margin"]))
    highlight_slice_margin_horizontal = _number(float(design["highlight_slice_margin_horizontal"]))
    highlight_slice_margin_vertical = _number(float(design["highlight_slice_margin_vertical"]))
    full_width_highlight = "True" if design["full_width_highlight"] else "False"
    candidate_label_scale = _number(float(design["candidate_label_scale"]))
    candidate_comment_scale = _number(float(design["candidate_comment_scale"]))
    return f'''[Metadata]
Name={name}
Version=0.3.0
Author=fcitx5-dynamic-themes
Description="Dynamic {variant} theme for {compatibility}."

[InputPanel]
NormalColor={colors['on_surface']}
HighlightCandidateColor={colors['on_primary']}
HighlightColor={colors['on_primary']}
HighlightBackgroundColor={colors['primary']}
EnableBlur=False
FullWidthHighlight={full_width_highlight}
CandidateLabelTextSizeFactor={candidate_label_scale}
CandidateCommentTextSizeFactor={candidate_comment_scale}

[InputPanel/Background]
Image=panel.svg
Color={colors['surface']}
BorderColor={colors['outline_variant']}
BorderWidth=0

[InputPanel/Background/Margin]
Left={panel_slice_margin}
Right={panel_slice_margin}
Top={panel_slice_margin}
Bottom={panel_slice_margin}

[InputPanel/Highlight]
Image=highlight.svg
Color={colors['primary']}
BorderColor={colors['primary']}
BorderWidth=0

[InputPanel/Highlight/Margin]
Left={highlight_slice_margin_horizontal}
Right={highlight_slice_margin_horizontal}
Top={highlight_slice_margin_vertical}
Bottom={highlight_slice_margin_vertical}

[InputPanel/ContentMargin]
Left={content_padding}
Right={content_padding}
Top={content_padding}
Bottom={content_padding}

[InputPanel/TextMargin]
Left={text_margin_horizontal}
Right={text_margin_horizontal}
Top={text_margin_vertical}
Bottom={text_margin_bottom}

[Menu]
NormalColor={colors['on_surface']}
HighlightCandidateColor={colors['on_primary']}
Spacing=0

[Menu/Background]
Image=panel.svg
Color={colors['surface']}
BorderColor={colors['outline_variant']}
BorderWidth=0

[Menu/Background/Margin]
Left=11
Right=11
Top=11
Bottom=11

[Menu/Highlight]
Image=highlight.svg
Color={colors['primary']}
BorderColor={colors['primary']}
BorderWidth=0

[Menu/Highlight/Margin]
Left=5
Right=5
Top=5
Bottom=5

[Menu/ContentMargin]
Left=11
Right=11
Top=11
Bottom=11

[Menu/TextMargin]
Left=6
Right=6
Top=6
Bottom=6
'''


def render_theme(
    colors: dict[str, str],
    variant: str,
    target: Path,
    name: str,
    design: object | None = None,
) -> None:
    """Write a self-contained Fcitx5 Classic UI theme directory."""
    if variant not in {"rounded", "angular"}:
        raise ValueError("variant must be 'rounded' or 'angular'")
    design_values = validate_design(design)
    target.mkdir(parents=True, exist_ok=True)
    files = {
        "panel.svg": _panel_svg(colors, variant, design_values),
        "highlight.svg": _highlight_svg(colors, variant, design_values),
        "theme.conf": _theme_conf(colors, name, variant, design_values),
    }
    for filename, content in files.items():
        temporary = target / f".{filename}.tmp"
        temporary.write_text(content, encoding="utf-8")
        temporary.replace(target / filename)
