# 幻灯片逐张旁白与自动播放预备包（Narration & Auto-Play Pack）

> 本目录存放《AI 在医学数据分析与可视化中的应用及体会》（38 页）的**机器可读旁白清单**与**男声 TTS 批量合成脚本**。  
> **当前状态**：已完成 38 页口播脚本、停顿节奏、语调标签与页面互动触发点编排，**暂未挂载到 `slides/index.html` / `slides/deck.js`**，不影响现有手动演示。

## 目录内容

- [`slides_narration.json`](./slides_narration.json)：38 页结构化旁白清单（UTF-8 JSON，总计约 `30:06`），每页包含：
  - `id` / `slide` / `title` / `pace`（`focus` 重点展开、`normal` 生动讲解、`transition` 轻快过渡）
  - `audio_file`：预留音频路径规范（`../audio/slide_01.mp3` … `../audio/slide_38.mp3`）
  - `speech_text`：去除语气括号的纯净口播文本（可直接喂给语音合成 TTS）
  - `segments[]`：按意群拆分并带 `pause_after_sec`（如关键提问后的 `1.5s` / `2.0s` 真实思考停顿）与 `tone` 标签
  - `stage_cues[]`：8 处页面互动动画同步触发点（文字接龙、`/compact`、子代理 KV Cache、RAG 翻滚、代码跑图、色盲模拟）
  - `post_slide_delay_sec`：本页语音结束后切往下一页前的自然留白（1.0–2.0 秒）
- [`tts_batch_generate.py`](./tts_batch_generate.py)：中文男声 TTS 试听与一键批量合成脚本（基于 `edge-tts` + `ffmpeg`，自动按 `segments[]` 插入真实停顿）
- 可读版讲稿文档：[`../docs/05_narration_script_30min.md`](../docs/05_narration_script_30min.md)

---

## 两种配音方案：标准神经男声 vs 克隆讲者本人声音

### 方案 A：零成本神经男声（先试听，满意再一键批量合成 38 页）

内置 3 款高质量中文男声（`yunxi` 自然讲述 / `yunjian` 沉稳磁性 / `yunyang` 专业播音）：

```bash
# 1. 先试听对比（只合成 P02 黎曼猜想一页的 3 款男声，保存到 audio_preview/）
python3 narration/tts_batch_generate.py --audition --slides 2

# 2. 选定心仪音色后，一键批量合成全部 38 页至 audio/slide_01.mp3 .. audio/slide_38.mp3
python3 narration/tts_batch_generate.py --voice yunxi --rate +4% --pitch -2Hz
```

### 方案 B：克隆王医生本人音色与语调（最推荐用于“本人未到场自动代讲”）

只需在安静房间用手机或电脑录制 **15 秒 – 1 分钟** 平时自然讲课的干声（无背景音乐、自然带点抑扬顿挫，导出为 `.wav` / `.mp3`）：

- **云端高保真（免折腾环境、中文自然度天花板、30 分钟全集仅几元人民币）**：
  - **MiniMax 海螺语音（Speech-02-HD 声音复刻）** 或 **字节火山引擎豆包声音复刻** 或 **Fish Audio**：上传 30 秒干声获得专属 `voice_id`，写一个 30 行 Python 循环读取 `slides_narration.json` 的 `segments[]` 批量调 API 合成并用 `ffmpeg` 拼入停顿即可。
- **本机免费开源克隆（Apple Silicon Mac 原生可跑，声纹隐私不出本机）**：
  - **CosyVoice 2**（阿里通义，中文自然度与口语抑扬顿挫表现极佳）或 **F5-TTS / Fish-Speech 1.5（MLX 加速）**：同样直接读取 `slides_narration.json` 批量离线生成 38 段音频。

---

## 后续接入“语音 + 自动播放”的 UX 契约

等 38 段音频生成完毕并放入 `audio/` 后，接入 `slides/deck.js` 仅需极小改动：

1. **双按钮解耦**：HUD 新增 `🔊 语音` 与 `▶ 自动播放` 按钮——打开语音再点播放，即同步播放当前页音频、按进度触发本页动画，并在音频结束等待 `post_slide_delay_sec` 后自动翻页。
2. **断掉即停**：用户任意手动翻页（`←`/`→`/`空格`/`Esc`/按钮）、点暂停，或音频缺失/中断，立即终止自动播放并安全交还手动控制权。
3. **100% 离线打包兼容**：接入时同步导出一份 `narration/slides_narration.js`（挂载全局变量，避免 `file://` 协议下 `fetch()` 跨域拦截），确保打包发给别人解压双击即可离线自动播放。
