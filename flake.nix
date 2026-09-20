{
  description = "Original dynamically colored Fcitx5 themes for Noctalia";

  outputs = { self }: {
    homeManagerModules.default = import ./modules/home-manager.nix;
  };
}
