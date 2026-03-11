const AUTO_RECORD_MS = 4500;
var __clickAudioCtx = null;

function playClickSound() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    if (!__clickAudioCtx) __clickAudioCtx = new AudioCtx();
    const ctx = __clickAudioCtx;
    if (ctx.state === "suspended") ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = 1200;

    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.035);
  } catch (e) {
    // If audio playback is blocked, continue trial without failing.
  }
}

// Production trial: participants produce a canonical past-tense utterance.
var trial =
  (blockLabel, patternTag = "p1") =>
  (row) => {
    const uniqueLabel = `exp_${blockLabel}_${patternTag}_${row.verb}_${row.side}`;
    const verbImage = newImage(row.verb, row.pic).size(400, 400);
    const recorderId =
      `resp_${blockLabel}_${patternTag}_${row.verb}_${row.side}`.toLowerCase();

    return newTrial(
      uniqueLabel,
      defaultText.css({ "font-size": "1.35em", "font-family": "sans-serif" }),

      newCanvas("production_blank", 1200, 700)
        .css({ "background-color": "white" })
        .center()
        .print(),
      newTimer("production_blank_t", 300).start(),
      getTimer("production_blank_t").wait(),
      getCanvas("production_blank").remove(),

      newText("production_fix", "+")
        .css({ "font-size": "3em", "font-weight": "bold" })
        .center()
        .print(),
      newTimer("production_fix_t", 500).start(),
      getTimer("production_fix_t").wait(),
      getText("production_fix").remove(),

      newVoiceRecorder(recorderId).log(),
      verbImage.center().print(),
      newFunction(
        `play_click_${blockLabel}_${patternTag}_${row.verb}_${row.side}`,
        playClickSound,
      ).call(),
      newVar("production_rt").set(() => Date.now()),
      getVoiceRecorder(recorderId).record(),

      newTimer("production_record_window", AUTO_RECORD_MS).start(),
      getTimer("production_record_window").wait(),
      getVoiceRecorder(recorderId).stop(),

      newButton("production_continue", "Continue")
        .bold()
        .css(button_css)
        .center()
        .print(),

      getVar("production_rt").set((v) => Date.now() - v),
      newKey(
        `production_space_${blockLabel}_${row.verb}_${row.side}`,
        " ",
      ).callback(getButton("production_continue").click()),
      getButton("production_continue").wait(),
    )
      .setOption("hideProgressBar", true)
      .log("Block", blockLabel)
      .log("Verb", row.verb)
      .log("Form", row.form)
      .log("Tense", row.side)
      .log("Regularity", row.regularity || "Unknown")
      .log("Entity", row.entity)
      .log("EventPhrase", row.event_phrase)
      .log("TargetLabelSentence", row.target_label_sentence)
      .log("TargetCanonicalSentence", row.target_canonical_sentence)
      .log("PatternTag", patternTag)
      .log("ResponseMode", "spoken_production")
      .log("AutoRecordMS", AUTO_RECORD_MS)
      .log("ProductionRT", getVar("production_rt"));
  };

var practiceDecisionTrial = (trialLabel, row) => {
  const uniqueLabel = trialLabel;
  const verbImage = newImage(`practice_${row.verb}`, row.pic).size(400, 400);
  const recorderId = `${trialLabel}_recorder`.toLowerCase();

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "1.35em", "font-family": "sans-serif" }),

    newCanvas("practice_production_blank", 1200, 700)
      .css({ "background-color": "white" })
      .center()
      .print(),
    newTimer("practice_production_blank_t", 300).start(),
    getTimer("practice_production_blank_t").wait(),
    getCanvas("practice_production_blank").remove(),

    newText("practice_production_fix", "+")
      .css({ "font-size": "3em", "font-weight": "bold" })
      .center()
      .print(),
    newTimer("practice_production_fix_t", 500).start(),
    getTimer("practice_production_fix_t").wait(),
    getText("practice_production_fix").remove(),

    newVoiceRecorder(recorderId).log(),
    verbImage.center().print(),
    newFunction(
      `play_click_practice_${row.verb}_${row.side}`,
      playClickSound,
    ).call(),
    newVar("practice_production_rt").set(() => Date.now()),
    getVoiceRecorder(recorderId).record(),

    newText(
      "practice_prompt",
      "Practice: speak a past-tense sentence for this picture.",
    )
      .css({
        "font-size": "1.15em",
        "margin-top": "14px",
        "font-weight": "bold",
      })
      .center()
      .print(),
    newText(
      "practice_hint",
      "Example: The Pirate spun a top. / The Pirate dragged a sack.",
    )
      .css({ "font-size": "1.0em", "margin-top": "6px" })
      .center()
      .print(),
    newText("practice_hint2", "Recording starts and stops automatically.")
      .css({ "font-size": "1.05em", "margin-top": "6px" })
      .center()
      .print(),

    newText("practice_recording_now", "Recording starts now. Please speak.")
      .css({
        "font-size": "1.1em",
        "font-weight": "bold",
        color: "#B00020",
        "margin-top": "12px",
      })
      .center()
      .print(),

    newTimer("practice_record_window", AUTO_RECORD_MS).start(),
    getTimer("practice_record_window").wait(),
    getVoiceRecorder(recorderId).stop(),
    getText("practice_recording_now").remove(),

    newButton("practice_continue", "Continue")
      .bold()
      .css(button_css)
      .center()
      .print(),

    getVar("practice_production_rt").set((v) => Date.now() - v),
    newKey(`practice_space_${row.verb}_${row.side}`, " ").callback(
      getButton("practice_continue").click(),
    ),
    getButton("practice_continue").wait(),
  )
    .setOption("hideProgressBar", true)
    .log("Block", "practice")
    .log("Verb", row.verb)
    .log("Form", row.form)
    .log("Tense", row.side)
    .log("Regularity", row.regularity || "Unknown")
    .log("Entity", row.entity)
    .log("EventPhrase", row.event_phrase)
    .log("TargetLabelSentence", row.target_label_sentence)
    .log("TargetCanonicalSentence", row.target_canonical_sentence)
    .log("ResponseMode", "spoken_production")
    .log("AutoRecordMS", AUTO_RECORD_MS)
    .log("ProductionRT", getVar("practice_production_rt"));
};

// Fixed I/R patterns used to order production trials.
// Pattern 0: I, R, R, I, I, R
// Pattern 1: R, I, I, R, R, I
const REGULARITY_PATTERNS = [
  ["IRREGULAR", "REGULAR", "REGULAR", "IRREGULAR", "IRREGULAR", "REGULAR"],
  ["REGULAR", "IRREGULAR", "IRREGULAR", "REGULAR", "REGULAR", "IRREGULAR"],
];

function getRegularityPatternByIndex(patternIndex) {
  const safeIndex =
    Math.abs(Number(patternIndex) || 0) % REGULARITY_PATTERNS.length;
  return REGULARITY_PATTERNS[safeIndex];
}

function orderItemsByRegularityPattern(items, patternIndex, previousEntity) {
  const irregular = items.filter((it) => it.regularity === "IRREGULAR");
  const regular = items.filter((it) => it.regularity === "REGULAR");
  const pattern = Number.isInteger(patternIndex)
    ? getRegularityPatternByIndex(patternIndex)
    : REGULARITY_PATTERNS[
        Math.floor(Math.random() * REGULARITY_PATTERNS.length)
      ];

  const byRegularity = {
    IRREGULAR: irregular.slice(),
    REGULAR: regular.slice(),
  };

  function solve(pos, prevEntity, remaining) {
    if (pos >= pattern.length) return [];

    const neededRegularity = pattern[pos];
    const candidates = remaining[neededRegularity].filter(
      (item) => item.entity !== prevEntity,
    );

    for (let i = 0; i < candidates.length; i++) {
      const pick = candidates[i];
      const nextRemaining = {
        IRREGULAR: remaining.IRREGULAR.slice(),
        REGULAR: remaining.REGULAR.slice(),
      };
      const pool = nextRemaining[neededRegularity];
      const idx = pool.indexOf(pick);
      if (idx > -1) pool.splice(idx, 1);

      const rest = solve(pos + 1, pick.entity, nextRemaining);
      if (rest) return [pick].concat(rest);
    }

    return null;
  }

  const constrained = solve(0, previousEntity || null, byRegularity);
  if (constrained) return constrained;

  // Fallback to regularity-only ordering if no constrained solution is found.
  const pools = {
    IRREGULAR: irregular.slice(),
    REGULAR: regular.slice(),
  };

  const ordered = [];

  pattern.forEach((r) => {
    if (pools[r].length > 0) {
      ordered.push(pools[r].shift());
    } else {
      // fallback: if we ever run out, pull from the other pool
      const other = r === "IRREGULAR" ? "REGULAR" : "IRREGULAR";
      if (pools[other].length > 0) {
        ordered.push(pools[other].shift());
      }
    }
  });

  // if anything is left over (shouldn't be), append it
  ordered.push(...pools.IRREGULAR, ...pools.REGULAR);

  return ordered;
}

function escapeRegExp(s) {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

var recall_trial = (blockLabel) => (row) => {
  const uniqueLabel = `recall_${blockLabel}_${row.verb}_${row.side}`;
  const verbImage = newImage(row.verb, row.pic).size(150, 150);

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    verbImage.center().print(),

    newText(
      "prompt",
      "Type the original verb (base form). You can include the object:",
    )
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
    newKey(`recall_space_${blockLabel}_${row.verb}_${row.side}`, " ").callback(
      getButton("Next").click(),
    ),
    getButton("Next").wait(),

    getTextInput("answer")
      .test.text(new RegExp(`\\b${escapeRegExp(row.verb)}\\b`, "i"))
      .success(
        newText(
          "feedback-ok",
          "Correct! Your answer included the verb '" + row.verb + "'.",
        )
          .settings.bold()
          .settings.color("green")
          .center()
          .print(),
        newTimer("fb-ok", 1500).start(),
        getTimer("fb-ok").wait(),
      )
      .failure(
        newText(
          "feedback-bad",
          "Please include the verb '" + row.verb + "' in your answer.",
        )
          .settings.bold()
          .settings.color("red")
          .center()
          .print(),
        newTimer("fb-bad", 2500).start(),
        getTimer("fb-bad").wait(),
      ),
  )
    .setOption("hideProgressBar", true)
    .log("Block", blockLabel)
    .log("Verb", row.verb)
    .log("Form", row.form)
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

    newText(
      "body",
      "Before the production trials, please type the learned verb for each picture.",
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue").center().print(),
    newKey(`recall_intro_space_${blockName}`, " ").callback(
      getButton("Continue").click(),
    ),
    getButton("Continue").wait(),
  ).setOption("hideProgressBar", true);

var recallOutroTrial = (blockName) =>
  newTrial(
    `recall_outro_${blockName}`,
    newText("title", "Memory check complete")
      .css({ "font-size": "2.5em", "font-weight": "bold" })
      .center()
      .print(),

    newText(
      "body",
      "Great. Next, we will learn how those verbs map to yesterday (Past) and tomorrow (Future).",
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue").center().print(),
    newKey(`recall_outro_space_${blockName}`, " ").callback(
      getButton("Continue").click(),
    ),
    getButton("Continue").wait(),
  ).setOption("hideProgressBar", true);
