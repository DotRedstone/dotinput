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

### Start here

1. Open [Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/) and pick a style plus a color theme.
2. Adjust geometry or colors only when you want to, then download the JSON.
3. Run `fcitx5-dynamic-themes render --config ~/Downloads/my-fcitx-theme.json --reload`.

For automatic wallpaper-synchronized colors, use the Noctalia setup below instead:
it manages the palette updates while you keep the generated rounded theme
selected in Fcitx5.

### Theme family

| Theme | Intended clients | Shape language |
| --- | --- | --- |
| `fcitx5-dynamic-rounded-light` | Native Wayland, light mode | Soft-square shell and inset focus ring |
| `fcitx5-dynamic-rounded-dark` | Native Wayland, dark mode | Soft-square shell and inset focus ring |

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

[Open Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/) keeps style
and color independent. Pick one of four rounded style themes (Studio, Compact,
Soft, or Outlined), then combine it with one of ten color themes. Every color
theme includes light and dark semantic palettes; every style theme includes its
own radius, outline, inset, and margin values. All supported output controls
are visible: panel and
highlight radius, outline, content and text margins, image slices, inner lines,
vertical full-width highlighting, and candidate comment scale. The rounded
preview uses the same half-scale SVG geometry as the generated 30px asset with
a 60px viewBox. Fcitx5 content and text margins remain raw pixels. It exports
one portable theme configuration matching
[core/theme.schema.json](core/theme.schema.json).
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

### Custom SVG assets

The Studio intentionally generates one rounded theme family. Advanced theme
authors can replace `panel.svg` and `highlight.svg`, but an SVG alone is not a
complete Fcitx5 theme: `theme.conf` supplies the image slice margins, content
and text margins, colors, and highlight behavior that make those assets render
correctly. Use the generated rounded theme as the reference implementation and
keep each SVG at `30x30` with a `60x60` viewBox when following its geometry.

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

### 三步开始

1. 打开 [Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/)，先选样式主题和配色主题。
2. 只在需要时微调颜色或几何参数，然后下载 JSON。
3. 运行 `fcitx5-dynamic-themes render --config ~/Downloads/my-fcitx-theme.json --reload`。

想让配色跟壁纸自动同步，则使用下面的 Noctalia 接入：它负责更新调色板，而 Fcitx5
继续选择生成出的圆角主题即可。

### 主题族

| 主题 | 适用客户端 | 外观语言 |
| --- | --- | --- |
| `fcitx5-dynamic-rounded-light` | 原生 Wayland、浅色模式 | 柔和圆角外框与内嵌焦点环 |
| `fcitx5-dynamic-rounded-dark` | 原生 Wayland、深色模式 | 柔和圆角外框与内嵌焦点环 |

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

打开 [Theme Studio](https://blog.dotres.cn/fcitx5-dynamic-themes/) 时，样式和配色彼此独立：可先从工作室、紧凑、
柔润、描边四套圆角样式中选一套，再搭配十套配色主题。每套配色都有深浅两组语义色；每套样式决定圆角、描边、
内环与边距。所有支持写入主题的参数都直接展示：面板/高亮圆角、描边、内容与文字边距、图片切片、内环、
纵向满宽高亮和候选注释缩放。
圆角预览遵循生成主题的 30px SVG 画布与 60px viewBox 的半缩放关系；而 Fcitx5 的内容和文字边距仍按原始像素
计算。它会导出一个符合 [core/theme.schema.json](core/theme.schema.json) 的可移植主题配置文件。
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

### 自定义 SVG 素材

工作室刻意只生成一套圆角主题。需要深度定制的用户可以替换 `panel.svg` 与
`highlight.svg`，但 SVG 本身不是完整的 Fcitx5 主题：`theme.conf` 还要提供图片切片边距、
内容和文字边距、颜色与高亮行为，素材才能被正确拉伸和绘制。可把生成的圆角主题当作参考实现；
若沿用本项目的几何规则，请保持 SVG 为 `30x30`、`viewBox` 为 `60x60`。

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
