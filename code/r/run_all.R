# ==============================================================================
# run_all.R
# One-click reproducibility script: exports tidy datasets to data/ and
# regenerates all 6 publication-grade teaching figures (300 DPI PNG + vector PDF)
# Run from the repository root:
#   Rscript code/r/run_all.R
# ==============================================================================

scripts <- c(
  "code/r/export_datasets.R",
  "code/r/01_rainbow_vs_scientific_color.R",
  "code/r/02_messy_vs_cns_layout.R",
  "code/r/04_table_reading_vs_code.R",
  "code/r/06_context_scaling_and_rot.R",
  "code/r/07_font_arial_vs_times.R",
  "code/r/08_three_tier_viz_evolution.R"
)

for (s in scripts) {
  message("=== Running ", s, " ===")
  source(s, local = new.env(parent = globalenv()))
}

message("All datasets and figures reproduced successfully.")
