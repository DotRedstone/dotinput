{
  description = "Provider-agnostic dynamic color themes for Fcitx5 Classic UI";

  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";

  outputs = { self, nixpkgs }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
    in
    {
      packages = forAllSystems (system:
        let
          pkgs = import nixpkgs { inherit system; };
        in
        {
          default = pkgs.python3Packages.buildPythonApplication {
            pname = "fcitx5-dynamic-themes";
            version = "0.2.0";
            pyproject = true;
            src = self;
            nativeBuildInputs = [ pkgs.python3Packages.setuptools ];
            postInstall = ''
              cp -r providers "$out/providers"
              install -Dm755 scripts/install.sh "$out/bin/fcitx5-dynamic-themes-noctalia-setup"
            '';
            doCheck = true;
            checkPhase = ''
              PYTHONPATH=src ${pkgs.python3}/bin/python -m unittest discover -s tests
            '';
          };
        });

      homeManagerModules.default = import ./modules/home-manager.nix;
    };
}
