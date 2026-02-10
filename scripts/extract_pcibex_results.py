#!/usr/bin/env python3
"""Extract clean PCIbex data and generate a final markdown report with Pyro models."""

from __future__ import annotations

import argparse
import csv
import math
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Dict, Iterable, List, Optional, Sequence, Tuple

BASE_COLUMNS = [
    "results_reception_time",
    "participant_hash",
    "controller_name",
    "item_order",
    "inner_element_number",
    "label",
    "latin_square_group",
    "PennElementType",
    "PennElementName",
    "Parameter",
    "Value",
    "EventTime",
    "RT_answer_header",
    "trialN_header",
    "source",
    "SONA_ID_URL",
]

TRIAL_LOG_COLUMNS = [
    "trialN",
    "RT-answer",
    "item_id",
    "group",
    "character",
    "verb",
    "past_form",
    "type",
    "picture",
    "tense",
    "sentence",
]


def _to_int(value: str) -> Optional[int]:
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _to_float(value: str) -> Optional[float]:
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def _mean(values: Sequence[float]) -> Optional[float]:
    if not values:
        return None
    return sum(values) / len(values)


def _sample_sd(values: Sequence[float]) -> Optional[float]:
    if len(values) < 2:
        return None
    mu = _mean(values)
    assert mu is not None
    return math.sqrt(sum((x - mu) ** 2 for x in values) / (len(values) - 1))


def _se(values: Sequence[float]) -> Optional[float]:
    sd = _sample_sd(values)
    if sd is None:
        return None
    return sd / math.sqrt(len(values))


def _fmt_num(value: Optional[float], digits: int = 3) -> str:
    if value is None:
        return "NA"
    return f"{value:.{digits}f}"


def _quantile(values: Sequence[float], q: float) -> Optional[float]:
    if not values:
        return None
    vs = sorted(values)
    if len(vs) == 1:
        return vs[0]
    pos = q * (len(vs) - 1)
    lo = int(math.floor(pos))
    hi = int(math.ceil(pos))
    if lo == hi:
        return vs[lo]
    w = pos - lo
    return vs[lo] * (1.0 - w) + vs[hi] * w


def _ci(values: Sequence[float]) -> Tuple[Optional[float], Optional[float], Optional[float]]:
    return (_quantile(values, 0.5), _quantile(values, 0.025), _quantile(values, 0.975))


def parse_row(row: List[str]) -> Dict[str, str]:
    if len(row) < len(BASE_COLUMNS) + 1:
        raise ValueError(f"Unexpected short row ({len(row)} cols): {row}")

    parsed: Dict[str, str] = {}
    for i, name in enumerate(BASE_COLUMNS):
        parsed[name] = row[i]

    extras = row[len(BASE_COLUMNS) : -1]
    for i, value in enumerate(extras):
        key = TRIAL_LOG_COLUMNS[i] if i < len(TRIAL_LOG_COLUMNS) else f"extra_log_{i+1}"
        parsed[key] = value

    parsed["Comments"] = row[-1]
    return parsed


def read_pcibex_rows(path: Path) -> List[Dict[str, str]]:
    rows: List[Dict[str, str]] = []
    with path.open("r", encoding="utf-8", newline="") as f:
        for raw in f:
            if not raw.strip() or raw.startswith("#"):
                continue
            row = next(csv.reader([raw]))
            rows.append(parse_row(row))
    return rows


def build_response_trials(rows: Iterable[Dict[str, str]]) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for r in rows:
        is_response = (
            r.get("PennElementType") == "Scale"
            and r.get("PennElementName") == "rating"
            and r.get("Parameter") == "Choice"
        )
        if not is_response:
            continue

        out.append(
            {
                "participant_hash": r.get("participant_hash", ""),
                "source": r.get("source", ""),
                "SONA_ID_URL": r.get("SONA_ID_URL", ""),
                "label": r.get("label", ""),
                "item_order": r.get("item_order", ""),
                "trialN": r.get("trialN", ""),
                "item_id": r.get("item_id", ""),
                "group": r.get("group", ""),
                "character": r.get("character", ""),
                "verb": r.get("verb", ""),
                "past_form": r.get("past_form", ""),
                "type": r.get("type", ""),
                "picture": r.get("picture", ""),
                "tense": r.get("tense", ""),
                "sentence": r.get("sentence", ""),
                "rating": r.get("Value", ""),
                "rt_ms": r.get("RT_answer_header", ""),
                "comments": r.get("Comments", ""),
                "results_reception_time": r.get("results_reception_time", ""),
                "event_time": r.get("EventTime", ""),
            }
        )

    out.sort(
        key=lambda x: (
            x.get("participant_hash", ""),
            _to_int(x.get("trialN", "")) or 10**9,
            _to_int(x.get("item_order", "")) or 10**9,
        )
    )
    return out


def build_clean_trials(response_trials: Iterable[Dict[str, str]]) -> List[Dict[str, str]]:
    out: List[Dict[str, str]] = []
    for r in response_trials:
        if r.get("label") not in {"experiment", "filler"}:
            continue

        rating_num = _to_float(r.get("rating", ""))
        rt_num = _to_float(r.get("rt_ms", ""))
        is_ordinal = rating_num is not None and rating_num in {1, 2, 3, 4, 5, 6, 7}

        out.append(
            {
                **r,
                "rating_num": "" if rating_num is None else f"{rating_num:g}",
                "rt_ms_num": "" if rt_num is None else f"{rt_num:g}",
                "is_valid_rating": "1" if rating_num is not None else "0",
                "is_valid_ordinal": "1" if is_ordinal else "0",
            }
        )
    return out


def build_participants(rows: Iterable[Dict[str, str]]) -> List[Dict[str, str]]:
    grouped: Dict[str, Dict[str, object]] = defaultdict(
        lambda: {
            "source": set(),
            "sona": set(),
            "n_rows": 0,
            "n_responses": 0,
            "n_experiment": 0,
            "n_filler": 0,
            "first_reception_time": None,
            "last_reception_time": None,
        }
    )

    for r in rows:
        pid = r.get("participant_hash", "")
        g = grouped[pid]
        g["n_rows"] = int(g["n_rows"]) + 1

        src = (r.get("source") or "").strip()
        sona = (r.get("SONA_ID_URL") or "").strip()
        if src:
            g["source"].add(src)
        if sona:
            g["sona"].add(sona)

        reception = _to_int(r.get("results_reception_time", ""))
        if reception is not None:
            if g["first_reception_time"] is None or reception < int(g["first_reception_time"]):
                g["first_reception_time"] = reception
            if g["last_reception_time"] is None or reception > int(g["last_reception_time"]):
                g["last_reception_time"] = reception

        is_response = (
            r.get("PennElementType") == "Scale"
            and r.get("PennElementName") == "rating"
            and r.get("Parameter") == "Choice"
        )
        if is_response:
            g["n_responses"] = int(g["n_responses"]) + 1
            if r.get("label") == "experiment":
                g["n_experiment"] = int(g["n_experiment"]) + 1
            elif r.get("label") == "filler":
                g["n_filler"] = int(g["n_filler"]) + 1

    out: List[Dict[str, str]] = []
    for pid, g in grouped.items():
        out.append(
            {
                "participant_hash": pid,
                "source": ";".join(sorted(g["source"])),
                "SONA_ID_URL": ";".join(sorted(g["sona"])),
                "n_rows": str(g["n_rows"]),
                "n_responses": str(g["n_responses"]),
                "n_experiment": str(g["n_experiment"]),
                "n_filler": str(g["n_filler"]),
                "first_reception_time": "" if g["first_reception_time"] is None else str(g["first_reception_time"]),
                "last_reception_time": "" if g["last_reception_time"] is None else str(g["last_reception_time"]),
            }
        )
    out.sort(key=lambda x: x["participant_hash"])
    return out


def write_csv(path: Path, rows: List[Dict[str, str]], fieldnames: List[str]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def _collect_group_stats(rows: Iterable[Dict[str, str]], keys: Sequence[str]) -> List[Dict[str, str]]:
    grouped_trials: Dict[Tuple[str, ...], List[Dict[str, str]]] = defaultdict(list)
    for r in rows:
        grouped_trials[tuple(r.get(k, "") for k in keys)].append(r)

    out: List[Dict[str, str]] = []
    for group_key in sorted(grouped_trials.keys()):
        rs = grouped_trials[group_key]
        valid = [r for r in rs if _to_float(r.get("rating_num", "")) is not None]
        ratings = [_to_float(r.get("rating_num", "")) for r in valid]
        rts = [_to_float(r.get("rt_ms_num", "")) for r in valid if _to_float(r.get("rt_ms_num", "")) is not None]
        ratings_clean = [x for x in ratings if x is not None]
        rts_clean = [x for x in rts if x is not None]

        by_pid_rating: Dict[str, List[float]] = defaultdict(list)
        by_pid_rt: Dict[str, List[float]] = defaultdict(list)
        for r in valid:
            pid = r.get("participant_hash", "")
            rv = _to_float(r.get("rating_num", ""))
            tv = _to_float(r.get("rt_ms_num", ""))
            if rv is not None:
                by_pid_rating[pid].append(rv)
            if tv is not None:
                by_pid_rt[pid].append(tv)

        pid_rating_means = [_mean(v) for v in by_pid_rating.values() if v]
        pid_rt_means = [_mean(v) for v in by_pid_rt.values() if v]

        record = {
            "n_trials": str(len(valid)),
            "n_participants": str(len(by_pid_rating)),
            "rating_mean": _fmt_num(_mean([x for x in pid_rating_means if x is not None])),
            "rating_se": _fmt_num(_se([x for x in pid_rating_means if x is not None])),
            "rt_mean_ms": _fmt_num(_mean(rts_clean), 1),
            "rt_se_ms": _fmt_num(_se([x for x in pid_rt_means if x is not None]), 1),
        }
        for k, v in zip(keys, group_key):
            record[k] = v
        out.append(record)

    return out


def _markdown_table(rows: List[Dict[str, str]], columns: Sequence[str]) -> str:
    header = "| " + " | ".join(columns) + " |"
    sep = "| " + " | ".join(["---"] * len(columns)) + " |"
    body = []
    for r in rows:
        body.append("| " + " | ".join(r.get(c, "") for c in columns) + " |")
    return "\n".join([header, sep] + body)


def _posterior_contrasts(
    samples_by_condition: Dict[str, List[float]],
    is_log_scale: bool = False,
) -> List[Dict[str, str]]:
    conds = list(samples_by_condition.keys())
    out: List[Dict[str, str]] = []
    for i in range(len(conds)):
        for j in range(i + 1, len(conds)):
            a = conds[i]
            b = conds[j]
            diffs = [x - y for x, y in zip(samples_by_condition[a], samples_by_condition[b])]
            med, lo, hi = _ci(diffs)
            p_gt_0 = sum(1 for d in diffs if d > 0) / len(diffs) if diffs else None
            row = {
                "contrast": f"{a} - {b}",
                "median_diff": _fmt_num(med),
                "ci_2.5": _fmt_num(lo),
                "ci_97.5": _fmt_num(hi),
                "p_gt_0": _fmt_num(p_gt_0),
            }
            if is_log_scale:
                ratio = [math.exp(d) for d in diffs]
                r_med, r_lo, r_hi = _ci(ratio)
                row["ratio_median"] = _fmt_num(r_med)
                row["ratio_ci_2.5"] = _fmt_num(r_lo)
                row["ratio_ci_97.5"] = _fmt_num(r_hi)
            out.append(row)
    return out


def run_hierarchical_pyro(clean_trials: List[Dict[str, str]], steps: int, seed: int) -> Dict[str, object]:
    valid = [r for r in clean_trials if (r.get("item_id") or "").strip() != ""]
    valid_rating = [
        r for r in valid if r.get("is_valid_ordinal") == "1" and _to_float(r.get("rating_num", "")) is not None
    ]
    valid_rt = [
        r
        for r in valid
        if _to_float(r.get("rt_ms_num", "")) is not None and (_to_float(r.get("rt_ms_num", "")) or 0.0) > 0.0
    ]
    if not valid_rating and not valid_rt:
        return {"ok": False, "error": "No valid trials available for modeling."}

    try:
        import pyro
        import pyro.distributions as dist
        import torch
        import torch.nn.functional as F
        from pyro.infer import SVI, Trace_ELBO
        from pyro.infer.autoguide import AutoNormal
        from pyro.infer.mcmc import MCMC, NUTS
        from pyro.optim import Adam
    except Exception as exc:  # pragma: no cover
        return {"ok": False, "error": f"Pyro import failed: {exc}"}

    torch.manual_seed(seed)
    pyro.set_rng_seed(seed)

    def _ordered_cutpoints(raw: "torch.Tensor") -> "torch.Tensor":
        cp = torch.cumsum(F.softplus(raw), dim=-1)
        return cp - cp.mean()

    def _ordinal_probs(eta: "torch.Tensor", cut: "torch.Tensor") -> "torch.Tensor":
        cdf = torch.sigmoid(cut.unsqueeze(0) - eta.unsqueeze(-1))
        p_first = cdf[:, :1]
        p_mid = cdf[:, 1:] - cdf[:, :-1]
        p_last = 1.0 - cdf[:, -1:]
        probs = torch.cat([p_first, p_mid, p_last], dim=1)
        probs = probs.clamp(min=1e-8)
        return probs / probs.sum(dim=1, keepdim=True)

    preferred_order = ["past", "future", "had_already", "progressive"]
    observed_conditions = sorted({r.get("tense", "") for r in valid if (r.get("tense") or "") != ""})
    conditions = [c for c in preferred_order if c in observed_conditions] + [
        c for c in observed_conditions if c not in preferred_order
    ]
    cond_to_i = {c: i for i, c in enumerate(conditions)}

    model_out: Dict[str, object] = {"ok": True, "conditions": conditions}

    # Keep MCMC runtime bounded but stable across runs.
    mcmc_warmup = max(150, min(500, steps // 10))
    mcmc_samples = max(250, min(800, steps // 5))

    if valid_rating:
        participants = sorted({r["participant_hash"] for r in valid_rating})
        items = sorted({r["item_id"] for r in valid_rating})
        pid_to_i = {p: i for i, p in enumerate(participants)}
        item_to_i = {it: i for i, it in enumerate(items)}

        y = torch.tensor([int(float(r["rating_num"])) - 1 for r in valid_rating], dtype=torch.long)
        subj_idx = torch.tensor([pid_to_i[r["participant_hash"]] for r in valid_rating], dtype=torch.long)
        item_idx = torch.tensor([item_to_i[r["item_id"]] for r in valid_rating], dtype=torch.long)
        cond_idx = torch.tensor([cond_to_i[r["tense"]] for r in valid_rating], dtype=torch.long)

        n_subj = len(participants)
        n_item = len(items)
        n_cond = len(conditions)
        n_cat = 7

        def rating_model(obs: "torch.Tensor") -> None:
            cond_eff = pyro.sample("rating_cond_eff", dist.Normal(0.0, 1.0).expand([n_cond]).to_event(1))
            sigma_subj = pyro.sample("rating_sigma_subj", dist.HalfNormal(1.0))
            sigma_item = pyro.sample("rating_sigma_item", dist.HalfNormal(1.0))

            with pyro.plate("rating_subjects", n_subj):
                subj_raw = pyro.sample("rating_subj_raw", dist.Normal(0.0, 1.0))
            with pyro.plate("rating_items", n_item):
                item_raw = pyro.sample("rating_item_raw", dist.Normal(0.0, 1.0))

            cut_raw = pyro.sample("rating_cut_raw", dist.Normal(0.0, 1.0).expand([n_cat - 1]).to_event(1))
            cut = _ordered_cutpoints(cut_raw)
            eta = cond_eff[cond_idx] + sigma_subj * subj_raw[subj_idx] + sigma_item * item_raw[item_idx]
            probs = _ordinal_probs(eta, cut)

            with pyro.plate("rating_obs", len(obs)):
                pyro.sample("rating", dist.Categorical(probs=probs), obs=obs)

        nuts = NUTS(rating_model, target_accept_prob=0.85)
        mcmc = MCMC(nuts, warmup_steps=mcmc_warmup, num_samples=mcmc_samples)
        mcmc.run(y)
        post = mcmc.get_samples()
        cond_tensor = post["rating_cond_eff"].detach().cpu()
        cond_samples: Dict[str, List[float]] = {c: cond_tensor[:, i].tolist() for i, c in enumerate(conditions)}

        cond_rows: List[Dict[str, str]] = []
        for c in conditions:
            med, lo, hi = _ci(cond_samples[c])
            cond_rows.append(
                {"condition": c, "post_median": _fmt_num(med), "ci_2.5": _fmt_num(lo), "ci_97.5": _fmt_num(hi)}
            )

        contrasts = _posterior_contrasts(cond_samples, is_log_scale=False)
        sigma_subj_s = post["rating_sigma_subj"].detach().cpu().tolist()
        sigma_item_s = post["rating_sigma_item"].detach().cpu().tolist()
        ss_med, ss_lo, ss_hi = _ci(sigma_subj_s)
        si_med, si_lo, si_hi = _ci(sigma_item_s)
        scale_rows = [
            {"parameter": "rating_sigma_subj", "post_median": _fmt_num(ss_med), "ci_2.5": _fmt_num(ss_lo), "ci_97.5": _fmt_num(ss_hi)},
            {"parameter": "rating_sigma_item", "post_median": _fmt_num(si_med), "ci_2.5": _fmt_num(si_lo), "ci_97.5": _fmt_num(si_hi)},
        ]

        model_out["rating_model"] = {
            "ok": True,
            "n_trials": len(valid_rating),
            "n_subj": n_subj,
            "n_item": n_item,
            "sampler": "NUTS",
            "n_draws": int(cond_tensor.shape[0]),
            "final_loss": None,
            "cond_rows": cond_rows,
            "contrast_rows": contrasts,
            "scale_rows": scale_rows,
            "notes": "Ordinal cumulative-logit latent scale fit with MCMC/NUTS; larger values imply higher ratings.",
        }

    # Keep RT model as SVI for speed.
    if valid_rt:
        participants_rt = sorted({r["participant_hash"] for r in valid_rt})
        items_rt = sorted({r["item_id"] for r in valid_rt})
        pid_to_i_rt = {p: i for i, p in enumerate(participants_rt)}
        item_to_i_rt = {it: i for i, it in enumerate(items_rt)}

        y_log_rt = torch.tensor([math.log(float(r["rt_ms_num"])) for r in valid_rt], dtype=torch.float32)
        subj_idx_rt = torch.tensor([pid_to_i_rt[r["participant_hash"]] for r in valid_rt], dtype=torch.long)
        item_idx_rt = torch.tensor([item_to_i_rt[r["item_id"]] for r in valid_rt], dtype=torch.long)
        cond_idx_rt = torch.tensor([cond_to_i[r["tense"]] for r in valid_rt], dtype=torch.long)

        n_subj_rt = len(participants_rt)
        n_item_rt = len(items_rt)
        n_cond = len(conditions)

        def rt_model(obs: "torch.Tensor") -> None:
            cond_loc = pyro.sample("rt_cond_loc", dist.Normal(8.0, 1.0).expand([n_cond]).to_event(1))
            sigma_subj = pyro.sample("rt_sigma_subj", dist.HalfNormal(1.0))
            sigma_item = pyro.sample("rt_sigma_item", dist.HalfNormal(1.0))
            sigma = pyro.sample("rt_sigma", dist.HalfNormal(1.0))

            with pyro.plate("rt_subjects", n_subj_rt):
                subj_raw = pyro.sample("rt_subj_raw", dist.Normal(0.0, 1.0))
            with pyro.plate("rt_items", n_item_rt):
                item_raw = pyro.sample("rt_item_raw", dist.Normal(0.0, 1.0))

            mu = cond_loc[cond_idx_rt] + sigma_subj * subj_raw[subj_idx_rt] + sigma_item * item_raw[item_idx_rt]
            with pyro.plate("rt_obs", len(obs)):
                pyro.sample("rt", dist.Normal(mu, sigma), obs=obs)

        pyro.clear_param_store()
        rt_guide = AutoNormal(rt_model)
        rt_svi = SVI(rt_model, rt_guide, Adam({"lr": 0.03}), loss=Trace_ELBO())
        rt_losses: List[float] = []
        for _ in range(steps):
            rt_losses.append(float(rt_svi.step(y_log_rt)))

        n_draws = 2000
        rt_cond_samples: Dict[str, List[float]] = {c: [] for c in conditions}
        for _ in range(n_draws):
            s = rt_guide(y_log_rt)
            vec = s["rt_cond_loc"].detach().cpu().tolist()
            for i, c in enumerate(conditions):
                rt_cond_samples[c].append(float(vec[i]))

        cond_rows_rt = []
        for c in conditions:
            med, lo, hi = _ci(rt_cond_samples[c])
            cond_rows_rt.append(
                {
                    "condition": c,
                    "post_median_log_ms": _fmt_num(med),
                    "ci_2.5": _fmt_num(lo),
                    "ci_97.5": _fmt_num(hi),
                    "implied_ms_median": _fmt_num(math.exp(med) if med is not None else None, 1),
                }
            )

        rt_contrasts = _posterior_contrasts(rt_cond_samples, is_log_scale=True)
        q_rt = rt_guide.quantiles([0.025, 0.5, 0.975])
        rt_scale_rows = [
            {
                "parameter": "rt_sigma_subj",
                "post_median": _fmt_num(float(q_rt["rt_sigma_subj"][1])),
                "ci_2.5": _fmt_num(float(q_rt["rt_sigma_subj"][0])),
                "ci_97.5": _fmt_num(float(q_rt["rt_sigma_subj"][2])),
            },
            {
                "parameter": "rt_sigma_item",
                "post_median": _fmt_num(float(q_rt["rt_sigma_item"][1])),
                "ci_2.5": _fmt_num(float(q_rt["rt_sigma_item"][0])),
                "ci_97.5": _fmt_num(float(q_rt["rt_sigma_item"][2])),
            },
            {
                "parameter": "rt_sigma",
                "post_median": _fmt_num(float(q_rt["rt_sigma"][1])),
                "ci_2.5": _fmt_num(float(q_rt["rt_sigma"][0])),
                "ci_97.5": _fmt_num(float(q_rt["rt_sigma"][2])),
            },
        ]
        model_out["rt_model"] = {
            "ok": True,
            "n_trials": len(valid_rt),
            "n_subj": n_subj_rt,
            "n_item": n_item_rt,
            "final_loss": rt_losses[-1] if rt_losses else None,
            "cond_rows": cond_rows_rt,
            "contrast_rows": rt_contrasts,
            "scale_rows": rt_scale_rows,
            "notes": "Log-RT model; ratio > 1 in contrasts means first condition is slower.",
        }

    # Focused MCMC model for picture-level past vs future differences (experiment items only).
    valid_pf = [
        r
        for r in valid_rating
        if r.get("label") == "experiment" and r.get("tense") in {"past", "future"} and (r.get("item_id") or "") != ""
    ]
    if valid_pf:
        participants_pf = sorted({r["participant_hash"] for r in valid_pf})
        items_pf = sorted({r["item_id"] for r in valid_pf})
        pid_to_i_pf = {p: i for i, p in enumerate(participants_pf)}
        item_to_i_pf = {it: i for i, it in enumerate(items_pf)}
        item_to_picture = {r["item_id"]: r.get("picture", "") for r in valid_pf}

        y_pf = torch.tensor([int(float(r["rating_num"])) - 1 for r in valid_pf], dtype=torch.long)
        subj_idx_pf = torch.tensor([pid_to_i_pf[r["participant_hash"]] for r in valid_pf], dtype=torch.long)
        item_idx_pf = torch.tensor([item_to_i_pf[r["item_id"]] for r in valid_pf], dtype=torch.long)
        past_idx = torch.tensor([1.0 if r["tense"] == "past" else 0.0 for r in valid_pf], dtype=torch.float32)

        n_subj_pf = len(participants_pf)
        n_item_pf = len(items_pf)
        n_cat = 7

        def pf_item_model(obs: "torch.Tensor") -> None:
            beta_past = pyro.sample("pf_beta_past", dist.Normal(0.0, 1.0))
            sigma_subj = pyro.sample("pf_sigma_subj", dist.HalfNormal(1.0))
            sigma_item = pyro.sample("pf_sigma_item", dist.HalfNormal(1.0))
            sigma_item_past = pyro.sample("pf_sigma_item_past", dist.HalfNormal(1.0))

            with pyro.plate("pf_subjects", n_subj_pf):
                subj_raw = pyro.sample("pf_subj_raw", dist.Normal(0.0, 1.0))
            with pyro.plate("pf_items", n_item_pf):
                item_raw = pyro.sample("pf_item_raw", dist.Normal(0.0, 1.0))
                item_past_raw = pyro.sample("pf_item_past_raw", dist.Normal(0.0, 1.0))

            cut_raw = pyro.sample("pf_cut_raw", dist.Normal(0.0, 1.0).expand([n_cat - 1]).to_event(1))
            cut = _ordered_cutpoints(cut_raw)
            item_past_eff = beta_past + sigma_item_past * item_past_raw[item_idx_pf]
            eta = sigma_subj * subj_raw[subj_idx_pf] + sigma_item * item_raw[item_idx_pf] + past_idx * item_past_eff
            probs = _ordinal_probs(eta, cut)

            with pyro.plate("pf_obs", len(obs)):
                pyro.sample("pf_rating", dist.Categorical(probs=probs), obs=obs)

        nuts_pf = NUTS(pf_item_model, target_accept_prob=0.85)
        mcmc_pf = MCMC(nuts_pf, warmup_steps=mcmc_warmup, num_samples=mcmc_samples)
        mcmc_pf.run(y_pf)
        post_pf = mcmc_pf.get_samples()

        beta_samples = post_pf["pf_beta_past"].detach().cpu().tolist()
        sig_samples = post_pf["pf_sigma_item_past"].detach().cpu().tolist()
        raw_samples = post_pf["pf_item_past_raw"].detach().cpu()

        item_samples: Dict[str, List[float]] = {it: [] for it in items_pf}
        for draw_i in range(raw_samples.shape[0]):
            for item_i, it in enumerate(items_pf):
                item_samples[it].append(float(beta_samples[draw_i] + sig_samples[draw_i] * raw_samples[draw_i, item_i]))

        global_med, global_lo, global_hi = _ci(beta_samples)
        global_prob = sum(1 for v in beta_samples if v > 0.0) / len(beta_samples)
        counts_by_item_tense: Dict[Tuple[str, str], int] = defaultdict(int)
        for r in valid_pf:
            counts_by_item_tense[(r["item_id"], r["tense"])] += 1

        item_rows = []
        for it in items_pf:
            med, lo, hi = _ci(item_samples[it])
            p_gt_0 = sum(1 for v in item_samples[it] if v > 0.0) / len(item_samples[it])
            item_rows.append(
                {
                    "item_id": it,
                    "picture": item_to_picture.get(it, ""),
                    "n_past": str(counts_by_item_tense.get((it, "past"), 0)),
                    "n_future": str(counts_by_item_tense.get((it, "future"), 0)),
                    "past_minus_future_median": _fmt_num(med),
                    "ci_2.5": _fmt_num(lo),
                    "ci_97.5": _fmt_num(hi),
                    "p_gt_0": _fmt_num(p_gt_0),
                    "abs_effect_for_ranking": _fmt_num(abs(med) if med is not None else None),
                }
            )

        item_rows_sorted = sorted(
            item_rows,
            key=lambda r: abs(float(r["past_minus_future_median"])) if r["past_minus_future_median"] != "NA" else -1.0,
            reverse=True,
        )

        model_out["past_future_item_model"] = {
            "ok": True,
            "n_trials": len(valid_pf),
            "n_subj": n_subj_pf,
            "n_item": n_item_pf,
            "sampler": "NUTS",
            "n_draws": int(raw_samples.shape[0]),
            "final_loss": None,
            "global_contrast": {
                "contrast": "past - future",
                "post_median": _fmt_num(global_med),
                "ci_2.5": _fmt_num(global_lo),
                "ci_97.5": _fmt_num(global_hi),
                "p_gt_0": _fmt_num(global_prob),
            },
            "top_item_rows": item_rows_sorted[:20],
            "all_item_rows": item_rows_sorted,
            "notes": "Positive values mean higher ratings in past than future; fit with MCMC/NUTS.",
        }

    if "rating_model" not in model_out and "rt_model" not in model_out and "past_future_item_model" not in model_out:
        return {"ok": False, "error": "Pyro ran but no model could be fit."}
    return model_out


def build_report(
    all_rows: List[Dict[str, str]],
    clean_trials: List[Dict[str, str]],
    participants: List[Dict[str, str]],
    pyro_result: Dict[str, object],
) -> str:
    timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")

    valid_clean = [r for r in clean_trials if _to_float(r.get("rating_num", "")) is not None]
    missing_n = len(clean_trials) - len(valid_clean)

    by_label_tense = _collect_group_stats(clean_trials, ["label", "tense"])
    by_tense = _collect_group_stats(clean_trials, ["tense"])
    by_label = _collect_group_stats(clean_trials, ["label"])

    lines: List[str] = []
    lines.append("# Final Norming Report")
    lines.append("")
    lines.append(f"Generated: {timestamp}")
    lines.append("")
    lines.append("## Data Summary")
    lines.append("")
    lines.append(f"- Participants: **{len(participants)}**")
    lines.append(f"- Raw PCIbex data rows: **{len(all_rows)}**")
    lines.append(f"- Clean analysis trials (experiment + filler): **{len(clean_trials)}**")
    lines.append(f"- Valid numeric ratings in clean trials: **{len(valid_clean)}**")
    lines.append(f"- Missing/non-numeric ratings in clean trials: **{missing_n}**")
    lines.append("")

    lines.append("## Participant List")
    lines.append("")
    lines.append(
        _markdown_table(
            participants,
            [
                "participant_hash",
                "source",
                "SONA_ID_URL",
                "n_responses",
                "n_experiment",
                "n_filler",
            ],
        )
    )
    lines.append("")

    lines.append("## Descriptive Means and Standard Errors")
    lines.append("")
    lines.append("SE values are computed across participant means within each condition.")
    lines.append("")

    lines.append("### By Label")
    lines.append("")
    lines.append(
        _markdown_table(
            by_label,
            ["label", "n_trials", "n_participants", "rating_mean", "rating_se", "rt_mean_ms", "rt_se_ms"],
        )
    )
    lines.append("")

    lines.append("### By Label and Tense (includes fillers)")
    lines.append("")
    lines.append(
        _markdown_table(
            by_label_tense,
            [
                "label",
                "tense",
                "n_trials",
                "n_participants",
                "rating_mean",
                "rating_se",
                "rt_mean_ms",
                "rt_se_ms",
            ],
        )
    )
    lines.append("")

    lines.append("### By Tense (pooled across experiment + fillers)")
    lines.append("")
    lines.append(
        _markdown_table(
            by_tense,
            ["tense", "n_trials", "n_participants", "rating_mean", "rating_se", "rt_mean_ms", "rt_se_ms"],
        )
    )
    lines.append("")

    lines.append("## Hierarchical Bayesian Models (Pyro)")
    lines.append("")
    lines.append(
        "Ordinal formulation follows the cumulative-logit approach from the NumPyro ordinal regression tutorial: https://num.pyro.ai/en/0.15.3/tutorials/ordinal_regression.html"
    )
    lines.append("")

    if not pyro_result.get("ok"):
        lines.append(f"Pyro models did not run: `{pyro_result.get('error', 'Unknown error')}`")
        lines.append("")
        return "\n".join(lines)

    lines.append("### Ordinal Rating Model")
    lines.append("")
    lines.append(
        "Model: ordinal cumulative-logit with random intercepts for participant and item, condition = `tense` (includes fillers)."
    )
    lines.append("")

    rating_model = pyro_result.get("rating_model")
    if isinstance(rating_model, dict) and rating_model.get("ok"):
        lines.append(f"- Model trials: **{rating_model['n_trials']}**")
        lines.append(f"- Participants in model: **{rating_model['n_subj']}**")
        lines.append(f"- Items in model: **{rating_model['n_item']}**")
        lines.append(f"- Sampler: **{rating_model.get('sampler', 'unknown')}**")
        lines.append(f"- Posterior draws: **{rating_model.get('n_draws', 'NA')}**")
        lines.append(f"- Note: {rating_model.get('notes', '')}")
        lines.append("")

        lines.append("#### Condition Effects (latent scale)")
        lines.append("")
        lines.append(
            _markdown_table(
                rating_model["cond_rows"],
                ["condition", "post_median", "ci_2.5", "ci_97.5"],
            )
        )
        lines.append("")

        lines.append("#### Condition Differences for Ratings")
        lines.append("")
        lines.append(
            _markdown_table(
                rating_model["contrast_rows"],
                ["contrast", "median_diff", "ci_2.5", "ci_97.5", "p_gt_0"],
            )
        )
        lines.append("")
    else:
        lines.append("Rating model not available.")
        lines.append("")

    lines.append("### RT Model")
    lines.append("")
    lines.append(
        "Model: Gaussian model on log RT (ms) with random intercepts for participant and item, condition = `tense` (includes fillers)."
    )
    lines.append("")

    rt_model = pyro_result.get("rt_model")
    if isinstance(rt_model, dict) and rt_model.get("ok"):
        lines.append(f"- Model trials: **{rt_model['n_trials']}**")
        lines.append(f"- Participants in model: **{rt_model['n_subj']}**")
        lines.append(f"- Items in model: **{rt_model['n_item']}**")
        lines.append(f"- Final ELBO loss: **{_fmt_num(rt_model.get('final_loss'), 2)}**")
        lines.append(f"- Note: {rt_model.get('notes', '')}")
        lines.append("")

        lines.append("#### Condition Effects (log ms)")
        lines.append("")
        lines.append(
            _markdown_table(
                rt_model["cond_rows"],
                ["condition", "post_median_log_ms", "ci_2.5", "ci_97.5", "implied_ms_median"],
            )
        )
        lines.append("")

        lines.append("#### Condition Differences for RT")
        lines.append("")
        lines.append(
            _markdown_table(
                rt_model["contrast_rows"],
                [
                    "contrast",
                    "median_diff",
                    "ci_2.5",
                    "ci_97.5",
                    "p_gt_0",
                    "ratio_median",
                    "ratio_ci_2.5",
                    "ratio_ci_97.5",
                ],
            )
        )
        lines.append("")
    else:
        lines.append("RT model not available.")
        lines.append("")

    lines.append("### Item-Level Past vs Future Differences (Experiment Items)")
    lines.append("")
    lines.append(
        "Model: ordinal cumulative-logit with item-specific past-vs-future slopes, random participant and item intercepts."
    )
    lines.append("")

    pf_model = pyro_result.get("past_future_item_model")
    if isinstance(pf_model, dict) and pf_model.get("ok"):
        lines.append(f"- Model trials: **{pf_model['n_trials']}**")
        lines.append(f"- Participants in model: **{pf_model['n_subj']}**")
        lines.append(f"- Items in model: **{pf_model['n_item']}**")
        lines.append(f"- Sampler: **{pf_model.get('sampler', 'unknown')}**")
        lines.append(f"- Posterior draws: **{pf_model.get('n_draws', 'NA')}**")
        lines.append(f"- Note: {pf_model.get('notes', '')}")
        lines.append("")

        lines.append("#### Global Past vs Future Contrast")
        lines.append("")
        lines.append(
            _markdown_table(
                [pf_model["global_contrast"]],
                ["contrast", "post_median", "ci_2.5", "ci_97.5", "p_gt_0"],
            )
        )
        lines.append("")

        lines.append("#### Top 20 Pictures by |Past - Future| Effect")
        lines.append("")
        lines.append(
            _markdown_table(
                pf_model["top_item_rows"],
                [
                    "item_id",
                    "picture",
                    "n_past",
                    "n_future",
                    "past_minus_future_median",
                    "ci_2.5",
                    "ci_97.5",
                    "p_gt_0",
                ],
            )
        )
        lines.append("")
        lines.append(
            "Full item list is saved in `analysis_output/past_future_item_effects.csv`."
        )
        lines.append("")
    else:
        lines.append("Past-vs-future item model not available.")
        lines.append("")

    return "\n".join(lines)


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Extract clean trial data, participant metadata, and a markdown report from PCIbex results CSV."
    )
    parser.add_argument("input_csv", type=Path, help="Path to PCIbex results CSV")
    parser.add_argument("--out-dir", type=Path, default=Path("analysis_output"), help="Output directory")
    parser.add_argument("--pyro-steps", type=int, default=2500, help="Iteration budget (SVI steps / MCMC tuning)")
    parser.add_argument("--seed", type=int, default=13, help="Random seed")
    args = parser.parse_args()

    all_rows = read_pcibex_rows(args.input_csv)
    response_trials = build_response_trials(all_rows)
    clean_trials = build_clean_trials(response_trials)
    participants = build_participants(all_rows)

    pyro_result = run_hierarchical_pyro(clean_trials, steps=args.pyro_steps, seed=args.seed)
    report_text = build_report(all_rows, clean_trials, participants, pyro_result)

    args.out_dir.mkdir(parents=True, exist_ok=True)

    clean_trials_path = args.out_dir / "clean_trials.csv"
    participants_path = args.out_dir / "participants.csv"
    report_path = args.out_dir / "final_report.md"
    pf_item_path = args.out_dir / "past_future_item_effects.csv"

    write_csv(
        clean_trials_path,
        clean_trials,
        [
            "participant_hash",
            "source",
            "SONA_ID_URL",
            "label",
            "item_order",
            "trialN",
            "item_id",
            "group",
            "character",
            "verb",
            "past_form",
            "type",
            "picture",
            "tense",
            "sentence",
            "rating",
            "rating_num",
            "rt_ms",
            "rt_ms_num",
            "is_valid_rating",
            "is_valid_ordinal",
            "comments",
            "results_reception_time",
            "event_time",
        ],
    )

    write_csv(
        participants_path,
        participants,
        [
            "participant_hash",
            "source",
            "SONA_ID_URL",
            "n_rows",
            "n_responses",
            "n_experiment",
            "n_filler",
            "first_reception_time",
            "last_reception_time",
        ],
    )

    report_path.write_text(report_text, encoding="utf-8")

    pf_model = pyro_result.get("past_future_item_model")
    if isinstance(pf_model, dict) and pf_model.get("ok"):
        write_csv(
            pf_item_path,
            pf_model["all_item_rows"],
            [
                "item_id",
                "picture",
                "n_past",
                "n_future",
                "past_minus_future_median",
                "ci_2.5",
                "ci_97.5",
                "p_gt_0",
                "abs_effect_for_ranking",
            ],
        )

    print(f"Read {len(all_rows)} data rows from {args.input_csv}")
    print(f"Saved {len(clean_trials)} clean trials to {clean_trials_path}")
    print(f"Saved {len(participants)} participants to {participants_path}")
    if pyro_result.get("ok"):
        print("Pyro model fit completed and included in report")
    else:
        print(f"Pyro model skipped: {pyro_result.get('error')}")
    print(f"Saved report to {report_path}")
    if isinstance(pyro_result.get("past_future_item_model"), dict) and pyro_result["past_future_item_model"].get("ok"):
        print(f"Saved item-level past/future effects to {pf_item_path}")


if __name__ == "__main__":
    main()
