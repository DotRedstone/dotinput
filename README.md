# Fcitx5 Dynamic Themes

[English](#english) | [简体中文](#简体中文)

## English

Provider-agnostic dynamic color themes for Fcitx5 Classic UI. A color provider
supplies a semantic palette, this project renders complete Fcitx5 assets, and
Classic UI reloads without restarting the input method. Noctalia is the first
fully integrated provider, not a project-wide requirement.

| Delivery | Status | Entry point |
| --- | --- | --- |
| Nix Flake | Ready | `nix profile install github:DotRedstone/fcitx5-dynamic-themes` |
| Arch PKGBUILD | Ready | `packaging/arch/PKGBUILD` |
| AUR | Pending AUR SSH key | Package name: `fcitx5-dynamic-themes` |

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

### Theme Studio

[Open Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/) to
adjust semantic colors, rounded geometry, and the XWayland-safe angular
variant with a live candidate-window preview. It exports one portable theme
configuration matching [core/theme.schema.json](core/theme.schema.json).
The Studio has English and Simplified Chinese interfaces. Candidate orientation
and candidate count are preview-only controls: they never enter the exported
JSON and must be configured in Fcitx5 itself when you want to change real input
method behavior.

Render a downloaded configuration directly. The output is a regular writable
Fcitx5 Classic UI theme and `--reload` updates only Classic UI:

```bash
fcitx5-dynamic-themes render \
  --config ~/Downloads/my-fcitx-theme.json --reload
```

The Studio has no account, backend, or telemetry. Its source is static in
[`web/`](web/), so it can also be opened locally or hosted anywhere.

### Nix / Home Manager

Install the command-line renderer and Noctalia setup helper into a profile:

```bash
nix profile install github:DotRedstone/fcitx5-dynamic-themes
fcitx5-dynamic-themes --help
fcitx5-dynamic-themes-noctalia-setup
```

Run the renderer without installing it permanently:

```bash
nix run github:DotRedstone/fcitx5-dynamic-themes -- --help
```

For Home Manager, use both the package and the declarative Noctalia provider:

```nix
{
  inputs.fcitx5-dynamic-themes.url = "github:DotRedstone/fcitx5-dynamic-themes";

  imports = [ inputs.fcitx5-dynamic-themes.homeManagerModules.default ];

  home.packages = [
    inputs.fcitx5-dynamic-themes.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

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

The PKGBUILD is pinned to the immutable `v0.3.0` source tarball and has a real
SHA-256 checksum. Build and install it locally on Arch Linux:

```bash
git clone https://github.com/DotRedstone/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes/packaging/arch
makepkg -si
fcitx5-dynamic-themes-noctalia-setup
```

The intended AUR package name is `fcitx5-dynamic-themes`, but publication is
waiting for the maintainer's AUR SSH key. Package installation never modifies
user Fcitx5 or Noctalia configuration; the setup command is always explicit.

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

| 分发方式 | 状态 | 安装入口 |
| --- | --- | --- |
| Nix Flake | 已可用 | `nix profile install github:DotRedstone/fcitx5-dynamic-themes` |
| Arch PKGBUILD | 已可用 | `packaging/arch/PKGBUILD` |
| AUR | 等待 AUR SSH 密钥 | 包名：`fcitx5-dynamic-themes` |

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

### Theme Studio 可视化编辑器

打开 [Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/)，可直接调节
语义色、圆角几何和适用于 XWayland 的切角方案，并实时预览候选窗。它会导出一个符合
[core/theme.schema.json](core/theme.schema.json) 的可移植主题配置文件。
网站提供简体中文和英文界面。候选词横向/纵向布局和候选词数量只是预览控件，不会进入
导出的 JSON；实际输入法的候选窗行为仍需在 Fcitx5 中单独配置。

下载配置后可直接生成主题；产物是用户目录中普通、可写的 Fcitx5 Classic UI 主题，
`--reload` 只会热加载 Classic UI：

```bash
fcitx5-dynamic-themes render \
  --config ~/Downloads/my-fcitx-theme.json --reload
```

Theme Studio 没有账号、后端或遥测，源码就是仓库中的 [`web/`](web/)，因此也能离线打开
或部署到任何静态站点服务。

### Nix / Home Manager

将通用渲染命令和 Noctalia 设置工具安装进用户 profile：

```bash
nix profile install github:DotRedstone/fcitx5-dynamic-themes
fcitx5-dynamic-themes --help
fcitx5-dynamic-themes-noctalia-setup
```

无需安装、临时运行渲染器：

```bash
nix run github:DotRedstone/fcitx5-dynamic-themes -- --help
```

Home Manager 同时安装软件包并启用声明式 Noctalia 提供方：

```nix
{
  inputs.fcitx5-dynamic-themes.url = "github:DotRedstone/fcitx5-dynamic-themes";

  imports = [ inputs.fcitx5-dynamic-themes.homeManagerModules.default ];

  home.packages = [
    inputs.fcitx5-dynamic-themes.packages.${pkgs.stdenv.hostPlatform.system}.default
  ];

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

PKGBUILD 已固定到不可变的 `v0.3.0` 源码 tarball，并写入真实 SHA-256 校验和。
在 Arch Linux 上可直接本地构建并安装：

```bash
git clone https://github.com/DotRedstone/fcitx5-dynamic-themes.git
cd fcitx5-dynamic-themes/packaging/arch
makepkg -si
fcitx5-dynamic-themes-noctalia-setup
```

AUR 计划使用的包名为 `fcitx5-dynamic-themes`，但发布仍等待维护者绑定 AUR SSH 密钥。
软件包安装不会改动用户的 Fcitx5 或 Noctalia 配置；启用提供方始终需要用户显式运行设置命令。

### 开发与验证

```bash
PYTHONPATH=src python -m unittest discover -s tests -v
nix flake check --no-build
nix build .# --no-link
```

## License / 许可证

MIT. See [LICENSE](LICENSE).
