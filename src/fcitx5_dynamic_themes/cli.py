"""Command line entry point for generic palette rendering."""

from __future__ import annotations

import argparse
import json
from pathlib import Path
import shutil
import subprocess
import sys

from .renderer import render_theme, validate_palette


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


def _read_palette(path: Path) -> dict[str, object]:
    try:
        decoded = json.loads(path.read_text(encoding="utf-8"))
    except OSError as error:
        raise ValueError(f"cannot read palette: {error}") from error
    except json.JSONDecodeError as error:
        raise ValueError(f"invalid palette JSON: {error}") from error
    if not isinstance(decoded, dict):
        raise ValueError("palette root must be a JSON object")
    return decoded


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Render dynamic Fcitx5 Classic UI themes.")
    commands = parser.add_subparsers(dest="command", required=True)

    render = commands.add_parser("render", help="render one theme from a semantic palette JSON")
    render.add_argument("--palette", type=Path, required=True)
    render.add_argument("--mode", choices=("light", "dark"), required=True)
    render.add_argument("--variant", choices=("rounded", "angular"), required=True)
    render.add_argument("--name")
    render.add_argument("--target", type=Path)
    render.add_argument("--reload", action="store_true")

    validate = commands.add_parser("validate", help="validate a semantic palette JSON")
    validate.add_argument("--palette", type=Path, required=True)
    validate.add_argument("--mode", choices=("light", "dark"), required=True)

    args = parser.parse_args(argv)
    try:
        palette = _read_palette(args.palette)
        colors = validate_palette(palette, args.mode)
        if args.command == "validate":
            print(f"{args.mode} palette is valid")
            return 0
        name = args.name or f"fcitx5-dynamic-{args.variant}-{args.mode}"
        target = args.target or _default_target(name)
        render_theme(colors, args.variant, target, name)
        if args.reload:
            _reload_classicui()
        print(target)
        return 0
    except ValueError as error:
        parser.error(str(error))
    return 2


if __name__ == "__main__":
    raise SystemExit(main())
