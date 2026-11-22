# 演示文稿可复现数据集清单 (`data/`)

本目录保存了本套 38 页 HTML 幻灯片中所有由 R 脚本生成的教学图表所使用的底层结构化数据（全部为脱敏教学数据、公开论文基准数值或固定随机种子模拟数据，无任何真实患者隐私信息）。

| 数据文件 | 对应图表脚本 | 对应页码 | 数据来源与说明 |
| :--- | :--- | :---: | :--- |
| `table_reading_vs_code_200.csv` | `code/r/04_table_reading_vs_code.R` | P21 | *A Society of AI Scientists* (alphaXiv, 2026) Fig. 13c 实证统计：直接读表口算（171/200，其中 25 题为 ≥90% 高自信错误）vs 本地跑代码（200/200） |
| `context_scaling_quadratic.csv` | `code/r/06_context_scaling_and_rot.R` | P09 | Transformer 注意力复杂度 $O(N^2)$ 相对算力曲线（100K = 1× → 1M = 100×） |
| `lost_in_the_middle_curve.csv` | `code/r/06_context_scaling_and_rot.R` | P09 | 长上下文“中间迷失（Lost in the Middle）” U 型召回率示意曲线 |
| `clinical_pfs_demo_n36.csv` | `code/r/07_font_arial_vs_times.R` | P28 | 固定随机种子 `set.seed(2026)` 生成的模拟 NSCLC 无进展生存期对照数据（$n = 36$），用于测试 85mm 单栏缩印字体清晰度 |
| `toothgrowth_clinical_demo.csv` | `code/r/02_messy_vs_cns_layout.R`<br>`code/r/08_three_tier_viz_evolution.R` | P23, P28 | R 内置 `datasets::ToothGrowth` 清洗版，用于“炸药柱状图 vs CNS 箱线散点图”与“三阶输入 $x$ 可视化跃迁”对比 |
| `iris_palette_demo.csv` | `code/r/01_rainbow_vs_scientific_color.R` | P27 | R 内置 `datasets::iris`（与 `datasets::volcano` 矩阵共同用于彩虹色误导 vs Viridis / CNS 语义配色实证） |

运行以下命令可重新生成本目录所有 CSV：

```bash
Rscript code/r/export_datasets.R
```
