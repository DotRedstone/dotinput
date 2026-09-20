# Fcitx5 Dynamic Themes

[English](#english) | [简体中文](#简体中文)

## English

Provider-agnostic dynamic color themes for Fcitx5 Classic UI. A color provider
supplies a semantic palette, this project renders complete Fcitx5 assets, and
Classic UI reloads without restarting the input method. Noctalia is the first
fully integrated provider, not a project-wide requirement.

### Theme family

| Theme | Intended clients | Shape language |
| --- | --- | --- |
| `fcitx5-dynamic-rounded-light` | Native Wayland, light mode | Soft-square shell and inset focus ring |
| `fcitx5-dynamic-rounded-dark` | Native Wayland, dark mode | Soft-square shell and inset focus ring |
| `fcitx5-dynamic-angular-light` | XWayland, light mode | Cut corners and layered focus frame |
| `fcitx5-dynamic-angular-dark` | XWayland, dark mode | Cut corners and layered focus frame |

Angular variants deliberately avoid transparent rounded corners, which makes
them a safer choice for compatibility-sensitive XWayland clients.

### Install the Noctalia provider

Requirements: Fcitx5 Classic UI and Noctalia v5 with user templates enabled.

```bash
git clone https://github.com/DotRedstone/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes
./scripts/install.sh
```

The installer creates writable output directories, adds idempotent template
entries to `~/.config/noctalia/user-templates.toml`, applies the current
palette, and reloads only the Fcitx5 Classic UI addon. It never selects a theme
for you. Select one in Fcitx5 Configuration Tool or set it in:

```ini
~/.config/fcitx5/conf/classicui.conf
Theme=fcitx5-dynamic-rounded-dark
```

### Use another palette provider

The generic command accepts palette JSON matching
[core/palette.schema.json](core/palette.schema.json):

```bash
fcitx5-dynamic-themes render \
  --palette "$XDG_CACHE_HOME/my-provider/palette.json" \
  --mode dark --variant rounded --reload
```

Any color generator can integrate by exporting that JSON or invoking the
command after a palette update. See [docs.md](docs.md) for the provider
contract and [examples/palette.json](examples/palette.json) for a complete
test palette.

### Nix / Home Manager

```nix
{
  inputs.fcitx5-dynamic-themes.url = "github:DotRedstone/fcitx5-dynamic-themes";

  imports = [ inputs.fcitx5-dynamic-themes.homeManagerModules.default ];

  programs.fcitx5DynamicThemes = {
    enable = true;
    applyOnActivation = true;
  };
}
```

Generated themes remain in the user's Fcitx5 data directory; templates can
come from either a checkout or an immutable Nix store path. Set
`applyOnActivation = false` when Noctalia is not running during Home Manager
activation, then run `noctalia msg templates-apply` after login.

### Arch / AUR

[packaging/arch](packaging/arch) contains the AUR packaging source. The
published AUR repository will use a release tarball checksum after a versioned
GitHub release is created. Package installation never modifies user Fcitx5 or
Noctalia configuration; users explicitly run
`fcitx5-dynamic-themes-noctalia-setup` to enable the Noctalia provider.

### Development

```bash
PYTHONPATH=src python -m unittest discover -s tests -v
nix flake check --no-build
nix build .# --no-link
```

## 简体中文

这是一个面向 Fcitx5 Classic UI 的动态配色主题项目。调色板提供方输出
语义色彩，本项目据此生成完整的 Fcitx5 主题文件，并仅热加载 Classic UI，
不会重启输入法。Noctalia 是第一个完整接入的提供方，但并不是项目的前置依赖。

### 主题族

| 主题 | 适用客户端 | 外观语言 |
| --- | --- | --- |
| `fcitx5-dynamic-rounded-light` | 原生 Wayland、浅色模式 | 柔和圆角外框与内嵌焦点环 |
| `fcitx5-dynamic-rounded-dark` | 原生 Wayland、深色模式 | 柔和圆角外框与内嵌焦点环 |
| `fcitx5-dynamic-angular-light` | XWayland、浅色模式 | 切角外框与分层焦点框 |
| `fcitx5-dynamic-angular-dark` | XWayland、深色模式 | 切角外框与分层焦点框 |

`angular` 主题刻意不使用透明圆角，在兼容性敏感的 XWayland 客户端中更稳妥。

### 使用 Noctalia 提供方

前提：已启用 Fcitx5 Classic UI，并使用支持用户模板的 Noctalia v5。

```bash
git clone https://github.com/DotRedstone/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes
./scripts/install.sh
```

安装器会创建可写主题输出目录，在
`~/.config/noctalia/user-templates.toml` 中写入可重复执行而不会重复添加的模板项，
应用当前调色板，并只通过 D-Bus 热加载 Fcitx5 Classic UI。它不会替你改变当前主题。
可在 Fcitx5 配置工具选择主题，或编辑：

```ini
~/.config/fcitx5/conf/classicui.conf
Theme=fcitx5-dynamic-rounded-dark
```

### 接入其他动态配色工具

通用命令接收符合 [core/palette.schema.json](core/palette.schema.json) 的 JSON：

```bash
fcitx5-dynamic-themes render \
  --palette "$XDG_CACHE_HOME/my-provider/palette.json" \
  --mode dark --variant rounded --reload
```

任何能导出该 JSON、或能在配色更新后运行命令的工具都可以接入。完整约定见
[docs.md](docs.md)，可用 [examples/palette.json](examples/palette.json) 做离线测试。

### Nix / Home Manager

```nix
{
  inputs.fcitx5-dynamic-themes.url = "github:DotRedstone/fcitx5-dynamic-themes";

  imports = [ inputs.fcitx5-dynamic-themes.homeManagerModules.default ];

  programs.fcitx5DynamicThemes = {
    enable = true;
    applyOnActivation = true;
  };
}
```

生成后的主题始终位于用户自己的 Fcitx5 数据目录；模板源既可来自普通检出目录，
也可来自只读 Nix store。如果 Home Manager 激活时 Noctalia 尚未启动，可将
`applyOnActivation` 设为 `false`，登录后运行 `noctalia msg templates-apply`。

### Arch / AUR

[packaging/arch](packaging/arch) 提供 AUR 打包源。正式 AUR 仓库会在创建版本化
GitHub Release 后使用对应 tarball 的校验和。软件包安装不会修改用户的 Noctalia
或 Fcitx5 配置；需要用户显式运行
`fcitx5-dynamic-themes-noctalia-setup` 才会启用 Noctalia 提供方。

### 开发与验证

```bash
PYTHONPATH=src python -m unittest discover -s tests -v
nix flake check --no-build
nix build .# --no-link
```

## License / 许可证

MIT. See [LICENSE](LICENSE).
