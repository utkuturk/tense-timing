// --- Initial Setup ---
PennController.ResetPrefix(null);
DebugOff();
SendResults("send_results");
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/elevenlabs_audio.zip",
);
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/morphosyntax/chunk_includes/pictures.zip",
);
const isDemoMode = GetURLParameter("id") === "demo";
const SUBJECT_ID = isDemoMode ? "demo" : Math.random().toString(36).slice(2, 10);
// SONA credit links. Set experiment_id and credit_token from the SONA
// researcher dashboard for this study before deploying to PCIbex; the real
// values are deliberately not kept in this repository.
const PSYCH_SONA_LINK_BASE =
  "https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=XX&credit_token=XX&survey_code=";
const LING_SONA_LINK_BASE =
  "https://umlinguistics.sona-systems.com/webstudy_credit.aspx?experiment_id=XX&credit_token=XX&survey_code=";
var psych_sona_link = PSYCH_SONA_LINK_BASE + GetURLParameter("id");
var ling_sona_link = LING_SONA_LINK_BASE + GetURLParameter("id");
const listOptions = ["a", "b", "c", "d"];
const requestedListParam = String(GetURLParameter("list") || "")
  .trim()
  .toLowerCase();
const hasValidRequestedList = listOptions.includes(requestedListParam);
const LIST_ID = hasValidRequestedList
  ? requestedListParam
  : listOptions[Math.floor(Math.random() * listOptions.length)];
const LIST_SOURCE = hasValidRequestedList ? "url_param" : "random";

const LAMBDA_URL =
  "https://u7dzjb1y1m.execute-api.us-east-2.amazonaws.com/default/pcibex-s3-recorder";
InitiateRecorder(
  LAMBDA_URL,
  "<p><b>This study records your voice responses.</b></p>" +
    "<p>Please allow microphone access when prompted, then continue.</p>",
)
  .label("init")
  .consent("I consent to audio recording for this study.");

Header(
  newVar("source", "").global().set(GetURLParameter("source")),
  newVar("subject_id", "").global().set(SUBJECT_ID),
  newVar("requested_list", "")
    .global()
    .set(requestedListParam || "none"),
  newVar("assigned_list", "").global().set(LIST_ID),
  newVar("list_source", "").global().set(LIST_SOURCE),
)
  .log("SONA_ID_URL", GetURLParameter("id"))
  .log("source", GetURLParameter("source"))
  .log("subject_id", getVar("subject_id"))
  .log("requested_list", getVar("requested_list"))
  .log("assigned_list", getVar("assigned_list"))
  .log("list_source", getVar("list_source"));

// --- CSS / UI Helpers ---
const newDemo = (name, label) => [
  newTextInput(name)
    .before(
      newText(label)
        .size("15em", "1.5em")
    )
    .size("15em", "1.5em")
    .lines(1)
    .css(underline_blank)
    .center()
    .print()
    .log(),
  newText("<br><br>").print()
];

const requireFilled = (name, msg) =>
  getTextInput(name)
    .testNot.text("")
    .failure(
      newText("err-" + name, msg)
        .settings.color("red")
        .print()
    );

var button_css = {
  "background-color": "#E03A3E",
  color: "white",
  "font-size": "1.25em",
  padding: "0.5em",
  "border-radius": "0.25em",
  margin: "0 auto",
  "text-align": "center",
  border: "none",
  display: "block",
};

var text_css = {
  margin: "0 auto",
  "font-size": "20px",
  "font-family": "sans-serif",
};

var underline_blank = {
  outline: "none",
  resize: "none",
  border: "0",
  padding: "0",
  margin: "0",
  "margin-left": "1ex",
  "margin-right": "1ex",
  "vertical-align": "-.33em",
  "background-color": "white",
  "border-bottom": "2px solid black",
  display: "inline",
};

// --- Break Trial ---
newTrial("Break",
  newText("message", "Break")
      .css({ "font-size": "3em", "font-weight": "bold", "color": "#cc0000" })
      .center()
      .print(),

  newText("instruction",
          "Now we are going to learn about other things they did. Please <b>rest for a second</b>.")
      .css({ "font-size": "1.8em", "margin-top": "30px" })
      .center()
      .print(),

  newText("note",
          "Click 'Continue' when you are ready to see the verbs for the next block.")
      .css({ "font-size": "1.2em", "margin-top": "50px" })
      .center()
      .print(),
  newText("space1break", "<p>")
      .center()
      .print(),
  newTimer("break_continue_gate", 2000)
      .start()
      .wait()
      ,
  newButton("Continue")
      .css(button_css)
      .center()
      .print(),
  newTimer("break_timeout_warn", 55000)
      .callback(
        newText("break_warn_text", "Please do not wait too long! Press Continue to proceed.")
          .css({
            color: "red",
            "font-size": "2.5em",
            "font-weight": "bold",
            "background-color": "#ffe0e0",
            padding: "20px 40px",
            border: "4px solid red",
            "border-radius": "12px",
            "margin-top": "20px",
          })
          .center()
          .print()
      )
      .start(),
  newTimer("break_timeout_advance", 60000)
      .callback(getButton("Continue").click())
      .start(),
  newKey("break_space_continue", " ").callback(getButton("Continue").click())
      ,
  getButton("Continue")
      .wait()
)
  .setOption("hideProgressBar", true);

// --- Situation Switch Trial ---
newTrial("SituationSwitch",
  newText("switch_title", "New Situation")
      .css({ "font-size": "3em", "font-weight": "bold", "color": "#003366" })
      .center()
      .print(),

  newText("switch_instruction",
          "Now we are moving to a <b>new situation</b>.<br>The times of the events may be different from what you learned before. Please <b>rest for a second</b> and then click 'Continue' to see the verbs for the next block.")
      .css({ "font-size": "1.6em", "margin-top": "24px", "text-align": "center" })
      .center()
      .print(),

  newText("switch_note",
          "Click 'Continue' when you are ready to begin the next situation.")
      .css({ "font-size": "1.2em", "margin-top": "42px" })
      .center()
      .print(),
  newText("space_switch", "<p>")
      .center()
      .print(),
  newTimer("switch_continue_gate", 2000)
      .start()
      .wait(),
  newButton("switch_continue", "Continue")
      .css(button_css)
      .center()
      .print(),
  newTimer("switch_timeout_warn", 55000)
      .callback(
        newText("switch_warn_text", "Please do not wait too long! Press Continue to proceed.")
          .css({
            color: "red",
            "font-size": "2.5em",
            "font-weight": "bold",
            "background-color": "#ffe0e0",
            padding: "20px 40px",
            border: "4px solid red",
            "border-radius": "12px",
            "margin-top": "20px",
          })
          .center()
          .print()
      )
      .start(),
  newTimer("switch_timeout_advance", 60000)
      .callback(getButton("switch_continue").click())
      .start(),
  newKey("switch_space_continue", " ").callback(getButton("switch_continue").click()),
  getButton("switch_continue")
      .wait()
)
  .setOption("hideProgressBar", true);

// --- Trial Functions ---
const AUTO_RECORD_MS = 4500;

var trial =
  (blockLabel, patternTag = "p1") =>
  (row) => {
    const uniqueLabel = `exp_${blockLabel}_${patternTag}_${row.verb}_${row.side}`;
    const verbImage = newImage(row.verb, row.pic).size(400, 400);
    const recorderId =
      `${SUBJECT_ID}_resp_${blockLabel}_${patternTag}_${row.verb}_${row.side}`.toLowerCase();

    return newTrial(
      uniqueLabel,
      defaultText.css({ "font-size": "1.35em", "font-family": "sans-serif" }),

      newCanvas("production_blank", 1200, 700)
        .css({ "background-color": "white" })
        .center()
        .print(),
      newTimer("production_blank_t", 400).start(),
      getTimer("production_blank_t").wait(),
      getCanvas("production_blank").remove(),

      newText("production_fix", "+")
        .css({ "font-size": "5em", "font-weight": "bold" })
        .center()
        .print("center at 50vw", "middle at 35vh"),
      newTimer("production_fix_t", 600).start(),
      getTimer("production_fix_t").wait(),
      getText("production_fix").remove(),

      newVoiceRecorder(recorderId).log(),
      verbImage.center().print(),
      getVoiceRecorder(recorderId).record(),

      newTimer("production_record_window", AUTO_RECORD_MS)
        .callback(getVoiceRecorder(recorderId).stop())
        .start(),
      getTimer("production_record_window").wait(),

      newButton("production_continue", "Continue")
        .bold()
        .css(button_css)
        .center()
        .print(),

      newTimer("production_timeout_warn", 13000)
        .callback(
          newText(
            "production_warn_text",
            "Please do not wait too long between scenes!",
          )
            .css({
              color: "red",
              "font-size": "2.5em",
              "font-weight": "bold",
              "background-color": "#ffe0e0",
              padding: "20px 40px",
              border: "4px solid red",
              "border-radius": "12px",
              "margin-top": "20px",
            })
            .center()
            .print(),
        )
        .start(),
      newTimer("production_timeout_advance", 15000)
        .callback(getButton("production_continue").click())
        .start(),

      newKey(
        `production_space_${blockLabel}_${row.verb}_${row.side}`,
        " ",
      ).callback(getButton("production_continue").click()),
      getButton("production_continue").wait(),
    )
      .setOption("hideProgressBar", true)
      .log("Block", blockLabel)
      .log("Verb", row.verb)
      .log("Regularity", row.regularity || "Unknown")
      .log("Form", row.form)
      .log("Tense", row.side)
      .log("Entity", row.entity)
      .log("EventPhrase", row.event_phrase)
      .log("TargetLabelSentence", row.target_label_sentence)
      .log("TargetCanonicalSentence", row.target_canonical_sentence)
      .log("PatternTag", patternTag)
      .log("ResponseMode", "spoken_production")
      .log("AutoRecordMS", AUTO_RECORD_MS);
  };

var practiceDecisionTrial = (trialLabel, row) => {
  const uniqueLabel = trialLabel;
  const verbImage = newImage(`practice_${row.verb}`, row.pic).size(400, 400);
  const recorderId = `${SUBJECT_ID}_${trialLabel}_recorder`.toLowerCase();

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
    getVoiceRecorder(recorderId).record(),

    newText(
      "practice_prompt",
      "describe this sentence using the appropriate tense and a overt subject.<br>",
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
      "Example: The Pirate dragged a sack or The pirate will drag a sack.<br>",
    )
      .css({ "font-size": "1.0em", "margin-top": "6px" })
      .center()
      .print(),
    newText("practice_hint2", "Recording starts and stops automatically.<br>")
      .css({ "font-size": "1.05em", "margin-top": "6px" })
      .center()
      .print(),

    newText("practice_recording_now", "Recording started! Please speak.<br>")
      .css({
        "font-size": "1.1em",
        "font-weight": "bold",
        color: "#B00020",
        "margin-top": "12px",
      })
      .center()
      .print(),

    newTimer("practice_record_window", AUTO_RECORD_MS)
      .callback(getVoiceRecorder(recorderId).stop())
      .start(),
    getTimer("practice_record_window").wait(),
    getText("practice_recording_now").remove(),

    newButton("practice_continue", "Continue")
      .bold()
      .css(button_css)
      .center()
      .print(),

    newKey(`practice_space_${row.verb}_${row.side}`, " ").callback(
      getButton("practice_continue").click(),
    ),
    getButton("practice_continue").wait(),
  )
    .setOption("hideProgressBar", true)
    .log("Block", "practice")
    .log("Verb", row.verb)
    .log("Regularity", row.regularity || "Unknown")
    .log("Form", row.form)
    .log("Tense", row.side)
    .log("Entity", row.entity)
    .log("EventPhrase", row.event_phrase)
    .log("TargetLabelSentence", row.target_label_sentence)
    .log("TargetCanonicalSentence", row.target_canonical_sentence)
    .log("ResponseMode", "spoken_production")
    .log("AutoRecordMS", AUTO_RECORD_MS);
};

// Fixed P/F patterns used to order production trials.
// Pattern 0: PAST, FUTURE, FUTURE, PAST, PAST, FUTURE
// Pattern 1: FUTURE, PAST, PAST, FUTURE, FUTURE, PAST
const TENSE_PATTERNS = [
  ["PAST", "FUTURE", "FUTURE", "PAST", "PAST", "FUTURE"],
  ["FUTURE", "PAST", "PAST", "FUTURE", "FUTURE", "PAST"],
];

function getTensePatternByIndex(patternIndex) {
  const safeIndex = Math.abs(Number(patternIndex) || 0) % TENSE_PATTERNS.length;
  return TENSE_PATTERNS[safeIndex];
}

function orderItemsByTensePattern(items, patternIndex, previousEntity) {
  const past = items.filter((it) => it.side === "PAST");
  const future = items.filter((it) => it.side === "FUTURE");
  const pattern = Number.isInteger(patternIndex)
    ? getTensePatternByIndex(patternIndex)
    : TENSE_PATTERNS[Math.floor(Math.random() * TENSE_PATTERNS.length)];

  const byTense = {
    PAST: past.slice(),
    FUTURE: future.slice(),
  };

  function solve(pos, prevEntity, remaining) {
    if (pos >= pattern.length) return [];

    const neededTense = pattern[pos];
    const candidates = remaining[neededTense].filter(
      (item) => item.entity !== prevEntity,
    );

    for (let i = 0; i < candidates.length; i++) {
      const pick = candidates[i];
      const nextRemaining = {
        PAST: remaining.PAST.slice(),
        FUTURE: remaining.FUTURE.slice(),
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
    FUTURE: future.slice(),
  };

  const ordered = [];

  pattern.forEach((t) => {
    if (pools[t].length > 0) {
      ordered.push(pools[t].shift());
    } else {
      const other = t === "PAST" ? "FUTURE" : "PAST";
      if (pools[other].length > 0) {
        ordered.push(pools[other].shift());
      }
    }
  });

  ordered.push(...pools.PAST, ...pools.FUTURE);

  return ordered;
}


// --- Block Intro Functions ---
var MIN_TENSE_STUDY_MS = 3000;
var VERB_WHITE_MS = 400;
var VERB_FIX_MS = 600;
var VERB_POST_AUDIO_MS = 2000;
var ENTITY_DISPLAY_ORDER = ["Pirate", "Wizard", "Chef"];

function uniqueByVerb(items) {
  const seen = {};
  const out = [];
  items.forEach((item) => {
    if (!seen[item.verb]) {
      seen[item.verb] = true;
      out.push(item);
    }
  });
  return out;
}

function shuffledCopy(items) {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function audioFileForVerb(item) {
  return `tts_verb_${item.verb}.mp3`;
}

function audioFileForSentence(item) {
  const entity = String(item.entity || "").toLowerCase();
  const tense = String(item.side || "").toLowerCase();
  return `tts_sent_${entity}_${item.verb}_${tense}.mp3`;
}

var introTrial = (blockName, items) => {
  const verbItems = shuffledCopy(uniqueByVerb(items));
  const commands = [
    defaultText.css({ "font-size": "1.25em", "font-family": "sans-serif" }),
    newText("intro_title", "Learn the verbs")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "intro_body",
      "You will now see the actions one by one.<br><br>" +
        "Listen to each action and study it carefully. When you are ready, click <b>Next</b> or press <b>SPACE</b> to learn the next one.<br><br>" +
        "You will also hear the verb and the object being told to you, but not the full sentence. Please utter full sentences when describing them.",
    )
      .css({ "font-size": "1.25em", "margin-top": "20px" })
      .center()
      .print(),
    newText("intro_space_start", "<p>").print(),
    newButton("intro_start", "Start")
      .bold()
      .css(button_css)
      .center()
      .disable()
      .print(),
    newTimer(`intro_start_gate_${blockName}`, 900).start(),
    getTimer(`intro_start_gate_${blockName}`).wait(),
    getButton("intro_start").enable(),
    newKey(`intro_start_space_${blockName}`, " ").callback(
      getButton("intro_start").click(),
    ),
    getButton("intro_start").wait(),
    getText("intro_title").remove(),
    getText("intro_body").remove(),
    getButton("intro_start").remove(),
  ];

  verbItems.forEach((item, idx) => {
    const n = idx + 1;
    const audioId = `v_audio_${n}`;
    commands.push(
      newCanvas(`vblank_${n}`, 1200, 700)
        .css({ "background-color": "white" })
        .center()
        .print(),
      newTimer(`vblank_t_${n}`, VERB_WHITE_MS).start(),
      getTimer(`vblank_t_${n}`).wait(),
      getCanvas(`vblank_${n}`).remove(),
      newText(`vcross_${n}`, "+")
        .css({ "font-size": "5em", "font-weight": "bold" })
        .center()
        .print("center at 50vw", "middle at 35vh"),
      newTimer(`vcross_t_${n}`, VERB_FIX_MS).start(),
      getTimer(`vcross_t_${n}`).wait(),
      getText(`vcross_${n}`).remove(),
      newImage(`vimg_${n}`, item.pic).size(400, 400).center().print(),
      newText(`vent_${n}`, item.entity)
        .css({ "font-size": "1.1em" })
        .center()
        .print(),
      newText(`vtxt_${n}`, item.verb)
        .css({ "font-size": "2.2em", "font-weight": "bold" })
        .center()
        .print(),
      newText(`vobj_${n}`, item.object || "")
        .css({ "font-size": "1.25em", "margin-top": "6px" })
        .center()
        .print(),
      newAudio(audioId, audioFileForVerb(item)),
      getAudio(audioId).play(),
      newTimer(`vmin_${n}`, VERB_POST_AUDIO_MS).start(),
      // Do not block on audio end; missing/failed files can otherwise freeze the trial.
      getTimer(`vmin_${n}`).wait(),
      newText(`vspace2_${n}`, "<p>").print(),
      newButton(`vnext_${n}`, "Next").bold().css(button_css).center().print(),
      newKey(`vnext_space_${n}`, " ").callback(getButton(`vnext_${n}`).click()),
      getButton(`vnext_${n}`).wait(),
      getImage(`vimg_${n}`).remove(),
      getText(`vent_${n}`).remove(),
      getText(`vtxt_${n}`).remove(),
      getText(`vobj_${n}`).remove(),
      getButton(`vnext_${n}`).remove(),
    );
  });

  return newTrial(`intro_${blockName}`, ...commands).setOption(
    "hideProgressBar",
    true,
  );
};

var tenseIntroTrial = (blockName, options = {}) =>
  newTrial(
    `tense_intro_${blockName}`,
    newText("title", options.title || "Now let's place events in time")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "body",
      options.body ||
        "<p>Each character has an event that they completed in the <b>past</b> and an event they will complete in the <b>future</b>.</p>" +
          "<p>Now we will show you times for each event for each participant.</p>" +
          "<p>For each item, press <b>SPACE</b> to reveal the picture and hear the sentence audio.</p>" +
          "<p>Then click <b>Next</b> to continue.</p>",
    )
      .css({
        "font-size": "1.25em",
        "max-width": "38em",
        "text-align": "left",
        "margin-top": "20px",
      })
      .center()
      .print(),
    newText("space_to_start", options.startPrompt || "Press SPACE to begin.")
      .css({
        "font-size": "1.2em",
        "font-weight": "bold",
        "margin-top": "16px",
      })
      .center()
      .print(),
    newKey(`tense_intro_space_${blockName}`, " ").wait(),
  ).setOption("hideProgressBar", true);

var tensePairTrial = (blockName, items, options = {}) => {
  const byEntity = {};
  uniqueByVerb(items).forEach((item) => {
    if (!byEntity[item.entity])
      byEntity[item.entity] = { PAST: [], FUTURE: [] };
    if (!byEntity[item.entity][item.side])
      byEntity[item.entity][item.side] = [];
    byEntity[item.entity][item.side].push(item);
  });

  Object.keys(byEntity).forEach((entity) => {
    byEntity[entity].PAST = (byEntity[entity].PAST || [])
      .slice()
      .sort((a, b) => a.verb.localeCompare(b.verb));
    byEntity[entity].FUTURE = (byEntity[entity].FUTURE || [])
      .slice()
      .sort((a, b) => a.verb.localeCompare(b.verb));
  });

  const extraEntities = Object.keys(byEntity)
    .filter((e) => !ENTITY_DISPLAY_ORDER.includes(e))
    .sort();

  const entityOrder = ENTITY_DISPLAY_ORDER.concat(extraEntities).filter(
    (e) =>
      byEntity[e] &&
      ((byEntity[e].PAST && byEntity[e].PAST.length) ||
        (byEntity[e].FUTURE && byEntity[e].FUTURE.length)),
  );

  const rows = [];
  entityOrder.forEach((entity) => {
    const pastItems = byEntity[entity].PAST || [];
    const futureItems = byEntity[entity].FUTURE || [];
    const rowCount = Math.max(pastItems.length, futureItems.length);
    for (let i = 0; i < rowCount; i++) {
      rows.push({
        entity,
        pastItem: pastItems[i] || null,
        futureItem: futureItems[i] || null,
      });
    }
  });

  const orderedItems = [];
  rows.forEach((row) => {
    if (row.pastItem) orderedItems.push(row.pastItem);
    if (row.futureItem) orderedItems.push(row.futureItem);
  });

  const tensePairImageSize = 250;
  const rowStartY = 155;
  const rowStepY = tensePairImageSize + 10;
  const pairCanvasHeight =
    rowStartY +
    Math.max(rows.length - 1, 0) * rowStepY +
    Math.ceil(tensePairImageSize / 2) +
    40;

  const itemKey = (item) => `${item.entity}|${item.side}|${item.verb}`;
  const slotByItemKey = {};
  rows.forEach((row, idx) => {
    const rowY = rowStartY + idx * rowStepY;
    if (row.pastItem) {
      slotByItemKey[itemKey(row.pastItem)] = { x: 34, y: rowY };
    }
    if (row.futureItem) {
      slotByItemKey[itemKey(row.futureItem)] = { x: 66, y: rowY };
    }
  });

  const slotFor = (item) =>
    slotByItemKey[itemKey(item)] || {
      x: item.side === "PAST" ? 34 : 66,
      y: rowStartY,
    };

  const canvasId = `pairs_canvas_${blockName}`;
  const commands = [
    defaultText.css({ "font-size": "1.2em", "font-family": "sans-serif" }),
    newText("pairs_title", "Tense Assignment")
      .css({ "font-size": "2.1em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "pairs_body",
      options.body ||
        "All items will be shown according to their tense.<br><br>" +
          "Press <b>SPACE</b> to reveal each item and hear the sentence audio.",
    )
      .css({ "font-size": "1.2em", "margin-top": "10px" })
      .center()
      .print(),
    newText("pairs_space_start", options.startPrompt || "Press SPACE to start.")
      .css({
        "font-size": "1.2em",
        "font-weight": "bold",
        "margin-top": "12px",
      })
      .center()
      .print(),
    newKey(`pairs_start_space_${blockName}`, " ").wait(),
    getText("pairs_title").remove(),
    getText("pairs_body").remove(),
    getText("pairs_space_start").remove(),
    newText(`lbl_past_${blockName}`, "Past (Yesterday)").css({
      "font-size": "1.1em",
      "font-weight": "bold",
    }),
    newText(`lbl_future_${blockName}`, "Future (Tomorrow)").css({
      "font-size": "1.1em",
      "font-weight": "bold",
    }),
    newCanvas(canvasId, 1200, pairCanvasHeight)
      .center()
      .add("center at 34%", "top at 10px", getText(`lbl_past_${blockName}`))
      .add("center at 66%", "top at 10px", getText(`lbl_future_${blockName}`))
      .print(),
  ];

  rows.forEach((row, idx) => {
    const rowY = rowStartY + idx * rowStepY;
    const entityId = `${row.entity.toLowerCase()}_${idx + 1}`;
    commands.push(
      newText(`row_ent_${blockName}_${entityId}`, `<b>${row.entity}</b>`).css({
        "font-size": "1.2em",
      }),
      getCanvas(canvasId).add(
        "center at 10%",
        `middle at ${rowY}px`,
        getText(`row_ent_${blockName}_${entityId}`),
      ),
    );
  });

  orderedItems.forEach((item, idx) => {
    const n = idx + 1;
    const slot = slotFor(item);
    commands.push(
      newText(
        `pwait_${n}`,
        options.revealPrompt || "Press SPACE to reveal the next item.",
      )
        .css({ "font-size": "1.05em", "margin-top": "10px" })
        .center()
        .print(),
      newKey(`preveal_${blockName}_${n}`, " ").wait(),
      getText(`pwait_${n}`).remove(),
      newImage(`pimg_${n}`, item.pic).size(
        tensePairImageSize,
        tensePairImageSize,
      ),
      getCanvas(canvasId).add(
        `center at ${slot.x}%`,
        `middle at ${slot.y}px`,
        getImage(`pimg_${n}`),
      ),
      newAudio(`p_audio_${blockName}_${n}`, audioFileForSentence(item)),
      getAudio(`p_audio_${blockName}_${n}`).play(),
      newTimer(`pmin_${n}`, MIN_TENSE_STUDY_MS).start(),
      newButton(`pnext_${n}`, "Next").bold().css(button_css).center().disable(),
      // Do not block on audio end; missing/failed files can otherwise freeze the trial.
      getTimer(`pmin_${n}`).wait(),
      getButton(`pnext_${n}`).print(),
      getButton(`pnext_${n}`).enable(),
      newKey(`pnext_space_${blockName}_${n}`, " ").callback(
        getButton(`pnext_${n}`).click(),
      ),
      getButton(`pnext_${n}`).wait(),
      getButton(`pnext_${n}`).remove(),
    );
  });

  return newTrial(`tense_pairs_${blockName}`, ...commands).setOption(
    "hideProgressBar",
    true,
  );
};

var decisionReadyTrial = (blockName, options = {}) =>
  newTrial(
    `ready_${blockName}`,
    newText("ready_title", options.title || "Get Ready")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "ready_body",
      options.body ||
        "<p>The description trials start next.</p>" +
          "<p>Your instructions were framed as 'The pirate's spinning a top is in the past/future'.</p>" +
          "<p>You are expected to produce canonical sentences without using the -ing form.</p>" +
          "<p><b>Examples:</b> The Pirate will spin a top. / The Pirate dragged a sack.</p>" +
          "<p>Speak as soon as possible once you see the picture. Recording starts and stops automatically.</p>" +
          "<p>Please respond clearly and naturally and describe the scenes in 4 seconds.</p>",
    )
      .css({ "font-size": "1.2em", "text-align": "left", "max-width": "36em" })
      .center()
      .print(),
    newButton("ready_button", options.buttonText || "Start Recording Trials")
      .bold()
      .css(button_css)
      .center()
      .disable()
      .print(),
    newTimer(`ready_gate_${blockName}`, 900).start(),
    getTimer(`ready_gate_${blockName}`).wait(),
    getButton("ready_button").enable(),
    newKey(`ready_space_${blockName}`, " ").callback(
      getButton("ready_button").click(),
    ),
    getButton("ready_button").wait(),
  ).setOption("hideProgressBar", true);

// ==============================
// 1. DATA DEFINITIONS
// ==============================

const ENTITIES = ["Pirate", "Chef", "Wizard"];

const PRACTICE_EXTRA_VERBS = ["cut", "hammer"];

const verbsBlock1 = ["drink", "read", "eat", "paint", "wash", "push"];
const verbsBlock2 = ["build", "sweep", "ride", "climb", "stir", "peel"];
const verbsBlock3 = ["blow", "dig", "shake", "carry", "play", "smell"];

const IRREGULAR_VERBS = new Set([
  "blow",
  "build",
  "dig",
  "drink",
  "eat",
  "read",
  "ride",
  "shake",
  "spin",
  "sweep",
]);

const regularityFor = (verb) =>
  IRREGULAR_VERBS.has(verb) ? "Irregular" : "Regular";

const cbSets = {
  // With 18 main verbs and 9 irregular verbs, exact 50/50 irregular Past/Future
  // for each participant is impossible. These lists implement the closest split
  // (5/4) and counterbalance it across participants.
  a: {
    past1: ["drink", "read", "paint"], // 2 irregular, 1 regular
    past2: ["build", "ride", "climb"], // 2 irregular, 1 regular
    past3: ["blow", "carry", "play"], // 1 irregular, 2 regular
  },
  b: {
    past1: ["eat", "wash", "push"], // 1 irregular, 2 regular
    past2: ["sweep", "stir", "peel"], // 1 irregular, 2 regular
    past3: ["dig", "shake", "smell"], // 2 irregular, 1 regular
  },
  c: {
    past1: ["drink", "read", "push"], // 2 irregular, 1 regular
    past2: ["build", "stir", "peel"], // 1 irregular, 2 regular
    past3: ["dig", "shake", "carry"], // 2 irregular, 1 regular
  },
  d: {
    past1: ["eat", "paint", "wash"], // 1 irregular, 2 regular
    past2: ["sweep", "ride", "climb"], // 2 irregular, 1 regular
    past3: ["blow", "play", "smell"], // 1 irregular, 2 regular
  },
};

const PICTURE_BY_ENTITY_VERB = {
  Pirate: {
    blow: "pirate_blow_bubbles_v5.png",
    build: "pirate_build_tower_v3.png",
    carry: "pirate_carry_box_v4.png",
    climb: "pirate_climb_ladder_v1.png",
    dig: "pirate_dig_hole_v4.png",
    drag: "pirate_drag_sack_v3.png",
    drink: "pirate_drink_coffee_v2.png",
    eat: "pirate_eat_apple_v5.png",
    paint: "pirate_paint_canvas_v2.png",
    peel: "pirate_peel_banana_v5.png",
    play: "pirate_play_guitar_v5.png",
    push: "pirate_push_cart_v3.png",
    read: "pirate_read_book_v2.png",
    ride: "pirate_ride_bicycle_v3.png",
    shake: "pirate_shake_bottle_v4.png",
    smell: "pirate_smell_flower_v3.png",
    spin: "pirate_spin_top_v5.png",
    stir: "pirate_stir_pot_v3.png",
    sweep: "pirate_sweep_floor_v4.png",
    wash: "pirate_wash_dish_v3.png",
    cut: "pirate_cut_bread_v1.png",
    hammer: "pirate_hammer_nail_v1.png",
  },
  Chef: {
    blow: "chef_blow_bubbles_v4.png",
    build: "chef_build_tower_v1.png",
    carry: "chef_carry_box_v5.png",
    climb: "chef_climb_ladder_v2.png",
    dig: "chef_dig_hole_v1.png",
    drag: "chef_drag_sack_v1.png",
    drink: "chef_drink_coffee_v1.png",
    eat: "chef_eat_apple_v1.png",
    paint: "chef_paint_canvas_v3.png",
    peel: "chef_peel_banana_v5.png",
    play: "chef_play_guitar_v2.png",
    push: "chef_push_cart_v3.png",
    read: "chef_read_book_v2.png",
    ride: "chef_ride_bicycle_v2.png",
    shake: "chef_shake_bottle_v2.png",
    smell: "chef_smell_flower_v1.png",
    spin: "chef_spin_top_v3.png",
    stir: "chef_stir_pot_v4.png",
    sweep: "chef_sweep_floor_v1.png",
    wash: "chef_wash_dish_v3.png",
    cut: "chef_cut_bread_v1.png",
    hammer: "chef_hammer_nail_v1.png",
  },
  Wizard: {
    blow: "wizard_blow_bubbles_v5.png",
    build: "wizard_build_tower_v2.png",
    carry: "wizard_carry_box_v1.png",
    climb: "wizard_climb_ladder_v1.png",
    dig: "wizard_dig_hole_v4.png",
    drag: "wizard_drag_sack_v1.png",
    drink: "wizard_drink_coffee_v5.png",
    eat: "wizard_eat_apple_v4.png",
    paint: "wizard_paint_canvas_v2.png",
    peel: "wizard_peel_banana_v1.png",
    play: "wizard_play_guitar_v1.png",
    push: "wizard_push_cart_v1.png",
    read: "wizard_read_book_v2.png",
    ride: "wizard_ride_bicycle_v5.png",
    shake: "wizard_shake_bottle_v3.png",
    smell: "wizard_smell_flower_v2.png",
    spin: "wizard_spin_top_v5.png",
    stir: "wizard_stir_pot_v2.png",
    sweep: "wizard_sweep_floor_v3.png",
    wash: "wizard_wash_dish_v5.png",
    cut: "wizard_cut_bread_v1.png",
    hammer: "wizard_hammer_nail_v1.png",
  },
};

const PAST_FORMS = {
  blow: "blew",
  build: "built",
  carry: "carried",
  climb: "climbed",
  dig: "dug",
  drag: "dragged",
  drink: "drank",
  eat: "ate",
  paint: "painted",
  peel: "peeled",
  play: "played",
  push: "pushed",
  read: "read",
  ride: "rode",
  shake: "shook",
  smell: "smelled",
  spin: "spun",
  stir: "stirred",
  sweep: "swept",
  wash: "washed",
  cut: "cut",
  hammer: "hammered",
};

const GERUND_FORMS = {
  blow: "blowing",
  build: "building",
  carry: "carrying",
  climb: "climbing",
  dig: "digging",
  drag: "dragging",
  drink: "drinking",
  eat: "eating",
  paint: "painting",
  peel: "peeling",
  play: "playing",
  push: "pushing",
  read: "reading",
  ride: "riding",
  shake: "shaking",
  smell: "smelling",
  spin: "spinning",
  stir: "stirring",
  sweep: "sweeping",
  wash: "washing",
  cut: "cutting",
  hammer: "hammering",
};

const OBJECT_PHRASE_BY_VERB = {
  blow: "bubbles",
  build: "a tower",
  carry: "a box",
  climb: "a ladder",
  dig: "a hole",
  drag: "a sack",
  drink: "coffee",
  eat: "an apple",
  paint: "a canvas",
  peel: "a banana",
  play: "the guitar",
  push: "a cart",
  read: "a book",
  ride: "a bicycle",
  shake: "a bottle",
  smell: "a flower",
  spin: "a top",
  stir: "a pot",
  sweep: "the floor",
  wash: "a dish",
  cut: "bread",
  hammer: "a nail",
};

const pastForm = (v) => PAST_FORMS[v] || v + "ed";
const futureForm = (v) => "will " + v;
const gerundForm = (v) =>
  GERUND_FORMS[v] || (v.endsWith("e") ? `${v.slice(0, -1)}ing` : `${v}ing`);
const sideLabelLower = (side) =>
  String(side || "").toLowerCase() === "past" ? "past" : "future";
const pictureFor = (verb, entity) => {
  const byEntity = PICTURE_BY_ENTITY_VERB[entity] || {};
  const picture = byEntity[verb];
  if (!picture)
    throw new Error(`Missing picture mapping for ${entity}_${verb}`);
  return picture;
};
const objectFor = (verb) => OBJECT_PHRASE_BY_VERB[verb] || "";
const eventPhraseFor = (verb) =>
  `${gerundForm(verb)} ${objectFor(verb)}`.trim();
const conceptualLabelSentence = (entity, verb, side) =>
  `The ${entity}'s ${eventPhraseFor(verb)} is in the ${sideLabelLower(side)}.`;
const canonicalSentence = (entity, verb, side) =>
  side === "PAST"
    ? `The ${entity} ${pastForm(verb)} ${objectFor(verb)}.`
    : `The ${entity} will ${verb} ${objectFor(verb)}.`;

function makeBlockItems(blockVerbs, pastVerbs, entityRotation = 0) {
  const futureVerbs = blockVerbs.filter((v) => !pastVerbs.includes(v));

  const pastSorted = pastVerbs.slice().sort();
  const futureSorted = futureVerbs.slice().sort();

  const entityByVerb = {};

  ENTITIES.forEach((_, i) => {
    const ent = ENTITIES[(i + entityRotation) % ENTITIES.length];
    entityByVerb[pastSorted[i]] = ent;
    entityByVerb[futureSorted[i]] = ent;
  });

  return [
    ...pastVerbs.map((v) => ({
      verb: v,
      form: pastForm(v),
      regularity: regularityFor(v),
      object: objectFor(v),
      event_phrase: eventPhraseFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "PAST",
      target_label_sentence: conceptualLabelSentence(
        entityByVerb[v],
        v,
        "PAST",
      ),
      target_canonical_sentence: canonicalSentence(entityByVerb[v], v, "PAST"),
    })),
    ...futureVerbs.map((v) => ({
      verb: v,
      form: futureForm(v),
      regularity: regularityFor(v),
      object: objectFor(v),
      event_phrase: eventPhraseFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "FUTURE",
      target_label_sentence: conceptualLabelSentence(
        entityByVerb[v],
        v,
        "FUTURE",
      ),
      target_canonical_sentence: canonicalSentence(
        entityByVerb[v],
        v,
        "FUTURE",
      ),
    })),
  ];
}

function makeItemsForList(listId, entityRotation = 0) {
  const cfg = cbSets[listId];
  const items1 = makeBlockItems(verbsBlock1, cfg.past1, entityRotation);
  const items2 = makeBlockItems(verbsBlock2, cfg.past2, entityRotation);
  const items3 = makeBlockItems(verbsBlock3, cfg.past3, entityRotation);
  return { items1, items2, items3 };
}

function chooseMetaLists(primaryList, count = 3) {
  const uniquePool = listOptions.filter((id) => id !== primaryList).slice();
  fisherYates(uniquePool);
  return [primaryList, ...uniquePool.slice(0, Math.max(0, count - 1))];
}

// ==============================
// 2. SEQUENCE HELPERS
// ==============================

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const METABLOCK_ROTATIONS = [0, 1, 2];
const META_LIST_IDS = chooseMetaLists(LIST_ID, METABLOCK_ROTATIONS.length);
const metaBlocks = METABLOCK_ROTATIONS.map((rotation, idx) => ({
  metaName: `m${idx + 1}`,
  listId: META_LIST_IDS[idx],
  itemsByBlock: makeItemsForList(META_LIST_IDS[idx], rotation),
}));

// ==============================
// 3. REGISTER ALL TRIALS
// ==============================

function registerBlockTrials(blockName, items) {
  items.forEach(trial(blockName, "p1"));
  items.forEach(trial(blockName, "p2"));

  introTrial(blockName, items);
  tenseIntroTrial(blockName);
  tensePairTrial(blockName, items);
  decisionReadyTrial(blockName);
}

const metaBlockSpecs = metaBlocks.map((meta) => {
  const blocks = [
    { name: `${meta.metaName}_block1`, items: meta.itemsByBlock.items1 },
    { name: `${meta.metaName}_block2`, items: meta.itemsByBlock.items2 },
    { name: `${meta.metaName}_block3`, items: meta.itemsByBlock.items3 },
  ];
  blocks.forEach((b) => registerBlockTrials(b.name, b.items));
  return { metaName: meta.metaName, listId: meta.listId, blocks };
});

// ==============================
// 4. SEQUENCE
// ==============================

function buildBlockSequence(blockOrder, withIntro) {
  const seq = [];

  blockOrder.forEach((b, index) => {
    if (index > 0) {
      seq.push("Break");
    }

    if (withIntro) {
      seq.push(`intro_${b.name}`);
      seq.push(`tense_intro_${b.name}`);
      seq.push(`tense_pairs_${b.name}`);
      seq.push(`ready_${b.name}`);
    }

    const patternOrder = fisherYates([0, 1]);
    let previousEntity = null;
    patternOrder.forEach((patternIndex) => {
      const patternTag = patternIndex === 0 ? "p1" : "p2";
      const productionItems = orderItemsByTensePattern(
        b.items,
        patternIndex,
        previousEntity,
      );
      productionItems.forEach((item) => {
        seq.push(`exp_${b.name}_${patternTag}_${item.verb}_${item.side}`);
      });
      if (productionItems.length > 0) {
        previousEntity = productionItems[productionItems.length - 1].entity;
      }
    });
  });

  return seq;
}

const metaSequences = metaBlockSpecs.map((metaSpec, metaIndex) => {
  const order = metaSpec.blocks.slice();
  fisherYates(order);
  const seq = buildBlockSequence(order, true);
  return metaIndex === 0 ? seq : ["SituationSwitch", ...seq];
});

const PRACTICE_ENTITY = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
const PRACTICE_VERBS = ["spin", "drag", ...PRACTICE_EXTRA_VERBS];
const PRACTICE_VERB_TEXT = PRACTICE_VERBS.map((v) => `<b>${v}</b>`).join(", ");
const PRACTICE_ITEMS = [
  {
    verb: "spin",
    form: pastForm("spin"),
    regularity: regularityFor("spin"),
    object: objectFor("spin"),
    event_phrase: eventPhraseFor("spin"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("spin", PRACTICE_ENTITY),
    side: "PAST",
    target_label_sentence: conceptualLabelSentence(
      PRACTICE_ENTITY,
      "spin",
      "PAST",
    ),
    target_canonical_sentence: canonicalSentence(
      PRACTICE_ENTITY,
      "spin",
      "PAST",
    ),
  },
  {
    verb: "drag",
    form: futureForm("drag"),
    regularity: regularityFor("drag"),
    object: objectFor("drag"),
    event_phrase: eventPhraseFor("drag"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("drag", PRACTICE_ENTITY),
    side: "FUTURE",
    target_label_sentence: conceptualLabelSentence(
      PRACTICE_ENTITY,
      "drag",
      "FUTURE",
    ),
    target_canonical_sentence: canonicalSentence(
      PRACTICE_ENTITY,
      "drag",
      "FUTURE",
    ),
  },
  {
    verb: "cut",
    form: pastForm("cut"),
    regularity: regularityFor("cut"),
    object: objectFor("cut"),
    event_phrase: eventPhraseFor("cut"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("cut", PRACTICE_ENTITY),
    side: "PAST",
    target_label_sentence: conceptualLabelSentence(
      PRACTICE_ENTITY,
      "cut",
      "PAST",
    ),
    target_canonical_sentence: canonicalSentence(
      PRACTICE_ENTITY,
      "cut",
      "PAST",
    ),
  },
  {
    verb: "hammer",
    form: futureForm("hammer"),
    regularity: regularityFor("hammer"),
    object: objectFor("hammer"),
    event_phrase: eventPhraseFor("hammer"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("hammer", PRACTICE_ENTITY),
    side: "FUTURE",
    target_label_sentence: conceptualLabelSentence(
      PRACTICE_ENTITY,
      "hammer",
      "FUTURE",
    ),
    target_canonical_sentence: canonicalSentence(
      PRACTICE_ENTITY,
      "hammer",
      "FUTURE",
    ),
  },
];

const PRACTICE_PRODUCTION_ITEMS = fisherYates(PRACTICE_ITEMS.slice());
const PRACTICE_PRODUCTION_LABELS = PRACTICE_PRODUCTION_ITEMS.map(
  (item) => `practice_production_${item.verb}_${item.side.toLowerCase()}`,
);

introTrial("practice", PRACTICE_ITEMS);
tenseIntroTrial("practice", {
  title: "Practice: Place events in time",
  body:
    `<p>This is a short practice with four ${PRACTICE_ENTITY} actions: ${PRACTICE_VERB_TEXT}.</p>` +
    "<p>Two actions happened in the <b>past</b>, and two actions will happen in the <b>future</b>.</p>" +
    "<p>Press <b>SPACE</b> to reveal each item and hear the sentence audio.</p>" +
    "<p>Then click <b>Next</b> to continue.</p>",
});
tensePairTrial("practice", PRACTICE_ITEMS, {
  body:
    "The four practice items will be shown according to their tense.<br><br>" +
    "Press <b>SPACE</b> to reveal each item and hear the sentence audio.",
});
decisionReadyTrial("practice", {
  title: "Practice: Speak canonical tense sentences",
  body:
    `<p>You heard sentences in the form of "The ${PRACTICE_ENTITY}'s cutting a bread is in the future/past". Now you will produce sentences without the -ing form of the verb.</p>` +
    "<p>Produce sentences in the following form:</p>" +
    "<p style='font-size:1.35em; line-height:1.5;'>" +
    `<b>The ${PRACTICE_ENTITY} cut a bread.</b><br>` +
    "</p>" +
    "<p>Speak as soon as possible once you see the picture. The recording will stop automatically.</p>" +
    "<p><b>Do not use pronouns for subjects as in 'he' or 'she'.</b></p>",
  buttonText: "Start Practice Recording",
});
PRACTICE_PRODUCTION_ITEMS.forEach((item, idx) => {
  practiceDecisionTrial(PRACTICE_PRODUCTION_LABELS[idx], item);
});

// INTRO
newTrial(
  "intro",
  newText("welcome-title", "Welcome!<br><br>")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "welcome-body",
    "This experiment takes about 30 minutes and requires your full attention." +
      "<p>Before you begin, please make sure:" +
      "<ul>" +
      "<li>You are using a <b>computer</b>, not a phone or tablet.</li>" +
      "<li>You are using <b>Google Chrome</b>.</li>" +
      "<li>Your <b>microphone</b> is available and allowed in the browser.</li>" +
      "<li>Your <b>mouse/trackpad</b> and <b>keyboard</b> work.</li>" +
      "<li>You are a native speaker of <b>American English</b>.</li>" +
      "<li>You are <b>18 or older</b>.</li>" +
      "<li>This is your <b>first time</b> doing this experiment.</li>" +
      "</ul>",
  )
    .css({ "font-size": "1.1em", "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("CONTINUE").bold().css(button_css).center().disable().print(),
  newTimer("intro_continue_gate", 1200).start(),
  getTimer("intro_continue_gate").wait(),
  getButton("CONTINUE").enable(),
  newKey("intro_space_continue", " ").callback(getButton("CONTINUE").click()),
  getButton("CONTINUE").wait(),
).setOption("hideProgressBar", true);

// CONSENT
newTrial(
  "consent",
  newText("consent-title", "Consent Form<br><br>")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "consent-body",
    "Please click " +
      "<a target='_blank' rel='noopener noreferrer' href='https://utkuturk.com/files/web_consent.pdf'>here</a> " +
      "to open the consent form for this study in a new tab." +
      "<p>If you read it and agree to participate, click <b>I Agree</b> below." +
      "<br>You can leave the study at any time by closing this tab." +
      "<p>If you have any questions or encounter problems, you can contact the researchers by email.",
  )
    .css({ "font-size": "1.1em", "text-align": "left" })
    .center()
    .print(),

  newText(
    "researchers",
    "<p><b>Researchers:</b><br>" +
      "Utku Turk, PhD (utkuturk@umd.edu) and Asst. Prof. Shota Momma",
  )
    .css({ "font-size": "0.95em", "text-align": "left", "margin-top": "1em" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("agree", "I AGREE")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("consent_continue_gate", 1200).start(),
  getTimer("consent_continue_gate").wait(),
  getButton("agree").enable(),
  newKey("consent_space_agree", " ").callback(getButton("agree").click()),
  getButton("agree").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "demo",

  ...newDemo("age", "Age*:"),
  ...newDemo("gender", "Gender*:"),
  ...newDemo("geo", "Location (state, country)*:"),
  ...newDemo("comp", "Computer type (e.g. Mac, PC)*:"),
  ...newDemo("language", "Native language*:"),
  ...newDemo("otherlg", "Other languages you speak:"),

  newText("demo-note", "Fields with * are required.").center().print(),

  newText("<p>").print(),

  newButton("CONTINUE")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait(
      getTextInput("age")
        .test.text(/^\d+$/)
        .failure(
          newText("err-age", "Age should be a numeric value.")
            .settings.color("red")
            .print(),
        )
        .and(requireFilled("language", "Please enter your native language."))
        .and(
          requireFilled(
            "gender",
            "Please indicate your gender or write 'prefer not to say'.",
          ),
        )
        .and(requireFilled("geo", "Please enter your current location."))
        .and(requireFilled("comp", "Please indicate your computer type.")),
    ),
).setOption("hideProgressBar", true);

newTrial(
  "instructions",

  newText("inst-title", "Instructions<br><br>")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "inst-body",
    "<p>In this study, you will see pictures of characters doing certain actions.</p>" +
      "<p>The experiment will consist of 3 blocks. In each block:</p>" +
      "<ol>" +
      "<li style='margin-bottom: 12px;'><b>Learn verbs</b>:<br>" +
      "You will learn what each character has done one by one, with audio.</li>" +
      "<li style='margin-bottom: 12px;'><b>Learn tense assignment</b>:<br>" +
      "You will then study whether these actions are already done or will be done in the future." +
      "Fore example, you will be told <b>The pirate's spinning a top is in the past/future.</b><br> </li>" +
      "<li><b>Describe the scenes out loud</b>:<br>" +
      "Scene that you learned will be shown to you randomly and you will be asked to describe the scene." +
      "For each scene, you are expected to use the past/future based on what you learned.<br>" +
      "Your sentences should be in the form of:<br><br>" +
      "<i>The Pirate will spin a top</i> or <i>The Pirate dragged a sack.</i><br><br>" +
      "<b>Important:</b> Do not use pronouns like 'he' or 'she', and do not produce incomplete sentences!<br><br>" +
      "You will be recorded while you say these sentences out loud. Speak as soon as possible once you see the picture, and the recording will stop automatically.<br>" +
      "</li>" +
      "</ol>" +
      "<p>Please speak clearly and naturally, and avoid long pauses. You will have <b>4 seconds</b> for each description.</p>" +
      "<p>After each scene, press <b>Space</b> or click <b>Continue</b> to go to the next scene. Please do not wait more than <b>10 seconds</b> between the scenes.</p>",
  )
    .css({ "font-size": "1.1em", "max-width": "45em", "text-align": "left" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("CONTINUE").bold().css(button_css).center().disable().print(),
  newTimer("instructions_continue_gate", 1500).start(),
  getTimer("instructions_continue_gate").wait(),
  getButton("CONTINUE").enable(),
  newKey("instructions_space_continue", " ").callback(
    getButton("CONTINUE").click(),
  ),
  getButton("CONTINUE").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "remember",
  newText("remember_title", "Silent Environment")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),
  newText(
    "remember_body",
    "<p>This experiment is going to record your audio and will play audio files for you to hear.</p>" +
      "<p>Make sure that you are in a silent environment without any distractions or loud noises.</p>" +
      "<p>Also make sure that you are using headphones to listen the audio instructions.</p>" +
      "<p>In the case of no clear audio, or too much background noise, your data will not be reusable and you will not be rewarded for your time.</p>",
  )
    .css({ "font-size": "1.15em", "max-width": "42em", "text-align": "left" })
    .center()
    .print(),
  newButton("remember_start", "Start Practice")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("remember_gate", 1200).start(),
  getTimer("remember_gate").wait(),
  getButton("remember_start").enable(),
  newKey("remember_space_start", " ").callback(
    getButton("remember_start").click(),
  ),
  getButton("remember_start").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "practice_intro",
  newText("practice_intro_title", "Practice")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),
  newText(
    "practice_intro_body",
    "<p>You will now complete a short practice before the real experiment.</p>" +
      `<p>First, you will learn four actions that ${PRACTICE_ENTITY} did: ${PRACTICE_VERB_TEXT}.</p>` +
      "<p>Then you will be recorded while describing each scene out loud in its <b>appropriate</b> tense.</p>" +
      "<p>Speak as soon as possible once you see the picture. You will have <b>4 seconds</b> to describe each scene.</p>",
  )
    .css({ "font-size": "1.15em", "max-width": "42em", "text-align": "left" })
    .center()
    .print(),
  newButton("practice_intro_start", "Start Practice")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("practice_intro_gate", 1200).start(),
  getTimer("practice_intro_gate").wait(),
  getButton("practice_intro_start").enable(),
  newKey("practice_intro_space_start", " ").callback(
    getButton("practice_intro_start").click(),
  ),
  getButton("practice_intro_start").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "exp_ready",
  newText("exp_ready_title", "Practice Complete")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),
  fullscreen(),
  newText(
    "exp_ready_body",
    "<p>The real experiment is about to start.</p>" +
      "<p>In each learning block, you will see <b>6 events</b>.</p>" +
      "<p>Later you will describe these scenes out loud while being recorded.</p>" +
      "<p><b>Important reminder:</b> say full sentences without using pronouns like 'he' or 'she'.</p>" +
      "<p>For example: <i>The Pirate will spin a top</i> or <i>The Pirate spun a top</i></p>" +
      "<p>Please get ready for the first block and make sure that you are in a relatively silent environment.</p>" +
      "<p>Remember to speak as soon as possible once you see the picture. You have <b>4 seconds</b> to describe each scene.</p>" +
      "<p>Press <b>SPACE</b> or click <b>Start</b> when you are ready.</p>",
  )
    .css({ "font-size": "1.15em", "max-width": "42em", "text-align": "center" })
    .center()
    .print(),
  newButton("exp_ready_start", "Start")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("exp_ready_gate", 1200).start(),
  getTimer("exp_ready_gate").wait(),
  getButton("exp_ready_start").enable(),
  newKey("exp_ready_space_start", " ").callback(
    getButton("exp_ready_start").click(),
  ),
  getButton("exp_ready_start").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "recording_test",
  defaultText.css({ "font-size": "1.1em", "font-family": "sans-serif" }),
  newText("recording_test_title", "Microphone Check")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),
  newText(
    "recording_test_body",
    "<p>Please test your microphone now.</p>" +
      "<p>Click <b>Record</b>, say <b>This is a test</b>, then click <b>Stop</b>.</p>" +
      "<p>Use playback to confirm your voice is audible, then continue.</p>",
  )
    .css({ "max-width": "42em", "text-align": "left" })
    .center()
    .print(),
  newVoiceRecorder(`${SUBJECT_ID}_recording_test_recorder`).log().center().print(),
  newButton("recording_test_continue", "Continue")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait(
      getVoiceRecorder(`${SUBJECT_ID}_recording_test_recorder`)
        .test.recorded()
        .failure(
          newText(
            "recording_test_missing",
            "Please make a test recording before continuing.",
          )
            .css({ color: "red", "margin-top": "10px" })
            .center()
            .print(),
        )
        .and(
          getVoiceRecorder(`${SUBJECT_ID}_recording_test_recorder`)
            .test.hasPlayed()
            .failure(
              newText(
                "recording_test_playback",
                "Please play back your recording once before continuing.",
              )
                .css({ color: "red", "margin-top": "10px" })
                .center()
                .print(),
            ),
        ),
    ),
).setOption("hideProgressBar", true);

const introBlock = [
  ...(isDemoMode ? [] : ["intro", "consent"]),
  "demo",
  "init",
  "recording_test",
  "instructions",
  "remember",
  "practice_intro",
  "intro_practice",
  "tense_intro_practice",
  "tense_pairs_practice",
  "ready_practice",
  ...PRACTICE_PRODUCTION_LABELS,
  "exp_ready",
];

CheckPreloaded().label("check");
UploadRecordings("upload_recordings");

newTrial(
  "debrief",
  newText("debrief_title", "Debrief")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .print(),
  newText(
    "debrief_body",
    "<p>This study examines how people plan tense information during real-time language production.</p>" +
      "<p>We are testing when tense is planned at different levels of representation:</p>" +
      "<p>1) <b>Conceptual planning</b> (event-time meaning),</p>" +
      "<p>2) <b>Syntactic planning</b> (grammatical tense features), and</p>" +
      "<p>3) <b>Morphophonological planning</b> (the form used to express tense).</p>" +
      "<p>Thank you for helping with this research.</p>" +
      "<p>If you have any questions, contact <a href='mailto:utkuturk@umd.edu'>utkuturk@umd.edu</a>.</p>",
  )
    .css({ "max-width": "45em", "text-align": "left" })
    .center()
    .print(),
  newText("d_q1", "Did you experience any technical issues during the study?")
    .css({ "margin-top": "10px" })
    .print(),
  newScale("tech_issues", "No", "Yes")
    .radio()
    .labelsPosition("right")
    .log()
    .print(),
  newText("d_q2", "How clear were the instructions overall?")
    .css({ "margin-top": "10px" })
    .print(),
  newScale("instruction_clarity", "1", "2", "3", "4", "5")
    .labelsPosition("bottom")
    .keys("1", "2", "3", "4", "5")
    .log()
    .print(),
  newText("d_q3", "Optional feedback").css({ "margin-top": "10px" }).print(),
  newTextInput("feedback").lines(4).size("900px", "120px").log().print(),
  newButton("debrief_continue", "Continue")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("debrief_continue_gate", 1200).start(),
  getTimer("debrief_continue_gate").wait(),
  getButton("debrief_continue").enable(),
  getButton("debrief_continue").wait(),
).setOption("hideProgressBar", true);

newTrial(
  "exit_sona",
  newText("exit_thanks", "<center><b>Thank you for participating!</b></center>")
    .css(text_css)
    .print()
    .center(),
  newText(
    "exit_sona_msg",
    "<p>You can confirm your participation on SONA by clicking the link below:</p>",
  ).css(text_css),
  newText(
    "psych_link",
    "<p><a href='" + psych_sona_link + "'>Confirm your participation.</a></p>",
  ).css(text_css),
  newText(
    "ling_link",
    "<p><a href='" + ling_sona_link + "'>Confirm your participation.</a></p>",
  ).css(text_css),
  newText(
    "fallback_msg",
    "<p>Thank you for your participation. Your credit will be approved within 3 days after the due date of the experiment.</p>",
  ).css(text_css),
  getVar("source")
    .test.is("psych")
    .success(getText("exit_sona_msg").print(), getText("psych_link").print())
    .failure(
      getVar("source")
        .test.is("ling")
        .success(getText("exit_sona_msg").print(), getText("ling_link").print())
        .failure(getText("fallback_msg").print()),
    ),
  newText("exit_close", "<p>You now may close this tab.</p>")
    .css(text_css)
    .print()
    .center(),
  newButton().wait(),
).setOption("hideProgressBar", true);

Sequence(
  ...introBlock,
  "check",
  ...metaSequences.flat(),
  "upload_recordings",
  "send_results",
  "debrief",
  "exit_sona",
);
