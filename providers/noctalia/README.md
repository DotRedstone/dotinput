# Noctalia provider

Use this provider when Noctalia already controls your desktop palette and you
want Fcitx5 to follow it automatically.

## Setup

```bash
git clone https://github.com/DotRedstone/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes
./scripts/install.sh
```

Then choose `fcitx5-dynamic-rounded-dark` as the dark Classic UI theme and
`fcitx5-dynamic-rounded-light` as the light theme in Fcitx5 Configuration Tool.
Noctalia will regenerate those two writable themes whenever its palette changes.

## What the installer changes

The script creates output directories in `~/.local/share/fcitx5/themes`, adds
idempotent entries to Noctalia's `user-templates.toml`, applies the current
palette, and reloads Classic UI. It does not change your selected Fcitx5 theme,
Rime configuration, candidate layout, or other input-method settings.

## Troubleshooting

After changing a Noctalia palette, apply templates manually if needed:

```bash
noctalia msg templates-apply
fcitx5-remote -r
```

This adapter has no Rime dependency and only generates the rounded theme family.
