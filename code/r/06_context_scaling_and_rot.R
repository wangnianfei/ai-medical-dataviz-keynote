# ==============================================================================
# 06_context_scaling_and_rot.R
# Slide P09: Physics Limits of Context — O(N^2) Attention Compute + Lost in the Middle
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
  library(patchwork)
})

# ---- Panel A: O(N^2) Attention Scaling Curve ----
len_df <- data.frame(
  k_tokens = seq(10, 1000, by = 10)
) %>%
  mutate(
    rel_cost = (k_tokens / 100)^2  # Normalized: 100K = 1x, 1M = 100x
  )

pts_df <- data.frame(
  k_tokens = c(100, 500, 1000),
  rel_cost = c(1, 25, 100),
  lbl = c("100K Token\n基准算力 1×", "500K\n25×", "1M Token\n算力暴涨 100×！")
)

p_quad <- ggplot(len_df, aes(x = k_tokens, y = rel_cost)) +
  annotate("rect", xmin = 420, xmax = 1000, ymin = 0, ymax = 116, fill = "#FEE2E2", alpha = 0.45) +
  annotate("text", x = 670, y = 104, label = "硬塞十几篇 PDF 的算力与噪声红区",
           family = PUB_FONT, size = 3.6, fontface = "bold", color = "#B91C1C") +
  geom_area(fill = "#3C5488", alpha = 0.14) +
  geom_line(color = "#1F4E79", linewidth = 1.6) +
  geom_point(data = pts_df, color = "#E64B35", size = 4.2) +
  geom_text(data = pts_df, aes(label = lbl),
            nudge_x = c(75, -80, -245), nudge_y = c(15, 13, -6),
            family = PUB_FONT, size = 3.5, fontface = "bold", color = "#111827", lineheight = 1.15) +
  scale_x_continuous(breaks = c(100, 250, 500, 750, 1000),
                     labels = c("100K", "250K", "500K", "750K", "1M")) +
  scale_y_continuous(limits = c(0, 118), breaks = c(0, 25, 50, 75, 100),
                     labels = function(x) paste0(x, "×")) +
  labs(
    title = "a  自注意力算力呈 O(N²) 平方级暴涨",
    subtitle = "上下文长度 ×10，注意力计算量直接 ×100",
    x = "上下文窗口长度（Tokens）",
    y = "相对注意力计算量"
  ) +
  theme_cns(base_size = 12.5) +
  theme(plot.title = element_text(size = 14.5))

# ---- Panel B: Lost in the Middle U-curve (Liu et al., TACL 2024 schematic) ----
pos_df <- data.frame(
  pos = seq(0, 100, by = 5),
  short_ctx = 94 - 6 * sin(pi * seq(0, 100, by = 5) / 100),
  long_ctx  = 86 - 38 * sin(pi * seq(0, 100, by = 5) / 100)^1.2
)

p_lost <- ggplot(pos_df, aes(x = pos)) +
  annotate("rect", xmin = 25, xmax = 75, ymin = 35, ymax = 98, fill = "#FEF3C7", alpha = 0.48) +
  annotate("text", x = 50, y = 41, label = "中间迷失区（Lost in the Middle）\n关键指令与表格数值极易被遗忘",
           family = PUB_FONT, size = 3.5, fontface = "bold", color = "#B45309", lineheight = 1.2) +
  geom_line(aes(y = short_ctx, color = "精简高信噪比上下文（< 30% 占用）"), linewidth = 1.5) +
  geom_line(aes(y = long_ctx,  color = "超长臃肿上下文（多轮试错 + 硬塞 PDF）"), linewidth = 1.6) +
  geom_point(data = pos_df[c(1, 11, 21), ], aes(y = long_ctx), color = "#E64B35", size = 3.8) +
  scale_color_manual(values = c(
    "精简高信噪比上下文（< 30% 占用）" = "#00A087",
    "超长臃肿上下文（多轮试错 + 硬塞 PDF）" = "#E64B35"
  )) +
  scale_x_continuous(breaks = c(0, 50, 100), labels = c("开头 (0%)", "中段 (50%)", "末尾 (100%)")) +
  scale_y_continuous(limits = c(35, 100), labels = function(x) paste0(x, "%")) +
  labs(
    title = "b  长窗口顽疾：中间迷失 & 上下文腐烂",
    subtitle = "塞得越满，中段关键信息召回率骤降（Context Rot）",
    x = "关键信息在上下文中的位置",
    y = "模型有效召回准确率",
    color = NULL
  ) +
  theme_cns(base_size = 12.5) +
  theme(
    plot.title = element_text(size = 14.5),
    legend.position = "top",
    legend.direction = "vertical",
    legend.text = element_text(size = 10.5, face = "bold"),
    legend.margin = margin(b = 2)
  )

final_plot <- (p_quad | p_lost) +
  plot_annotation(
    caption = "原理参考：Vaswani et al. (Transformer O(N²) Self-Attention) & Liu et al. (TACL 2024, Lost in the Middle) | 源码：code/r/06_context_scaling_and_rot.R",
    theme = theme(plot.caption = element_text(family = PUB_FONT, size = 9.5, color = "#6B7280", hjust = 0))
  )

save_pub_figure(final_plot, "06_context_scaling_and_rot", width = 12.8, height = 5.8)
