import json
import tempfile
import unittest
from pathlib import Path

from fcitx5_dynamic_themes.renderer import render_theme, validate_palette


PALETTE = {
    "dark": {
        "surface": "#1D1B20",
        "surface_container_low": "#1D1B20",
        "surface_container_high": "#2B2930",
        "on_surface": "#E6E1E5",
        "primary": "#D0BCFF",
        "on_primary": "#381E72",
        "outline": "#938F99",
        "outline_variant": "#49454F",
    }
}


class RendererTests(unittest.TestCase):
    def test_renderer_writes_complete_angular_theme(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "theme"
            render_theme(validate_palette(PALETTE, "dark"), "angular", target, "test-theme")
            self.assertIn("Name=test-theme", (target / "theme.conf").read_text())
            self.assertIn("L56 12", (target / "panel.svg").read_text())
            self.assertIn("#D0BCFF", (target / "highlight.svg").read_text())

    def test_renderer_uses_compact_rounded_geometry(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "theme"
            render_theme(validate_palette(PALETTE, "dark"), "rounded", target, "test-theme")
            self.assertIn('rx="12"', (target / "panel.svg").read_text())
            self.assertIn('rx="9"', (target / "highlight.svg").read_text())

    def test_palette_requires_semantic_roles(self):
        with self.assertRaises(ValueError):
            validate_palette({"dark": {}}, "dark")


if __name__ == "__main__":
    unittest.main()
