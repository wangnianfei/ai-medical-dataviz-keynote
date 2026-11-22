# ==============================================================================
# 01_rainbow_vs_scientific_color.R
# Slide P18: Color Taboos (Rainbow / Jet) vs CNS Scientific Semantic Palettes
# Built-in datasets: datasets::volcano (continuous) & datasets::iris (categorical)
# Reference: Crameri et al., Nature Communications (2020)
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(tidyr)
  library(patchwork)
  library(viridis)
  library(ggsci)
})

# 1. Continuous matrix from built-in `volcano` dataset (Maunga Whau topography)
volc_df <- as.data.frame(as.table(volcano)) %>%
  mutate(
    x = as.numeric(Var1),
    y = as.numeric(Var2),
    z = Freq
  )

# BAD continuous: classic Rainbow colormap (creates false visual bands)
p_bad_cont <- ggplot(volc_df, aes(x = x, y = y, fill = z)) +
  geom_raster(interpolate = TRUE) +
  scale_fill_gradientn(
    colours = rainbow(12),
    name = "连续信号强度",
    guide = guide_colorbar(title.position = "top", title.hjust = 0.5)
  ) +
  scale_x_continuous(expand = c(0, 0)) +
  scale_y_continuous(expand = c(0, 0)) +
  labs(
    title = "禁忌示范：默认彩虹色（Rainbow）",
    subtitle = "在黄/青交界处伪造虚假边界，色盲读者无法分辨"
  ) +
  theme_cns(base_size = 10.5) +
  theme(
    axis.title = element_blank(),
    axis.text = element_blank(),
    axis.ticks = element_blank(),
    axis.line = element_blank(),
    plot.title = element_text(color = "#B91C1C", face = "bold"),
    legend.position = "bottom",
    legend.key.width = unit(2.1, "cm"),
    legend.key.height = unit(0.24, "cm"),
    plot.margin = margin(8, 16, 12, 16)
  )

# GOOD continuous: Perceptually uniform Viridis (Crameri / CNS standard)
p_good_cont <- ggplot(volc_df, aes(x = x, y = y, fill = z)) +
  geom_raster(interpolate = TRUE) +
  scale_fill_viridis_c(
    option = "mako",
    direction = -1,
    name = "连续信号强度",
    guide = guide_colorbar(title.position = "top", title.hjust = 0.5)
  ) +
  scale_x_continuous(expand = c(0, 0)) +
  scale_y_continuous(expand = c(0, 0)) +
  labs(
    title = "CNS 示范：感知均匀连续色标（Viridis / Mako）",
    subtitle = "亮度单调递增，忠实还原连续梯度，黑白打印不失真"
  ) +
  theme_cns(base_size = 10.5) +
  theme(
    axis.title = element_blank(),
    axis.text = element_blank(),
    axis.ticks = element_blank(),
    axis.line = element_blank(),
    plot.title = element_text(color = "#0F766E", face = "bold"),
    legend.position = "bottom",
    legend.key.width = unit(2.1, "cm"),
    legend.key.height = unit(0.24, "cm"),
    plot.margin = margin(8, 16, 12, 16)
  )

# 2. Categorical comparison using built-in `iris` framed as 3 clinical subtypes
iris_df <- iris %>%
  mutate(
    Subtype = factor(
      Species,
      levels = c("setosa", "versicolor", "virginica"),
      labels = c("对照队列 (Ctrl)", "稳定亚型 (SD)", "高危进展型 (PD)")
    )
  )

# BAD categorical: neon oversaturated red/green/cyan clash
p_bad_cat <- ggplot(iris_df, aes(x = Sepal.Length, y = Petal.Length, color = Subtype)) +
  geom_point(size = 2.6, alpha = 0.95) +
  scale_color_manual(values = c("#00FF00", "#FF00FF", "#FFFF00")) +
  labs(
    title = "禁忌示范：高饱和荧光撞色",
    subtitle = "刺眼、主次不分，红绿/黄白在投影仪下几乎消失",
    x = "基线生物标志物 A",
    y = "治疗后指标 B",
    color = NULL
  ) +
  theme_cns(base_size = 10.5) +
  theme(
    plot.title = element_text(color = "#B91C1C", face = "bold"),
    legend.position = "top"
  )

# GOOD categorical: semantic hierarchy (gray baseline + calm blue + red highlight)
p_good_cat <- ggplot(iris_df, aes(x = Sepal.Length, y = Petal.Length, color = Subtype)) +
  geom_point(size = 2.5, alpha = 0.85) +
  stat_ellipse(linewidth = 0.65, linetype = "dashed", show.legend = FALSE) +
  scale_color_manual(values = c("#8C9BAA", "#2B6CB0", "#D9483B")) +
  labs(
    title = "CNS 示范：语义化分层配色（用色彩说话）",
    subtitle = "灰＝基线对照、蓝＝平稳队列、红＝唯一视觉焦点（高危进展）",
    x = "基线生物标志物 A",
    y = "治疗后指标 B",
    color = NULL
  ) +
  theme_cns(base_size = 10.5) +
  theme(
    plot.title = element_text(color = "#0F766E", face = "bold"),
    legend.position = "top"
  )

final_plot <- (p_bad_cont | p_good_cont) / (p_bad_cat | p_good_cat) +
  plot_annotation(
    title = "科研作图配色铁律：远离默认彩虹色，用色彩传递科学语义",
    subtitle = "同一份 R 内置数据（volcano & iris），仅改变配色语法带来的顶刊级质感跃迁",
    caption = "数据来源：R 内置数据集 datasets::volcano & datasets::iris | 方法学参考：Crameri et al., Nature Communications (2020)",
    theme = theme(
      plot.title    = element_text(family = PUB_FONT, size = 15, face = "bold", color = "#111827"),
      plot.subtitle = element_text(family = PUB_FONT, size = 10.5, color = "#4B5563", margin = margin(b = 10)),
      plot.caption  = element_text(family = PUB_FONT, size = 8.8, color = "#6B7280", hjust = 0)
    )
  )

save_pub_figure(final_plot, "01_rainbow_vs_scientific_color", width = 12.2, height = 7.4)
