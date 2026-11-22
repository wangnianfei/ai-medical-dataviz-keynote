# ==============================================================================
# export_datasets.R
# Exports the tidy CSV datasets used by the reproducible R teaching figures
# so readers can inspect every number directly in data/
# ==============================================================================

dir.create("data", showWarnings = FALSE, recursive = TRUE)

# 1. Empirical Table-Reading vs Code-Execution benchmark (Society of AI Scientists, Fig. 13c)
table_bench <- data.frame(
  method = c("LLM_direct_table_reading", "LLM_write_and_run_code"),
  total_tasks = c(200, 200),
  correct = c(171, 200),
  wrong_high_confidence_ge90pct = c(25, 0),
  wrong_other = c(4, 0),
  accuracy_pct = c(85.5, 100.0)
)
write.csv(table_bench, "data/table_reading_vs_code_200.csv", row.names = FALSE)

# 2. Transformer O(N^2) scaling & Lost-in-the-Middle attention retention curve
k_tokens <- seq(10, 1000, by = 10)
scaling_df <- data.frame(
  context_k_tokens = k_tokens,
  relative_attention_compute = (k_tokens / 100)^2
)
write.csv(scaling_df, "data/context_scaling_quadratic.csv", row.names = FALSE)

pos_pct <- seq(0, 100, by = 5)
# Smooth U-shaped retrieval accuracy curve (Liu et al., TACL 2024 illustrative fit)
u_curve <- data.frame(
  document_position_pct = pos_pct,
  retrieval_accuracy_pct = round(52 + 34 * ((pos_pct - 50) / 50)^2, 1)
)
write.csv(u_curve, "data/lost_in_the_middle_curve.csv", row.names = FALSE)

# 3. Fixed-seed simulated NSCLC PFS dataset (n=36) used in Slide P28 typography figure
set.seed(2026)
pfs_df <- data.frame(
  patient_id = sprintf("PT%02d", 1:36),
  arm = rep(c("Control", "KRASi + PD-1"), each = 18),
  pfs_months = round(c(rnorm(18, 5.4, 1.3), rnorm(18, 9.8, 1.6)), 2)
)
write.csv(pfs_df, "data/clinical_pfs_demo_n36.csv", row.names = FALSE)

# 4. Clean tidy export of datasets::ToothGrowth used in P23 & P28 layout/tier figures
tg <- datasets::ToothGrowth
tg$dose_label <- factor(tg$dose, levels = c(0.5, 1, 2), labels = c("0.5 mg/d", "1.0 mg/d", "2.0 mg/d"))
tg$arm <- ifelse(tg$supp == "OJ", "Combination_OJ", "Standard_VC")
write.csv(tg, "data/toothgrowth_clinical_demo.csv", row.names = FALSE)

# 5. Iris sepal/petal tidy export used in P27 categorical color comparison
write.csv(datasets::iris, "data/iris_palette_demo.csv", row.names = FALSE)

message("Exported 6 tidy CSV datasets to data/")
