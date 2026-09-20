# ---
# Module: Noctalia Fcitx5 Dynamic Theme
# Description: Installs the standalone Noctalia template integration during Home Manager activation.
# Scope: Home Manager
# ---

{ config, lib, ... }:

let
  cfg = config.programs.noctaliaFcitx5Dynamic;
in
{
  options.programs.noctaliaFcitx5Dynamic = {
    enable = lib.mkEnableOption "Noctalia Fcitx5 Dynamic theme templates";

    source = lib.mkOption {
      type = lib.types.path;
      default = ../.;
      description = "Checkout path containing the Noctalia Fcitx5 Dynamic installer.";
    };
  };

  config = lib.mkIf cfg.enable {
    home.activation.noctaliaFcitx5Dynamic = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
      ${cfg.source}/scripts/install.sh --no-apply
    '';
  };
}
