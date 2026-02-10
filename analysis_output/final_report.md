# Final Norming Report

Generated: 2026-02-10 21:44 UTC

## Data Summary

- Participants: **2**
- Raw PCIbex data rows: **1144**
- Clean analysis trials (experiment + filler): **200**
- Valid numeric ratings in clean trials: **199**
- Missing/non-numeric ratings in clean trials: **1**

## Participant List

| participant_hash | source | SONA_ID_URL | n_responses | n_experiment | n_filler |
| --- | --- | --- | --- | --- | --- |
| 8763722d2f3eec65377c986d643c49d5 | utku | 42 | 104 | 60 | 40 |
| e3a9cb9885a1fefc1e05ed632dd0e13a | utku | 42 | 104 | 60 | 40 |

## Descriptive Means and Standard Errors

SE values are computed across participant means within each condition.

### By Label

| label | n_trials | n_participants | rating_mean | rating_se | rt_mean_ms | rt_se_ms |
| --- | --- | --- | --- | --- | --- | --- |
| experiment | 119 | 2 | 4.907 | 0.060 | 3531.2 | 344.2 |
| filler | 80 | 2 | 5.325 | 0.050 | 3449.3 | 536.0 |

### By Label and Tense (includes fillers)

| label | tense | n_trials | n_participants | rating_mean | rating_se | rt_mean_ms | rt_se_ms |
| --- | --- | --- | --- | --- | --- | --- | --- |
| experiment | future | 59 | 2 | 4.636 | 0.498 | 3445.9 | 436.6 |
| experiment | past | 60 | 2 | 5.167 | 0.367 | 3614.9 | 252.0 |
| filler | had_already | 40 | 2 | 3.950 | 0.250 | 3580.4 | 256.3 |
| filler | progressive | 40 | 2 | 6.700 | 0.150 | 3318.2 | 815.7 |

### By Tense (pooled across experiment + fillers)

| tense | n_trials | n_participants | rating_mean | rating_se | rt_mean_ms | rt_se_ms |
| --- | --- | --- | --- | --- | --- | --- |
| future | 59 | 2 | 4.636 | 0.498 | 3445.9 | 436.6 |
| had_already | 40 | 2 | 3.950 | 0.250 | 3580.4 | 256.3 |
| past | 60 | 2 | 5.167 | 0.367 | 3614.9 | 252.0 |
| progressive | 40 | 2 | 6.700 | 0.150 | 3318.2 | 815.7 |

## Hierarchical Bayesian Models (Pyro)

Ordinal formulation follows the cumulative-logit approach from the NumPyro ordinal regression tutorial: https://num.pyro.ai/en/0.15.3/tutorials/ordinal_regression.html

### Ordinal Rating Model

Model: ordinal cumulative-logit with random intercepts for participant and item, condition = `tense` (includes fillers).

- Model trials: **199**
- Participants in model: **2**
- Items in model: **100**
- Sampler: **NUTS**
- Posterior draws: **400**
- Note: Ordinal cumulative-logit latent scale fit with MCMC/NUTS; larger values imply higher ratings.

#### Condition Effects (latent scale)

| condition | post_median | ci_2.5 | ci_97.5 |
| --- | --- | --- | --- |
| past | 0.662 | -0.552 | 1.434 |
| future | 0.233 | -0.947 | 0.928 |
| had_already | -0.378 | -1.653 | 0.449 |
| progressive | 2.571 | 1.305 | 3.642 |

#### Condition Differences for Ratings

| contrast | median_diff | ci_2.5 | ci_97.5 | p_gt_0 |
| --- | --- | --- | --- | --- |
| past - future | 0.437 | -0.097 | 0.983 | 0.938 |
| past - had_already | 1.028 | 0.347 | 1.715 | 0.998 |
| past - progressive | -1.933 | -2.749 | -1.136 | 0.000 |
| future - had_already | 0.577 | -0.022 | 1.261 | 0.963 |
| future - progressive | -2.371 | -3.130 | -1.572 | 0.000 |
| had_already - progressive | -2.962 | -3.869 | -2.112 | 0.000 |

### RT Model

Model: Gaussian model on log RT (ms) with random intercepts for participant and item, condition = `tense` (includes fillers).

- Model trials: **200**
- Participants in model: **2**
- Items in model: **100**
- Final ELBO loss: **139.29**
- Note: Log-RT model; ratio > 1 in contrasts means first condition is slower.

#### Condition Effects (log ms)

| condition | post_median_log_ms | ci_2.5 | ci_97.5 | implied_ms_median |
| --- | --- | --- | --- | --- |
| past | 6.578 | 6.483 | 6.667 | 719.1 |
| future | 6.594 | 6.498 | 6.691 | 730.6 |
| had_already | 6.641 | 6.531 | 6.751 | 765.9 |
| progressive | 6.528 | 6.402 | 6.656 | 684.0 |

#### Condition Differences for RT

| contrast | median_diff | ci_2.5 | ci_97.5 | p_gt_0 | ratio_median | ratio_ci_2.5 | ratio_ci_97.5 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| past - future | -0.016 | -0.150 | 0.111 | 0.401 | 0.984 | 0.860 | 1.117 |
| past - had_already | -0.065 | -0.199 | 0.082 | 0.189 | 0.937 | 0.819 | 1.086 |
| past - progressive | 0.047 | -0.113 | 0.200 | 0.736 | 1.048 | 0.893 | 1.221 |
| future - had_already | -0.047 | -0.193 | 0.109 | 0.278 | 0.955 | 0.825 | 1.115 |
| future - progressive | 0.067 | -0.091 | 0.213 | 0.805 | 1.069 | 0.913 | 1.237 |
| had_already - progressive | 0.110 | -0.057 | 0.274 | 0.901 | 1.116 | 0.945 | 1.316 |

### Item-Level Past vs Future Differences (Experiment Items)

Model: ordinal cumulative-logit with item-specific past-vs-future slopes, random participant and item intercepts.

- Model trials: **119**
- Participants in model: **2**
- Items in model: **60**
- Sampler: **NUTS**
- Posterior draws: **400**
- Note: Positive values mean higher ratings in past than future; fit with MCMC/NUTS.

#### Global Past vs Future Contrast

| contrast | post_median | ci_2.5 | ci_97.5 | p_gt_0 |
| --- | --- | --- | --- | --- |
| past - future | 0.658 | -0.004 | 1.323 | 0.973 |

#### Top 20 Pictures by |Past - Future| Effect

| item_id | picture | n_past | n_future | past_minus_future_median | ci_2.5 | ci_97.5 | p_gt_0 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Wizard_push | wizard_push_cart.png | 1 | 1 | 0.917 | -0.478 | 2.856 | 0.917 |
| Chef_paint | chef_paint_canvas.png | 1 | 1 | 0.906 | -0.313 | 2.719 | 0.915 |
| Pirate_cut | pirate_cut_bread.png | 1 | 1 | 0.905 | -0.440 | 2.958 | 0.915 |
| Chef_peel | chef_peel_banana.png | 1 | 1 | 0.899 | -0.251 | 2.835 | 0.910 |
| Pirate_smell | pirate_smell_flower.png | 1 | 1 | 0.876 | -0.502 | 2.703 | 0.930 |
| Wizard_light | wizard_light_candle.png | 1 | 1 | 0.875 | -0.770 | 2.498 | 0.902 |
| Wizard_dig | wizard_dig_hole.png | 1 | 1 | 0.872 | -0.435 | 2.661 | 0.925 |
| Pirate_dig | pirate_dig_hole.png | 1 | 1 | 0.863 | -0.385 | 2.912 | 0.935 |
| Pirate_drink | pirate_drink_coffee.png | 1 | 1 | 0.863 | -0.414 | 2.773 | 0.930 |
| Pirate_paint | pirate_paint_canvas.png | 1 | 1 | 0.857 | -0.428 | 2.975 | 0.915 |
| Chef_break | chef_break_stick.png | 1 | 1 | 0.855 | -0.594 | 2.776 | 0.915 |
| Pirate_light | pirate_light_candle.png | 1 | 1 | 0.851 | -0.463 | 3.012 | 0.907 |
| Pirate_peel | pirate_peel_banana.png | 1 | 1 | 0.849 | -0.519 | 2.501 | 0.925 |
| Chef_cut | chef_cut_bread.png | 1 | 1 | 0.835 | -0.688 | 2.893 | 0.915 |
| Pirate_break | pirate_break_stick.png | 1 | 1 | 0.833 | -0.447 | 2.726 | 0.922 |
| Chef_smell | chef_smell_flower.png | 1 | 1 | 0.824 | -0.291 | 3.009 | 0.938 |
| Chef_light | chef_light_candle.png | 1 | 1 | 0.822 | -0.716 | 2.880 | 0.890 |
| Chef_dig | chef_dig_hole.png | 1 | 1 | 0.807 | -0.384 | 2.946 | 0.917 |
| Chef_sweep | chef_sweep_floor.png | 1 | 1 | 0.796 | -0.215 | 3.029 | 0.930 |
| Wizard_break | wizard_break_stick.png | 1 | 1 | 0.795 | -0.419 | 2.869 | 0.922 |

Full item list is saved in `analysis_output/past_future_item_effects.csv`.
