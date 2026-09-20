# Arch / AUR release files

This directory is ready for an AUR release after the project has a public
GitHub repository and an immutable `v0.2.0` tag. Generate the real checksum
with `updpkgsums`, then publish the PKGBUILD in the separate AUR packaging
repository.

The package installs code and provider assets only. It never writes a user's
Noctalia or Fcitx5 configuration during pacman installation. Users explicitly
run `fcitx5-dynamic-themes-noctalia-setup` to enable the Noctalia provider.
