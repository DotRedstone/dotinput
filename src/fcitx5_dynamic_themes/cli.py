"""Command line entry point for generic palette rendering."""

from __future__ import annotations

import argparse
import base64
import binascii
import json
from pathlib import Path
import shutil
import subprocess
import re

from .renderer import render_theme, validate_design, validate_palette

THEME_NAME = re.compile(r"^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$")


def _default_target(name: str) -> Path:
    data_home = Path.home() / ".local" / "share"
    return data_home / "fcitx5" / "themes" / name


def _reload_classicui() -> None:
    busctl = shutil.which("busctl")
    if busctl is None:
        return
    subprocess.run(
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
    render.add_argument("--reload", action="store_true")

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
        if args.reload:
            _reload_classicui()
        print(target)
        return 0
    except ValueError as error:
        parser.error(str(error))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
