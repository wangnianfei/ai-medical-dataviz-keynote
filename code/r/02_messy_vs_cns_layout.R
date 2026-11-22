# ==============================================================================
# 02_messy_vs_cns_layout.R
# Slide P17: Layout Rule #1 — Alignment & Visual Discipline (Bad vs Good)
# Built-in dataset: datasets::ToothGrowth
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(patchwork)
})

df <- ToothGrowth %>%
  mutate(
    dose_f = factor(dose, levels = c(0.5, 1, 2), labels = c("0.5 mg/d", "1.0 mg/d", "2.0 mg/d")),
    supp_f = factor(supp, levels = c("VC", "OJ"), labels = c("标准方案 (VC)", "强化方案 (OJ)"))
  )

summary_df <- df %>%
  group_by(dose_f, supp_f) %>%
  summarise(
    mean_len = mean(len),
    se_len   = sd(len) / sqrt(n()),
    .groups  = "drop"
  )

# BAD: Default cluttered bar chart with ugly gray panel, noisy borders, tilted messy labels
p_bad <- ggplot(summary_df, aes(x = dose_f, y = mean_len, fill = supp_f)) +
  geom_col(position = position_dodge(0.85), width = 0.78, color = "black", linewidth = 0.9) +
  geom_errorbar(
    aes(ymin = mean_len - se_len, ymax = mean_len + se_len),
    position = position_dodge(0.85), width = 0.35, linewidth = 0.9
  ) +
  scale_fill_manual(values = c("#F8766D", "#00BFC4")) +
  labs(
    title = "常见默认出图（信息噪声高）",
    subtitle = "灰底粗网格 + 隐藏原始数据分布 + 右侧图例挤压画布",
    x = "给药剂量水平（Dose Level）",
    y = "组织反应长度 (mm)",
    fill = "Treatment_Group_Type"
  ) +
  theme_gray(base_size = 10.5, base_family = PUB_FONT) +
  theme(
    plot.title   = element_text(color = "#B91C1C", face = "bold", size = 12),
    plot.subtitle = element_text(color = "#6B7280", size = 9.2),
    axis.text.x  = element_text(angle = 35, hjust = 1),
    panel.grid.major = element_line(color = "white", linewidth = 1.1),
    legend.position = "right",
    legend.background = element_rect(fill = "#FFF7ED", color = "black")
  )

# GOOD: CNS-style aligned dot + boxplot + mean trendline, zero clutter, direct visual hierarchy
p_good <- ggplot(df, aes(x = dose_f, y = len, color = supp_f, fill = supp_f)) +
  geom_boxplot(
    position = position_dodge(width = 0.62),
    width = 0.42, alpha = 0.18, outlier.shape = NA, linewidth = 0.55
  ) +
  geom_point(
    position = position_jitterdodge(jitter.width = 0.10, dodge.width = 0.62),
    size = 1.9, alpha = 0.85
  ) +
  stat_summary(
    aes(group = supp_f),
    fun = mean, geom = "line",
    position = position_dodge(width = 0.62),
    linewidth = 0.85, linetype = "solid"
  ) +
  scale_color_manual(values = c("#3C5488", "#E64B35")) +
  scale_fill_manual(values = c("#3C5488", "#E64B35")) +
  scale_y_continuous(limits = c(0, 38), breaks = seq(0, 35, 5), expand = expansion(mult = c(0, 0.04))) +
  annotate("segment", x = 0.84, xend = 1.16, y = 23.5, yend = 23.5, color = "#2C3E50", linewidth = 0.45) +
  annotate("text", x = 1.0, y = 24.8, label = "P = 0.006", family = PUB_FONT, size = 3.1, fontface = "bold", color = "#1F2937") +
  annotate("segment", x = 1.84, xend = 2.16, y = 29.5, yend = 29.5, color = "#2C3E50", linewidth = 0.45) +
  annotate("text", x = 2.0, y = 30.8, label = "P = 0.001", family = PUB_FONT, size = 3.1, fontface = "bold", color = "#1F2937") +
  annotate("segment", x = 2.84, xend = 3.16, y = 35.2, yend = 35.2, color = "#2C3E50", linewidth = 0.45) +
  annotate("text", x = 3.0, y = 36.5, label = "NS (P = 0.96)", family = PUB_FONT, size = 3.0, color = "#6B7280") +
  labs(
    title = "CNS 顶刊级重构（对齐、克制、透明）",
    subtitle = "白底留白 + 展示全部个体散点 + 均值趋势连线 + 顶部齐平图例",
    x = "给药剂量",
    y = "组织反应长度 (mm)",
    color = NULL, fill = NULL
  ) +
  theme_cns(base_size = 10.5) +
  theme(
    plot.title = element_text(color = "#0F766E", face = "bold", size = 12),
    legend.position = "top",
    legend.justification = "left",
    panel.grid.major.x = element_blank()
  )

final_plot <- (p_bad | p_good) +
  plot_layout(widths = c(1, 1.12)) +
  plot_annotation(
    title = "排版第一原则：整齐、克制、让数据本身成为主角",
    subtitle = "同样的数据（R 内置 ToothGrowth），告别“炸药柱状图”，升级为可透明检验分布的 CNS 规范图",
    caption = "数据来源：R 内置数据集 datasets::ToothGrowth（n = 60）| 原则参考：Claus Wilke《Fundamentals of Data Visualization》",
    theme = theme(
      plot.title    = element_text(family = PUB_FONT, size = 15, face = "bold", color = "#111827"),
      plot.subtitle = element_text(family = PUB_FONT, size = 10.5, color = "#4B5563", margin = margin(b = 10)),
      plot.caption  = element_text(family = PUB_FONT, size = 8.8, color = "#6B7280", hjust = 0)
    )
  )

save_pub_figure(final_plot, "02_messy_vs_cns_layout", width = 12.4, height = 5.9)
