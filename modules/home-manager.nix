# ---
# Module: Fcitx5 Dynamic Themes
# Description: Installs the optional Noctalia provider during Home Manager activation.
# Scope: Home Manager
# ---

{ config, lib, ... }:

let
  cfg = config.programs.fcitx5DynamicThemes;
in
{
  options.programs.fcitx5DynamicThemes = {
    enable = lib.mkEnableOption "the Noctalia provider for Fcitx5 Dynamic Themes";

    source = lib.mkOption {
      type = lib.types.path;
      default = ../.;
      description = "Path containing the Fcitx5 Dynamic Themes Noctalia provider.";
    };

    applyOnActivation = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Apply the current Noctalia palette after the provider setup completes.";
    };
  };

  config = lib.mkIf cfg.enable {
    home.activation.fcitx5DynamicThemes = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
      ${cfg.source}/scripts/install.sh ${lib.optionalString (!cfg.applyOnActivation) "--no-apply"}
    '';
  };
}
