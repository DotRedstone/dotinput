# Noctalia Fcitx5 Dynamic

An original Fcitx5 Classic UI theme family driven by Noctalia's dynamic color
templates. It follows the active Noctalia palette without relying on a fixed
wallpaper color or an upstream Fcitx5 theme repository.

## Theme family

| Theme | Best for | Shape language |
| --- | --- | --- |
| `noctalia-dynamic-rounded-light` | Native Wayland, light mode | Soft-square outer shell and inset focus ring |
| `noctalia-dynamic-rounded-dark` | Native Wayland, dark mode | Soft-square outer shell and inset focus ring |
| `noctalia-dynamic-angular-light` | XWayland and compatibility-sensitive apps | Cut corners and layered focus frame |
| `noctalia-dynamic-angular-dark` | XWayland and compatibility-sensitive apps | Cut corners and layered focus frame |

The angular variants deliberately avoid transparent rounded corners. They are
intended for XWayland clients such as WeChat where transparent SVG corners can
be rendered incorrectly by the compatibility path.

## Install

Requirements: Fcitx5 Classic UI and Noctalia v5 with user templates enabled.

```bash
git clone https://github.com/YOUR_ACCOUNT/noctalia-fcitx5-dynamic.git
cd noctalia-fcitx5-dynamic
./scripts/install.sh
```

The installer creates writable theme output directories, appends named template
entries to `~/.config/noctalia/user-templates.toml`, applies the current
Noctalia palette, and reloads the Fcitx5 Classic UI addon. It refuses to append
duplicate entries.

Choose one of the four themes in Fcitx5 Configuration Tool, or edit:

```ini
~/.config/fcitx5/conf/classicui.conf
Theme=noctalia-dynamic-rounded-dark
```

## Nix / Home Manager

Keep this repository outside the Nix store because Noctalia renders templates
at runtime. Add the installer to a Home Manager activation step, or link the
repository into a persistent path and run `scripts/install.sh` after switching.
The example fragment in [examples/user-templates.toml](examples/user-templates.toml)
shows the entries that Noctalia consumes.

## Project scope

The SVG artwork, shape geometry, palette mapping, template configuration, and
installer are authored for this project. Generated theme directories are not
tracked. This repository does not include assets or source files from other
Fcitx5 theme projects.

## License

MIT. See [LICENSE](LICENSE).
