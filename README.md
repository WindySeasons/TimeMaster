# TimeMaster 项目 👋

TimeMaster 是一个基于 [Expo](https://expo.dev) 的跨平台应用，旨在帮助用户高效管理时间和任务。

## 快速开始

1. **安装依赖**

   ```bash
   npm install
   ```

2. **启动应用**

   ```bash
   npx expo start
   ```

   启动后，您可以选择以下方式运行应用：

   - [开发构建](https://docs.expo.dev/develop/development-builds/introduction/)
   - [Android 模拟器](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS 模拟器](https://docs.expo.dev/workflow/ios-simulator/)
   - [Expo Go](https://expo.dev/go)：一个用于快速体验 Expo 应用开发的沙盒环境

## 项目结构

以下是项目的主要目录结构：

```
TimeMaster/
├── app/                     # 应用主目录
│   ├── _layout.tsx          # 全局布局文件
│   ├── database.ts          # 数据库配置和初始化
│   ├── entities/            # TypeORM 实体
│   │   └── Task.ts          # 任务实体
│   ├── services/            # 服务层逻辑
│   │   └── TaskService.ts   # 任务相关的增删改查逻辑
│   ├── (tabs)/              # 基于文件的路由
│   │   ├── _layout.tsx      # 标签页布局
│   │   ├── about.tsx        # 关于页面
│   │   ├── cardLibrary.tsx  # 卡片库页面
│   │   ├── index.tsx        # 首页
│   │   └── summary.tsx      # 总结页面
├── components/              # 可复用的 UI 组件
│   ├── Button.tsx           # 按钮组件
│   ├── DataPickerView.tsx   # 日期选择组件
│   ├── ImageViewer.tsx      # 图片查看器组件
│   ├── ProjectView.tsx      # 项目视图组件
│   └── TaskCard.tsx         # 任务卡片组件
├── assets/                  # 静态资源
│   ├── fonts/               # 字体文件
│   └── images/              # 图片资源
├── scripts/                 # 实用脚本
│   └── reset-project.js     # 项目重置脚本
├── package.json             # 项目依赖和脚本
├── tsconfig.json            # TypeScript 配置
├── app.json                 # Expo 配置
└── README.md                # 项目说明文件
```

## 常用命令

- **安装依赖**：
  ```bash
  npm install
  ```

- **启动开发服务器**：
  ```bash
  npx expo start
  ```

- **构建 Android APK**：
  ```bash
  npx expo run:android
  ```

- **构建 iOS 应用**（需 macOS 和 Xcode）：
  ```bash
  npx expo run:ios
  ```

- **清理缓存**：
  ```bash
  expo start -c
  ```

## 学习更多

- [Expo 文档](https://docs.expo.dev/): 学习基础知识或探索高级主题。
- [TypeORM 文档](https://typeorm.io/): 学习如何使用 TypeORM 管理数据库。
- [React Native 文档](https://reactnative.dev/): 深入了解 React Native 的开发。

## 贡献

欢迎贡献代码！请提交 Pull Request 或报告问题。

## 许可证

本项目基于 MIT 许可证开源。
