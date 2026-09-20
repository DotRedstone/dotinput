# Fcitx5 Dynamic Themes

Provider-agnostic dynamic color themes for Fcitx5 Classic UI. A color provider
supplies a semantic palette, this project renders Fcitx5 assets, and Classic UI
reloads without restarting the input method. Noctalia is the first provider,
not a project-wide requirement.

## Theme family

| Theme | Best for | Shape language |
| --- | --- | --- |
| `fcitx5-dynamic-rounded-light` | Native Wayland, light mode | Soft-square outer shell and inset focus ring |
| `fcitx5-dynamic-rounded-dark` | Native Wayland, dark mode | Soft-square outer shell and inset focus ring |
| `fcitx5-dynamic-angular-light` | XWayland and compatibility-sensitive apps | Cut corners and layered focus frame |
| `fcitx5-dynamic-angular-dark` | XWayland and compatibility-sensitive apps | Cut corners and layered focus frame |

The angular variants deliberately avoid transparent rounded corners. They are
intended for XWayland clients such as WeChat where transparent SVG corners can
be rendered incorrectly by the compatibility path.

## Install

Requirements: Fcitx5 Classic UI plus one palette provider.

```bash
git clone https://github.com/YOUR_ACCOUNT/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes
./scripts/install.sh # Explicitly enables the Noctalia provider.
```

The installer creates writable theme output directories, appends named template
entries to `~/.config/noctalia/user-templates.toml`, applies the current
Noctalia palette, and reloads the Fcitx5 Classic UI addon. It refuses to append
duplicate entries.

Choose one of the four themes in Fcitx5 Configuration Tool, or edit:

```ini
~/.config/fcitx5/conf/classicui.conf
Theme=fcitx5-dynamic-rounded-dark
```

## Providers

The generic CLI accepts a palette JSON following
[core/palette.schema.json](core/palette.schema.json):

```bash
fcitx5-dynamic-themes render --palette palette.json --mode dark --variant rounded --reload
```

This works with any color generator that can write the semantic palette JSON or
invoke a hook after its palette changes. See [docs.md](docs.md) for the exact
provider contract. The Noctalia provider keeps its native template integration
under [providers/noctalia](providers/noctalia).

[examples/palette.json](examples/palette.json) is a complete valid palette for
testing the renderer without a live color provider.

## Nix / Home Manager

The runtime output remains in the user's Fcitx5 data directory; templates may
come from either a checkout or an immutable Nix store path. Import the bundled
module and explicitly opt into the Noctalia provider:

```nix
{
  inputs.fcitx5-dynamic-themes.url = "github:YOUR_ACCOUNT/fcitx5-dynamic-themes";

  imports = [ inputs.fcitx5-dynamic-themes.homeManagerModules.default ];

  programs.fcitx5DynamicThemes = {
    enable = true;
    applyOnActivation = true;
  };
}
```

The example fragment in [examples/user-templates.toml](examples/user-templates.toml)
shows the entries that the Noctalia provider consumes. Set
`applyOnActivation = false` when the color provider is not running during Home
Manager activation, then run `noctalia msg templates-apply` after login.

## Arch / AUR

[packaging/arch](packaging/arch) contains the release-ready PKGBUILD. Before
uploading it to the AUR, replace `OWNER` with the GitHub account, create the
matching `v0.2.0` tag, and replace `SKIP` with the release tarball checksum.
It installs only provider assets and commands; user configuration is touched
only when the user explicitly enables a provider.

## Project scope

The SVG artwork, shape geometry, palette mapping, template configuration, and
installer are authored for this project. Generated theme directories are not
tracked. This repository does not include assets or source files from other
Fcitx5 theme projects.

## License

MIT. See [LICENSE](LICENSE).
