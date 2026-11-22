# ==============================================================================
# 00_theme_pub.R
# Unified CNS-style ggplot2 publication theme & save helpers
# Project: AI in Medical Data Analysis & Visualization (30-min Lecture)
# ==============================================================================

suppressPackageStartupMessages({
  library(ggplot2)
  library(ragg)
})

# Detect clean Chinese + Latin sans-serif font on macOS / fallback
PUB_FONT <- if (Sys.info()[["sysname"]] == "Darwin") "PingFang SC" else "sans"

# Curated Nature / Okabe-Ito inspired semantic palette
PAL_CNS <- c(
  navy    = "#1F4E79",
  blue    = "#3C5488",
  sky     = "#4DBBD5",
  teal    = "#00A087",
  red     = "#E64B35",
  coral   = "#DC5F47",
  amber   = "#E69F00",
  purple  = "#7E6148",
  slate   = "#5C6B73",
  muted   = "#B8C2CC",
  bg_soft = "#F7F8FA"
)

theme_cns <- function(base_size = 11, base_family = PUB_FONT) {
  theme_minimal(base_size = base_size, base_family = base_family) +
    theme(
      plot.background   = element_rect(fill = "#FFFFFF", color = NA),
      panel.background  = element_rect(fill = "#FFFFFF", color = NA),
      panel.grid.major  = element_line(color = "#ECEFF3", linewidth = 0.35),
      panel.grid.minor  = element_blank(),
      axis.line         = element_line(color = "#2C3E50", linewidth = 0.5),
      axis.ticks        = element_line(color = "#2C3E50", linewidth = 0.4),
      axis.ticks.length = unit(3, "pt"),
      axis.title        = element_text(color = "#1A2530", face = "bold", size = rel(0.95)),
      axis.text         = element_text(color = "#34495E", size = rel(0.88)),
      plot.title        = element_text(color = "#111827", face = "bold", size = rel(1.12), margin = margin(b = 4)),
      plot.subtitle     = element_text(color = "#5A6772", size = rel(0.88), margin = margin(b = 8)),
      plot.caption      = element_text(color = "#7F8C8D", size = rel(0.78), hjust = 0, margin = margin(t = 8)),
      legend.title      = element_text(color = "#1A2530", face = "bold", size = rel(0.88)),
      legend.text       = element_text(color = "#34495E", size = rel(0.84)),
      legend.key        = element_rect(fill = NA, color = NA),
      strip.background  = element_rect(fill = "#F1F4F8", color = NA),
      strip.text        = element_text(color = "#1A2530", face = "bold", size = rel(0.90), margin = margin(4, 6, 4, 6)),
      plot.margin       = margin(10, 12, 10, 12)
    )
}

get_project_root <- function() {
  # Works whether invoked from project root or code/r/
  if (dir.exists("code/r")) return(normalizePath("."))
  if (dir.exists("../../code/r")) return(normalizePath("../.."))
  return(normalizePath("."))
}

save_pub_figure <- function(plot_obj, name, width = 12, height = 6.2, dpi = 300) {
  root <- get_project_root()
  out_dir <- file.path(root, "assets", "generated")
  if (!dir.exists(out_dir)) dir.create(out_dir, recursive = TRUE)

  png_path <- file.path(out_dir, paste0(name, ".png"))
  pdf_path <- file.path(out_dir, paste0(name, ".pdf"))

  ragg::agg_png(png_path, width = width, height = height, units = "in", res = dpi, background = "#FFFFFF")
  print(plot_obj)
  dev.off()

  tryCatch({
    grDevices::cairo_pdf(pdf_path, width = width, height = height, family = PUB_FONT)
    print(plot_obj)
    dev.off()
  }, error = function(e) {
    message("PDF skipped for ", name, ": ", e$message)
  })

  message("Saved: ", png_path)
}
