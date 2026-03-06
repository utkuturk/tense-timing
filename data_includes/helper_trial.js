// Decision trial (fixed mapping: C=Past, M=Future)
var trial = (blockLabel, patternTag = "p1") => (row) => {
  const uniqueLabel = `exp_${blockLabel}_${patternTag}_${row.verb}_${row.side}`;
  const verbImage   = newImage(row.verb, row.pic).size(400, 400);

  const leftLabel  = "Past (C)";
  const rightLabel = "Future (M)";

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "1.35em", "font-family": "sans-serif" }),

    newCanvas("decision_blank", 1200, 700)
      .css({ "background-color": "white" })
      .center()
      .print(),
    newTimer("decision_blank_t", 300).start(),
    getTimer("decision_blank_t").wait(),
    getCanvas("decision_blank").remove(),

    newText("decision_fix", "+")
      .css({ "font-size": "3em", "font-weight": "bold" })
      .center()
      .print(),
    newTimer("decision_fix_t", 500).start(),
    getTimer("decision_fix_t").wait(),
    getText("decision_fix").remove(),

    // picture
    verbImage.center().print(),

    // left/right labels
    newText("leftOpt",  leftLabel),
    newText("rightOpt", rightLabel),

    newCanvas("choices", 820, 120)
      .add("center at 35%", "middle at 50%", getText("leftOpt"))
      .add("center at 65%", "middle at 50%", getText("rightOpt"))
      .print(),

    // RT start
    newVar("decision_RT").global().set(v => Date.now()),

    newSelector("tenseChoice")
      .add(getText("leftOpt"), getText("rightOpt"))
      .keys("C", "M")
      .once()
      .log()
      .wait(),

    // RT end
    getVar("decision_RT").set(v => Date.now() - v)
  )
    .setOption("hideProgressBar", true)
    .log("Block",   blockLabel)
    .log("Verb",    row.verb)
    .log("Form",    row.form)
    .log("Tense",   row.side)
    .log("Entity",  row.entity)          // <--- add this
    .log("PatternTag", patternTag)
    .log("LeftOpt", leftLabel)
    .log("RightOpt", rightLabel)
    .log("DecisionRT", getVar("decision_RT"));
};

var practiceDecisionTrial = (trialLabel, row) => {
  const uniqueLabel = trialLabel;
  const verbImage = newImage(`practice_${row.verb}`, row.pic).size(400, 400);
  const leftLabel = "Past (C)";
  const rightLabel = "Future (M)";
  const correctLabel = row.side === "PAST" ? leftLabel : rightLabel;

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "1.35em", "font-family": "sans-serif" }),

    newCanvas("practice_decision_blank", 1200, 700)
      .css({ "background-color": "white" })
      .center()
      .print(),
    newTimer("practice_decision_blank_t", 300).start(),
    getTimer("practice_decision_blank_t").wait(),
    getCanvas("practice_decision_blank").remove(),

    newText("practice_decision_fix", "+")
      .css({ "font-size": "3em", "font-weight": "bold" })
      .center()
      .print(),
    newTimer("practice_decision_fix_t", 500).start(),
    getTimer("practice_decision_fix_t").wait(),
    getText("practice_decision_fix").remove(),

    verbImage.center().print(),

    newText("practice_leftOpt", leftLabel),
    newText("practice_rightOpt", rightLabel),

    newCanvas("practice_choices", 820, 120)
      .add("center at 35%", "middle at 50%", getText("practice_leftOpt"))
      .add("center at 65%", "middle at 50%", getText("practice_rightOpt"))
      .print(),

    newVar("practice_decision_RT").set(() => Date.now()),
    newVar("practice_correct").set(0),

    newSelector("practice_tenseChoice")
      .add(getText("practice_leftOpt"), getText("practice_rightOpt"))
      .keys("C", "M")
      .once()
      .log()
      .wait(),

    getVar("practice_decision_RT").set(v => Date.now() - v),
    getSelector("practice_tenseChoice")
      .test.selected(row.side === "PAST" ? getText("practice_leftOpt") : getText("practice_rightOpt"))
      .success(
        getVar("practice_correct").set(1),
        newText("practice_feedback", "Correct!")
          .css({ "font-size": "1.3em", "font-weight": "bold", "color": "green", "margin-top": "14px" })
          .center()
          .print(),
        newTimer("practice_fb_ok_t", 1200).start(),
        getTimer("practice_fb_ok_t").wait(),
        getText("practice_feedback").remove()
      )
      .failure(
        newText("practice_feedback", `Incorrect. Correct answer: ${correctLabel}.`)
          .css({ "font-size": "1.2em", "font-weight": "bold", "color": "crimson", "margin-top": "14px" })
          .center()
          .print(),
        newTimer("practice_fb_bad_t", 1700).start(),
        getTimer("practice_fb_bad_t").wait(),
        getText("practice_feedback").remove()
      )
  )
    .setOption("hideProgressBar", true)
    .log("Block", "practice")
    .log("Verb", row.verb)
    .log("Form", row.form)
    .log("Tense", row.side)
    .log("Entity", row.entity)
    .log("LeftOpt", leftLabel)
    .log("RightOpt", rightLabel)
    .log("PracticeCorrect", getVar("practice_correct"))
    .log("DecisionRT", getVar("practice_decision_RT"));
};

// Fixed P/F patterns used for decision trials.
// Pattern 0: PAST, FUTURE, FUTURE, PAST, PAST, FUTURE
// Pattern 1: FUTURE, PAST, PAST, FUTURE, FUTURE, PAST
const TENSE_PATTERNS = [
  ["PAST",   "FUTURE", "FUTURE", "PAST",   "PAST",   "FUTURE"],
  ["FUTURE", "PAST",   "PAST",   "FUTURE", "FUTURE", "PAST"]
];

function getTensePatternByIndex(patternIndex) {
  const safeIndex = Math.abs(Number(patternIndex) || 0) % TENSE_PATTERNS.length;
  return TENSE_PATTERNS[safeIndex];
}

function orderItemsByTensePattern(items, patternIndex, previousEntity) {
  const past   = items.filter(it => it.side === "PAST");
  const future = items.filter(it => it.side === "FUTURE");
  const pattern = Number.isInteger(patternIndex)
    ? getTensePatternByIndex(patternIndex)
    : TENSE_PATTERNS[Math.floor(Math.random() * TENSE_PATTERNS.length)];

  const byTense = {
    PAST: past.slice(),
    FUTURE: future.slice()
  };

  function solve(pos, prevEntity, remaining) {
    if (pos >= pattern.length) return [];

    const neededTense = pattern[pos];
    const candidates = remaining[neededTense]
      .filter(item => item.entity !== prevEntity);

    for (let i = 0; i < candidates.length; i++) {
      const pick = candidates[i];
      const nextRemaining = {
        PAST: remaining.PAST.slice(),
        FUTURE: remaining.FUTURE.slice()
      };
      const pool = nextRemaining[neededTense];
      const idx = pool.indexOf(pick);
      if (idx > -1) pool.splice(idx, 1);

      const rest = solve(pos + 1, pick.entity, nextRemaining);
      if (rest) return [pick].concat(rest);
    }

    return null;
  }

  const constrained = solve(0, previousEntity || null, byTense);
  if (constrained) return constrained;

  // Fallback to tense-only ordering if no constrained solution is found.
  const pools = {
    PAST: past.slice(),
    FUTURE: future.slice()
  };

  const ordered = [];

  pattern.forEach(t => {
    if (pools[t].length > 0) {
      ordered.push(pools[t].shift());
    } else {
      // fallback: if we ever run out, pull from the other pool
      const other = t === "PAST" ? "FUTURE" : "PAST";
      if (pools[other].length > 0) {
        ordered.push(pools[other].shift());
      }
    }
  });

  // if anything is left over (shouldn't be), append it
  ordered.push(...pools.PAST, ...pools.FUTURE);

  return ordered;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

var recall_trial = (blockLabel) => (row) => {
  const uniqueLabel = `recall_${blockLabel}_${row.verb}_${row.side}`;
  const verbImage   = newImage(row.verb, row.pic).size(150, 150);

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    verbImage.center().print(),

    newText("prompt", "Type the original verb (base form). You can include the object:")
      .center()
      .print(),

    newTextInput("answer")
      .log()
      .lines(1)
    //   .css(underline_blank)
      .center()
      .print(),

    newText("<p>").print(),

    newButton("Next")
      .bold()
    //   .css(button_css)
      .center()
      .print(),
    newKey(`recall_space_${blockLabel}_${row.verb}_${row.side}`, " ").callback(getButton("Next").click()),
    getButton("Next").wait(),

    getTextInput("answer")
      .test.text(new RegExp(`\\b${escapeRegExp(row.verb)}\\b`, "i"))
      .success(
        newText("feedback-ok",
          "Correct! Your answer included the verb '" + row.verb + "'."
        )
          .settings.bold()
          .settings.color("green")
          .center()
          .print(),
        newTimer("fb-ok", 1500).start(),
        getTimer("fb-ok").wait()
      )
      .failure(
        newText("feedback-bad",
          "Please include the verb '" + row.verb + "' in your answer."
        )
          .settings.bold()
          .settings.color("red")
          .center()
          .print(),
        newTimer("fb-bad", 2500).start(),
        getTimer("fb-bad").wait()
      )
  )
    .setOption("hideProgressBar", true)
    .log("Block", blockLabel)
    .log("Verb",  row.verb)
    .log("Form",  row.form)
    .log("Entity", row.entity)
    .log("Tense", row.side);
};

var recallIntroTrial = (blockName) =>
  newTrial(
    `recall_intro_${blockName}`,
    newText("title", "Memory check")
      .css({ "font-size": "2.5em", "font-weight": "bold" })
      .center()
      .print(),

    newText("body",
      "Before the decision trials, please type the learned verb for each picture."
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue")
      .center()
      .print(),
    newKey(`recall_intro_space_${blockName}`, " ").callback(getButton("Continue").click()),
    getButton("Continue").wait()
  )
    .setOption("hideProgressBar", true);

var recallOutroTrial = (blockName) =>
  newTrial(
    `recall_outro_${blockName}`,
    newText("title", "Memory check complete")
      .css({ "font-size": "2.5em", "font-weight": "bold" })
      .center()
      .print(),

    newText("body",
      "Great. Next, we will learn how those verbs map to yesterday (Past) and tomorrow (Future)."
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue")
      .center()
      .print(),
    newKey(`recall_outro_space_${blockName}`, " ").callback(getButton("Continue").click()),
    getButton("Continue").wait()
  )
    .setOption("hideProgressBar", true);
