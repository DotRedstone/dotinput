# Arch / AUR release files

This directory contains a reproducible Arch package recipe for the immutable
`v0.2.0` GitHub source tarball. Its SHA-256 checksum is verified by makepkg.
Use `makepkg -si` here to build and install it locally.

The intended AUR package name is `fcitx5-dynamic-themes`. Publishing still requires an
AUR account with this machine's SSH public key registered; GitHub credentials
do not grant AUR push access.

The package installs code and provider assets only. It never writes a user's
Noctalia or Fcitx5 configuration during pacman installation. Users explicitly
run `fcitx5-dynamic-themes-noctalia-setup` to enable the Noctalia provider.
