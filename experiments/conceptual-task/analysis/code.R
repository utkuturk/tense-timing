# R code to reproduce the analysis on conceptual_sebastian
# Assumptions (same as I used):
# 1) Priming is defined within each block x pattern (p1/p2)
# 2) "Primed" = same tense as immediately previous trial in that block x pattern
# 3) Burn trial positions 1 and 6 from each 6-trial pattern

library(dplyr)


read.pcibex <- function(
    filepath,
    auto.colnames = TRUE,
    fun.col = function(col, cols) {
        cols[cols == col] <- paste(col, "Ibex", sep = ".")
        return(cols)
    }
) {
    n.cols <- max(count.fields(filepath, sep = ",", quote = NULL), na.rm = TRUE)
    if (auto.colnames) {
        cols <- c()
        con <- file(filepath, "r")
        while (TRUE) {
            line <- readLines(con, n = 1, warn = FALSE)
            if (length(line) == 0) {
                break
            }
            m <- regmatches(line, regexec("^# (\\d+)\\. (.+)\\.$", line))[[1]]
            if (length(m) == 3) {
                index <- as.numeric(m[2])
                value <- m[3]
                if (is.function(fun.col)) {
                    cols <- fun.col(value, cols)
                }
                cols[index] <- value
                if (index == n.cols) {
                    break
                }
            }
        }
        close(con)
        return(read.csv(
            filepath,
            comment.char = "#",
            header = FALSE,
            col.names = cols
        ))
    } else {
        return(read.csv(
            filepath,
            comment.char = "#",
            header = FALSE,
            col.names = seq(1:n.cols)
        ))
    }
}

# 1) Load raw Ibex/PennController results
fname = "results/conceptual_sebastian.csv"
raw <- read.pcibex(fname)

# 2) Keep only main decision selections
df <- raw %>%
    filter(
        PennElementType == "Selector",
        PennElementName == "tenseChoice",
        Parameter == "Selection",
        grepl("^exp_", Label)
    ) %>%
    transmute(
        event_time = as.numeric(EventTime),
        block = Block,
        # Label format: exp_<meta>_<block>_<p1|p2>_<verb>_<tense>
        pattern = vapply(strsplit(Label, "_"), function(x) x[4], character(1)),
        tense = Tense, # PAST / FUTURE
        choice = Value, # leftOpt / rightOpt
        rt = as.numeric(DecisionRT)
    ) %>%
    arrange(event_time)

# 3) Add pattern position + priming tag (within block x pattern)
df <- df %>%
    group_by(block, pattern) %>%
    mutate(
        pattern_pos = row_number(),
        prime = case_when(
            row_number() == 1 ~ "first",
            row_number() == 6 ~ "last",
            tense == lag(tense) ~ "primed",
            TRUE ~ "unprimed"
        )
    ) %>%
    ungroup()

# 4) Burn first/last trial of each pattern
df_trim <- df %>%
    filter(!pattern_pos %in% c(1, 6)) %>%
    mutate(
        correct = (tense == "PAST" & choice == "leftOpt") |
            (tense == "FUTURE" & choice == "rightOpt")
    )

# 5) Helper for SE
se <- function(x) sd(x, na.rm = TRUE) / sqrt(sum(!is.na(x)))

# 6) Accuracy
acc_overall <- df_trim %>%
    summarise(
        n = n(),
        n_correct = sum(correct),
        acc = mean(correct)
    )

acc_by_condition <- df_trim %>%
    group_by(tense, prime) %>%
    summarise(
        n = n(),
        n_correct = sum(correct),
        acc = round(mean(correct), 2),
        se_acc = round(sqrt(acc * (1 - acc) / n), 2), # binomial SE
        .groups = "drop"
    )

# 7) RT means + SE (all kept trials)
rt_by_condition_all <- df_trim %>%
    group_by(tense, prime) %>%
    summarise(
        n = sum(!is.na(rt)),
        mean_rt = mean(rt, na.rm = TRUE),
        se_rt = se(rt),
        .groups = "drop"
    )

# 8) RT means + SE (correct-only)
rt_by_condition_correct <- df_trim %>%
    filter(correct) %>%
    group_by(tense, prime) %>%
    summarise(
        n = sum(!is.na(rt)),
        mean_rt = round(mean(rt, na.rm = TRUE), 2),
        se_rt = round(se(rt), 2),
        .groups = "drop"
    )

# 9) Print outputs
acc_overall
acc_by_condition
rt_by_condition_all
rt_by_condition_correct
