# Chunker 中文版 (Chunker i18n)

**在 Java 版与基岩版之间转换 Minecraft 世界 —— 支持中文/英文切换的社区汉化版**

> 本项目基于 [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker) 1.19.1 的源码进行汉化，
> 上游项目由 Hive Games 维护并接受 Mojang Studios 资助。若你需要官方英文原版，请访问上游仓库。
>
> This is a community Chinese-localized fork of Chunker. For the official English version, visit
> [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker).

**语言 / Language / 語言**：[简体中文](#简体中文) | [English](#english) | [繁體中文](#繁體中文)

---

<a id="简体中文"></a>
## 简体中文

### ✨ 汉化内容

- **界面全量汉化**（约 450 条文本）：所有页面、按钮、报错提示、世界设置说明
- **中英文一键切换**：页脚 `English | 简体中文`，即时生效，无需重启
- **自动记忆**：语言偏好保存在本地，重启后保持
- **智能默认**：首次启动按操作系统语言自动选择（中文系统默认简体中文）
- **后端消息翻译**：转换进度、设置分类名等来自 Java 后端的文本同样翻译
- **世界设置全汉化**：难度、游戏规则、天气、限制等全部设置项及悬停说明

### 📥 下载使用

前往 [Releases](../../releases) 页面下载：

| 文件 | 说明 |
|---|---|
| `Chunker-x.x.x-i18n.exe` | Windows 便携版，双击即用（x64） |
| `Chunker-x.x.x-i18n-windows-x86.zip` | Windows 免安装解压版 |

**系统要求**：Windows 10/11（64 位）。程序内置 Java 运行时，无需额外安装。

**切换语言**：启动后拖动页面到底部页脚，点击 `简体中文` 或 `English` 即可切换。

### 🛠️ 从源码构建

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

完整的汉化技术文档（架构设计、词条维护、踩坑记录）见 [I18N.md](I18N.md)；
上游更新时的快速汉化与构建操作手册见 [DEVELOPMENT.md](DEVELOPMENT.md)。

### 🔄 与上游同步

```powershell
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
git fetch upstream
git merge upstream/master   # 解决冲突后 git push
```

上游更新后，通常只需检查：新增界面文本是否已补入 `app/ui/src/i18n/locales/` 两份词条文件、
世界设置数据文件结构是否变化。

### 📁 汉化相关目录

```
app/ui/src/i18n/                    # i18n 核心 + 中英词条
app/ui/src/.../world_settings/      # 世界设置数据（settings.json / settings.zh-CN.json）
app/electron/src/version.json       # 构建版本信息（自动生成，勿手动编辑）
I18N.md                             # 汉化开发文档
```

### ⚠️ 已知限制

继承上游的限制：实体（画与展示框除外）、结构数据（村庄/要塞等）暂不支持转换。

汉化相关：Java 命令行界面（CLI）为英文；世界预览地图的图层控件在切换语言后需重新进入预览页刷新。

### 📄 许可证与致谢

- 原项目 [Chunker](https://github.com/HiveGamesOSS/Chunker) 由 [Hive Games](https://hivegames.io) 开发，MIT 协议授权
- 本 fork 遵循相同的 [MIT 协议](LICENSE)
- 汉化工作与上游官方无关，问题反馈请优先到本仓库的 Issues

---

<a id="english"></a>
## English

A community fork of [Chunker](https://github.com/HiveGamesOSS/Chunker) 1.19.1 adding full Simplified Chinese localization with a language switcher.

### Localization Highlights

- ~450 translated strings covering every screen, button, error message and world setting description
- One-click language switching in the footer (`English | 简体中文`), applied instantly
- Preference persisted locally; auto-detects system language on first launch
- Backend-pushed texts (progress names, settings categories) are translated as well

### Download

Grab `Chunker-x.x.x-i18n.exe` (portable, Windows x64) from the [Releases](../../releases) page.
The app bundles its own Java runtime — no extra installation required.

### Building from Source

```powershell
cd app\ui;       npm install; npm run build
cd app\electron; npm install; npm run publish   # output in app\electron\dist\
```

Electron packaging expects a packaged Java backend at `cli\build\libs\packaged`
(build it with `gradlew build`, or extract `resources\chunker-cli` from an upstream release zip).
See [I18N.md](I18N.md) for the full localization engineering notes (in Chinese), and
[DEVELOPMENT.md](DEVELOPMENT.md) for the upstream-sync & build runbook (in Chinese).

### Syncing with Upstream

```powershell
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
git fetch upstream && git merge upstream/master
```

### License & Credits

Original Chunker by [Hive Games](https://hivegames.io), MIT licensed.
This fork is distributed under the same [MIT license](LICENSE).
The localization is a community effort, not affiliated with Hive Games or Mojang Studios.

---

<a id="繁體中文"></a>
## 繁體中文

Chunker 的社群繁體化分支，在上游 1.19.1 原始碼基礎上新增完整的中文在地化，並可於介面中一鍵切換語言。

### ✨ 當地語系化內容

- **介面全量中文化**（約 450 條文字）：所有頁面、按鈕、錯誤提示、世界設定說明
- **中英文一鍵切換**：頁尾 `English | 简体中文`，即時生效，無需重新啟動
- **自動記憶**：語言偏好儲存在本機，重啟後保持不變
- **智慧預設**：首次啟動時依作業系統語言自動選擇（中文系統預設為簡體中文）
- **後端訊息翻譯**：轉換進度、設定分類名稱等來自 Java 後端的文字同樣翻譯
- **世界設定全中文化**：難度、遊戲規則、天氣、限制等全部設定項目及懸停說明

### 📥 下載與使用

前往 [Releases](../../releases) 頁面下載：

| 檔案 | 說明 |
|---|---|
| `Chunker-x.x.x-i18n.exe` | Windows 可攜式版本，點擊即用（x64） |
| `Chunker-x.x.x-i18n-windows-x86.zip` | Windows 免安裝解壓版 |

**系統需求**：Windows 10/11（64 位元）。程式內建 Java 執行環境，無需額外安裝。

**切換語言**：啟動後將頁面拖動至底部頁尾，點擊 `简体中文` 或 `English` 即可切換。
（目前內建詞條為簡體中文，繁體介面用語已在地化；如需純繁體詞條歡迎提交 PR。）

### 🛠️ 從原始碼建置

**需求**：Node.js 18+（前端）、JDK 17+（選用，僅在需要重新編譯 Java 後端時）

```powershell
# 1. 建置前端 UI
cd app\ui
npm install
npm run build

# 2. 封裝 Windows 桌面應用程式（產物在 app\electron\dist\）
cd ..\electron
npm install
npm run publish
```

> 提示：Electron 封裝需要 `cli\build\libs\packaged` 目錄下有已封裝的 Java 後端
> （可用 `gradlew build` 從原始碼產生，或從上游 Release 的 zip 解壓 `resources\chunker-cli`）。

完整的當地語系化技術文件（架構設計、詞條維護、除錯記錄）見 [I18N.md](I18N.md)；
上游更新時的快速漢化與建置操作手冊見 [DEVELOPMENT.md](DEVELOPMENT.md)。

### 🔄 與上游同步

```powershell
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
git fetch upstream
git merge upstream/master   # 解決衝突後 git push
```

### 📄 授權與致謝

- 原專案 [Chunker](https://github.com/HiveGamesOSS/Chunker) 由 [Hive Games](https://hivegames.io) 開發，以 MIT 授權條款釋出
- 本 fork 遵循相同的 [MIT 授權](LICENSE)
- 當地語系化工作與上游官方無關，問題回饋請優先至本儲存庫的 Issues
