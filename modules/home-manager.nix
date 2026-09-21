# ---
# Module: DotInput Themes
# Description: Installs the optional Noctalia provider during Home Manager activation.
# Scope: Home Manager
# ---

{ config, lib, ... }:

let
  cfg = config.programs.dotInput;
in
{
  options.programs.dotInput = {
    enable = lib.mkEnableOption "the Noctalia provider for DotInput Themes";

    source = lib.mkOption {
      type = lib.types.path;
      default = ../.;
      description = "Path containing the DotInput Themes Noctalia provider.";
    };

    applyOnActivation = lib.mkOption {
      type = lib.types.bool;
      default = false;
      description = "Apply the current Noctalia palette after the provider setup completes.";
    };
  };

  config = lib.mkIf cfg.enable {
    home.activation.dotInput = lib.hm.dag.entryAfter [ "writeBoundary" ] ''
      ${cfg.source}/scripts/install.sh ${lib.optionalString (!cfg.applyOnActivation) "--no-apply"}
    '';
  };
}
