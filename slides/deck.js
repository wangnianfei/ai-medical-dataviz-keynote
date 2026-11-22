/* ==========================================================================
   deck.js — Zero-Dependency Interactive 35-Slide Presentation Runtime (v4)
   - Bulletproof centered 16:9 viewport scaling (zero right-edge clipping)
   - Keyboard & button navigation + URL hash sync (#1..#35)
   - 35-slide visual Overview Grid (key: G)
   - Speaker Notes + Live Elapsed Timer (key: N)
   - Full-screen Image Lightbox (click any image)
   - Matrix Live Code-to-Figure Runner Theatre (Global Split-Pane + P25 Inline)
   - Widget 1 (P06): Autoregressive Text-Chain & Context Divergence Animator
   - Widget 2 (P10): /compact Context Compression Simulator
   - Widget 3 (P25): Local MCP (PlotCase + 顶刊美图社) Top-5 Matcher + Inline Matrix R Runner
   - Widget 4 (P26): CNS Palette Switcher + Live Colorblind Simulator
   ========================================================================== */

(function () {
  const deckEl = document.getElementById("deck");
  const slides = Array.from(document.querySelectorAll(".slide"));
  const total = slides.length;
  const progressFill = document.getElementById("progress-fill");
  const hudCounter = document.getElementById("hud-counter");
  const notesDrawer = document.getElementById("notes-drawer");
  const notesContent = document.getElementById("notes-content");
  const timerDisplay = document.getElementById("timer-display");
  const overviewModal = document.getElementById("overview-modal");
  const overviewGrid = document.getElementById("overview-grid");
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");
  const runnerModal = document.getElementById("runner-modal");
  const runnerTitle = document.getElementById("runner-title");
  const runnerCodeScroll = document.getElementById("runner-code-scroll");
  const runnerStatus = document.getElementById("runner-status");
  const runnerBarFill = document.getElementById("runner-bar-fill");
  const runnerCurtain = document.getElementById("runner-curtain");
  const runnerCurtainPct = document.getElementById("runner-curtain-pct");
  const runnerImg = document.getElementById("runner-img");
  const runnerBadge = document.getElementById("runner-result-badge");

  let current = 0;
  let timerSeconds = 0;
  let timerRunning = false;
  let timerInterval = null;
  let runnerTimer = null;
  let inlineTimer = null;
  let activeRecipeKey = null;

  // ---------- 1. Bulletproof Centered 16:9 Canvas Scaling ----------
  function scaleDeck() {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const scale = Math.min(vw / 1440, vh / 810);
    deckEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }
  window.addEventListener("resize", scaleDeck);
  window.addEventListener("orientationchange", scaleDeck);
  scaleDeck();

  // ---------- 2. Slide Navigation ----------
  function goTo(idx) {
    const next = Math.max(0, Math.min(total - 1, idx));
    slides[current].classList.remove("active");
    current = next;
    slides[current].classList.add("active");

    const pct = ((current + 1) / total) * 100;
    progressFill.style.width = `${pct}%`;
    hudCounter.textContent = `${String(current + 1).padStart(2, "0")} / ${total}`;
    history.replaceState(null, "", `#${current + 1}`);

    const note = slides[current].getAttribute("data-notes") || "本页无额外演讲台词。";
    notesContent.textContent = note;
    updateOverviewHighlight();
  }

  function nextSlide() { goTo(current + 1); }
  function prevSlide() { goTo(current - 1); }

  const initHash = parseInt(location.hash.replace("#", ""), 10);
  if (!isNaN(initHash) && initHash >= 1 && initHash <= total) {
    goTo(initHash - 1);
  } else {
    goTo(0);
  }

  // ---------- 3. Overview Grid (35 Slides) ----------
  function buildOverview() {
    overviewGrid.innerHTML = "";
    slides.forEach((s, i) => {
      const card = document.createElement("div");
      card.className = "ov-card";
      const kicker = s.querySelector(".kicker")?.textContent || "COVER";
      const title = s.querySelector("h1.title")?.textContent || `Slide ${i + 1}`;
      card.innerHTML = `<div class="ov-num">${String(i + 1).padStart(2, "0")} · ${kicker}</div><div class="ov-title">${title}</div>`;
      card.addEventListener("click", () => {
        goTo(i);
        overviewModal.classList.remove("open");
      });
      overviewGrid.appendChild(card);
    });
    updateOverviewHighlight();
  }

  function updateOverviewHighlight() {
    const cards = overviewGrid.querySelectorAll(".ov-card");
    cards.forEach((c, i) => c.classList.toggle("current", i === current));
  }
  buildOverview();

  // ---------- 4. Elapsed Lecture Timer ----------
  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function toggleTimer() {
    if (timerRunning) {
      clearInterval(timerInterval);
      timerRunning = false;
    } else {
      timerRunning = true;
      timerInterval = setInterval(() => {
        timerSeconds += 1;
        timerDisplay.textContent = formatTime(timerSeconds);
      }, 1000);
    }
  }

  // ---------- 5. Controls & Keyboard Shortcuts ----------
  document.getElementById("btn-prev").addEventListener("click", prevSlide);
  document.getElementById("btn-next").addEventListener("click", nextSlide);
  document.getElementById("btn-grid").addEventListener("click", () => overviewModal.classList.toggle("open"));
  document.getElementById("btn-close-grid").addEventListener("click", () => overviewModal.classList.remove("open"));
  document.getElementById("btn-notes").addEventListener("click", () => notesDrawer.classList.toggle("open"));
  document.getElementById("btn-timer").addEventListener("click", toggleTimer);
  document.getElementById("btn-fs").addEventListener("click", () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
    else document.exitFullscreen?.();
  });

  function closeRunnerModal() {
    if (runnerTimer) { clearInterval(runnerTimer); runnerTimer = null; }
    runnerModal.classList.remove("open");
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      overviewModal.classList.remove("open");
      lightbox.classList.remove("open");
      closeRunnerModal();
      notesDrawer.classList.remove("open");
      return;
    }
    if (overviewModal.classList.contains("open") || lightbox.classList.contains("open") || runnerModal.classList.contains("open")) {
      return;
    }
    if (["ArrowRight", "ArrowDown", "PageDown", " "].includes(e.key)) {
      e.preventDefault();
      nextSlide();
    } else if (["ArrowLeft", "ArrowUp", "PageUp"].includes(e.key)) {
      e.preventDefault();
      prevSlide();
    } else if (e.key === "Home") {
      goTo(0);
    } else if (e.key === "End") {
      goTo(total - 1);
    } else if (e.key.toLowerCase() === "g") {
      overviewModal.classList.toggle("open");
    } else if (e.key.toLowerCase() === "n") {
      notesDrawer.classList.toggle("open");
    } else if (e.key.toLowerCase() === "f") {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.();
      else document.exitFullscreen?.();
    }
  });

  // ---------- 6. Lightbox Image Zoom ----------
  document.addEventListener("click", (e) => {
    const img = e.target.closest(".slide img, #runner-img");
    if (!img) return;
    e.stopPropagation();
    lightboxImg.src = img.src;
    lightbox.classList.add("open");
  });
  lightbox.addEventListener("click", () => lightbox.classList.remove("open"));

  // ---------- 7. Matrix Syntax Highlighter & Authentic R Recipes ----------
  function highlightRLine(line) {
    const esc = line
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    if (/^\s*#/.test(esc)) return `<span class="mx-comment">${esc}</span>`;
    if (/^\s*✓|^\s*\$/.test(esc)) return `<span class="mx-ok">${esc}</span>`;
    return esc
      .replace(/("[^"]*"|'[^']*')/g, '<span class="mx-str">$1</span>')
      .replace(/\b(library|source|function|mutate|filter|arrange|ggplot|ggsave|tribble|factor|case_when|survfit2|ggsurvfit|jjVolcano|circular_annotation_plot|forest|swimmer_plot|stat_density_2d|coord_polar|theme_minimal|scale_fill_viridis|scale_color_manual)\b/g, '<span class="mx-fn">$1</span>')
      .replace(/\b(TRUE|FALSE|NA|NULL|for|in|if|else)\b/g, '<span class="mx-kw">$1</span>');
  }

  const CODE_RUN_RECIPES = {
    "tj_094_bmi_ring": {
      title: "Rscript Circular_multi-track_sample_annotation_plot.R  # Nature Aging (2024)",
      img: "../assets/top_journal_clean/nature_aging_bmi_ring.png",
      badge: "✓ Nature Aging (2024) · Age / BMI / 胰岛素敏感性多轨道环形图渲染完成",
      lines: [
        "$ Rscript Circular_multi-track_sample_annotation_plot.R",
        "# Ref: Shen et al., Nature Aging 4, 1619–1634 (2024)",
        "library(tidyverse)",
        "library(ggbeeswarm)",
        'source("circular_annotation_plot.R")',
        'data <- read_csv("simulated_demographics_108.csv")',
        "numeric_tracks <- tribble(",
        '  ~name, ~column,        ~title,         ~inner, ~outer, ~min, ~max, ~color,',
        '  "Age", "adjusted_age", "Age (years)",   3.32,   4.16,   21,   75,  "#702083",',
        '  "BMI", "BMI",          "BMI",           2.39,   3.23,   15,   41,  "#F04A22"',
        ")",
        "category_tracks <- tribble(",
        '  ~name,              ~column,     ~title,                  ~inner, ~outer,',
        '  "Insulin response", "IRIS",      "Insulin response (%)",   0.90,   1.32,',
        '  "Ethnicity",        "Ethnicity", "Ethnicity (%)",          1.39,   1.81,',
        '  "Gender",           "Gender",    "Gender (%)",             1.88,   2.30',
        ")",
        "category_colors <- c(",
        '  Female = "#F33010", Male = "#E2BD6E", Asian = "#046C9B",',
        '  IS = "#F21901", IR = "#3C99B0"',
        ")",
        "plot <- circular_annotation_plot(",
        '  data = data, id_col = "subject_id_random", sort_col = "adjusted_age",',
        "  numeric_tracks = numeric_tracks, category_tracks = category_tracks,",
        "  category_colors = category_colors, font_scale = 1.25",
        ")",
        'ggsave("Fig1a_circular_annotation.pdf", plot, width = 10.4, height = 11.2)',
        "✓ [0.78s] Exported 300 DPI vector figure -> nature_aging_bmi_ring.png"
      ]
    },
    "pc_polar_volcano": {
      title: "Rscript polar_multi_tissue_volcano.R  # PlotCase 20-Organ Polar Volcano",
      img: "../assets/mcp_covers/plotcase_polar_protein_volcano.png",
      badge: "✓ PlotCase · 20 器官极坐标差异蛋白高级火山图渲染完成",
      lines: [
        "$ Rscript polar_multi_tissue_volcano.R",
        "# PlotCase: Multi-tissue Differential Proteomics Polar Volcano",
        "library(tidyverse)",
        "library(ggrepel)",
        "library(geomtextpath)",
        'df <- read_csv("aging_20_organs_proteome.csv") |>',
        "  mutate(",
        '    sig = case_when(log2FC > 1 & padj < 0.05 ~ "Up-regulated Ig",',
        '                    log2FC < -1 & padj < 0.05 ~ "Down-regulated Ig",',
        '                    TRUE ~ "Other proteins")',
        "  )",
        "p <- ggplot(df, aes(x = tissue_sector, y = log2FC, color = sig)) +",
        '  geom_col(data = bg_sectors, aes(y = max_fc), fill = "#F2F3F5", width = 0.88) +',
        "  geom_jitter(width = 0.34, size = 1.6, alpha = 0.85) +",
        '  geom_tile(aes(y = 0, fill = tissue), height = 0.45, color = NA) +',
        '  scale_color_manual(values = c("#C9332B", "#4B8BBE", "#B8BEC4")) +',
        "  coord_polar(start = 0, clip = 'off') +",
        "  theme_minimal(base_family = 'Helvetica') +",
        '  labs(title = "log2(FC): Young vs. Aged")',
        'ggsave("polar_volcano_20organs.pdf", p, width = 10, height = 10, dpi = 300)',
        "✓ [0.64s] Exported 300 DPI figure -> plotcase_polar_protein_volcano.png"
      ]
    },
    "tj_057_circ_volcano": {
      title: "Rscript Circle_Volcano.R  # Nature Communications (2025)",
      img: "../assets/top_journal_clean/natcomm_circular_volcano.png",
      badge: "✓ Nature Communications (2025) · 多分组环状火山图渲染完成",
      lines: [
        "$ Rscript Circle_Volcano.R",
        "# Ref: Wei et al., Nat Commun 16, 7702 (2025)",
        "library(scRNAtoolVis)",
        "library(readxl)",
        "library(tidyverse)",
        'markers <- read_excel("41467_2025_62793_MOESM6_ESM.xlsx") |>',
        "  mutate(cluster = factor(domain)) |>",
        '  filter(!str_detect(gene, "^LINC"))',
        "region_color <- c(",
        '  FPPFC = "#3F4587", DLPFC = "#8562AA", VLPFC = "#EC8561",',
        '  M1 = "#B97CB5", S1 = "#D43046", PoCG = "#ED4A96",',
        '  SPL = "#593C97", AG = "#FBDE13", V1 = "#299FAE", ACC = "#0D9547"',
        ")",
        "jjVolcano(",
        "  diffData = markers, log2FC.cutoff = 0.1,",
        "  size = 3, pSize = 0.5, base_size = 15,",
        "  tile.col = region_color, topGeneN = 2, polar = TRUE",
        ") |>",
        '  ggsave(filename = "gene_downup_circle.pdf", height = 9, width = 10)',
        "✓ [0.71s] Exported vector circular volcano -> natcomm_circular_volcano.png"
      ]
    },
    "pc_global_map": {
      title: "Rscript global_spatial_response_map.R  # PlotCase Global GeoTIFF Map",
      img: "../assets/mcp_covers/plotcase_global_map_warm.png",
      badge: "✓ PlotCase · 全球高分辨率空间分布地图渲染完成",
      lines: [
        "$ Rscript global_spatial_response_map.R",
        "# PlotCase: Global Spatial Distribution (terra + ggplot2)",
        "library(terra)",
        "library(ggplot2)",
        "library(sf)",
        'r_global <- rast("global_biomass_response.tif")',
        'world_sf <- rnaturalearth::ne_countries(scale = "medium", returnclass = "sf")',
        "df_grid <- as.data.frame(r_global, xy = TRUE, na.rm = TRUE)",
        "pal_div <- c('#08306B', '#3182BD', '#9ECAE1', '#FEF0E6', '#F4A582', '#D6604D', '#8C3F0E')",
        "p_map <- ggplot() +",
        "  geom_raster(data = df_grid, aes(x = x, y = y, fill = response)) +",
        "  scale_fill_stepsn(colours = pal_div, limits = c(-0.95, 0.46)) +",
        "  coord_sf(expand = FALSE) +",
        "  theme_void(base_family = 'Helvetica') +",
        "  theme(legend.position = c(0.14, 0.12), legend.direction = 'horizontal')",
        'ggsave("global_distribution_map.pdf", p_map, width = 12, height = 5.2, dpi = 300)',
        "✓ [0.92s] Exported high-res global raster -> plotcase_global_map_warm.png"
      ]
    },
    "tj_051_luad_galaxy": {
      title: "Rscript galaxy_plot.R  # Nature (2024) LUAD Single-Cell Galaxy",
      img: "../assets/top_journal_clean/nature_2024_luad_galaxy.png",
      badge: "✓ Nature (2024) · 肺腺癌 (LUAD) 单细胞星云密度图渲染完成",
      lines: [
        "$ Rscript galaxy_plot.R",
        "# Ref: Han et al., Nature 627, 656–663 (2024) — Lung Adenocarcinoma",
        "library(ggplot2)",
        "library(viridis)",
        "library(ggpubr)",
        'data <- readRDS("Fig2h_KAC_UmapData.rds")',
        'hull <- read.csv("mark_hull.csv", header = FALSE)',
        'data$Field1 <- factor(data$Field1, levels = c("tumor", "NL"),',
        '                      labels = c("LUAD\\n(n = 1,674)", "NL\\n(n = 8,359)"))',
        "galaxy_Umap <- ggplot(data, aes(x = UMAP_1, y = UMAP_2)) +",
        '  stat_density_2d(aes(fill = after_stat(density)), geom = "raster", contour = FALSE) +',
        '  geom_polygon(data = hull, aes(x = V1, y = V2), color = "white",',
        '               fill = "transparent", linetype = "dashed") +',
        '  geom_point(color = "white", size = 0.02) +',
        "  facet_wrap(~Field1, ncol = 2) +",
        '  scale_fill_viridis(option = "magma") +',
        "  galaxyTheme_black(base_size = 20)",
        'ggsave("galaxy_plot.pdf", galaxy_Umap, width = 12, height = 7)',
        "✓ [0.85s] Rendered 10,033 single cells -> nature_2024_luad_galaxy.png"
      ]
    },
    "tj_103_science_circos": {
      title: "Rscript Figure1E.R  # Science (2026) Chinese Immune Multi-Omics Atlas",
      img: "../assets/top_journal_clean/science_2026_immune_circos.png",
      badge: "✓ Science (2026) · 人体免疫细胞环状树图与多轨道热图渲染完成",
      lines: [
        "$ Rscript Figure1E.R",
        "# Ref: Yin et al., Science (2026) · Chinese Immune Multi-Omics Atlas",
        "library(tidyverse); library(tidygraph); library(ggraph); library(ggforce)",
        'data <- read_csv("Figure1E_data.csv") |>',
        "  arrange(id) |> mutate(theta = (row_number() - 0.5) * 2 * pi / n())",
        'lineage_colors <- c("#AE159D", "#EE7100", "#2DB77B", "#302C9B", "#00AEEF")',
        "tree <- tbl_graph(nodes = nodes, edges = edges, directed = TRUE)",
        'tree_layout <- create_layout(tree, layout = "manual", x = x, y = y) |>',
        "  mutate(circular = TRUE)",
        "p_atlas <- ggraph(tree_layout) +",
        "  geom_edge_diagonal(aes(edge_colour = color, edge_width = width)) +",
        "  geom_arc_bar(data = track_sex, aes(r0 = 1.08, r = 1.24, fill = z)) +",
        "  geom_arc_bar(data = track_age, aes(r0 = 1.26, r = 1.42, fill = z)) +",
        "  coord_fixed() + theme_void()",
        'ggsave("Figure1E.pdf", p_atlas, width = 12, height = 12, device = cairo_pdf)',
        "✓ [0.95s] Exported 73 immune subsets -> science_2026_immune_circos.png"
      ]
    },
    "tj_020_km": {
      title: "Rscript Kaplan_Meier_survival.R  # Nature Medicine Survival + Risk Table",
      img: "../assets/top_journal_clean/natmed_km_risktable.png",
      badge: "✓ Nature Medicine · 双臂 KM 生存曲线 + 风险表渲染完成",
      lines: [
        "$ Rscript Kaplan_Meier_survival.R",
        "# Ref: Nature Medicine 29, 473–482 (2023)",
        "library(survival); library(ggsurvfit); library(patchwork)",
        'df_lung$arm <- factor(df_lung$sex, labels = c("Placebo + CF", "Serplulimab + CF"))',
        "p_km <- survfit2(Surv(time, status) ~ arm, data = df_lung) |>",
        "  ggsurvfit(linewidth = 0.9) +",
        '  add_risktable(risktable_stats = "{n.risk} ({cum.censor})") +',
        "  add_censor_mark(size = 4, shape = 73) +",
        '  add_quantile(y_value = 0.5, linetype = "dashed", linewidth = 0.6) +',
        '  scale_color_manual(values = c("#E05133", "#4877B9")) +',
        "  theme_classic(base_family = 'Helvetica')",
        'ggsave("Nature_Medicine_KM.pdf", p_km, width = 10, height = 6)',
        "✓ [0.52s] Fitted KM & aligned risk table -> natmed_km_risktable.png"
      ]
    },
    "tj_036_forest": {
      title: "Rscript Cox_subgroup_forest.R  # NEJM Subgroup Forest Plot",
      img: "../assets/top_journal_clean/nejm_cox_forest.png",
      badge: "✓ NEJM · 多亚组 Cox 回归森林图渲染完成",
      lines: [
        "$ Rscript Cox_subgroup_forest.R",
        "# Ref: N Engl J Med 387, 1089–1098 (2022)",
        "library(jstable); library(survival); library(forestploter); library(tidyverse)",
        "res <- TableSubgroupMultiCox(",
        "  formula = Surv(time, status) ~ treatment, data = df,",
        '  var_subgroups = c("age", "ph.ecog", "ph.karno", "pat.karno", "wt.loss"),',
        '  count_by = "treatment", event = TRUE',
        ")",
        "tm <- forest_theme(base_size = 10, ci_pch = 15, ci_col = 'black')",
        "p_for <- forest(res[, c(1, 2, 3, 7, 8, 9)],",
        "                est = res$est, lower = res$low, upper = res$high,",
        "                ci_column = 4, ref_line = 1, xlim = c(0, 2), theme = tm)",
        'ggsave("NEJM_Cox_Subgroup_Forest.pdf", p_for, width = 10, height = 9)',
        "✓ [0.58s] Computed 14 subgroup HRs -> nejm_cox_forest.png"
      ]
    },
    "tj_053_swimmer": {
      title: "Rscript Swimmer_Spider_Waterfall.R  # Nature (2025) Immunotherapy",
      img: "../assets/top_journal_clean/nature_2025_immunotherapy_multipanel.png",
      badge: "✓ Nature (2025) · 肿瘤免疫治疗泳道 + 生存 + 瀑布 8-Panel 组图渲染完成",
      lines: [
        "$ Rscript Swimmer_Spider_Waterfall.R",
        "# Ref: Dai et al., Nature (2025) — PPP2R1A Immunotherapy Cohort",
        "library(tidyverse); library(swimplot); library(ggrepel); library(patchwork)",
        'p_swim <- swimmer_plot(df = OCCC_endpoint, id = "Acc", end = "Time_mo",',
        '                       name_fill = "Genetic", width = 0.8) +',
        '  swimmer_points(df_points = OCCC_timeline, name_shape = "overallResponse") +',
        '  swimmer_arrows(df_arrows = OCCC_ongoing, color = "#1D76BD") +',
        '  scale_fill_manual(values = c("#8fd2c4", "#9bc1dd", "#fdc583")) +',
        "  coord_flip(ylim = c(0, 72))",
        "final_fig <- (p_schema | p_swim) / (p_km1 | p_km2 | p_km3) / (p_ct | p_spider | p_water)",
        'ggsave("Nature_2025_Immunotherapy.pdf", final_fig, width = 14, height = 13)',
        "✓ [0.89s] Assembled 8 clinical panels -> nature_2025_immunotherapy_multipanel.png"
      ]
    },
    "pc_circos_genome": {
      title: "Rscript multi_track_genome_circos.R  # PlotCase EGFR/MET/CD274 Circos",
      img: "../assets/mcp_covers/plotcase_circos_genome.png",
      badge: "✓ PlotCase · 多轨道基因组热图与靶点弦图渲染完成",
      lines: [
        "$ Rscript multi_track_genome_circos.R",
        "# PlotCase: hg38 Multi-Track Genomic Heatmap + Target Links",
        "library(circlize); library(ComplexHeatmap)",
        'circos.initializeWithIdeogram(species = "hg38", plotType = c("ideogram", "labels"))',
        "col_fun <- colorRamp2(c(-2, 0, 2), c('#2B1055', '#B5367A', '#FDE725'))",
        "circos.genomicHeatmap(bed_track1, col = col_fun, side = 'inside', track.height = 0.14)",
        "circos.genomicHeatmap(bed_track2, col = pal_disease, side = 'inside', track.height = 0.12)",
        "circos.genomicLabels(bed_targets, labels.column = 4, side = 'inside',",
        "                     col = c('#00A087', '#E64B35', '#7876B1'))",
        "circos.genomicLink(region1, region2, col = link_cols, lwd = 2.2)",
        "✓ [0.76s] Rendered 23 chromosomes + target links -> plotcase_circos_genome.png"
      ]
    },
    "04_table_vs_code": {
      title: "Rscript code/r/04_table_reading_vs_code.R  # 200/200 零误差实证",
      img: "../assets/generated/04_table_reading_vs_code.png",
      badge: "✓ 本地 R 脚本执行完毕 · 200/200 零误差对照实证图已生成",
      lines: [
        "$ Rscript code/r/04_table_reading_vs_code.R",
        "# A Society of AI Scientists (Nov 2026) Fig. 13c — 200 Quantitative Questions",
        "library(ggplot2); library(dplyr)",
        "waffle_df <- bind_rows(",
        '  make_grid(171, 25, 4, "让大模型直接读表口算 (85.5%)"),',
        '  make_grid(200,  0, 0, "让大模型写 Python/R 代码本地执行 (100.0%)")',
        ")",
        "p <- ggplot(waffle_df, aes(x = col, y = -row, fill = outcome)) +",
        '  geom_tile(color = "#FFFFFF", linewidth = 0.9) +',
        '  scale_fill_manual(values = c("#1B5E55", "#C2412D", "#D97706")) +',
        "  facet_wrap(~ method, ncol = 2) + coord_fixed() + theme_minimal()",
        'ggsave("assets/generated/04_table_reading_vs_code.png", p, dpi = 300)',
        "✓ [0.46s] Verified 200/200 (100.0%) -> 04_table_reading_vs_code.png"
      ]
    },
    "06_context_rot": {
      title: "Rscript code/r/06_context_scaling_and_rot.R  # O(N^2) 与中段迷失",
      img: "../assets/generated/06_context_scaling_and_rot.png",
      badge: "✓ 本地 R 脚本执行完毕 · O(N²) 算力曲线与中段遗忘双图已生成",
      lines: [
        "$ Rscript code/r/06_context_scaling_and_rot.R",
        "library(ggplot2); library(dplyr); library(patchwork)",
        "len_df <- data.frame(k_tokens = seq(10, 1000, by = 10)) |> ",
        "  mutate(rel_cost = (k_tokens / 100)^2)  # 10x length -> 100x compute",
        "pos_df <- data.frame(pos = seq(0, 100, by = 5)) |> ",
        "  mutate(short_ctx = 94 - 6 * sin(pi * pos / 100),",
        "         long_ctx  = 86 - 38 * sin(pi * pos / 100)^1.2)",
        "final <- p_quad + p_u_curve + plot_layout(widths = c(1, 1.05))",
        'ggsave("assets/generated/06_context_scaling_and_rot.png", final, dpi = 300)',
        "✓ [0.49s] Rendered dual scaling curves -> 06_context_scaling_and_rot.png"
      ]
    },
    "08_three_tier": {
      title: "Rscript code/r/08_three_tier_viz_evolution.R  # 三阶可视化跃迁",
      img: "../assets/generated/08_three_tier_viz_evolution.png",
      badge: "✓ 本地 R 脚本执行完毕 · 0阶 → 1阶 → 2阶 CNS 跃迁对比图已生成",
      lines: [
        "$ Rscript code/r/08_three_tier_viz_evolution.R",
        "# Same dataset (datasets::ToothGrowth), 3 tiers of Input x",
        "library(ggplot2); library(patchwork)",
        "p0 <- ggplot(df, aes(dose_f, len, fill = supp)) + geom_col(position = 'dodge') + theme_gray()",
        "p1 <- ggplot(df, aes(dose_f, len, fill = supp)) + geom_boxplot(width = 0.5) + theme_bw()",
        "p2 <- ggplot(df, aes(dose_f, len, color = supp, fill = supp)) +",
        "  geom_boxplot(alpha = 0.18, outlier.shape = NA) +",
        "  geom_point(position = position_jitterdodge(0.12), size = 2.0) +",
        "  stat_summary(fun = mean, geom = 'line', linewidth = 0.9) +",
        '  scale_color_manual(values = c("#1B5E55", "#C2412D")) + theme_cns()',
        "final <- p0 | p1 | p2",
        'ggsave("assets/generated/08_three_tier_viz_evolution.png", final, dpi = 300)',
        "✓ [0.54s] Evolved Tier 0 -> Tier 2 CNS figure -> 08_three_tier_viz_evolution.png"
      ]
    },
    "01_rainbow": {
      title: "Rscript code/r/01_rainbow_vs_scientific_color.R  # 彩虹色 vs Viridis",
      img: "../assets/generated/01_rainbow_vs_scientific_color.png",
      badge: "✓ 本地 R 脚本执行完毕 · 彩虹色禁忌 vs CNS 科学配色图已生成",
      lines: [
        "$ Rscript code/r/01_rainbow_vs_scientific_color.R",
        "library(ggplot2); library(viridis); library(patchwork)",
        "p_bad  <- ggplot(volc_df, aes(x, y, fill = z)) + geom_raster() +",
        "  scale_fill_gradientn(colours = rainbow(12))   # ✗ False visual boundaries",
        "p_good <- ggplot(volc_df, aes(x, y, fill = z)) + geom_raster() +",
        '  scale_fill_viridis_c(option = "mako", direction = -1)  # ✓ Perceptually uniform',
        'ggsave("assets/generated/01_rainbow_vs_scientific_color.png", dpi = 300)',
        "✓ [0.48s] Rendered color comparison -> 01_rainbow_vs_scientific_color.png"
      ]
    },
    "02_layout": {
      title: "Rscript code/r/02_messy_vs_cns_layout.R  # 告别炸药柱状图",
      img: "../assets/generated/02_messy_vs_cns_layout.png",
      badge: "✓ 本地 R 脚本执行完毕 · 杂乱柱状图 vs CNS 规范排版图已生成",
      lines: [
        "$ Rscript code/r/02_messy_vs_cns_layout.R",
        "library(ggplot2); library(patchwork)",
        "p_cns <- ggplot(df, aes(dose_f, len, color = supp, fill = supp)) +",
        "  geom_boxplot(width = 0.42, alpha = 0.18, outlier.shape = NA) +",
        "  geom_point(position = position_jitterdodge(0.10), size = 1.9) +",
        "  stat_summary(fun = mean, geom = 'line', linewidth = 0.85) +",
        '  scale_color_manual(values = c("#1B5E55", "#C2412D")) + theme_cns()',
        'ggsave("assets/generated/02_messy_vs_cns_layout.png", dpi = 300)',
        "✓ [0.45s] Rendered layout contrast -> 02_messy_vs_cns_layout.png"
      ]
    },
    "07_fonts": {
      title: "Rscript code/r/07_font_arial_vs_times.R  # Arial vs Times New Roman",
      img: "../assets/generated/07_font_arial_vs_times.png",
      badge: "✓ 本地 R 脚本执行完毕 · 85mm 单栏字体清晰度实测图已生成",
      lines: [
        "$ Rscript code/r/07_font_arial_vs_times.R",
        "library(ggplot2); library(patchwork)",
        'p_times <- base_plot + theme_minimal(base_family = "Times")      # ✗ Serif blurs at 85mm',
        'p_arial <- base_plot + theme_minimal(base_family = "Helvetica")  # ✓ Nature/Cell standard',
        'ggsave("assets/generated/07_font_arial_vs_times.png", p_times | p_arial, dpi = 300)',
        "✓ [0.43s] Rendered font clarity test -> 07_font_arial_vs_times.png"
      ]
    }
  };

  function runMatrixModal(key) {
    const rec = CODE_RUN_RECIPES[key];
    if (!rec) return;
    activeRecipeKey = key;
    if (runnerTimer) { clearInterval(runnerTimer); runnerTimer = null; }

    runnerTitle.textContent = rec.title;
    runnerCodeScroll.innerHTML = "";
    runnerImg.src = rec.img;
    runnerImg.classList.remove("fig-just-rendered");
    runnerBadge.textContent = "⏳ 正在本地执行 R 脚本并渲染矢量图形…";
    runnerCurtain.classList.remove("revealed");
    runnerBarFill.style.width = "0%";
    runnerStatus.textContent = "[1/4] 启动本地 R 引擎…";
    runnerCurtainPct.textContent = "0%";
    runnerModal.classList.add("open");

    let idx = 0;
    const totalLines = rec.lines.length;
    const stepMs = Math.max(70, Math.min(130, Math.floor(1900 / totalLines)));

    runnerTimer = setInterval(() => {
      if (idx < totalLines) {
        const div = document.createElement("div");
        div.innerHTML = highlightRLine(rec.lines[idx]);
        runnerCodeScroll.appendChild(div);
        runnerCodeScroll.scrollTop = runnerCodeScroll.scrollHeight;
        idx += 1;

        const pct = Math.round((idx / totalLines) * 100);
        runnerBarFill.style.width = `${pct}%`;
        runnerCurtainPct.textContent = `${pct}%`;

        if (pct < 35) runnerStatus.textContent = `[1/4] 加载医学统计与绘图 R 包… ${pct}%`;
        else if (pct < 70) runnerStatus.textContent = `[2/4] 映射数据轨道与顶刊配色… ${pct}%`;
        else if (pct < 98) runnerStatus.textContent = `[3/4] 渲染 300 DPI 高清矢量图形… ${pct}%`;
        else runnerStatus.textContent = `[4/4] ✓ 运行完成，输出终图！ 100%`;
      } else {
        clearInterval(runnerTimer);
        runnerTimer = null;
        runnerCurtain.classList.add("revealed");
        runnerImg.classList.add("fig-just-rendered");
        runnerBadge.textContent = rec.badge;
      }
    }, stepMs);
  }

  document.querySelectorAll("[data-run]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      runMatrixModal(btn.getAttribute("data-run"));
    });
  });

  document.getElementById("btn-runner-replay")?.addEventListener("click", () => {
    if (activeRecipeKey) runMatrixModal(activeRecipeKey);
  });
  document.getElementById("btn-runner-zoom")?.addEventListener("click", () => {
    if (!runnerImg.src) return;
    lightboxImg.src = runnerImg.src;
    lightbox.classList.add("open");
  });
  document.getElementById("btn-close-runner")?.addEventListener("click", closeRunnerModal);
  runnerModal?.addEventListener("click", (e) => {
    if (e.target === runnerModal) closeRunnerModal();
  });

  // ---------- 8. Widget 1 (P06): Autoregressive Text-Chain Animator ----------
  const CHAIN_MODES = {
    good: {
      seed: ["请用 R", "ggsurvfit", "绘双臂 KM 曲线 +", "风险表 + NPG 配色："],
      steps: [
        { token: "survfit(Surv(os, status)", cands: [["survfit(Surv(os, status)", 88], ["plot(data$os)", 7], ["barplot(mean)", 5]] },
        { token: " ~ arm, data = df)", cands: [[" ~ arm, data = df)", 92], [" ~ 1)", 5], [" ~ age)", 3]] },
        { token: " |> ggsurvfit()", cands: [[" |> ggsurvfit()", 86], [" |> plot()", 9], [" |> hist()", 5]] },
        { token: " + add_risktable()", cands: [[" + add_risktable()", 90], [" + theme_gray()", 6], [" + geom_bar()", 4]] },
        { token: " + add_pvalue()", cands: [[" + add_pvalue()", 87], [" + labs(title='图1')", 9], [" + coord_polar()", 4]] },
        { token: " + scale_color_npg()", cands: [[" + scale_color_npg()", 93], [" + rainbow(5)", 4], [" + theme_classic()", 3]] }
      ],
      verdict: "✅ 开头精确锁定包与美学 → 概率高度收束，直接产出顶刊代码！"
    },
    bad: {
      seed: ["帮我画一个", "好看的", "肺癌生存图："],
      steps: [
        { token: "好的！", cands: [["好的！", 62], ["请问数据格式？", 24], ["以下是步骤：", 14]] },
        { token: "可以用 Excel", cands: [["可以用 Excel", 45], ["用 SPSS 点菜单", 32], ["用 Python", 23]] },
        { token: "选中两列数据，", cands: [["选中两列数据，", 48], ["画柱状图，", 30], ["算平均值，", 22]] },
        { token: "插入折线图，", cands: [["插入折线图，", 44], ["插入饼图，", 29], ["设彩虹渐变，", 27]] },
        { token: "手动调成红色", cands: [["手动调成红色", 41], ["截图贴 Word", 36], ["加三维阴影", 23]] },
        { token: "（缺删失与风险表…）", cands: [["（缺删失与风险表…）", 52], ["（统计未指定）", 31], ["（反复返工）", 17]] }
      ],
      verdict: "❌ 开头模糊 → 概率发散，每步跑偏接回输入 x，越改越累！"
    }
  };

  let chainMode = "good";
  let chainStep = 0;
  let chainTimer = null;

  function renderChain() {
    const streamEl = document.getElementById("chain-stream");
    const probEl = document.getElementById("chain-probs");
    const verdictEl = document.getElementById("chain-verdict");
    const stepBadge = document.getElementById("chain-step-badge");
    if (!streamEl) return;

    const cfg = CHAIN_MODES[chainMode];
    const pills = cfg.seed.map((t) => `<span class="tok-pill seed">${t}</span>`);
    for (let i = 0; i < chainStep; i++) {
      const cls = chainMode === "good" ? "gen" : "gen-bad";
      pills.push(`<span class="tok-pill ${cls}">${cfg.steps[i].token}</span>`);
    }
    if (chainStep < cfg.steps.length) {
      pills.push(`<span class="tok-pill" style="background:#faf1df;color:#b07219;border:2px dashed #b07219;">f(x) → 预测中…</span>`);
    }
    streamEl.innerHTML = pills.join("");
    stepBadge.textContent = `当前上下文：${cfg.seed.length + chainStep} 片段（第 ${chainStep}/${cfg.steps.length} 步）`;

    const activeIdx = Math.min(chainStep, cfg.steps.length - 1);
    const cands = cfg.steps[activeIdx].cands;
    probEl.innerHTML = cands
      .map((c, idx) => {
        const col = idx === 0 ? (chainMode === "good" ? "#1b5e55" : "#c2412d") : "#9a9186";
        return `<div class="prob-row">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:${idx === 0 ? "#1d1b18" : "#6e665d"};">${c[0]}</div>
          <div class="prob-track"><div class="prob-fill" style="width:${c[1]}%;background:${col};"></div></div>
          <div style="font-family:var(--font-mono);text-align:right;color:${col};">${c[1]}%</div>
        </div>`;
      })
      .join("");

    if (chainStep >= cfg.steps.length) {
      verdictEl.textContent = cfg.verdict;
      verdictEl.style.background = chainMode === "good" ? "#e6f2f0" : "#fbebe8";
      verdictEl.style.color = chainMode === "good" ? "#10423b" : "#8f2a1b";
      verdictEl.style.borderColor = chainMode === "good" ? "#79bfb4" : "#e7a095";
    } else {
      verdictEl.textContent = "👆 点击上方红色按钮「单步预测 / 自动接龙」现场演示";
      verdictEl.style.background = "#efeae0";
      verdictEl.style.color = "#46413b";
      verdictEl.style.borderColor = "#d8cfc2";
    }

    document.querySelectorAll("[data-chain-mode]").forEach((b) => {
      b.classList.toggle("active-pill", b.getAttribute("data-chain-mode") === chainMode);
    });
  }

  function stopChainAuto() {
    if (chainTimer) { clearInterval(chainTimer); chainTimer = null; }
  }

  document.querySelectorAll("[data-chain-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      stopChainAuto();
      chainMode = btn.getAttribute("data-chain-mode");
      chainStep = 0;
      renderChain();
    });
  });

  const btnChainStep = document.getElementById("btn-chain-step");
  const btnChainAuto = document.getElementById("btn-chain-auto");
  const btnChainReset = document.getElementById("btn-chain-reset");
  if (btnChainStep) {
    btnChainStep.addEventListener("click", () => {
      stopChainAuto();
      const maxS = CHAIN_MODES[chainMode].steps.length;
      if (chainStep < maxS) chainStep += 1;
      renderChain();
    });
    btnChainAuto.addEventListener("click", () => {
      stopChainAuto();
      const maxS = CHAIN_MODES[chainMode].steps.length;
      if (chainStep >= maxS) chainStep = 0;
      renderChain();
      chainTimer = setInterval(() => {
        chainStep += 1;
        renderChain();
        if (chainStep >= maxS) stopChainAuto();
      }, 650);
    });
    btnChainReset.addEventListener("click", () => {
      stopChainAuto();
      chainStep = 0;
      renderChain();
    });
    renderChain();
  }

  // ---------- 9. Widget 2 (P10): /compact Simulator ----------
  const btnCompact = document.getElementById("btn-run-compact");
  const btnResetCompact = document.getElementById("btn-reset-compact");
  const segSys = document.getElementById("ctx-seg-sys");
  const segNoise = document.getElementById("ctx-seg-noise");
  const segCore = document.getElementById("ctx-seg-core");
  const ctxPctLabel = document.getElementById("ctx-pct-label");
  const compactLog = document.getElementById("compact-log");

  if (btnCompact) {
    btnCompact.addEventListener("click", () => {
      segSys.style.width = "10%";
      segNoise.style.width = "0%";
      segNoise.style.opacity = "0";
      segCore.style.width = "18%";
      segCore.textContent = "高密摘要 18%";
      ctxPctLabel.textContent = "上下文占用：20%（释放 72% 空间，精度重回巅峰）";
      ctxPctLabel.style.color = "#6ed4c1";
      compactLog.innerHTML =
        `<span class="t-prompt">&gt;</span> <span class="t-cmd">/compact</span><br>` +
        `<span class="t-ok">✓ 剥离 38 轮试错报错（-142,800 tokens）</span><br>` +
        `<span class="t-ok">✓ 仅留清洗规则与美学铁律（总占 20%）</span>`;
    });

    btnResetCompact.addEventListener("click", () => {
      segSys.style.width = "12%";
      segNoise.style.width = "62%";
      segNoise.style.opacity = "1";
      segCore.style.width = "18%";
      segCore.textContent = "核心 18%";
      ctxPctLabel.textContent = "上下文占用：92%（临近溢出，开始中段遗忘）";
      ctxPctLabel.style.color = "#ebc06d";
      compactLog.innerHTML =
        `<span class="t-warn">⚠ 警告：当前会话已累计 184,000 tokens（92%）</span><br>` +
        `<span class="t-dim">充斥历史报错、废弃代码、冗长中间表…</span><br>` +
        `<span class="t-prompt">&gt;</span> <span class="t-cmd">点击下方高亮按钮现场执行 /compact</span>`;
    });
  }

  // ---------- 10. Widget 3 (P25): Real Local MCP Top-5 + INLINE Matrix Code Runner ----------
  const MATCH_DATA = {
    omics: {
      items: [
        { rank: "#1", source: "顶刊美图社", name: "第094期 · Nature Aging 年龄/BMI 环形图", recipe: "tj_094_bmi_ring", img: "../assets/top_journal_clean/nature_aging_bmi_ring.png", cap: "顶刊美图社 第094期 · Nature Aging Age / BMI / 胰岛素敏感性多轨道环形图" },
        { rank: "#2", source: "PlotCase",   name: "20 器官极坐标差异蛋白高级火山图",     recipe: "pc_polar_volcano", img: "../assets/mcp_covers/plotcase_polar_protein_volcano.png", cap: "本机 PlotCase · 20 器官极坐标差异蛋白高级火山图" },
        { rank: "#3", source: "顶刊美图社", name: "第057期 · Nat. Commun. 多分组环状火山图", recipe: "tj_057_circ_volcano", img: "../assets/top_journal_clean/natcomm_circular_volcano.png", cap: "顶刊美图社 第057期 · Nature Communications 多分组环状火山图" },
        { rank: "#4", source: "PlotCase",   name: "全球高分辨率空间响应分布地图",        recipe: "pc_global_map", img: "../assets/mcp_covers/plotcase_global_map_warm.png", cap: "本机 PlotCase · 全球空间响应分布地图 (terra + ggplot2)" },
        { rank: "#5", source: "顶刊美图社", name: "第103期 · Science 免疫环状图谱",      recipe: "tj_103_science_circos", img: "../assets/top_journal_clean/science_2026_immune_circos.png", cap: "顶刊美图社 第103期 · Science (2026) 人体免疫细胞环状图谱" }
      ]
    },
    survival: {
      items: [
        { rank: "#1", source: "顶刊美图社", name: "第020期 · Nat. Med. 生存曲线 + 风险表", recipe: "tj_020_km", img: "../assets/top_journal_clean/natmed_km_risktable.png", cap: "顶刊美图社 第020期 · Nature Medicine 生存曲线 + 风险表" },
        { rank: "#2", source: "顶刊美图社", name: "第036期 · NEJM 亚组 Cox 森林图",       recipe: "tj_036_forest", img: "../assets/top_journal_clean/nejm_cox_forest.png", cap: "顶刊美图社 第036期 · NEJM 亚组 Cox 森林图" },
        { rank: "#3", source: "顶刊美图社", name: "第053期 · Nature 免疫治疗 8-Panel 组图", recipe: "tj_053_swimmer", img: "../assets/top_journal_clean/nature_2025_immunotherapy_multipanel.png", cap: "顶刊美图社 第053期 · Nature (2025) 肿瘤免疫治疗泳道 + 生存 + 瀑布组图" },
        { rank: "#4", source: "顶刊美图社", name: "第051期 · Nature 肺腺癌单细胞星云图",  recipe: "tj_051_luad_galaxy", img: "../assets/top_journal_clean/nature_2024_luad_galaxy.png", cap: "顶刊美图社 第051期 · Nature (2024) 肺腺癌单细胞星云密度图" },
        { rank: "#5", source: "PlotCase",   name: "多轨道基因组热图与靶点弦图 (EGFR)",  recipe: "pc_circos_genome", img: "../assets/mcp_covers/plotcase_circos_genome.png", cap: "本机 PlotCase · 多轨道基因组热图与弦图 (EGFR/MET/CD274)" }
      ]
    }
  };

  let currentMcpRecipe = "tj_094_bmi_ring";
  const mcpInlineLayer = document.getElementById("mcp-matrix-layer");
  const mcpInlineStream = document.getElementById("mcp-matrix-stream");
  const mcpInlineStatus = document.getElementById("mcp-matrix-status");
  const mcpInlineFill = document.getElementById("mcp-matrix-fill");
  const mcpPreviewImg = document.getElementById("mcp-preview-img");
  const mcpPreviewCap = document.getElementById("mcp-preview-cap");

  function runMcpInline(recipeKey, targetImg, targetCap) {
    const rec = CODE_RUN_RECIPES[recipeKey];
    if (!rec || !mcpInlineLayer) return;
    if (inlineTimer) { clearInterval(inlineTimer); inlineTimer = null; }

    mcpInlineLayer.classList.add("active");
    mcpInlineStream.innerHTML = "";
    mcpInlineFill.style.width = "0%";
    mcpInlineStatus.textContent = "$ Rscript 启动真实绘图代码…";
    mcpPreviewImg.classList.remove("fig-just-rendered");

    let idx = 0;
    const totalL = rec.lines.length;
    const stepMs = Math.max(60, Math.min(105, Math.floor(1650 / totalL)));

    inlineTimer = setInterval(() => {
      if (idx < totalL) {
        const div = document.createElement("div");
        div.innerHTML = highlightRLine(rec.lines[idx]);
        mcpInlineStream.appendChild(div);
        mcpInlineStream.scrollTop = mcpInlineStream.scrollHeight;
        idx += 1;

        const pct = Math.round((idx / totalL) * 100);
        mcpInlineFill.style.width = `${pct}%`;
        mcpInlineStatus.textContent = pct < 100
          ? `⚡ 正在运行真实 R 代码渲染顶刊图… ${pct}%`
          : `✓ 渲染完成 (300 DPI) · 正在输出成图！`;
      } else {
        clearInterval(inlineTimer);
        inlineTimer = null;
        setTimeout(() => {
          mcpPreviewImg.src = targetImg || rec.img;
          mcpPreviewCap.textContent = targetCap || rec.badge;
          mcpInlineLayer.classList.remove("active");
          mcpPreviewImg.classList.add("fig-just-rendered");
        }, 260);
      }
    }, stepMs);
  }

  function renderTop5(mode, autoRunFirst) {
    const d = MATCH_DATA[mode];
    const listEl = document.getElementById("mcp-top5-list");
    if (!listEl || !d) return;

    const first = d.items[0];
    currentMcpRecipe = first.recipe;
    if (autoRunFirst) {
      runMcpInline(first.recipe, first.img, first.cap);
    } else if (mcpPreviewImg) {
      if (inlineTimer) { clearInterval(inlineTimer); inlineTimer = null; }
      mcpInlineLayer?.classList.remove("active");
      mcpPreviewImg.src = first.img;
      mcpPreviewCap.textContent = first.cap;
    }

    listEl.innerHTML = d.items
      .map(
        (it, idx) => `
      <div class="mcp-row" data-recipe="${it.recipe}" data-img="${it.img}" data-cap="${it.cap}" style="cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 15px;border-radius:12px;background:${idx === 0 ? "#e6f2f0" : "#ffffff"};border:2px solid ${idx === 0 ? "#1b5e55" : "#e2dad0"};transition:background-color 0.15s ease,border-color 0.15s ease;">
        <div style="display:flex;align-items:center;gap:10px;min-width:0;">
          <span style="font-family:var(--font-mono);font-weight:900;font-size:22px;color:${idx === 0 ? "#1b5e55" : "#b07219"};flex-shrink:0;">${it.rank}</span>
          <div style="font-weight:800;font-size:22px;color:#1d1b18;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${it.name}</div>
        </div>
        <span class="tag ${it.source === "PlotCase" ? "ochre" : ""}" style="flex-shrink:0;">${it.source}</span>
      </div>`
      )
      .join("");

    listEl.querySelectorAll(".mcp-row").forEach((row) => {
      row.addEventListener("click", () => {
        const rk = row.getAttribute("data-recipe");
        const im = row.getAttribute("data-img");
        const cp = row.getAttribute("data-cap");
        currentMcpRecipe = rk;
        listEl.querySelectorAll(".mcp-row").forEach((r) => {
          r.style.background = "#ffffff";
          r.style.borderColor = "#e2dad0";
        });
        row.style.background = "#e6f2f0";
        row.style.borderColor = "#1b5e55";
        runMcpInline(rk, im, cp);
      });
    });

    document.querySelectorAll("[data-mcp]").forEach((b) => {
      b.classList.toggle("active-pill", b.getAttribute("data-mcp") === mode);
    });
  }

  document.querySelectorAll("[data-mcp]").forEach((btn) => {
    btn.addEventListener("click", () => renderTop5(btn.getAttribute("data-mcp"), true));
  });
  document.getElementById("btn-mcp-run-now")?.addEventListener("click", () => {
    runMcpInline(currentMcpRecipe);
  });
  document.getElementById("btn-mcp-theatre")?.addEventListener("click", () => {
    runMatrixModal(currentMcpRecipe);
  });
  renderTop5("omics", false);

  // ---------- 11. Widget 4 (P26): Live CNS Palette Studio ----------
  const PALETTES = {
    rainbow: {
      name: "彩虹色 Rainbow ❌",
      desc: "亮度突变造假边界 · 色盲难辨",
      colors: ["#FF0000", "#FF9900", "#FFFF00", "#00FF00", "#00FFFF", "#0000FF"],
      badgeClass: "red"
    },
    npg: {
      name: "Nature (NPG 语义色)",
      desc: "克制低刺眼 · 红蓝焦点分明",
      colors: ["#E64B35", "#4DBBD5", "#00A087", "#3C5488", "#F39B7F", "#8491B4"],
      badgeClass: ""
    },
    lancet: {
      name: "The Lancet 肿瘤风",
      desc: "沉稳深蓝砖红 · 适配临床队列",
      colors: ["#00468B", "#ED0000", "#42B540", "#0099B4", "#925E9F", "#AD002A"],
      badgeClass: ""
    },
    nejm: {
      name: "NEJM 医学杂志风",
      desc: "极高印刷辨识 · 冷暖平衡",
      colors: ["#BC3C29", "#0072B5", "#E18727", "#20854E", "#7876B1", "#6F99AD"],
      badgeClass: ""
    },
    viridis: {
      name: "Viridis 连续色金标",
      desc: "严格感知均匀 · 色盲 100% 友好",
      colors: ["#440154", "#414487", "#2A788E", "#22A884", "#7AD151", "#FDE725"],
      badgeClass: ""
    },
    metbrewer: {
      name: "MetBrewer · 葛饰北斋名画",
      desc: "大都会博物馆名画取色 · 色盲安全",
      colors: ["#6D2F20", "#B75347", "#DF7E66", "#EDC775", "#94B594", "#224B5E"],
      badgeClass: "ochre"
    }
  };

  const HEAT_DATA = [
    [0, 1, 1, 2, 3, 4, 5, 5],
    [0, 0, 1, 2, 3, 4, 4, 5],
    [1, 1, 2, 2, 3, 3, 4, 4],
    [2, 2, 2, 3, 3, 2, 2, 1],
    [4, 4, 3, 2, 1, 1, 0, 0],
    [5, 5, 4, 3, 2, 1, 0, 0]
  ];
  const BAR_VALUES = [78, 64, 53, 86, 42, 69];
  const BAR_LABELS = ["KRAS", "EGFR", "TP53", "MET", "ALK", "STK11"];

  function renderPaletteDemo(key) {
    const pal = PALETTES[key];
    if (!pal) return;
    const titleEl = document.getElementById("pal-active-name");
    const descEl = document.getElementById("pal-active-desc");
    const stripEl = document.getElementById("pal-swatches");
    const svgEl = document.getElementById("pal-live-svg");
    if (!svgEl) return;

    titleEl.textContent = pal.name;
    titleEl.className = `tag ${pal.badgeClass}`;
    descEl.textContent = pal.desc;

    stripEl.innerHTML = pal.colors
      .map((c) => `<div class="swatch-chip" style="background:${c}" title="${c}"></div>`)
      .join("");

    let cells = "";
    const cellW = 36, cellH = 29, gap = 3;
    HEAT_DATA.forEach((row, r) => {
      row.forEach((v, c) => {
        const x = 14 + c * (cellW + gap);
        const y = 38 + r * (cellH + gap);
        cells += `<rect x="${x}" y="${y}" width="${cellW}" height="${cellH}" rx="4" fill="${pal.colors[v]}" />`;
      });
    });

    let bars = "";
    BAR_VALUES.forEach((val, i) => {
      const bw = 36;
      const x = 356 + i * 47;
      const h = (val / 100) * 155;
      const y = 212 - h;
      bars += `<rect x="${x}" y="${y}" width="${bw}" height="${h}" rx="5" fill="${pal.colors[i]}" opacity="0.93" />`;
      bars += `<text x="${x + bw / 2}" y="${y - 6}" text-anchor="middle" font-size="16" font-weight="800" fill="#1d1b18">${val}%</text>`;
      bars += `<text x="${x + bw / 2}" y="236" text-anchor="middle" font-size="15" font-weight="800" fill="#46413b">${BAR_LABELS[i]}</text>`;
    });

    svgEl.innerHTML = `
      <text x="14" y="24" font-size="18" font-weight="800" fill="#1d1b18">连续表达热图</text>
      ${cells}
      <text x="356" y="24" font-size="18" font-weight="800" fill="#1d1b18">驱动基因检出率</text>
      <line x1="348" y1="212" x2="640" y2="212" stroke="#6e665d" stroke-width="1.6" />
      ${bars}
    `;

    document.querySelectorAll("[data-pal]").forEach((b) => {
      b.classList.toggle("active-pill", b.getAttribute("data-pal") === key);
    });
  }

  document.querySelectorAll("[data-pal]").forEach((btn) => {
    btn.addEventListener("click", () => renderPaletteDemo(btn.getAttribute("data-pal")));
  });

  const cbToggle = document.getElementById("btn-cb-toggle");
  const palVisualBox = document.getElementById("pal-visual-box");
  if (cbToggle && palVisualBox) {
    cbToggle.addEventListener("click", () => {
      const on = palVisualBox.classList.toggle("cb-simulated");
      cbToggle.classList.toggle("terracotta", on);
      cbToggle.textContent = on ? "👁 色盲视角已开（点此恢复）" : "👁 模拟红绿色盲";
    });
  }
  renderPaletteDemo("rainbow");

  // ---------- 12. Widget 5 (P11): Subagent Isolation & Cloud GPU KV Cache Animator ----------
  let saMode = "good";
  let saTimers = [];

  function clearSaTimers() {
    saTimers.forEach((t) => clearTimeout(t));
    saTimers = [];
  }

  function resetSubagentUI() {
    clearSaTimers();
    const baseSeg = document.getElementById("kv-seg-base");
    const retSeg = document.getElementById("kv-seg-ret");
    const track = document.getElementById("kv-meter-track");
    const pctLabel = document.getElementById("kv-pct-label");
    const bus = document.getElementById("sa-bus-row");
    const verdict = document.getElementById("sa-verdict-box");
    if (!baseSeg) return;

    track.classList.remove("overflow");
    baseSeg.style.width = "38%";
    baseSeg.textContent = "主窗核心 38%";
    retSeg.style.width = "0%";
    retSeg.textContent = "";
    retSeg.style.background = "#1b5e55";
    pctLabel.textContent = "主代理云端 KV Cache：38%（健康）";
    pctLabel.style.color = "#6ed4c1";
    bus.innerHTML = "<span>↓ 待派发</span><span>↓ 待派发</span><span>↓ 待派发</span>";

    [1, 2, 3].forEach((n) => {
      const card = document.getElementById(`sa-w-${n}`);
      const fill = document.getElementById(`sa-fill-${n}`);
      const stat = document.getElementById(`sa-stat-${n}`);
      card.classList.remove("running", "done-good", "done-bad");
      fill.style.width = "0%";
      stat.textContent = "独立纯净上下文 · 待命";
      stat.style.color = "#b8afa4";
    });

    verdict.style.borderColor = "#352f29";
    verdict.style.color = "#ebc06d";
    verdict.textContent = saMode === "good"
      ? "👆 点击「⚡ 运行协同演示」：观察子代理独立隔离 + 仅回传精炼摘要"
      : "👆 点击「⚡ 运行协同演示」：观察子代理吐出超长原文 → 瞬间挤爆主窗与 KV Cache！";

    document.querySelectorAll("[data-sa-mode]").forEach((b) => {
      b.classList.toggle("active-pill", b.getAttribute("data-sa-mode") === saMode);
    });
  }

  function runSubagentDemo() {
    resetSubagentUI();
    const baseSeg = document.getElementById("kv-seg-base");
    const retSeg = document.getElementById("kv-seg-ret");
    const track = document.getElementById("kv-meter-track");
    const pctLabel = document.getElementById("kv-pct-label");
    const bus = document.getElementById("sa-bus-row");
    const verdict = document.getElementById("sa-verdict-box");
    if (!baseSeg) return;

    // Step 1: Parallel dispatch
    bus.innerHTML = `<span style="color:#ebc06d;">⬇ 并行派发</span><span style="color:#ebc06d;">⬇ 并行派发</span><span style="color:#ebc06d;">⬇ 并行派发</span>`;
    verdict.textContent = "⏳ [1/3] 主代理并行派出 3 个子代理（任务弱依赖，各享 100% 独立干净上下文）…";

    [1, 2, 3].forEach((n, idx) => {
      saTimers.push(setTimeout(() => {
        const card = document.getElementById(`sa-w-${n}`);
        const fill = document.getElementById(`sa-fill-${n}`);
        const stat = document.getElementById(`sa-stat-${n}`);
        card.classList.add("running");
        fill.style.width = "100%";
        stat.textContent = n === 1 ? "独立检索 20 篇 PMID…" : n === 2 ? "独立运行 R 渲染出图…" : "独立提取指南数据…";
        stat.style.color = "#6ed4c1";
      }, 220 + idx * 180));
    });

    // Step 2: Return packets
    saTimers.push(setTimeout(() => {
      if (saMode === "good") {
        bus.innerHTML = `<span style="color:#34d399;">⬆ +4% 摘要</span><span style="color:#34d399;">⬆ +4% 路径</span><span style="color:#34d399;">⬆ +4% 结论</span>`;
        [1, 2, 3].forEach((n) => {
          const card = document.getElementById(`sa-w-${n}`);
          const stat = document.getElementById(`sa-stat-${n}`);
          card.classList.remove("running");
          card.classList.add("done-good");
          stat.textContent = "✓ 仅回传 150 字结构化摘要";
          stat.style.color = "#34d399";
        });
        retSeg.style.background = "#1b5e55";
        retSeg.style.width = "14%";
        retSeg.textContent = "摘要 +14%";
        pctLabel.textContent = "主代理云端 KV Cache：52%（绿色安全 · 零污染！）";
        pctLabel.style.color = "#34d399";
        verdict.style.borderColor = "#34d399";
        verdict.style.color = "#6ee7b7";
        verdict.textContent = "✅ 最佳实践：子代理吸收 90% 脏数据，主代理仅收极简摘要 → 高质量 + 零爆炸！";
      } else {
        bus.innerHTML = `<span style="color:#f28b78;">⬆ +35k 全文!</span><span style="color:#f28b78;">⬆ +28k 日志!</span><span style="color:#f28b78;">⬆ +42k PDF!</span>`;
        [1, 2, 3].forEach((n) => {
          const card = document.getElementById(`sa-w-${n}`);
          const stat = document.getElementById(`sa-stat-${n}`);
          card.classList.remove("running");
          card.classList.add("done-bad");
          stat.textContent = "✗ 原样吐回超长原始文本！";
          stat.style.color = "#f28b78";
        });
        retSeg.style.background = "#c2412d";
        retSeg.style.width = "62%";
        retSeg.textContent = "长输出回灌 💥 挤爆 100%!";
        track.classList.add("overflow");
        pctLabel.textContent = "💥 主代理云端 KV Cache 挤爆（>100% 溢出截断！）";
        pctLabel.style.color = "#f28b78";
        verdict.style.borderColor = "#f28b78";
        verdict.style.color = "#fca5a5";
        verdict.textContent = "💥 致命隐患：云端厂商 GPU 显存 KV Cache ≠ 本地内存（无法借 SSD 扩容），一旦挤爆即触发重算/截断/暴降！";
      }
    }, 1350));
  }

  document.querySelectorAll("[data-sa-mode]").forEach((btn) => {
    btn.addEventListener("click", () => {
      saMode = btn.getAttribute("data-sa-mode");
      runSubagentDemo();
    });
  });
  document.getElementById("btn-sa-run")?.addEventListener("click", runSubagentDemo);
  document.getElementById("btn-sa-reset")?.addEventListener("click", resetSubagentUI);
  resetSubagentUI();

  // ---------- 13. Widget 6 (P13): Local Oncology RAG Rolling Retrieval Simulator ----------
  const RAG_CASES = {
    nsclc: {
      query: "对比 KRAS G12C 脑转移颅内 ORR 与 mPFS，标明原文出处。",
      chunks: [
        "$ local-rag query --db oncology_428pdfs.chroma --top-k 3",
        "[1/4] 本地 BGE-M3 向量化提问 (1024-dim · 0.04s · 隐私不出本机)",
        "[2/4] 扫描本机 428 篇指南与 RCT 文献 (38,420 Markdown 切片)…",
        "      hit #1  cos=0.94  CodeBreaK_200_Lancet_2023.md   [p.4 §CNS]",
        "      hit #2  cos=0.92  KRYSTAL-1_JCO_2023.md          [p.7 §IC-ORR]",
        "      hit #3  cos=0.89  NCCN_NSCLC_2026_v3.md          [p.52 §KRAS]",
        "[3/4] Cross-Encoder 重排精筛 → 仅截取 Top-3 片段 (3,200 tokens)",
        "[4/4] 强制溯源约束：库外数值一律拒答 → 生成零幻觉结论…",
        "✓ [0.18s] 校验通过：0 编造文献 · 0 虚构数值 · 100% 原文可查！"
      ],
      hitsSummary: "召回 Top-3：CodeBreaK 200 (0.94) · KRYSTAL-1 (0.92) · NCCN (0.89)",
      tokensBadge: "3,200 tok (省97%) · 0 幻觉",
      points: [
        '1. <strong>Adagrasib</strong> 颅内 ORR <strong>42%</strong>，颅内 mPFS <strong>5.4 个月</strong> <span class="rag-cite-pill">[KRYSTAL-1 · p.7]</span>',
        '2. <strong>Sotorasib</strong> 显著延迟 CNS 进展（15.8m vs 10.5m） <span class="rag-cite-pill">[CodeBreaK 200 · p.4]</span>',
        '3. 指南建议基线脑 MRI 评估并标注证据等级 <span class="rag-cite-pill">[NCCN NSCLC · p.52]</span>'
      ]
    },
    breast: {
      query: "HER2-low 晚期乳腺癌 T-DXd 对比化疗的 mPFS 与 mOS 证据？",
      chunks: [
        "$ local-rag query --db oncology_428pdfs.chroma --top-k 3",
        "[1/4] 本地 BGE-M3 向量化提问 (1024-dim · 0.03s · 隐私不出本机)",
        "[2/4] 扫描本机乳腺癌专病库 (146 篇 PDF · 12,910 切片)…",
        "      hit #1  cos=0.96  DESTINY-Breast04_NEJM_2022.md  [p.6 §Table2]",
        "      hit #2  cos=0.93  DESTINY-Breast06_NEJM_2024.md  [p.5 §HR+]",
        "      hit #3  cos=0.90  CSCO_BC_2026_Guidelines.md     [p.88 §ADC]",
        "[3/4] Cross-Encoder 重排精筛 → 仅截取 Top-3 片段 (2,950 tokens)",
        "[4/4] 强制溯源约束：逐项核对 HR 与 P 值 → 生成零幻觉结论…",
        "✓ [0.16s] 校验通过：0 编造文献 · 0 虚构数值 · 100% 原文可查！"
      ],
      hitsSummary: "召回 Top-3：DESTINY-Breast04 (0.96) · DB-06 (0.93) · CSCO (0.90)",
      tokensBadge: "2,950 tok (省98%) · 0 幻觉",
      points: [
        '1. 全人群 <strong>mPFS 9.9m vs 5.1m</strong>（HR 0.50, P&lt;0.001） <span class="rag-cite-pill">[DB-04 NEJM · p.6]</span>',
        '2. 全人群 <strong>mOS 23.4m vs 16.8m</strong>（HR 0.64, P=0.001） <span class="rag-cite-pill">[DB-04 NEJM · p.6]</span>',
        '3. 需严密监测间质性肺病（ILD）分级处理 <span class="rag-cite-pill">[CSCO BC · p.88]</span>'
      ]
    },
    hcc: {
      query: "晚期肝癌一线靶免联合：IMbrave150 与 HIMALAYA 核心生存数据？",
      chunks: [
        "$ local-rag query --db oncology_428pdfs.chroma --top-k 3",
        "[1/4] 本地 BGE-M3 向量化提问 (1024-dim · 0.04s · 隐私不出本机)",
        "[2/4] 扫描本机肝癌专病库 (112 篇 PDF · 9,840 切片)…",
        "      hit #1  cos=0.95  IMbrave150_NEJM_JHepatol.md    [p.5 §OS]",
        "      hit #2  cos=0.93  HIMALAYA_NEJM_Evid_2022.md     [p.8 §STRIDE]",
        "      hit #3  cos=0.91  CNLC_HCC_2024_Consensus.md     [p.34 §1L]",
        "[3/4] Cross-Encoder 重排精筛 → 仅截取 Top-3 片段 (3,080 tokens)",
        "[4/4] 强制溯源约束：自动分离两项试验基线差异 → 生成零幻觉结论…",
        "✓ [0.17s] 校验通过：0 编造文献 · 0 虚构数值 · 100% 原文可查！"
      ],
      hitsSummary: "召回 Top-3：IMbrave150 (0.95) · HIMALAYA (0.93) · CNLC (0.91)",
      tokensBadge: "3,080 tok (省97%) · 0 幻觉",
      points: [
        '1. <strong>T+A 方案</strong>更新 mOS <strong>19.2m vs 13.4m</strong>（HR 0.66） <span class="rag-cite-pill">[IMbrave150 · p.5]</span>',
        '2. <strong>STRIDE 双免</strong> mOS <strong>16.4m vs 13.8m</strong>（4年OS 25.2%） <span class="rag-cite-pill">[HIMALAYA · p.8]</span>',
        '3. 伴食管胃底静脉曲张高危出血优先考量非抗血管方案 <span class="rag-cite-pill">[CNLC · p.34]</span>'
      ]
    }
  };

  let activeRagKey = "nsclc";
  let ragTimer = null;

  function populateRagResult(key) {
    const c = RAG_CASES[key];
    if (!c) return;
    const qEl = document.getElementById("rag-query-display");
    const hitEl = document.getElementById("rag-hits-display");
    const ansEl = document.getElementById("rag-answer-list");
    const tokEl = document.getElementById("rag-tokens-badge");
    if (!qEl) return;
    qEl.textContent = c.query;
    hitEl.textContent = c.hitsSummary;
    tokEl.textContent = c.tokensBadge;
    ansEl.innerHTML = c.points.map((p) => `<div style="margin-bottom:6px;">${p}</div>`).join("");
    document.querySelectorAll("[data-rag-case]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-rag-case") === key);
    });
  }

  function runRagRoll(key) {
    const c = RAG_CASES[key];
    const overlay = document.getElementById("rag-rolling-overlay");
    const stream = document.getElementById("rag-rolling-stream");
    const fill = document.getElementById("rag-bar-fill");
    const status = document.getElementById("rag-roll-status");
    const resultCard = document.getElementById("rag-result-card");
    if (!c || !overlay) return;

    activeRagKey = key;
    if (ragTimer) { clearInterval(ragTimer); ragTimer = null; }
    document.querySelectorAll("[data-rag-case]").forEach((b) => {
      b.classList.toggle("active", b.getAttribute("data-rag-case") === key);
    });

    overlay.classList.add("active");
    stream.innerHTML = "";
    fill.style.width = "0%";
    status.textContent = "⚡ 正在本地向量库高速检索与重排…";
    resultCard.classList.remove("fig-just-rendered");

    let idx = 0;
    const totalL = c.chunks.length;
    ragTimer = setInterval(() => {
      if (idx < totalL) {
        const div = document.createElement("div");
        div.innerHTML = highlightRLine(c.chunks[idx]);
        stream.appendChild(div);
        stream.scrollTop = stream.scrollHeight;
        idx += 1;
        const pct = Math.round((idx / totalL) * 100);
        fill.style.width = `${pct}%`;
        status.textContent = pct < 100
          ? `⚡ 本机 RAG 检索切片并核验页码… ${pct}%`
          : `✓ 溯源校验完成 · 零幻觉输出！`;
      } else {
        clearInterval(ragTimer);
        ragTimer = null;
        setTimeout(() => {
          populateRagResult(key);
          overlay.classList.remove("active");
          resultCard.classList.add("fig-just-rendered");
        }, 280);
      }
    }, 190);
  }

  document.querySelectorAll("[data-rag-case]").forEach((btn) => {
    btn.addEventListener("click", () => runRagRoll(btn.getAttribute("data-rag-case")));
  });
  document.getElementById("btn-rag-run")?.addEventListener("click", () => runRagRoll(activeRagKey));
  populateRagResult("nsclc");
})();
