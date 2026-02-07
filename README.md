# 语音转文字示例

基于 ShadcnUI + Tailwind CSS + TypeScript 的最小可行项目，支持语音实时转文字。

## 功能

- 点击按钮开始录音，同时进行实时语音识别转文字
- 再次点击停止录音
- 使用浏览器 Web Speech API（Chrome、Edge 等支持）

## 技术栈

- Vite + React + TypeScript
- Tailwind CSS v4
- ShadcnUI (Button)
- Web Speech API

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器访问 http://localhost:5173

## 构建

```bash
pnpm build
```

## 说明

- 语音识别需使用 **HTTPS** 或 **localhost**
- 推荐使用 Chrome 或 Edge 浏览器
- 当前默认识别语言为中文（zh-CN）
