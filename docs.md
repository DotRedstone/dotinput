# Provider contract

The generic renderer consumes a palette JSON with two maps, `light` and `dark`.
Each map needs these semantic color roles:

```json
{
  "dark": {
    "surface": "#1D1B20",
    "surface_container_low": "#1D1B20",
    "surface_container_high": "#2B2930",
    "on_surface": "#E6E1E5",
    "primary": "#D0BCFF",
    "on_primary": "#381E72",
    "outline": "#938F99",
    "outline_variant": "#49454F"
  }
}
```

Run a provider hook after its palette changes:

```bash
dotinput render \
  --palette "$XDG_CACHE_HOME/my-provider/palette.json" \
  --mode dark --variant rounded --reload
```

The command writes a complete Fcitx5 theme to the user data directory and
reloads only the Classic UI addon. Providers should never restart Fcitx5 or
overwrite `classicui.conf`; the user chooses the resulting theme once.

`providers/noctalia` is the reference adapter. Matugen, Wallust, Pywal, and
other generators only need to export this JSON contract or call the renderer
with an equivalent adapter.
