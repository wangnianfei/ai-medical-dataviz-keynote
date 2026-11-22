# 38 页演示文稿素材溯源与复现清单（Asset Manifest · v7）

本仓库仅收录本套 38 页 HTML 幻灯片**实际引用的 28 张高清图像**（外加 6 份由 R 生成的伴生矢量 PDF，总计 ~24 MB），零冗余、零未发表手稿或隐私数据。

---

## 1. 可复现 R 脚本生成图（`assets/generated/`，300 DPI PNG + 矢量 PDF）

运行 `Rscript code/r/run_all.R` 即可从零一键复现以下全部 6 组图表：

| 文件名 | 对应页码 | 复现源码 | 底层数据 | 说明 |
| :--- | :---: | :--- | :--- | :--- |
| `01_rainbow_vs_scientific_color.png` | P27 | `code/r/01_rainbow_vs_scientific_color.R` | `datasets::volcano` & `data/iris_palette_demo.csv` | 彩虹色假边界 vs Viridis / CNS 语义配色 |
| `02_messy_vs_cns_layout.png` | P28 | `code/r/02_messy_vs_cns_layout.R` | `data/toothgrowth_clinical_demo.csv` | 告别灰底炸药柱状图 → 顶刊箱线散点均值图 |
| `04_table_reading_vs_code.png` | P21 | `code/r/04_table_reading_vs_code.R` | `data/table_reading_vs_code_200.csv` | Fig.13c 200 题华夫格（171/200 vs 200/200，突出高自信错误） |
| `06_context_scaling_and_rot.png` | P09 | `code/r/06_context_scaling_and_rot.R` | `data/context_scaling_quadratic.csv` & `lost_in_the_middle_curve.csv` | $O(N^2)$ 算力曲线 + Lost in the Middle U 型曲线 |
| `07_font_arial_vs_times.png` | P28 | `code/r/07_font_arial_vs_times.R` | `data/clinical_pfs_demo_n36.csv` | 单栏 85mm 缩印清晰度实测：Times New Roman vs Arial/Helvetica |
| `08_three_tier_viz_evolution.png` | P23 | `code/r/08_three_tier_viz_evolution.R` | `data/toothgrowth_clinical_demo.csv` | 同一数据集三阶输入 $x$ 跃迁（0阶默认 → 1阶清晰 → 2阶 CNS 精修） |

---

## 2. 定制 AI 概念与警示插画（`assets/generated/`，Gemini 生成，契合暖白/黑曜石美学）

| 文件名 | 对应页码 | 视觉用途 |
| :--- | :---: | :--- |
| `09_nano_banana_nsclc_mechanism.png` | P30 | NSCLC EGFR / KRAS G12C × PD-1/PD-L1 机制示意图（结构化提示词双轨示范） |
| `10_agent_mini_keyboard.png` | P17 | Agent 时代迷你小键盘工业概念图（VOICE / YES / NO / ENTER / ESC / 旋钮） |
| `11_synthid_invisible_watermark.png` | P32 | SynthID 频域隐形水印与不可靠“去水印”原理示意图 |
| `12_living_opensource_knowledge.png` | P33 | GitHub 活书与开源临床指南协作演进概念图 |
| `13_ai_research_server.jpg` | P17 | 未来科研“写文章专机 / 服务器”（预装 Agent + 软件 + Skill，呼应 Stanford Biomni） |
| `14_fake_tumor_12mm_ruler.jpg` | P38 | 科研诚信警示图：1cm 画出 12 格的假尺子 + “虾滑”状造假肿瘤样本（2026 年 11 月公开撤稿丑闻警示） |

---

## 3. 原版高清顶刊与 PlotCase 科研图（保留原始英文标注）

### `assets/top_journal_clean/`（7 张，来自本地「顶刊美图社」MCP 库）
- `natcomm_circular_volcano.png` — *Nature Communications* 环形火山图（P01, P24, P26）
- `natmed_km_risktable.png` — *Nature Medicine* KM 生存曲线 + Risk Table（P26）
- `nature_2024_luad_galaxy.png` — *Nature* 2024 LUAD 单细胞星云图（P01, P26）
- `nature_2025_immunotherapy_multipanel.png` — *Nature* 2025 肿瘤免疫多面板组图（P29）
- `nature_aging_bmi_ring.png` — *Nature Aging* 多层患者年龄/BMI/肥胖环形图（P01, P24, P26）
- `nejm_cox_forest.png` — *NEJM* 亚组 Cox 森林图（P26）
- `science_2026_immune_circos.png` — *Science* 2026 免疫通路弦图（P01, P24）

### `assets/mcp_covers/`（3 张，来自本地 `PlotCase` MCP 库）
- `plotcase_circos_genome.png` — 基因组 Circos 圈图（P01）
- `plotcase_global_map_warm.png` — 暖色系全球地理采样分布图（P24, P26）
- `plotcase_polar_protein_volcano.png` — 极坐标蛋白组多组火山图（P24）

---

## 4. 前沿论文实证裁切图与人物教学素材

### `assets/extracted/`（3 张）
- `society_fig1_ad.png` — *A Society of AI Scientists* (2026) Fig.1 Panel a + d 精准拼接（P03）
- `society_fig15d.png` — *A Society of AI Scientists* (2026) Fig.15 Panel d（202 对盲评森林图，P34）
- `hcc827_fig3_mutational_spectrum.png` — 讲者多面板突变谱与机制分析组图示范（P29）

### 配套延伸阅读长文（`docs/`）
- `docs/nature_aging_color_aesthetics.html` — 《科研作图的配色与美学：以一篇 *Nature Aging* 论文为例》完整拆解长文（P27 按钮直达）

### `assets/media/`（3 张，公开人物照片与课堂截图）
- `levent_alpoge.jpg` — 数学家 Levent Alpöge 照片（P02）
- `garrity_lecture_1_hd.jpg` — Thomas A. Garrity 教授讲授函数本质的课堂高清截图（P05）
- `karpathy_github.jpg` — Andrej Karpathy 肖像（P17）
