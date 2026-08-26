# 开发规范 —— 上游同步与汉化构建指南

> 本文档是**操作手册**：上游（HiveGamesOSS/Chunker）发布新版本时，按此流程快速完成汉化迁移与构建发布。
> 架构设计、改造背景与完整踩坑记录见 [I18N.md](I18N.md)。

---

## 1. 代码编写规范（日常开发必守）

### 1.1 字符串规则

| 场景 | 做法 | 禁止 |
|---|---|---|
| UI 自有文本（按钮/标题/提示） | `t("key")`，key 加入 **en.json 和 zh-CN.json 两份** | 硬编码英文 |
| 后端推送文本（进度名/警告/错误正文） | `tt(原文)`，词条键为 `backend.<英文原文>`（逐字一致） | 改后端代码翻译 |
| 世界设置数据 | 同步维护 `settings.json` 与 `settings.zh-CN.json` | 只改一份 |
| 发给后端的数据值 | **永不翻译**：`NORMAL`/`FLAT`/`CUSTOM`/`VOID`、难度数值、广播范围数值、`value` 字段 | 翻译 value |
| 选项显示名 | 只翻译 Radio 选项的 `name` 字段 | — |

### 1.2 key 命名规范

按屏幕/组件加前缀，扁平小写点分：

```
common.*        通用按钮（cancel/close/restart/convert/start/save/running）
select.*        选择世界页（含 select.error.* 报错）
mode.*          导出版本页
processing.*    转换页
save.*          保存页
settings.tab.*  设置页侧栏
worldSettings.* 世界设置页
palette. / biome. / dimensions. / custom. / pruning. / region.  各设置 tab
converter.*     转换器设置
cli.*           CLI 导出页
selector.*      方块/生物群系选择器
preview.*       世界预览
error.*         各类报错标题
progress.*      进度条文案
backend.*       后端来源字符串映射（键 = 英文原文）
```

插值用 `{name}` 占位符：`t("mode.showAll", {count: 5})`。

### 1.3 i18n 导入路径对照表（高频错误点）

| 文件位置 | 导入写法 |
|---|---|
| `src/components/*.js` | `"../i18n"` |
| `src/components/page/*.js`、`modal/*.js` | `"../../i18n"` |
| `src/components/screen/<屏名>/*.js` | `"../../../i18n"` |
| `src/components/screen/settings/*.js` | `"../../../i18n"` |
| `src/components/screen/settings/tab/*.js` | `"../../../../i18n"` |
| `src/components/screen/settings/tab/<子目录>/*.js` | `"../../../../../i18n"` |

### 1.4 三个易错点（历史踩坑，详见 I18N.md）

1. **PureComponent**（BlockMapping/BiomeMapping 等）不响应 `forceUpdate`，父级必须传 `lang={getLang()}` prop
2. **模块级常量禁止缓存 `t()` 结果**（语言切换后不更新），需要时封装为函数
3. **默认值比较逻辑**若含英文文本（如 `"Region " + n`），必须与显示用 `t()` 同源

---

## 2. 上游同步流程

### 2.1 首次配置（只需一次）

```powershell
cd F:\Chunker\Chunker-1.19.1-i18n
git remote add upstream https://github.com/HiveGamesOSS/Chunker.git
```

### 2.2 标准同步步骤

```powershell
git fetch upstream
git merge upstream/master        # 若上游默认分支为 main 则相应替换
```

### 2.3 冲突处理策略（按文件类型）

| 冲突文件类型 | 策略 |
|---|---|
| 上游新增的组件/文件（我方未改过） | 直接采用上游，随后按第 1 节规范补 `t()` 与词条 |
| 双方都改过的组件（约 25 个已汉化文件，清单见 I18N.md 第三节） | **以上游版本为基础**，重新套用 `t()` 替换（参考 `git show 1ffc5c8 -- <文件>` 查看当初改法） |
| `settings.json`（世界设置英文数据） | 采用上游结构，将**新增/变更的键**同步进 `settings.zh-CN.json` |
| `app/electron/package.json` | 保留我方 `artifactName` 行，接受上游其他改动；注意比对 `version` 号 |
| `app/electron/src/version.json` | 不会冲突（gitignored，构建钩子自动生成） |
| `.github/workflows/*` | 一般直接采用上游 |

### 2.4 合并后必查

```powershell
# 全库扫描残留硬编码英文（应无输出或仅剩 console.info 日志）
git grep -n "showError(\"[A-Z]" -- app/ui/src
git grep -nE "\"[A-Z][a-z]+ [a-z][a-z ]+" -- app/ui/src/components
```

---

## 3. 新版本汉化检查清单

- [ ] **新界面文本**：逐文件检查上游 diff，新增文本全部 `t()` 化，词条补入两份 locale 文件
- [ ] **后端新消息**：搜索上游 Java 源码定位新增进度名/警告文本
  ```
  # 在上游 cli 源码中搜进度名
  git grep -n "ProgressStateResponse(" upstream/master -- cli
  # electron 侧
  git grep -n "name: \"" upstream/master -- app/electron/src
  ```
  找到的英文原文加入 `backend.*` 映射
- [ ] **世界设置**：diff 上游 `settings.json`，新增分类/设置项同步翻译进 `settings.zh-CN.json`（分类名与标识符逐字一致，只译 display/description/选项 name）
- [ ] **版本号**：更新 `app/electron/package.json` 的 `version` 字段（artifactName 用 `${version}` 自动带出）
- [ ] **词条一致性校验**（见第 4 节脚本）
- [ ] **构建 + 冒烟测试**（见第 4 节清单）

---

## 4. 构建与验证

### 4.1 词条完整性校验

```powershell
# 在 app/ui 下执行：输出两份词条数量与差异键，必须为空差异
node -e "const a=Object.keys(require('./src/i18n/locales/en.json')),b=Object.keys(require('./src/i18n/locales/zh-CN.json'));console.log(a.length,b.length,a.filter(k=>!b.includes(k)),b.filter(k=>!a.includes(k)))"
```

### 4.2 构建

```powershell
# 前端（必须零警告再继续）
cd app\ui;       npm install; npm run build

# 打包桌面应用（产物 app\electron\dist\Chunker-<版本>-i18n.exe）
cd ..\electron;  npm install; npm run publish
```

注意：
- **打包/覆盖前关闭正在运行的 Chunker**（文件占用会导致复制失败）
- Electron 打包依赖 `cli\build\libs\packaged`（Java 后端 + 内置 JRE）：
  - 上游大版本更新（后端有变）→ 用 `gradlew build` 重新生成（需 JDK 17+）
  - 仅 UI 更新 → 复用旧后端：从上游 Release 的 zip 提取 `resources\chunker-cli` 放入该目录
- `win-unpacked\` 目录为免安装版，可用于快速自测

### 4.3 冒烟测试清单

1. 首次启动：中文系统应默认显示中文
2. 页脚切换 `English ⇄ 简体中文`：全界面即时切换，重启后保持
3. 四个主屏走查：选择世界 → 导出版本（Java/基岩分组名）→ 转换（进度名）→ 保存
4. 世界设置页：五个分类标签（世界设置/游戏规则/限制/天气/杂项）均已翻译
5. 高级模式：方块映射、生物群系映射、维度与修剪、转换器设置、CLI 导出五个 tab 走查
6. 实际转换一个小型测试世界，确认功能无回归

---

## 5. 发布 Release

1. 提交并推送：`git add -A; git commit -m "..."; git push`
2. GitHub 网页 → Releases → Draft a new release
   - Tag：`v<上游版本>`（如 `v1.19.1`）
   - 附件：`Chunker-<版本>-i18n.exe`（及可选 zip 解压版）
3. Release 说明模板：

```markdown
## 更新内容
- 同步上游 Chunker <版本>
- （本次汉化修正/新增内容）

## 下载
- Chunker-<版本>-i18n.exe：Windows 便携版（x64），双击即用

基于 [HiveGamesOSS/Chunker](https://github.com/HiveGamesOSS/Chunker) <版本>，MIT License。
```

---

## 6. 常用命令速查

```powershell
# 词条一致性校验（app/ui 下）
node -e "const a=Object.keys(require('./src/i18n/locales/en.json')),b=Object.keys(require('./src/i18n/locales/zh-CN.json'));console.log(a.length,b.length,a.filter(k=>!b.includes(k)),b.filter(k=>!a.includes(k)))"

# 残留英文扫描（仓库根）
git grep -n "showError(\"[A-Z]" -- app/ui/src

# 同步上游
git fetch upstream; git merge upstream/master

# 查看某文件当初的汉化改法
git show 1ffc5c8 -- app/ui/src/components/screen/save/saveScreen.js

# 构建 UI / 打包 exe
cd app\ui; npm run build
cd ..\electron; npm run publish
```
