# Chunker 中文版 (Chunker i18n)

**在 Java 版与基岩版之间转换 Minecraft 世界 —— 支持中文/英文切换的社区汉化版**

> 本项目基于 [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker) 1.19.1 的源码进行汉化，
> 上游项目由 Hive Games 维护并接受 Mojang Studios 资助。若你需要官方英文原版，请访问上游仓库。
>
> This is a community Chinese-localized fork of Chunker. For the official English version, visit
> [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker). [English](#english)

---

## ✨ 汉化内容

- **界面全量汉化**（约 450 条文本）：所有页面、按钮、报错提示、世界设置说明
- **中英文一键切换**：页脚 `English | 简体中文`，即时生效，无需重启
- **自动记忆**：语言偏好保存在本地，重启后保持
- **智能默认**：首次启动按操作系统语言自动选择（中文系统默认简体中文）
- **后端消息翻译**：转换进度、设置分类名等来自 Java 后端的文本同样翻译
- **世界设置全汉化**：难度、游戏规则、天气、限制等全部设置项及悬停说明

## 📥 下载使用

前往 [Releases](../../releases) 页面下载：

| 文件 | 说明 |
|---|---|
| `Chunker-x.x.x-i18n.exe` | Windows 便携版，双击即用（x64） |
| `Chunker-x.x.x-i18n-windows-x86.zip` | Windows 免安装解压版 |

**系统要求**：Windows 10/11（64 位）。程序内置 Java 运行时，无需额外安装。

**切换语言**：启动后拖动页面到底部页脚，点击 `简体中文` 或 `English` 即可切换。

## 🛠️ 从源码构建

**要求**：Node.js 18+（前端）、JDK 17+（可选，仅重新编译 Java 后端时需要）

```powershell
# 1. 构建前端 UI
cd app\ui
npm install
npm run build

# 2. 打包 Windows 桌面应用（产物在 app\electron\dist\）
cd ..\electron
npm install
npm run publish
```

> 提示：Electron 打包需要 `cli\build\libs\packaged` 目录下有已打包的 Java 后端
> （可用 `gradlew build` 从源码生成，或从上游 Release 的 zip 中提取 `resources\chunker-cli`）。

完整的汉化技术文档（架构设计、词条维护、踩坑记录）见 [I18N.md](I18N.md)。

## 🔄 与上游同步

```powershell
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
git fetch upstream
git merge upstream/master   # 解决冲突后 git push
```

上游更新后，通常只需检查：新增界面文本是否已补入 `app/ui/src/i18n/locales/` 两份词条文件、
世界设置数据文件结构是否变化。

## 📁 汉化相关目录

```
app/ui/src/i18n/                    # i18n 核心 + 中英词条
app/ui/src/.../world_settings/      # 世界设置数据（settings.json / settings.zh-CN.json）
app/electron/src/version.json       # 构建版本信息（自动生成，勿手动编辑）
I18N.md                             # 汉化开发文档
```

## ⚠️ 已知限制

继承上游的限制：实体（画与展示框除外）、结构数据（村庄/要塞等）暂不支持转换。

汉化相关：Java 命令行界面（CLI）为英文；世界预览地图的图层控件在切换语言后需重新进入预览页刷新。

## 📄 许可证与致谢

- 原项目 [Chunker](https://github.com/HiveGamesOSS/Chunker) 由 [Hive Games](https://hivegames.io) 开发，MIT 协议授权
- 本 fork 遵循相同的 [MIT 协议](LICENSE)
- 汉化工作与上游官方无关，问题反馈请优先到本仓库的 Issues

---

<a name="english"></a>
# Chunker i18n (English)

A community fork of [Chunker](https://github.com/HiveGamesOSS/Chunker) 1.19.1 adding full Simplified Chinese localization with a language switcher.

## Localization Highlights

- ~450 translated strings covering every screen, button, error message and world setting description
- One-click language switching in the footer (`English | 简体中文`), applied instantly
- Preference persisted locally; auto-detects system language on first launch
- Backend-pushed texts (progress names, settings categories) are translated as well

## Download

Grab `Chunker-x.x.x-i18n.exe` (portable, Windows x64) from the [Releases](../../releases) page.
The app bundles its own Java runtime — no extra installation required.

## Building from Source

```powershell
cd app\ui;       npm install; npm run build
cd app\electron; npm install; npm run publish   # output in app\electron\dist\
```

Electron packaging expects a packaged Java backend at `cli\build\libs\packaged`
(build it with `gradlew build`, or extract `resources\chunker-cli` from an upstream release zip).
See [I18N.md](I18N.md) for the full localization engineering notes (in Chinese).

## Syncing with Upstream

```powershell
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
git fetch upstream && git merge upstream/master
```

## License & Credits

Original Chunker by [Hive Games](https://hivegames.io), MIT licensed.
This fork is distributed under the same [MIT license](LICENSE).
The localization is a community effort, not affiliated with Hive Games or Mojang Studios.
