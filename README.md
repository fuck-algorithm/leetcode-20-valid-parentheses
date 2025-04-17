# LeetCode 20 - 有效的括号动画演示

<div align="center">
  <img src="public/favicon.png" alt="Logo" width="80" height="80">
  <br/>
  <p align="center">
    <a href="https://fuck-algorithm.github.io/leetcode-20-valid-parentheses/" target="_blank">在线演示</a> •
    <a href="https://leetcode.cn/problems/valid-parentheses/" target="_blank">题目链接</a>
  </p>
</div>

## 📚 项目介绍

这是一个用于直观展示 LeetCode 第 20 题「有效的括号」算法解题过程的交互式动画应用。通过可视化的方式，帮助开发者理解栈在处理括号匹配问题中的应用。

### 🔍 题目描述

给定一个只包括 `(`，`)`，`{`，`}`，`[`，`]` 的字符串，判断字符串是否有效。

有效字符串需满足：
1. 左括号必须用相同类型的右括号闭合。
2. 左括号必须以正确的顺序闭合。
3. 每个右括号都有一个对应的左括号匹配。

## ✨ 功能特点

- 🖥️ **直观的动画演示**：通过动画展示括号匹配的过程
- 🎮 **交互式控制**：可以手动控制动画播放、暂停、步进等
- 📊 **栈操作可视化**：清晰展示栈的入栈、出栈操作
- 🔄 **多种预设案例**：提供多种括号组合的案例
- 🎲 **随机生成功能**：可随机生成有效/无效的括号组合
- 📱 **响应式设计**：适配不同尺寸的屏幕

## 🛠️ 技术栈

- **框架**：React + TypeScript
- **构建工具**：Vite
- **样式**：CSS-in-JS
- **部署**：GitHub Pages
- **CI/CD**：GitHub Actions

## 🚀 本地开发

### 前置要求

- Node.js (v14.0.0+)
- npm 或 yarn

### 安装依赖

```bash
npm install
# 或
yarn install
```

### 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

启动后访问 http://localhost:5174

### 构建生产版本

```bash
npm run build
# 或
yarn build
```

## 🔍 算法详解

该项目通过栈结构实现括号匹配验证：

1. 遍历字符串中的每个字符
2. 如果是左括号，则入栈
3. 如果是右括号，则与栈顶元素匹配
   - 如果栈为空或不匹配，则字符串无效
   - 如果匹配，则弹出栈顶元素
4. 最后检查栈是否为空，为空则有效

## 🤝 参与贡献

欢迎提交 Pull Request 或创建 Issue。

## 📄 许可证

[MIT License](LICENSE)

---

<div align="center">
  <sub>如果这个项目对你有帮助，请给它一个⭐️！</sub>
</div>
