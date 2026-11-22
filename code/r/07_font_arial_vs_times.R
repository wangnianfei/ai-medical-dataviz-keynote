# ==============================================================================
# 07_font_arial_vs_times.R
# Slide P27: Typography Iron Rule — Why Nature/Science/ESMO Mandate Arial/Helvetica
# and Forbid Times New Roman in Publication Figures
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(patchwork)
})

set.seed(2026)
demo_df <- data.frame(
  arm = rep(c("Control", "KRASi + PD-1"), each = 18),
  pfs = c(rnorm(18, 5.4, 1.3), rnorm(18, 9.8, 1.6))
)

# Panel A: Times New Roman (Serif — discouraged by CNS/ESMO)
p_times <- ggplot(demo_df, aes(x = arm, y = pfs, color = arm)) +
  geom_boxplot(width = 0.36, outlier.shape = NA, alpha = 0.15, aes(fill = arm)) +
  geom_jitter(width = 0.08, size = 2.0, alpha = 0.85) +
  scale_color_manual(values = c("#64748B", "#DC2626")) +
  scale_fill_manual(values = c("#64748B", "#DC2626")) +
  annotate("text", x = 1.5, y = 13.0, label = "HR = 0.48 (95% CI: 0.31–0.74)\nP = 0.0008  |  n = 36",
           family = "Times", size = 3.4, color = "#1F2937") +
  annotate("label", x = 1.5, y = 2.2,
           label = "单栏缩印至 85 mm 时：\n细衬线与笔画极细处易发糊、断笔、字号发虚",
           family = PUB_FONT, size = 3.2, fontface = "bold",
           fill = "#FEF2F2", color = "#B91C1C", label.size = 0.5) +
  ylim(1.2, 14.0) +
  labs(
    title = "✗ 禁用衬线体：Times New Roman",
    subtitle = "Figure 1a | Progression-Free Survival (Months)",
    x = "Treatment Arm", y = "PFS (Months)"
  ) +
  theme_minimal(base_size = 11.5, base_family = "Times") +
  theme(
    legend.position = "none",
    panel.grid.minor = element_blank(),
    axis.line = element_line(color = "#334155", linewidth = 0.5),
    plot.title = element_text(family = PUB_FONT, face = "bold", size = 14, color = "#B91C1C"),
    plot.subtitle = element_text(family = "Times", size = 11, color = "#475569"),
    plot.background = element_rect(fill = "#FFFDFD", color = "#FECACA", linewidth = 1.1)
  )

# Panel B: Arial / Helvetica (Sans-serif — CNS / ESMO Gold Standard)
p_arial <- ggplot(demo_df, aes(x = arm, y = pfs, color = arm)) +
  geom_boxplot(width = 0.36, outlier.shape = NA, alpha = 0.15, aes(fill = arm)) +
  geom_jitter(width = 0.08, size = 2.0, alpha = 0.85) +
  scale_color_manual(values = c("#3C5488", "#00A087")) +
  scale_fill_manual(values = c("#3C5488", "#00A087")) +
  annotate("text", x = 1.5, y = 13.0, label = "HR = 0.48 (95% CI: 0.31–0.74)\nP = 0.0008  |  n = 36",
           family = "Helvetica", fontface = "bold", size = 3.5, color = "#111827") +
  annotate("label", x = 1.5, y = 2.2,
           label = "单栏缩印至 85 mm 时：\n等宽无衬线笔画依然锐利清晰，顶刊强制标准",
           family = PUB_FONT, size = 3.2, fontface = "bold",
           fill = "#ECFDF5", color = "#047857", label.size = 0.5) +
  ylim(1.2, 14.0) +
  labs(
    title = "✓ 顶刊铁律：Arial / Helvetica 无衬线体",
    subtitle = "Figure 1a | Progression-Free Survival (Months)",
    x = "Treatment Arm", y = "PFS (Months)"
  ) +
  theme_minimal(base_size = 11.5, base_family = "Helvetica") +
  theme(
    legend.position = "none",
    panel.grid.minor = element_blank(),
    axis.line = element_line(color = "#1F2937", linewidth = 0.55),
    axis.title = element_text(face = "bold"),
    plot.title = element_text(family = PUB_FONT, face = "bold", size = 14, color = "#047857"),
    plot.subtitle = element_text(family = "Helvetica", size = 11, color = "#334155"),
    plot.background = element_rect(fill = "#FFFFFF", color = "#A7F3D0", linewidth = 1.1)
  )

final_plot <- (p_times | p_arial) +
  plot_annotation(
    caption = "Nature / Science / Cell / ESMO 投稿指南均明确规定图表字体统一使用无衬线体（Arial 或 Helvetica，5–8 pt）| 源码：code/r/07_font_arial_vs_times.R",
    theme = theme(plot.caption = element_text(family = PUB_FONT, size = 9.5, color = "#4B5563", hjust = 0))
  )

save_pub_figure(final_plot, "07_font_arial_vs_times", width = 11.8, height = 5.4)
