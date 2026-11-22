# ==============================================================================
# 08_three_tier_viz_evolution.R
# Slide P22: Same Clinical Dataset Across 3 Prompt/Input Tiers
# Tier 0 (Vague "make it look like Science") -> Tier 1 (Clear purpose/type) -> Tier 2 (CNS Exemplar + Rules)
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(ggdist)
  library(patchwork)
})

df <- datasets::ToothGrowth %>%
  mutate(
    group = factor(
      paste0(ifelse(supp == "OJ", "靶向联合", "标准单药"), "_", dose),
      levels = c("标准单药_0.5", "标准单药_1", "标准单药_2", "靶向联合_0.5", "靶向联合_1", "靶向联合_2")
    ),
    dose_f = factor(dose, levels = c(0.5, 1, 2), labels = c("低剂量", "中剂量", "高剂量")),
    arm = factor(supp, levels = c("VC", "OJ"), labels = c("标准对照", "联合方案"))
  )

# Tier 0: Default rough plot (vague prompt)
p0 <- ggplot(df, aes(x = group, y = len, fill = group)) +
  stat_summary(fun = mean, geom = "bar") +
  labs(title = "0阶 · 粗糙默认图", subtitle = "“画一张像 Science 一样好看的图”", x = "group", y = "len") +
  theme_gray(base_size = 10.5) +
  theme(
    text = element_text(family = PUB_FONT),
    axis.text.x = element_text(angle = 35, hjust = 1, size = 8),
    legend.position = "none",
    plot.title = element_text(face = "bold", color = "#B91C1C", size = 13),
    plot.subtitle = element_text(size = 9.5, color = "#6B7280")
  )

# Tier 1: Structured chart type & tidy grouping
p1 <- ggplot(df, aes(x = dose_f, y = len, fill = arm)) +
  geom_boxplot(position = position_dodge(0.75), width = 0.55, alpha = 0.75) +
  scale_fill_manual(values = c("#60A5FA", "#F87171")) +
  labs(title = "1阶 · 结构清晰图", subtitle = "明确数据类型、分组与统计图类型", x = "剂量梯度", y = "疗效指标", fill = NULL) +
  theme_bw(base_size = 10.5) +
  theme(
    text = element_text(family = PUB_FONT),
    legend.position = "top",
    plot.title = element_text(face = "bold", color = "#1D4ED8", size = 13),
    plot.subtitle = element_text(size = 9.5, color = "#4B5563")
  )

# Tier 2: CNS publication-grade (Exemplar + palette + raw points + P annotation)
p_val_1 <- t.test(len ~ arm, data = filter(df, dose == 1))$p.value
p2 <- ggplot(df, aes(x = dose_f, y = len, color = arm, fill = arm)) +
  geom_boxplot(position = position_dodge(0.62), width = 0.38, alpha = 0.16, outlier.shape = NA, linewidth = 0.65) +
  geom_point(position = position_jitterdodge(jitter.width = 0.09, dodge.width = 0.62), size = 1.9, alpha = 0.88) +
  stat_summary(aes(group = arm), fun = mean, geom = "line", position = position_dodge(0.62), linewidth = 0.9) +
  annotate("segment", x = 1.84, xend = 2.16, y = 29.8, yend = 29.8, color = "#111827", linewidth = 0.55) +
  annotate("text", x = 2.0, y = 31.4, label = sprintf("P = %.3f", p_val_1),
           family = "Helvetica", fontface = "bold", size = 3.3, color = "#111827") +
  scale_color_manual(values = c("标准对照" = "#3C5488", "联合方案" = "#E64B35")) +
  scale_fill_manual(values = c("标准对照" = "#3C5488", "联合方案" = "#E64B35")) +
  scale_y_continuous(limits = c(3, 35.5)) +
  labs(title = "2阶 · CNS 顶刊精修图", subtitle = "注入榜样代码 + 语义配色 + 原始散点 + 标注", x = "给药剂量梯度", y = "客观疗效指标 (mm)", color = NULL, fill = NULL) +
  theme_cns(base_size = 10.8) +
  theme(
    legend.position = "top",
    legend.justification = "left",
    plot.title = element_text(face = "bold", color = "#047857", size = 13),
    plot.subtitle = element_text(size = 9.5, color = "#374151")
  )

final_plot <- (p0 | p1 | p2) +
  plot_annotation(
    caption = "同一份内置数据 (datasets::ToothGrowth)，随着输入 x 的信息密度逐级提升，成图质量呈现断崖式跃迁 | 源码：code/r/08_three_tier_viz_evolution.R",
    theme = theme(plot.caption = element_text(family = PUB_FONT, size = 9.5, color = "#4B5563", hjust = 0))
  )

save_pub_figure(final_plot, "08_three_tier_viz_evolution", width = 13.4, height = 4.9)
