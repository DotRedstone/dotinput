"""Command line entry point for generic palette rendering."""

from __future__ import annotations

import argparse
import base64
import binascii
import json
import os
from pathlib import Path
import shutil
import subprocess
import re
import sys

from .renderer import render_theme, validate_design, validate_palette

THEME_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def _default_target(name: str) -> Path:
    data_home = Path.home() / ".local" / "share"
    return data_home / "fcitx5" / "themes" / name


def _classicui_config_path() -> Path:
    config_home = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    return config_home / "fcitx5" / "conf" / "classicui.conf"


def _config_value(content: str, key: str) -> str | None:
    match = re.search(rf"^\s*{re.escape(key)}\s*=\s*(.*)$", content, flags=re.MULTILINE)
    return match.group(1).strip() if match else None


def _set_config_value(content: str, key: str, value: str) -> str:
    pattern = re.compile(rf"^(\s*{re.escape(key)}\s*=\s*).*$", flags=re.MULTILINE)
    if pattern.search(content):
        return pattern.sub(rf"\g<1>{value}", content)
    suffix = "" if not content or content.endswith("\n") else "\n"
    return f"{content}{suffix}{key}={value}\n"


def _activate_classicui_theme(name: str, mode: str) -> Path:
    """Select one generated theme without rewriting unrelated Classic UI settings."""
    config_path = _classicui_config_path()
    try:
        content = config_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        content = ""
    use_dark_theme = _config_value(content, "UseDarkTheme") == "True"
    key = "DarkTheme" if mode == "dark" and use_dark_theme else "Theme"
    config_path.parent.mkdir(parents=True, exist_ok=True)
    config_path.write_text(_set_config_value(content, key, name), encoding="utf-8")
    return config_path


def _reload_classicui() -> bool:
    busctl = shutil.which("busctl")
    if busctl is None:
        return False
    try:
        result = subprocess.run(
            [
                busctl,
                "--user",
                "call",
                "org.fcitx.Fcitx5",
                "/controller",
                "org.fcitx.Fcitx.Controller1",
                "ReloadAddonConfig",
                "s",
                "classicui",
            ],
            check=False,
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
    except OSError:
        return False
    return result.returncode == 0


def _read_json(path: Path) -> dict[str, object]:
    try:
        decoded = json.loads(path.read_text(encoding="utf-8"))
    except OSError as error:
        raise ValueError(f"cannot read palette: {error}") from error
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid palette JSON: {error}") from error
    if not isinstance(decoded, dict):
        raise ValueError("palette root must be a JSON object")
    return decoded


def _read_base64_json(value: str) -> dict[str, object]:
    """Decode a URL-safe, padding-free Theme Studio configuration."""
    try:
        padding = "=" * (-len(value) % 4)
        decoded = base64.b64decode(value + padding, altchars=b"-_", validate=True)
        payload = json.loads(decoded.decode("utf-8"))
    except (ValueError, UnicodeDecodeError, binascii.Error, json.JSONDecodeError) as error:
        raise ValueError("invalid base64 theme config") from error
    if not isinstance(payload, dict):
        raise ValueError("theme config root must be a JSON object")
    return payload


def _theme_config(payload: dict[str, object]) -> tuple[dict[str, object], dict[str, float], str | None, str | None, str | None]:
    palette = payload.get("palette")
    if not isinstance(palette, dict):
        raise ValueError("theme config must contain a palette object")
    name = payload.get("name")
    mode = payload.get("mode")
    variant = payload.get("variant")
    for field, value in (("name", name), ("mode", mode), ("variant", variant)):
        if value is not None and not isinstance(value, str):
            raise ValueError(f"theme config {field} must be a string")
    if name is not None and not THEME_NAME.fullmatch(name):
        raise ValueError("theme config name must use letters, digits, dots, underscores, or hyphens")
    return palette, validate_design(payload.get("design")), name, mode, variant


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Render dynamic Fcitx5 Classic UI themes.")
    commands = parser.add_subparsers(dest="command", required=True)

    render = commands.add_parser("render", help="render one theme from a semantic palette JSON")
    source = render.add_mutually_exclusive_group(required=True)
    source.add_argument("--palette", type=Path)
    source.add_argument("--config", type=Path, help="theme config exported by Theme Studio")
    source.add_argument(
        "--config-base64",
        help="URL-safe base64 Theme Studio config for copy-and-run installation",
    )
    render.add_argument("--mode", choices=("light", "dark"))
    render.add_argument("--variant", choices=("rounded", "angular"))
    render.add_argument("--name")
    render.add_argument("--target", type=Path)
    render.add_argument(
        "--activate",
        action="store_true",
        help="select the generated theme for its light or dark Classic UI mode",
    )
    render.add_argument(
        "--reload",
        action="store_true",
        help="reload Classic UI after rendering and report whether the request succeeded",
    )

    validate = commands.add_parser("validate", help="validate a semantic palette JSON")
    validate.add_argument("--palette", type=Path, required=True)
    validate.add_argument("--mode", choices=("light", "dark"), required=True)

    args = parser.parse_args(argv)
    try:
        if args.command == "validate":
            palette = _read_json(args.palette)
            colors = validate_palette(palette, args.mode)
            print(f"{args.mode} palette is valid")
            return 0

        if args.config:
            palette, design, config_name, config_mode, config_variant = _theme_config(_read_json(args.config))
        elif args.config_base64:
            palette, design, config_name, config_mode, config_variant = _theme_config(
                _read_base64_json(args.config_base64)
            )
        else:
            palette = _read_json(args.palette)
            design = validate_design(None)
            config_name = config_mode = config_variant = None
        mode = args.mode or config_mode
        variant = args.variant or config_variant
        if mode not in {"light", "dark"}:
            raise ValueError("render requires --mode or a valid theme config mode")
        if variant not in {"rounded", "angular"}:
            raise ValueError("render requires --variant or a valid theme config variant")
        colors = validate_palette(palette, mode)
        name = args.name or config_name or f"fcitx5-dynamic-{variant}-{mode}"
        if not THEME_NAME.fullmatch(name):
            raise ValueError("theme name must use letters, digits, dots, underscores, or hyphens")
        target = args.target or _default_target(name)
        render_theme(colors, variant, target, name, design)
        if args.activate:
            _activate_classicui_theme(name, mode)
        reloaded = _reload_classicui() if args.reload else None
        print(target)
        if reloaded is True:
            print("Classic UI reloaded")
        elif reloaded is False:
            print("warning: Classic UI was not reloaded; it will use this theme on its next start", file=sys.stderr)
        return 0
    except ValueError as error:
        parser.error(str(error))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
