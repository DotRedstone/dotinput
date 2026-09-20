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


def _panel_svg(colors: dict[str, str], variant: str) -> str:
    if variant == "rounded":
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect x="4" y="4" width="52" height="52" rx="12" fill="{colors['surface_container_low']}" stroke="{colors['outline_variant']}" stroke-width="1.25"/>
  <rect x="6.5" y="6.5" width="47" height="47" rx="9.5" fill="none" stroke="{colors['outline_variant']}" stroke-width="0.7" stroke-opacity="0.5"/>
</svg>
'''
    return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <path d="M12 4H48L56 12V48L48 56H12L4 48V12L12 4Z" fill="{colors['surface']}" stroke="{colors['outline']}" stroke-width="1.5"/>
  <path d="M14 8H46L52 14V46L46 52H14L8 46V14L14 8Z" fill="none" stroke="{colors['outline']}" stroke-width="0.8" stroke-opacity="0.58"/>
  <path d="M12 4H48L56 12H4L12 4Z" fill="{colors['surface_container_high']}"/>
</svg>
'''


def _highlight_svg(colors: dict[str, str], variant: str) -> str:
    if variant == "rounded":
        return f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="30" height="30" viewBox="0 0 60 60" version="1.1" xmlns="http://www.w3.org/2000/svg">
  <rect x="5" y="5" width="50" height="50" rx="9" fill="{colors['primary']}"/>
  <rect x="7" y="7" width="46" height="46" rx="7" fill="none" stroke="{colors['on_primary']}" stroke-width="0.9" stroke-opacity="0.24"/>
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


def _theme_conf(colors: dict[str, str], name: str, variant: str) -> str:
    compatibility = "native Wayland apps" if variant == "rounded" else "XWayland-compatible apps"
    return f'''[Metadata]
Name={name}
Version=0.2.1
Author=fcitx5-dynamic-themes
Description="Dynamic {variant} theme for {compatibility}."

[InputPanel]
NormalColor={colors['on_surface']}
HighlightCandidateColor={colors['on_primary']}
HighlightColor={colors['on_primary']}
HighlightBackgroundColor={colors['primary']}
EnableBlur=False
FullWidthHighlight=True

[InputPanel/Background]
Image=panel.svg
Color={colors['surface']}
BorderColor={colors['outline_variant']}
BorderWidth=0

[InputPanel/Background/Margin]
Left=15
Right=15
Top=15
Bottom=15

[InputPanel/Highlight]
Image=highlight.svg
Color={colors['primary']}
BorderColor={colors['primary']}
BorderWidth=0

[InputPanel/Highlight/Margin]
Left=15
Right=15
Top=10
Bottom=10

[InputPanel/ContentMargin]
Left=9
Right=9
Top=7
Bottom=7

[InputPanel/TextMargin]
Left=9
Right=9
Top=6
Bottom=7

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


def render_theme(colors: dict[str, str], variant: str, target: Path, name: str) -> None:
    """Write a self-contained Fcitx5 Classic UI theme directory."""
    if variant not in {"rounded", "angular"}:
        raise ValueError("variant must be 'rounded' or 'angular'")
    target.mkdir(parents=True, exist_ok=True)
    files = {
        "panel.svg": _panel_svg(colors, variant),
        "highlight.svg": _highlight_svg(colors, variant),
        "theme.conf": _theme_conf(colors, name, variant),
    }
    for filename, content in files.items():
        temporary = target / f".{filename}.tmp"
        temporary.write_text(content, encoding="utf-8")
        temporary.replace(target / filename)
