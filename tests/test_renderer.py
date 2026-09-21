import base64
import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from dotinput.cli import main
from dotinput.renderer import render_theme, validate_design, validate_palette


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
            self.assertIn(
                "[InputPanel/Highlight/Margin]\nLeft=15\nRight=15\nTop=10\nBottom=10",
                (target / "theme.conf").read_text(),
            )

    def test_palette_requires_semantic_roles(self):
        with self.assertRaises(ValueError):
            validate_palette({"dark": {}}, "dark")

    def test_design_rejects_unknown_or_out_of_range_fields(self):
        with self.assertRaises(ValueError):
            validate_design({"panel_radius": 27})
        with self.assertRaises(ValueError):
            validate_design({"content_padding": 49})
        with self.assertRaises(ValueError):
            validate_design({"full_width_highlight": 1})
        with self.assertRaises(ValueError):
            validate_design({"unexpected": 1})

    def test_cli_renders_theme_studio_config(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            config = root / "theme.json"
            target = root / "theme"
            config.write_text(
                json.dumps(
                    {
                        "name": "studio-theme",
                        "mode": "dark",
                        "variant": "rounded",
                        "palette": PALETTE,
                        "design": {
                            "panel_radius": 6,
                            "highlight_radius": 4,
                            "content_padding": 16,
                            "text_margin_horizontal": 8,
                            "text_margin_vertical": 5,
                            "text_margin_bottom": 6,
                            "full_width_highlight": False,
                            "candidate_label_scale": 0.8,
                        },
                    }
                ),
                encoding="utf-8",
            )
            self.assertEqual(main(["render", "--config", str(config), "--target", str(target)]), 0)
            self.assertIn('rx="6"', (target / "panel.svg").read_text())
            self.assertIn('rx="4"', (target / "highlight.svg").read_text())
            self.assertIn("[InputPanel/ContentMargin]\nLeft=16", (target / "theme.conf").read_text())
            self.assertIn("FullWidthHighlight=False", (target / "theme.conf").read_text())
            self.assertNotIn("CandidateLabelTextSizeFactor", (target / "theme.conf").read_text())
            self.assertIn("[InputPanel/TextMargin]\nLeft=8", (target / "theme.conf").read_text())
            self.assertIn("Top=5\nBottom=6", (target / "theme.conf").read_text())

    def test_cli_renders_base64_theme_studio_config(self):
        with tempfile.TemporaryDirectory() as directory:
            target = Path(directory) / "theme"
            config = {
                "name": "base64-theme",
                "mode": "dark",
                "variant": "rounded",
                "palette": PALETTE,
                "design": {"panel_radius": 20, "highlight_radius": 16},
            }
            encoded = base64.urlsafe_b64encode(json.dumps(config).encode()).decode().rstrip("=")
            self.assertEqual(
                main(["render", "--config-base64", encoded, "--target", str(target)]), 0
            )
            self.assertIn('rx="20"', (target / "panel.svg").read_text())
            self.assertIn('rx="16"', (target / "highlight.svg").read_text())

    def test_cli_activates_dark_theme_without_rewriting_light_theme(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            config = root / "theme.json"
            target = root / "theme"
            classicui = root / "fcitx5" / "conf" / "classicui.conf"
            classicui.parent.mkdir(parents=True)
            classicui.write_text(
                "Theme=light-theme\nDarkTheme=old-dark-theme\nUseDarkTheme=True\n",
                encoding="utf-8",
            )
            config.write_text(
                json.dumps({"name": "new-dark-theme", "mode": "dark", "variant": "rounded", "palette": PALETTE}),
                encoding="utf-8",
            )
            with patch.dict("os.environ", {"XDG_CONFIG_HOME": str(root)}, clear=False):
                self.assertEqual(
                    main(["render", "--config", str(config), "--target", str(target), "--activate"]),
                    0,
                )
            content = classicui.read_text(encoding="utf-8")
            self.assertIn("Theme=light-theme", content)
            self.assertIn("DarkTheme=new-dark-theme", content)

    def test_cli_rejects_unsafe_theme_config_name(self):
        with self.assertRaises(SystemExit):
            main([
                "render", "--config", str(Path("examples/custom-theme.json")),
                "--name", "../not-a-theme",
            ])


if __name__ == "__main__":
    unittest.main()
