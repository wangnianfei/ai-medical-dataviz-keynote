# ==============================================================================
# 04_table_reading_vs_code.R
# Slide P20: Hard Empirical Proof — Never Let LLMs Compute Raw Tables Directly
# Empirical source: "A Society of AI Scientists" (alphaXiv, Nov 2026), Fig. 13c
# ==============================================================================

source("code/r/00_theme_pub.R")

suppressPackageStartupMessages({
  library(dplyr)
})

make_grid <- function(n_right, n_wrong_hi, n_wrong_lo, method_label) {
  expand.grid(col = 1:20, row = 1:10) %>%
    arrange(row, col) %>%
    mutate(
      idx = row_number(),
      outcome = case_when(
        idx <= n_right ~ "正确 (Correct)",
        idx <= n_right + n_wrong_hi ~ "高自信错误 (自信度 ≥ 90%)",
        TRUE ~ "一般错误 (Wrong)"
      ),
      method = method_label
    )
}

waffle_df <- bind_rows(
  make_grid(171, 25, 4, "让大模型直接读表口算\n171 / 200 正确（错 29 题 · 85.5%）"),
  make_grid(200,  0, 0, "让大模型写 Python / R 代码本地执行\n200 / 200 正确（0 错误 · 100.0%）")
) %>%
  mutate(
    method = factor(method, levels = unique(method)),
    outcome = factor(outcome, levels = c("正确 (Correct)", "高自信错误 (自信度 ≥ 90%)", "一般错误 (Wrong)"))
  )

p_bench <- ggplot(waffle_df, aes(x = col, y = -row, fill = outcome)) +
  geom_tile(color = "#FFFFFF", linewidth = 0.9, width = 0.9, height = 0.9) +
  facet_wrap(~ method, ncol = 2) +
  scale_fill_manual(
    values = c(
      "正确 (Correct)" = "#1F4E79",
      "高自信错误 (自信度 ≥ 90%)" = "#DC2626",
      "一般错误 (Wrong)" = "#F59E0B"
    )
  ) +
  coord_fixed() +
  labs(
    title = "硬核实证：200 道临床/科研表格定量题对照测试",
    subtitle = "每格 = 1 道定量题；直接读表出错的 29 题中，高达 25 题（86%）模型自信度 ≥ 90%（最危险的幻觉）",
    caption = "数据来源：Ahmad et al., A Society of AI Scientists (alphaXiv, Nov 2026), Fig. 13c | 源码：code/r/04_table_reading_vs_code.R",
    fill = NULL
  ) +
  theme_cns(base_size = 13) +
  theme(
    axis.text = element_blank(),
    axis.title = element_blank(),
    axis.ticks = element_blank(),
    axis.line = element_blank(),
    panel.grid = element_blank(),
    panel.spacing = unit(1.6, "lines"),
    legend.position = "bottom",
    legend.text = element_text(size = 12, face = "bold"),
    strip.text = element_text(size = 13, face = "bold", color = "#111827", margin = margin(8, 8, 8, 8)),
    plot.title = element_text(size = 17, face = "bold"),
    plot.subtitle = element_text(size = 12, color = "#374151"),
    plot.caption = element_text(size = 9.5)
  )

save_pub_figure(p_bench, "04_table_reading_vs_code", width = 12.6, height = 5.6)
