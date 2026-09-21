# Arch development package

This directory contains the `dotinput-git` PKGBUILD. It builds the current
main branch so new renderers can be tested before a stable release. Use
`makepkg -si` here to build and install it locally.

The intended AUR development package name is `dotinput-git`. Publishing still requires an
AUR account with this machine's SSH public key registered; GitHub credentials
do not grant AUR push access.

The package installs code and provider assets only. It never writes a user's
Noctalia or Fcitx5 configuration during pacman installation. Users explicitly
run `dotinput-noctalia-setup` to enable the Noctalia provider.
