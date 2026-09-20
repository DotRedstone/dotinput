#!/usr/bin/env bash
set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
config_file="${XDG_CONFIG_HOME:-$HOME/.config}/noctalia/user-templates.toml"
apply_templates=true

usage() {
  printf '%s\n' "Usage: $0 [--user-templates PATH] [--no-apply]"
}

while (($#)); do
  case "$1" in
    --user-templates)
      config_file="$2"
      shift 2
      ;;
    --no-apply)
      apply_templates=false
      shift
      ;;
    -h | --help)
      usage
      exit 0
      ;;
    *)
      usage >&2
      exit 2
      ;;
  esac
done

for theme in rounded-light rounded-dark angular-light angular-dark; do
  mkdir -p "${XDG_DATA_HOME:-$HOME/.local/share}/fcitx5/themes/noctalia-dynamic-$theme"
done

mkdir -p "$(dirname "$config_file")"
touch "$config_file"

if ! grep -Fq 'noctalia_fcitx5_dynamic_rounded_light_theme' "$config_file"; then
  backup="$config_file.before-noctalia-fcitx5-dynamic-$(date +%Y%m%d-%H%M%S)"
  cp -p "$config_file" "$backup"
  cat >> "$config_file" <<EOF

# Noctalia Fcitx5 Dynamic: managed by $project_root/scripts/install.sh
[theme.templates.user.noctalia_fcitx5_dynamic_rounded_light_theme]
input_path = "$project_root/themes/rounded-light/theme.conf.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-light/theme.conf"

[theme.templates.user.noctalia_fcitx5_dynamic_rounded_light_panel]
input_path = "$project_root/themes/rounded-light/panel.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-light/panel.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_rounded_light_highlight]
input_path = "$project_root/themes/rounded-light/highlight.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-light/highlight.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_rounded_dark_theme]
input_path = "$project_root/themes/rounded-dark/theme.conf.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-dark/theme.conf"

[theme.templates.user.noctalia_fcitx5_dynamic_rounded_dark_panel]
input_path = "$project_root/themes/rounded-dark/panel.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-dark/panel.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_rounded_dark_highlight]
input_path = "$project_root/themes/rounded-dark/highlight.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-rounded-dark/highlight.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_light_theme]
input_path = "$project_root/themes/angular-light/theme.conf.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-light/theme.conf"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_light_panel]
input_path = "$project_root/themes/angular-light/panel.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-light/panel.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_light_highlight]
input_path = "$project_root/themes/angular-light/highlight.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-light/highlight.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_dark_theme]
input_path = "$project_root/themes/angular-dark/theme.conf.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-dark/theme.conf"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_dark_panel]
input_path = "$project_root/themes/angular-dark/panel.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-dark/panel.svg"

[theme.templates.user.noctalia_fcitx5_dynamic_angular_dark_highlight]
input_path = "$project_root/themes/angular-dark/highlight.svg.template"
output_path = "$HOME/.local/share/fcitx5/themes/noctalia-dynamic-angular-dark/highlight.svg"
post_hook = "busctl --user call org.fcitx.Fcitx5 /controller org.fcitx.Fcitx.Controller1 ReloadAddonConfig s classicui >/dev/null 2>&1 || true"
EOF
  printf 'Added Noctalia template entries. Backup: %s\n' "$backup"
fi

if "$apply_templates" && command -v noctalia >/dev/null 2>&1; then
  noctalia msg templates-apply
fi
