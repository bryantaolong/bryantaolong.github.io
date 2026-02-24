> 原文链接：[Unlocking the Codex harness：how we built the App Server](https://openai.com/index/unlocking-the-codex-harness/)

# Gemini
这篇博客文章题目为《解密 Codex Harness：我们如何构建 App Server》（Unlocking the Codex harness: how we built the App Server），主要介绍了 OpenAI 如何通过 Codex App Server 将其 AI 编程智能体（Agent）的能力标准化，并集成到各种开发工具中。
以下是内容的详细摘要：
## 1. 核心概念：什么是 Codex App Server？
Codex App Server 是一个基于 JSON-RPC 协议的服务器，它作为“大脑”（Codex Harness）与“身体”（前端界面，如 VS Code、命令行、桌面应用）之间的桥梁。它允许不同的客户端通过统一、稳定的协议来驱动 Codex 的核心逻辑。

## 2. 为什么需要它？
最初，Codex 的逻辑分散在不同的产品中（如 TUI 命令行界面）。为了避免在每个新平台（如 VS Code 插件、Xcode、JetBrains）上重复编写复杂的智能体循环（Agent Loop）逻辑，OpenAI 开发了 App Server。
 * 重用性：一套核心逻辑，多端适用。
 * 兼容性：支持向后兼容，服务端更新（如更好的推理模型）时无需频繁更新客户端插件。

## 3. 三大核心原语 (Conversation Primitives)
为了处理 AI 编程中复杂的交互（不仅仅是简单的问答），App Server 定义了三个基本概念：
 * Item（项）：最小的输入/输出单元，如用户消息、AI 消息、工具执行结果、代码差异（Diff）等。
 * Turn（轮）：一次完整的工作单元。从用户输入开始，到 AI 完成任务（期间可能包含多个 Item，如思考、调用工具、生成代码）结束。
 * Thread（线程）：对话的持久化容器。它保存了历史记录，允许用户在不同设备间同步或恢复对话。

## 4. 架构与工作流程
 * 双向通信：采用 JSON-RPC 协议，不仅客户端可以请求服务器，服务器也可以主动向客户端发起请求（例如：请求用户授权执行某条终端命令）。
 * 流式输出：支持实时显示 AI 的思考过程和代码生成。
 * 集成方式：通过 stdio（标准输入输出）进行通信，支持 TypeScript、Python、Go 等多种语言的绑定。

## 5. 集成场景
 * 本地 IDE/应用：如 VS Code 插件和 Codex 桌面版，将 App Server 作为后台进程运行。
 * Web 端：Codex 网页版在云端容器中运行 App Server，并通过 WebSocket/SSE 将状态同步到浏览器。
 * 命令行 (TUI)：传统的命令行工具也将重构为 App Server 的客户端，以实现更一致的体验。

## 6. 总结与意义
OpenAI 正在将 Codex 从一个简单的插件转变为一个标准化的平台。通过开源 App Server 的相关协议和代码（在 Codex CLI 仓库中），OpenAI 希望让开发者更轻松地将强大的 AI 编程能力集成到自己的工作流中。
一句话总结： 这篇文章技术性地解释了 OpenAI 如何通过标准化的 App Server 协议，让 Codex 智能体能够无缝接入 VS Code、桌面端和网页等各种编程环境。



---
# ChatGPT
下面是对 **OpenAI 博客《Unlocking the Codex harness: how we built the App Server》** 的总结（中文）：

### 📌 核心观点总结

这篇博客由 OpenAI 工程师 Celia Chen 撰写，详细介绍了 **Codex App Server** 的设计理念、架构、协议以及它如何让不同客户端重用同一个 Codex “harness”（核心引擎）。

## 🧠 背景：为什么要有 App Server

- **Codex** 是一个通用的编码智能体，可在多个产品层面使用，包括 Web 应用、命令行界面 (CLI)、IDE 扩展、桌面应用等。
- 为了让这些不同界面都能复用同一套底层逻辑（也就是所谓的 _harness_），OpenAI 构建了 **App Server**。这是一个使用 **JSON-RPC** 的双向协议，旨在在客户端和 Codex 核心之间进行稳定、丰富的通讯。

## 🔧 App Server 的核心

### 🧩 什么是 Codex Harness

Codex 的核心称为 _Codex core_，负责：

1. 管理对话线程（创建、恢复、分支、归档）
2. 处理认证和配置（例如通过 ChatGPT 登录）
3. 执行工具（如沙箱中的 shell/file 操作）并将这些工具纳入会话流程

这些逻辑本来存在于 CLI 工具中，现在通过 App Server 作为一个独立进程暴露出来，使所有客户端都能共享。

## 🔁 协议设计：JSON-RPC 是如何运作的？

App Server 定义了一套基于 **JSON-RPC 的双向协议**（通过 stdio 或类似管道传输 JSONL 消息）来实现与客户端的通信：

### 核心通信概念

✔ **Thread（线程）**：Codex 会话容器，包含多个用户与模型的交互  
✔ **Turn（回合）**：用户发起一个具体任务  
✔ **Item（项目）**：回合中的原子输入/输出单位（如用户消息、模型响应、工具调用、差异 diff 等）

这个协议允许：

- 客户端发送请求并接收多条进度通知
- 服务器在需要时向客户端发起 _请求_（例如要求批准执行命令），客户端决策后才继续执行
- 流式输出，让客户端可以逐步渲染结果，而不是等待最终响应

## 🪄 如何集成到不同客户端

App Server 支持多种客户端集成方法：

1. **本地应用 & IDE**
    
    - 客户端启动一个长期运行的 App Server 子进程
    - 通过双向 JSON-RPC 与其通信
    - 能实现如 VS Code 扩展、JetBrains、Xcode 等 IDE 集成
2. **Web 版 Codex**
    
    - 在容器环境中运行 App Server
    - 客户端通过 HTTP + SSE 通信
    - 支持断线重连 / 恢复状态
3. **TUI / CLI**
    
    - 原来 CLI 会直接调用 harness，现在计划也使用 App Server 来实现统一的行为模式和特性扩展

## 🧠 其他集成选项对比

除了 App Server，还有其他嵌入方式：

|方法|用例|优点|局限|
|---|---|---|---|
|**MCP Server**|做为 MCP 工具调用|与现有 MCP 工作流兼容|不支持完整的语义和交互|
|**跨平台 agent 协议**|多 agent 协作|支持多模型|代表性特性可能较少|
|**Codex Exec**|自动化脚本任务|轻量、可直接 CI/CD|不适合交互式体验|
|**Codex SDK**|程序内调用|简单 library 接口|支持语言 & 特性较少|

## 🚀 未来展望

OpenAI 将 **App Server 作为未来首选的集成方式**，推动更稳定、跨平台、可扩展的 agent 生态。博客结尾也鼓励开发者尝试使用它构建自己的工作流，并提供了源码链接。

---
# Grok
**博客总结：Unlocking the Codex harness: how we built the App Server**  
（发布日期：2026年2月4日，作者：Celia Chen，OpenAI 技术团队成员）

这篇工程博客主要介绍了 **OpenAI 如何构建 Codex App Server**，以此来“解锁”并标准化 Codex harness（Codex 核心 agent 循环和逻辑）的使用。Codex 是 OpenAI 的编码代理（coding agent），目前已存在于多个产品形态中：web app、CLI、IDE 扩展、macOS 独立 App 等，而这些产品背后都由同一个 Codex harness 驱动。

### 核心内容
OpenAI 把 Codex harness 通过一个新的 **Codex App Server** 暴露出来，这是一个**客户端友好的、双向 JSON-RPC API**（基于 stdio 的 JSONL 通信），目的是：

- 让所有 Codex 产品（包括合作伙伴的集成）使用完全一致的 agent 行为
- 允许第三方开发者把 Codex 深度嵌入自己的工作流、IDE、工具中

App Server 既是协议，也是长期运行的进程，负责托管 Codex 核心线程。

### 关键技术点
- **三大原语**：
  - **Item**：最小原子单位（用户消息、工具执行、diff 等），带有生命周期事件（started → delta → completed）
  - **Turn**：一次完整的 agent 工作单元（从用户输入到输出结束）
  - **Thread**：持久化的会话容器，可创建、恢复、fork、归档，支持断线重连
- **功能亮点**：
  - 支持 streaming 进度、diff 输出
  - 沙箱执行 shell/文件工具
  - 支持人工审批流（agent 想执行危险操作前会暂停等 allow/deny）
  - 与 MCP server、skills 系统统一策略控制
- **集成现状**：已被 JetBrains、Xcode、Codex 桌面 App 等采用，实现 IDE 级体验和多 agent 并行编排
- **开源与 SDK**：核心代码在 Codex CLI 仓库公开（GitHub: openai/codex），提供 Go/Python/TS/Swift/Kotlin 等语言绑定

### 定位与未来
OpenAI 明确表示：**Codex App Server 将成为未来首要的集成方式**。相比之前的 MCP server（功能较弱）、Codex Exec（一次性任务）、Codex SDK（编程控制），App Server 提供了最完整、最一致的 harness 访问能力。

他们还计划把 CLI 的 TUI 界面也改造成 App Server 的客户端，统一所有交互体验。

### 总结一句话
这篇文章本质上是 OpenAI 向开发者敞开 Codex 最核心的 agent 引擎，提供了一个稳定、可扩展的 JSON-RPC 接口，让大家可以像官方产品一样，把强大的 Codex 编码代理嵌入到任何自己想要的地方（代码审查、SRE 代理、日常开发助手等）。


