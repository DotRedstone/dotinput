{
  description = "Extensible Linux input method themes, with Fcitx5 Classic UI support";

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
          package = pkgs.python3Packages.buildPythonApplication {
            pname = "dotinput";
            version = "0.3.0";
            pyproject = true;
            src = self;
            nativeBuildInputs = [ pkgs.python3Packages.setuptools ];
            postInstall = ''
              cp -r providers "$out/providers"
              install -Dm755 scripts/install.sh "$out/bin/dotinput-noctalia-setup"
            '';
            doCheck = true;
            checkPhase = ''
              PYTHONPATH=src ${pkgs.python3}/bin/python -m unittest discover -s tests
            '';
          };
        in
        {
          default = package;
          dotinput = package;
        });

      apps = forAllSystems (system: {
        default = {
          type = "app";
          program = "${self.packages.${system}.default}/bin/dotinput";
          meta.description = "Render DotInput Fcitx5 Classic UI themes";
        };
      });

      homeManagerModules.default = import ./modules/home-manager.nix;
    };
}
