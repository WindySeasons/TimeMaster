# 欢迎使用您的 Expo 应用 👋

这是一个使用 [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) 创建的 [Expo](https://expo.dev) 项目。

## 快速开始

1. 安装依赖

   ```bash
   npm install
   ```

2. 启动应用

   ```bash
   npx expo start
   ```

启动后，您可以选择以下方式运行应用：

- [开发构建](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android 模拟器](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS 模拟器](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go)：一个用于快速体验 Expo 应用开发的沙盒环境

您可以通过编辑 **app** 目录中的文件开始开发。此项目使用 [基于文件的路由](https://docs.expo.dev/router/introduction)。

## 获取一个全新项目

当您准备好时，可以运行以下命令：

```bash
npm run reset-project
```

此命令会将初始代码移动到 **app-example** 目录，并创建一个空的 **app** 目录，供您开始开发。

## 项目结构

- **app/**: 包含应用的主要代码，包括页面和路由。
- **components/**: 可复用的 UI 组件。
- **assets/**: 静态资源，如图片和字体。
- **scripts/**: 实用脚本，例如项目重置脚本。

## 学习更多

要了解更多关于使用 Expo 开发项目的信息，请参考以下资源：

- [Expo 文档](https://docs.expo.dev/): 学习基础知识或通过我们的 [指南](https://docs.expo.dev/guides) 探索高级主题。
- [Expo 教程](https://docs.expo.dev/tutorial/introduction/): 按步骤完成一个可以在 Android、iOS 和 Web 上运行的项目。

## 加入社区

加入我们的开发者社区，共同创建跨平台应用。

- [Expo GitHub](https://github.com/expo/expo): 查看我们的开源平台并贡献代码。
- [Discord 社区](https://chat.expo.dev): 与其他 Expo 用户交流并提问。

## 常见问题

### 如何添加新页面？

在 **app/(tabs)** 目录中创建一个新的 `.tsx` 文件，例如 `newPage.tsx`，它会自动成为一个新的路由。

### 如何自定义导航栏？

导航栏的配置位于 **_layout.tsx** 文件中，您可以在其中修改 `Tabs.Screen` 的属性。

### 如何添加静态资源？

将图片或字体添加到 **assets/** 目录中，并通过 `require` 或 `import` 引入。

### 如何运行生产构建？

运行以下命令以生成生产构建：

```bash
npx expo build
```

然后按照提示选择目标平台（Android 或 iOS）。
