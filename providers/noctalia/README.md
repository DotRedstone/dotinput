# Noctalia provider

Noctalia v5 already owns a semantic palette and a template lifecycle. This
provider keeps rendering inside Noctalia: its template files use Noctalia color
variables and produce the Fcitx5 theme files directly when the palette changes.

```bash
./scripts/install.sh
```

The script creates writable output directories under
`~/.local/share/fcitx5/themes`, adds idempotent entries to Noctalia's
`user-templates.toml`, runs `noctalia msg templates-apply`, then asks Fcitx5
Classic UI to reload through D-Bus. It does not select a Fcitx5 theme.

This adapter has no Rime dependency. Use `rounded` for native Wayland clients
and `angular` for compatibility-sensitive XWayland clients.
