# AI 在医学数据分析与可视化中的应用及体会

> **讲者**：王年飞 · 医生  
> **在线互动演示（GitHub Pages）**：https://wangnianfei.github.io/ai-medical-dataviz-keynote/  
> **技术形态**：零外部依赖离线 HTML5 / CSS3 / Vanilla JS 互动幻灯片（38 页 · `1440×810` 统一居中 16:9 画布 · 全场字号 `≥ 16pt`）  
> **附赠开源方法学 Skill**：[`skills/ai-html-keynote/`](./skills/ai-html-keynote/SKILL.md) —— 教你用 AI 工程化打造交互式 HTML 幻灯片，逐步告别 PowerPoint。

---

## 一、核心亮点

- **在线即看 / 断网可演**：克隆仓库后双击打开 [`slides/index.html`](./slides/index.html)，或直接访问 GitHub Pages 链接即可完整演示，零 CDN 依赖。
- **暖白编辑部美学体系**：摒弃模板化“企业蓝”，采用暖白纸底（`#F7F4EE`）、暖黑曜石（`#1B1815`）、森林松绿（`#1B5E55`）、陶土红（`#C2412D`）与琥珀金（`#B07219`）；全套视觉字号严格 `≥ 22px`（`≥ 16pt`）。
- **8 大现场可交互演示与微动画**：
  1. **P06**：自回归“文字接龙”与上下文分化互动动画
  2. **P10**：`/compact` 一键压缩上下文模拟器
  3. **P11**：多智能体子代理上下文隔离 vs 云端显存 **KV Cache** 撑爆演示器
  4. **P13**：本地肿瘤专病 RAG（NSCLC / 乳腺癌 / 肝癌）滚动检索与零幻觉条款溯源
  5. **P16**：CSS/SVG 连续循环“复制粘贴搬运工”动画（网页 Chatbot ⇄ 本地报错软件）
  6. **P24 & P26**：黑客帝国式 **R 源码实跑出图**（Matrix Code-to-Figure Runner）+ 本地 MCP 图库演播厅
  7. **P27**：CNS / `MetBrewer` 世界名画配色实验室 + **红绿色盲实时 SVG 模拟**
  8. **P34**：`AI 写论文 → AI 审论文 → AI 读论文` 动态闭环图 + 202 对盲评实证
- **数据、代码、素材、幻灯片与 Skill 全开源可复现**：包含全部教学 CSV 数据、可移植 R 绘图脚本、28 张精选高清素材、自动化 QA 审计脚本，以及可复用的 `ai-html-keynote` Skill。

---

## 二、演示快捷键与操作指南

| 快捷键 / 操作 | 功能说明 |
| :--- | :--- |
| `→` / `↓` / `Space` / `←` / `↑` | 下一页 / 上一页（自动同步地址栏 `#1..#38`） |
| `G` | 打开 **38 页全景网格总览**，点击任意卡片瞬时跳转 |
| `N` | 打开 / 关闭 **演讲者口播台词抽屉与计时器** |
| `F` | 进入 / 退出 **全屏演示** |
| **点击任意图片** | 触发全屏高清灯箱放大（`Esc` 退出） |
| **点击 `⚡ 跑代码` / 互动按钮** | 现场运行代码翻滚出图或交互模拟器 |
| `Cmd + P` / `Ctrl + P` | 一键导出 16:9 静态 PDF 备份 |

---

## 三、仓库目录结构

```text
ai-medical-dataviz-keynote/
├── index.html                           # GitHub Pages 根入口（自动跳转至 slides/index.html）
├── README.md                            # 项目说明与使用指南
├── LICENSE                              # MIT（代码与 Skill）+ CC BY 4.0（教学内容）
├── slides/                              # 零依赖 38 页 HTML5 互动幻灯片源码
│   ├── index.html
│   ├── styles.css
│   └── deck.js
├── data/                                # 6 份可复现 CSV 教学/实证数据集及数据字典
├── code/
│   └── r/                               # 100% 可复现 R 绘图脚本（生成 300 DPI PNG + 矢量 PDF）
│       ├── 00_theme_pub.R               # 统一 CNS ggplot2 主题与导出工具
│       ├── 01_rainbow_vs_scientific_color.R
│       ├── 02_messy_vs_cns_layout.R
│       ├── 04_table_reading_vs_code.R
│       ├── 06_context_scaling_and_rot.R
│       ├── 07_font_arial_vs_times.R
│       ├── 08_three_tier_viz_evolution.R
│       ├── export_datasets.R            # 一键导出 data/ 全部 CSV
│       └── run_all.R                    # 一键复现全部数据与 R 教学图
├── assets/                              # 28 张精选高清图像（零冗余、零隐私数据）
│   ├── generated/                       # 6 组 R 实绘图（PNG+PDF）+ 6 张定制概念/警示插画
│   ├── top_journal_clean/               # 7 张原版高清英文顶刊科研图
│   ├── mcp_covers/                      # 3 张 PlotCase 精选多维图
│   ├── extracted/                       # 2 张 Society of AI Scientists (2026) 实证图
│   └── media/                           # 3 张公开人物与课堂素材
├── docs/
│   ├── 01_slide_map_38slides.md         # 六幕 38 页结构与互动总览
│   ├── 02_resources_and_links.md        # 精选科研绘图、配色美学与 AI 学习资源
│   ├── 03_asset_manifest.md             # 28 张素材溯源与复现清单
│   └── 04_ai_html_keynote_methodology.md# 《告别 PowerPoint：用 AI 工程化打造 HTML 幻灯片的方法学》
└── skills/
    └── ai-html-keynote/                 # 开源可复用 Agent Skill（兼容 Antigravity / Claude Code 等）
        ├── SKILL.md                     # 主流程指令（6 阶段 Slides-as-Code 工程闭环）
        ├── references/                  # 设计规范、交互模式、双闸门 QA 检查表
        └── scripts/                     # audit_deck.py（静态审计）& capture_slides.sh（无头截屏 QA）
```

---

## 四、一键复现全部 R 图表与质量验收

### 1. 复现数据与 6 组教学图（需本地安装 R 及 `ggplot2`, `dplyr`, `patchwork`, `ragg`, `viridis`, `ggsci`, `ggdist`）

```bash
git clone https://github.com/wangnianfei/ai-medical-dataviz-keynote.git
cd ai-medical-dataviz-keynote
Rscript code/r/run_all.R
```

### 2. 运行静态审计与无头 Chrome 视觉巡检

```bash
# 静态检查（断图 / <21px 违规字号 / 硬编码路径 / JS 语法）
python3 skills/ai-html-keynote/scripts/audit_deck.py slides/index.html

# Headless Chrome 1280x720 实机截屏检查指定页码
bash skills/ai-html-keynote/scripts/capture_slides.sh slides/index.html ./qa_shots 1 16 17 20 34 38
```

---

## 五、如何复用本仓库的开源 Skill（`ai-html-keynote`）

如果你也想用 AI 制作高审美、可交互、零依赖的 HTML 幻灯片来逐步替代 PowerPoint，可以直接把 [`skills/ai-html-keynote/`](./skills/ai-html-keynote/) 安装到你的 AI Agent 技能目录中：

- **Antigravity 全局安装**：
  ```bash
  cp -R skills/ai-html-keynote ~/.gemini/config/skills/ai-html-keynote
  ```
- **项目级安装（Antigravity / Open Agent Skills 标准）**：
  ```bash
  mkdir -p .agents/skills
  cp -R skills/ai-html-keynote .agents/skills/ai-html-keynote
  ```
- **详细方法学白皮书**：请阅读 [`docs/04_ai_html_keynote_methodology.md`](./docs/04_ai_html_keynote_methodology.md)。

---

## 六、致谢与结语

> “美的前提是真，在知识的海洋里，我们至少可以不往里面扔垃圾。”

欢迎各位临床与科研同道 Star、Fork、基于本套 Skill 制作属于自己的交互式 HTML 幻灯片，共同推动医学科研与科学传播的开放、真实与可复现。
