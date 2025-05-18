<!-- filepath: j:\soofware_develop\TimeMaster\README.md -->
<p align="center">
  <img src="assets/images/icon.png" width="120" alt="TimeMaster Logo" />
</p>

<h1 align="center" style="font-size:2.5rem;">TimeMaster ⏰</h1>
<p align="center" style="font-size:1.2rem;"><b>让每一分钟都被善待</b></p>

<p align="center" style="color:#ffd33d;font-size:1.1rem;">专注 · 高效 · 记录 · 成长</p>

---

<blockquote align="center" style="font-style:italic; color:#888;">
“时间就像海绵里的水，只要愿挤，总还是有的。”<br/>
<sub>—— TimeMaster 开发者寄语</sub>
</blockquote>

---

# TimeMaster 项目 👋

> ⏳ <b>TimeMaster</b> 是一款基于 [Expo](https://expo.dev) 的极简跨平台时间管理应用，助你高效记录、反思与成长。

## ✨ 功能特性

- 📝 <b>卡片式任务管理</b>：项目、反思、打分多维度记录
- ⏱️ <b>自动统计用时</b>：支持时间区间筛选
- 📊 <b>数据可视化</b>：用图表洞察你的时间分布与体验
- 🗂️ <b>项目库/任务库分离</b>：支持项目预设与切换
- 🖋️ <b>富文本编辑</b>：本地集成 Quill.js，支持多样化内容输入
- 🌙 <b>深色主题</b>：现代美观，夜间更护眼
- 📱 <b>全平台支持</b>：Android/iOS 一键切换

## 🛠️ 技术栈

- <b>React Native + Expo</b>
- <b>TypeORM + SQLite</b>（本地数据库）
- <b>React Native Paper / RNEUI</b>（UI 组件库）
- <b>Quill.js</b>（富文本编辑器，静态资源本地化）
- <b>TypeScript</b> 全面类型安全

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

## 🗂️ 项目结构

```
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

## 🧑‍💻 开发建议

- 推荐使用 <b>VSCode + Prettier/ESLint</b> 保持代码风格统一
- 组件建议拆分到 `components/`，业务逻辑放在 `services/`
- 富文本编辑器自定义可修改 `components/QuillEditor.tsx` 及 `assets/quill/`
- 数据库结构变更请同步更新 `entities/` 和 `services/`

## ❓ 常见问题 FAQ

- <b>富文本编辑器无法输入/显示异常？</b>
  - 请确保 WebView 权限正常，且 `assets/quill/` 下资源完整。
- <b>如何重置数据库或清空所有任务？</b>
  - 可在 about.tsx 页面或 scripts/reset-project.js 脚本中执行重置操作。
- <b>如何导入/导出任务数据？</b>
  - 目前仅支持本地存储，后续可扩展云同步或导出功能。
- <b>如何自定义主题或样式？</b>
  - 可修改 components/ 下的样式文件或自定义 UI 组件。

## 🤝 贡献指南

欢迎贡献代码！
- Fork 本仓库并新建分支
- 保持代码风格统一，建议使用 Prettier/ESLint
- 提交前请确保通过所有单元测试
- PR 请详细描述变更内容和动机

## 📄 许可证

本项目基于 MIT 许可证开源。详见 [LICENSE](./LICENSE)。

<p align="center" style="color:#ffd33d;font-size:1.1rem;">TimeMaster · 让每一分钟都被善待</p>
