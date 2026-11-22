# ==============================================================================
# 09_riemann_zeta_and_primes.R
# Mathematically exact editorial figures for Slide P02 (Riemann Hypothesis):
#   15_prime_distribution.png        — Prime-counting staircase pi(x) vs Li(x)
#                                      + irregular prime barcode
#   16_riemann_zeta_critical_line.png — Critical strip |zeta(sigma + i*t)|
#                                      contour landscape + aligned Re(s)=1/2 wave
# Zero external math packages required (pure R Euler-Maclaurin zeta(s)).
# ==============================================================================

source(if (file.exists("code/r/00_theme_pub.R")) "code/r/00_theme_pub.R" else "00_theme_pub.R")

suppressPackageStartupMessages({
  library(patchwork)
})

# Warm Museum Editorial Palette (matches slides/styles.css)
ED_PAPER <- "#FAF7F2"
ED_CARD  <- "#FFFFFF"
ED_INK1  <- "#1D1B18"
ED_INK2  <- "#46413B"
ED_GRID  <- "#EAE3D7"
ED_PINE  <- "#1B5E55"
ED_PINE_LIGHT <- "#E6F2F0"
ED_RED   <- "#C2412D"
ED_OCHRE <- "#B07219"

# ------------------------------------------------------------------------------
# 1. Exact Euler-Maclaurin complex Riemann zeta(s) (15-digit accuracy for t<=50)
# ------------------------------------------------------------------------------
BERNOULLI_EVEN <- c(
  1 / 6,
  -1 / 30,
  1 / 42,
  -1 / 30,
  5 / 66,
  -691 / 2730,
  7 / 6,
  -3617 / 510,
  43867 / 798
)

riemann_zeta_vec <- function(s, N = 32L, M = 9L) {
  # Vectorized over complex vector s (s != 1)
  res <- complex(length(s))
  for (k in seq_len(N - 1L)) {
    res <- res + k^(-s)
  }
  res <- res + (N^(1 - s)) / (s - 1) + 0.5 * (N^(-s))

  # Euler-Maclaurin correction terms
  prod_term <- s
  for (m in seq_len(M)) {
    if (m > 1L) {
      prod_term <- prod_term * (s + 2L * m - 3L) * (s + 2L * m - 2L)
    }
    coeff <- BERNOULLI_EVEN[m] / factorial(2L * m)
    res <- res + coeff * prod_term * (N^(-(s + 2L * m - 1L)))
  }
  res
}

# Quick self-check on first 5 known non-trivial zeros
ZEROS_T <- c(14.13472514, 21.02203964, 25.01085758, 30.42487613, 32.93506159)
zero_err <- max(Mod(riemann_zeta_vec(complex(real = 0.5, imaginary = ZEROS_T))))
message(sprintf("Euler-Maclaurin max |zeta(1/2 + i*t_k)| on first 5 zeros: %.2e", zero_err))

# ------------------------------------------------------------------------------
# 2. Plate 15: Prime Distribution pi(x) vs Li(x) + Prime Barcode
# ------------------------------------------------------------------------------
is_prime_vec <- function(n_max) {
  sieve <- rep(TRUE, n_max)
  sieve[1] <- FALSE
  for (p in 2:floor(sqrt(n_max))) {
    if (sieve[p]) {
      sieve[seq(p * p, n_max, by = p)] <- FALSE
    }
  }
  which(sieve)
}

X_MAX <- 120L
primes <- is_prime_vec(X_MAX)

# Logarithmic integral Li(x) = integral_2^x dt/ln(t)
li_exact <- function(x) {
  sapply(x, function(u) {
    if (u <= 2) return(0)
    integrate(function(t) 1 / log(t), lower = 2, upper = u, rel.tol = 1e-10)$value
  })
}

df_step <- data.frame(
  x = 1:X_MAX,
  pi_x = sapply(1:X_MAX, function(u) sum(primes <= u))
)

x_smooth <- seq(2.05, X_MAX, length.out = 300)
df_li <- data.frame(
  x = x_smooth,
  li_x = li_exact(x_smooth)
)

df_primes <- data.frame(
  p = primes,
  is_twin = primes %in% c(primes[diff(c(primes, 999)) == 2],
                          primes[c(FALSE, diff(primes) == 2)])
)

p_top <- ggplot() +
  geom_area(data = df_step, aes(x = x, y = pi_x), fill = ED_PINE, alpha = 0.10) +
  geom_step(data = df_step, aes(x = x, y = pi_x), color = ED_PINE, linewidth = 1.25) +
  geom_line(data = df_li, aes(x = x, y = li_x), color = ED_RED, linewidth = 1.15, linetype = "22") +
  annotate("label", x = 36, y = 26.8, label = "Li(x) 平滑渐近定律",
           color = ED_RED, fill = ED_PAPER, linewidth = 0.45, fontface = "bold",
           family = PUB_FONT, size = 4.3, hjust = 0) +
  annotate("segment", x = 59, xend = 67, y = 25.0, yend = 21.8,
           color = ED_RED, linewidth = 0.65,
           arrow = arrow(length = unit(0.14, "cm"), type = "closed")) +
  annotate("label", x = 68, y = 10.5, label = "π(x) 真实质数阶梯",
           color = ED_PINE, fill = ED_PAPER, linewidth = 0.45, fontface = "bold",
           family = PUB_FONT, size = 4.3, hjust = 0) +
  annotate("segment", x = 86, xend = 77, y = 13.0, yend = 20.6,
           color = ED_PINE, linewidth = 0.65,
           arrow = arrow(length = unit(0.14, "cm"), type = "closed")) +
  scale_x_continuous(limits = c(1, X_MAX), breaks = c(2, 30, 60, 90, 120), expand = c(0.01, 0)) +
  scale_y_continuous(limits = c(0, 35), breaks = c(0, 10, 20, 30), expand = c(0.02, 0)) +
  labs(x = NULL, y = "质数个数 π(x)") +
  theme_minimal(base_size = 12, base_family = PUB_FONT) +
  theme(
    plot.background   = element_rect(fill = ED_PAPER, color = NA),
    panel.background  = element_rect(fill = ED_PAPER, color = NA),
    panel.grid.major  = element_line(color = ED_GRID, linewidth = 0.4),
    panel.grid.minor  = element_blank(),
    axis.line         = element_line(color = ED_INK2, linewidth = 0.5),
    axis.text.x       = element_blank(),
    axis.text.y       = element_text(color = ED_INK2, size = 10.5, face = "bold"),
    axis.title.y      = element_text(color = ED_INK1, size = 11.5, face = "bold", margin = margin(r = 6)),
    plot.margin       = margin(6, 10, 2, 8)
  )

p_bar <- ggplot(df_primes) +
  geom_hline(yintercept = 0.5, color = "#D8CFC0", linewidth = 0.5) +
  geom_segment(aes(x = p, xend = p, y = 0.14, yend = 0.86,
                   color = ifelse(is_twin, "twin", "single")),
               linewidth = 1.35, show.legend = FALSE) +
  scale_color_manual(values = c(twin = ED_OCHRE, single = ED_PINE)) +
  annotate("text", x = 2, y = 1.07, label = "2  3  5  7  11  13  17  19  23  29 ...",
           color = ED_INK2, fontface = "bold", family = PUB_FONT, size = 3.4, hjust = 0) +
  annotate("text", x = 120, y = 1.07, label = "局部看似随机散落",
           color = ED_OCHRE, fontface = "bold", family = PUB_FONT, size = 3.5, hjust = 1) +
  scale_x_continuous(limits = c(1, X_MAX), breaks = c(2, 30, 60, 90, 120), expand = c(0.01, 0)) +
  scale_y_continuous(limits = c(0, 1.28), expand = c(0, 0)) +
  labs(x = "自然数 x（1 → 120，橙金标出孪生质数）", y = NULL) +
  theme_minimal(base_size = 11, base_family = PUB_FONT) +
  theme(
    plot.background   = element_rect(fill = ED_PAPER, color = NA),
    panel.background  = element_rect(fill = ED_PAPER, color = NA),
    panel.grid        = element_blank(),
    axis.line.x       = element_line(color = ED_INK2, linewidth = 0.5),
    axis.text.y       = element_blank(),
    axis.text.x       = element_text(color = ED_INK2, size = 10.5, face = "bold"),
    axis.title.x      = element_text(color = ED_INK1, size = 11, face = "bold", margin = margin(t = 4)),
    plot.margin       = margin(0, 10, 6, 8)
  )

fig_primes <- (p_top / p_bar) +
  plot_layout(heights = c(2.65, 1.0)) &
  theme(plot.background = element_rect(fill = ED_PAPER, color = NA))

save_pub_figure(fig_primes, "15_prime_distribution", width = 6.2, height = 3.45, dpi = 300)

# ------------------------------------------------------------------------------
# 3. Plate 16: Riemann Zeta |zeta(sigma + i*t)| Landscape + Critical Line Wave
# ------------------------------------------------------------------------------
T_MIN <- 9
T_MAX <- 36

sig_seq <- seq(0.0, 1.0, length.out = 101)
t_seq   <- seq(T_MIN, T_MAX, length.out = 190)
grid_df <- expand.grid(sigma = sig_seq, t = t_seq)
grid_df$z_mod <- Mod(riemann_zeta_vec(complex(real = grid_df$sigma, imaginary = grid_df$t)))
grid_df$z_vis <- log1p(pmin(grid_df$z_mod, 6))

df_zeros <- data.frame(
  sigma = 0.5,
  t = ZEROS_T,
  lbl = sprintf("t=%.2f", ZEROS_T)
)

# Left panel: Critical strip contour landscape
p_strip <- ggplot(grid_df, aes(x = sigma, y = t)) +
  geom_raster(aes(fill = z_vis), interpolate = TRUE) +
  geom_contour(aes(z = z_vis), color = "#1D1B18", alpha = 0.24, linewidth = 0.32, bins = 11) +
  geom_vline(xintercept = 0.5, color = ED_RED, linewidth = 1.15, linetype = "dashed") +
  geom_point(data = df_zeros, aes(x = sigma, y = t),
             shape = 21, size = 3.8, fill = "#FAF7F2", color = ED_RED, stroke = 1.5) +
  annotate("label", x = 0.54, y = 10.9, label = "Re(s) = 1/2\n临界线",
           color = ED_RED, fill = "#FAF7F2", alpha = 0.94, linewidth = 0.4,
           fontface = "bold", family = PUB_FONT, size = 3.6, hjust = 0, lineheight = 0.95) +
  scale_fill_gradientn(
    colours = c("#123F39", "#1B5E55", "#4E9A8E", "#D8C69C", "#F6EFE2", "#FFFDF8"),
    values  = c(0, 0.14, 0.34, 0.58, 0.80, 1.0),
    guide   = "none"
  ) +
  scale_x_continuous(breaks = c(0.03, 0.5, 0.97), labels = c("0", "1/2", "1"), expand = c(0, 0)) +
  scale_y_continuous(limits = c(T_MIN, T_MAX), breaks = c(10, 15, 20, 25, 30, 35), expand = c(0, 0)) +
  labs(x = "实部 Re(s)", y = "虚部 Im(s) = t") +
  theme_minimal(base_size = 11.5, base_family = PUB_FONT) +
  theme(
    plot.background  = element_rect(fill = ED_PAPER, color = NA),
    panel.background = element_rect(fill = ED_PAPER, color = NA),
    panel.border     = element_rect(color = ED_INK2, fill = NA, linewidth = 0.6),
    axis.text        = element_text(color = ED_INK2, size = 10.2, face = "bold"),
    axis.title       = element_text(color = ED_INK1, size = 11, face = "bold"),
    plot.margin      = margin(6, 4, 6, 8)
  )

# Right panel: Synchronized |zeta(1/2 + i*t)| wave touching 0 at every non-trivial zero
t_fine <- seq(T_MIN, T_MAX, length.out = 520)
df_wave <- data.frame(
  t = t_fine,
  mag = Mod(riemann_zeta_vec(complex(real = 0.5, imaginary = t_fine)))
)

p_wave <- ggplot(df_wave, aes(x = mag, y = t)) +
  geom_hline(yintercept = ZEROS_T, color = ED_RED, linetype = "dotted", linewidth = 0.55, alpha = 0.72) +
  geom_vline(xintercept = 0, color = ED_RED, linewidth = 0.85) +
  geom_ribbon(aes(xmin = 0, xmax = mag), fill = ED_PINE, alpha = 0.16, orientation = "y") +
  geom_path(color = ED_PINE, linewidth = 1.15) +
  geom_point(data = df_zeros, aes(x = 0, y = t),
             shape = 21, size = 3.8, fill = ED_RED, color = "#FAF7F2", stroke = 1.1) +
  geom_label(data = df_zeros, aes(x = 3.92, y = t, label = lbl),
             color = ED_RED, fill = ED_PAPER, linewidth = 0,
             fontface = "bold", family = PUB_FONT, size = 3.25, hjust = 1,
             label.padding = unit(0.10, "lines")) +
  annotate("label", x = 2.65, y = 11.0, label = "零点 = 质数谐波",
           color = ED_PINE, fill = ED_PAPER, linewidth = 0.4, fontface = "bold",
           family = PUB_FONT, size = 3.55, hjust = 0.5) +
  scale_x_continuous(limits = c(-0.18, 4.02), breaks = c(0, 1, 2, 3), expand = c(0.01, 0)) +
  scale_y_continuous(limits = c(T_MIN, T_MAX), breaks = c(10, 15, 20, 25, 30, 35), expand = c(0, 0)) +
  labs(x = "|ζ(1/2 + it)|", y = NULL) +
  theme_minimal(base_size = 11.5, base_family = PUB_FONT) +
  theme(
    plot.background  = element_rect(fill = ED_PAPER, color = NA),
    panel.background = element_rect(fill = ED_PAPER, color = NA),
    panel.grid.major = element_line(color = ED_GRID, linewidth = 0.4),
    panel.grid.minor = element_blank(),
    panel.border     = element_rect(color = ED_INK2, fill = NA, linewidth = 0.6),
    axis.text.y      = element_blank(),
    axis.text.x      = element_text(color = ED_INK2, size = 10.2, face = "bold"),
    axis.title.x     = element_text(color = ED_INK1, size = 11, face = "bold"),
    plot.margin      = margin(6, 10, 6, 4)
  )

fig_zeta <- (p_strip | p_wave) +
  plot_layout(widths = c(1.15, 1.0)) &
  theme(plot.background = element_rect(fill = ED_PAPER, color = NA))

save_pub_figure(fig_zeta, "16_riemann_zeta_critical_line", width = 6.2, height = 3.45, dpi = 300)
