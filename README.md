<!-- filepath: j:\soofware_develop\TimeMaster\README.md -->
<p align="center">
  <img src="assets/images/icon.png" width="120" alt="TimeMaster Logo" />
</p>

<h1 align="center" style="font-size:2.5rem; letter-spacing:2px;">⏰ TimeMaster</h1>
<p align="center" style="font-size:1.2rem;"><b>让每一分钟都被善待</b></p>
<p align="center" style="color:#ffd33d;font-size:1.1rem;">专注 · 高效 · 记录 · 成长</p>

---

<blockquote align="center" style="font-style:italic; color:#888;">
“时间就像海绵里的水，只要愿挤，总还是有的。”<br/>
<sub>—— TimeMaster 开发者寄语</sub>
</blockquote>

---

<p align="center">
  <img src="https://img.shields.io/badge/React_Native-2024-blue?logo=react" />
  <img src="https://img.shields.io/badge/Expo-49.0.0-green?logo=expo" />
  <img src="https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" />
</p>

---

## 📖 目录
- [项目简介](#timemaster-项目-)
- [功能特性](#-功能特性)
- [技术栈](#-技术栈)
- [快速开始](#-快速开始)
- [构建与安装](#-构建-android-安装包-apk)
- [多版本共存](#-本地构建-android-debugrelease-版共存方法)
- [项目结构](#-项目结构)
- [开发建议](#-开发建议)
- [常见问题 FAQ](#-常见问题-faq)
- [贡献指南](#-贡献指南)
- [许可证](#-许可证)

---

# TimeMaster 项目 👋

> ⏳ <b>TimeMaster</b> 是一款基于 [Expo](https://expo.dev) 的极简跨平台时间管理应用，助你高效记录、反思与成长。

---

## ✨ 功能特性

- 📝 <b>卡片式任务管理</b>：项目、反思、打分多维度记录
- ⏱️ <b>自动统计用时</b>：支持时间区间筛选
- 📊 <b>数据可视化</b>：用图表洞察你的时间分布与体验
- 🗂️ <b>项目库/任务库分离</b>：支持项目预设与切换
- 🖋️ <b>富文本编辑</b>：本地集成 Quill.js，支持多样化内容输入
- 🌙 <b>深色主题</b>：现代美观，夜间更护眼
- 📱 <b>全平台支持</b>：Android/iOS 一键切换
- 🔒 <b>本地数据安全</b>：SQLite 持久化存储，隐私无忧
- 💡 <b>极简交互</b>：上手即用，界面清爽

---

## 🛠️ 技术栈

| 技术         | 说明                |
| ------------ | ------------------- |
| React Native | 跨平台开发框架      |
| Expo         | 快速开发与打包      |
| TypeORM      | 本地数据库 ORM      |
| SQLite       | 本地数据存储        |
| Quill.js     | 富文本编辑器        |
| TypeScript   | 类型安全            |
| React Native Paper / RNEUI | UI 组件库 |

---

## 🚀 快速开始

1. <b>安装依赖</b>
   ```bash
   npm install
   ```
2. <b>启动应用</b>
   ```bash
   npx expo start
   ```
   启动后可选择：
   - Expo Go 扫码体验
   - Android/iOS 模拟器
   - 开发构建（推荐）

3. <b>本地静态资源说明</b>
   - Quill.js 及样式已放于 `assets/quill/`，无需外网即可加载。

---

## 📦 构建 Android 安装包（APK）

1. 确保已安装好 [Expo CLI](https://docs.expo.dev/get-started/installation/) 和 Android Studio（或已配置好 Android 环境变量）。
2. 运行以下命令进行构建：

   ```bash
   npx expo run:android --variant release
   ```
   或使用 EAS Build（推荐云端构建）：
   ```bash
   npx eas build -p android --profile production
   ```
   > EAS Build 需先登录并初始化：`npx eas login`、`npx eas build:configure`

3. 构建完成后，APK 文件会在本地 `android/app/build/outputs/apk/release/` 目录下，或 EAS 云端下载链接中。
4. 将 APK 安装包发送到手机或通过模拟器安装，即可体验正式版。

> ⚠️ **注意**：
> 使用 `npx expo run:android --variant release` 构建 release 包时，生成的 APK 会使用本地静态 JS bundle（assets/index.android.bundle），
> 如果你没有手动重新打包 JS 资源或清理缓存，可能会导致安装到手机上的不是最新代码。
> 构建 release 包前，建议先运行 `npx expo export --platform android` 或 `npx expo prebuild`，确保 JS 代码为最新。

---

## 📦 本地构建 Android Debug/Release 版共存方法

Expo/React Native 项目如需让 debug 版和 release 版同时安装在手机上，需为不同版本设置不同的 `android.package`。

### 步骤

1. **修改 app.json 的 package 字段**

- Debug 版（开发包）
  ```json
  "android": {
    ...,
    "package": "com.huachen.timemaster.dev"
  }
  ```
- Release 版（正式包）
  ```json
  "android": {
    ...,
    "package": "com.huachen.timemaster"
  }
  ```

2. **构建并安装**

- 构建 debug 版：
  ```bash
  npx expo run:android --variant debug
  ```
- 构建 release 版：
  ```bash
  npx expo run:android --variant release
  ```

3. **注意事项**
- 两个包名不同，手机上可共存。
- 构建前请确认 app.json 中 `android.package` 已切换为目标版本的包名。
- EAS Build 也可通过 eas.json 的 profile 设置不同包名。

> 示例：
> - Debug 包名：com.huachen.timemaster.dev
> - Release 包名：com.huachen.timemaster

---

## 🗂️ 项目结构

```text
TimeMaster/
├── app/                # 应用主目录
│   ├── _layout.tsx     # 全局布局
│   ├── database.ts     # 数据库配置
│   ├── entities/       # TypeORM 实体
│   ├── services/       # 业务逻辑
│   ├── (tabs)/         # 路由页面
│   └── ...
├── components/         # 通用 UI 组件
├── assets/             # 静态资源
├── scripts/            # 实用脚本
├── package.json        # 依赖与脚本
└── README.md           # 项目说明
```

---

## 🧑‍💻 开发建议

- 推荐使用 <b>VSCode + Prettier/ESLint</b> 保持代码风格统一
- 组件建议拆分到 `components/`，业务逻辑放在 `services/`
- 富文本编辑器自定义可修改 `components/QuillEditor.tsx` 及 `assets/quill/`
- 数据库结构变更请同步更新 `entities/` 和 `services/`
- 建议多用 TypeScript 类型，提升代码健壮性
- 多用注释，便于团队协作

---

## ❓ 常见问题 FAQ

- <b>富文本编辑器无法输入/显示异常？</b>
  - 请确保 WebView 权限正常，且 `assets/quill/` 下资源完整。
- <b>如何重置数据库或清空所有任务？</b>
  - 可在 about.tsx 页面或 scripts/reset-project.js 脚本中执行重置操作。
- <b>如何导入/导出任务数据？</b>
  - 目前仅支持本地存储，后续可扩展云同步或导出功能。
- <b>如何自定义主题或样式？</b>
  - 可修改 components/ 下的样式文件或自定义 UI 组件。
- <b>如何适配不同屏幕？</b>
  - 推荐使用 Dimensions 动态设置组件尺寸，或使用 flex 布局。

---

## 🤝 贡献指南

欢迎贡献代码！
- Fork 本仓库并新建分支
- 保持代码风格统一，建议使用 Prettier/ESLint
- 提交前请确保通过所有单元测试
- PR 请详细描述变更内容和动机

---

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](./LICENSE)。

<p align="center" style="color:#ffd33d;font-size:1.1rem;">TimeMaster · 让每一分钟都被善待</p>
