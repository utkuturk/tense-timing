// --- Initial Setup ---
PennController.ResetPrefix(null);
DebugOff();
SendResults("send_results");
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/morphophonology/chunk_includes/elevenlabs_audio.zip",
);
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/morphophonology/chunk_includes/pictures.zip",
);
const PSYCH_SONA_LINK_BASE =
  "https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=XX&credit_token=XX&survey_code=";
const LING_SONA_LINK_BASE =
  "https://umlinguistics.sona-systems.com/webstudy_credit.aspx?experiment_id=XX&credit_token=XX&survey_code=";
var psych_sona_link = PSYCH_SONA_LINK_BASE + GetURLParameter("id");
var ling_sona_link = LING_SONA_LINK_BASE + GetURLParameter("id");
const isDemoMode = GetURLParameter("id") === "demo";
const SUBJECT_ID = isDemoMode
  ? "demo"
  : Math.random().toString(36).slice(2, 10);
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
  "https://u7dzjb1y1m.execute-api.us-east-2.amazonaws.com/default/pcibex-s3-recorder-phon";
InitiateRecorder(
  LAMBDA_URL,
  "<p><b>This study records your voice responses.</b></p>" +
    "<p>Please allow microphone access when prompted, then continue.</p>",
)
  .label("init")
  .consent("I consent to audio recording for this study.");

Header(
  newVar("subject_id", "").global().set(SUBJECT_ID),
  newVar("source", "").global().set(GetURLParameter("source")),
  newVar("requested_list", "")
    .global()
    .set(requestedListParam || "none"),
  newVar("assigned_list", "").global().set(LIST_ID),
  newVar("list_source", "").global().set(LIST_SOURCE),
)
  .log("subject_id", getVar("subject_id"))
  .log("SONA_ID_URL", GetURLParameter("id"))
  .log("source", GetURLParameter("source"))
  .log("requested_list", getVar("requested_list"))
  .log("assigned_list", getVar("assigned_list"))
  .log("list_source", getVar("list_source"));

// --- CSS / UI helpers ---
const newDemo = (name, label) => [
  newTextInput(name)
    .before(newText(label).size("15em", "1.5em"))
    .size("15em", "1.5em")
    .lines(1)
    .css(underline_blank)
    .center()
    .print()
    .log(),
  newText("<br><br>").print(),
];

const requireFilled = (name, msg) =>
  getTextInput(name)
    .testNot.text("")
    .failure(
      newText("err-" + name, msg)
        .settings.color("red")
        .print(),
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

// --- Break trial ---
newTrial(
  "Break",
  newText("message", "Break")
    .css({ "font-size": "3em", "font-weight": "bold", color: "#cc0000" })
    .center()
    .print(),

  newText(
    "instruction",
    "Now we are going to learn about other things they did. Please <b>rest for a second</b>.",
  )
    .css({ "font-size": "1.8em", "margin-top": "30px" })
    .center()
    .print(),

  newText(
    "note",
    "Click 'Continue' when you are ready to see the verbs for the next block.",
  )
    .css({ "font-size": "1.2em", "margin-top": "50px" })
    .center()
    .print(),
  newText("space1break", "<p>").center().print(),
  newTimer("break_continue_gate", 2000).start().wait(),
  newButton("Continue").css(button_css).center().print(),
  newTimer("break_timeout_warn", 55000)
    .callback(
      newText(
        "break_timeout_warning",
        "Please do not wait too long! Press Continue to proceed.",
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
  newTimer("break_timeout_advance", 60000)
    .callback(getButton("Continue").click())
    .start(),
  newKey("break_space_continue", " ").callback(getButton("Continue").click()),
  getButton("Continue").wait(),
).setOption("hideProgressBar", true);

// --- Production trial ---
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
            "timeout_warning",
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
      .log("Form", row.form)
      .log("Tense", row.side)
      .log("Regularity", row.regularity || "Unknown")
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
      "describe this sentence using the past tense and a overt subject.<br>",
    )
      .css({
        "font-size": "1.15em",
        "margin-top": "14px",
        "font-weight": "bold",
      })
      .center()
      .print(),
    newText("practice_hint", "Example: The Pirate dragged a sack.<br>")
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
    .log("Form", row.form)
    .log("Tense", row.side)
    .log("Regularity", row.regularity || "Unknown")
    .log("Entity", row.entity)
    .log("EventPhrase", row.event_phrase)
    .log("TargetLabelSentence", row.target_label_sentence)
    .log("TargetCanonicalSentence", row.target_canonical_sentence)
    .log("ResponseMode", "spoken_production")
    .log("AutoRecordMS", AUTO_RECORD_MS);
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

  const pools = {
    IRREGULAR: irregular.slice(),
    REGULAR: regular.slice(),
  };

  const ordered = [];

  pattern.forEach((r) => {
    if (pools[r].length > 0) {
      ordered.push(pools[r].shift());
    } else {
      const other = r === "IRREGULAR" ? "REGULAR" : "IRREGULAR";
      if (pools[other].length > 0) {
        ordered.push(pools[other].shift());
      }
    }
  });

  ordered.push(...pools.IRREGULAR, ...pools.REGULAR);

  return ordered;
}

// --- Block intro helpers ---
var VERB_WHITE_MS = 400;
var VERB_FIX_MS = 600;
var VERB_POST_AUDIO_MS = 2000;

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
          "<p>You heard each event and its relevant object without an overt subject.</b></p>" +
          "<p>You are expected to produce full sentences within the time!</p>" +
          "<p><b>Examples:</b> The Pirate spun a top. / The Pirate dragged a sack.</p>" +
          "<p>Recording starts and stops automatically. Speak as soon as possible once you see the picture.</p>" +
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

// --- Data ---
const ENTITIES = ["Pirate", "Chef", "Wizard"];

const PRACTICE_EXTRA_VERBS = ["cut", "hammer"];

const verbsBlock1 = ["drink", "read", "eat", "paint", "wash", "push"];
const verbsBlock2 = ["build", "sweep", "ride", "climb", "stir", "peel"];
const verbsBlock3 = ["blow", "dig", "shake", "carry", "play", "smell"];

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

const pastForm = (v) => PAST_FORMS[v] || v + "ed";
const regularityFor = (verb) =>
  IRREGULAR_VERBS.has(verb) ? "IRREGULAR" : "REGULAR";
const gerundForm = (v) =>
  GERUND_FORMS[v] || (v.endsWith("e") ? `${v.slice(0, -1)}ing` : `${v}ing`);
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
const conceptualLabelSentence = (entity, verb) =>
  `The ${entity}'s ${eventPhraseFor(verb)} is in the past.`;
const canonicalSentence = (entity, verb) =>
  `The ${entity} ${pastForm(verb)} ${objectFor(verb)}.`;

function makeBlockItems(blockVerbs, entityRotation = 0) {
  const irregularVerbs = blockVerbs.filter(
    (v) => regularityFor(v) === "IRREGULAR",
  );
  const regularVerbs = blockVerbs.filter((v) => regularityFor(v) === "REGULAR");
  const irregularSorted = irregularVerbs.slice().sort();
  const regularSorted = regularVerbs.slice().sort();

  if (
    irregularSorted.length !== ENTITIES.length ||
    regularSorted.length !== ENTITIES.length
  ) {
    throw new Error(
      "Each block must contain exactly 3 irregular and 3 regular verbs.",
    );
  }

  const entityByVerb = {};
  ENTITIES.forEach((_, i) => {
    const ent = ENTITIES[(i + entityRotation) % ENTITIES.length];
    entityByVerb[irregularSorted[i]] = ent;
    entityByVerb[regularSorted[i]] = ent;
  });

  return blockVerbs.map((v) => ({
    verb: v,
    form: pastForm(v),
    object: objectFor(v),
    event_phrase: eventPhraseFor(v),
    entity: entityByVerb[v],
    pic: pictureFor(v, entityByVerb[v]),
    side: "PAST",
    regularity: regularityFor(v),
    target_label_sentence: conceptualLabelSentence(entityByVerb[v], v),
    target_canonical_sentence: canonicalSentence(entityByVerb[v], v),
  }));
}

function makeItemsForRotation(entityRotation = 0) {
  const items1 = makeBlockItems(verbsBlock1, entityRotation);
  const items2 = makeBlockItems(verbsBlock2, entityRotation);
  const items3 = makeBlockItems(verbsBlock3, entityRotation);
  return { items1, items2, items3 };
}

function chooseMetaLists(primaryList, count = 3) {
  const uniquePool = listOptions.filter((id) => id !== primaryList).slice();
  fisherYates(uniquePool);
  return [primaryList, ...uniquePool.slice(0, Math.max(0, count - 1))];
}

function listRotationOffset(listId) {
  const map = { a: 0, b: 1, c: 2, d: 0 };
  return map[listId] ?? 0;
}

function makeItemsForList(listId, entityRotation = 0) {
  const rotation =
    (entityRotation + listRotationOffset(listId)) % ENTITIES.length;
  return makeItemsForRotation(rotation);
}

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

// --- Register all trials ---
function registerBlockTrials(blockName, items) {
  items.forEach(trial(blockName, "p1"));
  items.forEach(trial(blockName, "p2"));
  introTrial(blockName, items);
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

// --- Sequence building ---
function buildBlockSequence(blockOrder, withIntro) {
  const seq = [];

  blockOrder.forEach((b, index) => {
    if (index > 0) {
      seq.push("Break");
    }

    if (withIntro) {
      seq.push(`intro_${b.name}`);
      seq.push(`ready_${b.name}`);
    }

    const patternOrder = fisherYates([0, 1]);
    let previousEntity = null;
    patternOrder.forEach((patternIndex) => {
      const patternTag = patternIndex === 0 ? "p1" : "p2";
      const productionItems = orderItemsByRegularityPattern(
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
  return metaIndex === 0 ? seq : ["Break", ...seq];
});

// --- Practice items ---
const PRACTICE_ENTITY = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
const PRACTICE_VERBS = ["spin", "drag", ...PRACTICE_EXTRA_VERBS];
const PRACTICE_VERB_TEXT = PRACTICE_VERBS.map((v) => `<b>${v}</b>`).join(", ");
const PRACTICE_ITEMS = [
  {
    verb: "spin",
    form: pastForm("spin"),
    object: objectFor("spin"),
    event_phrase: eventPhraseFor("spin"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("spin", PRACTICE_ENTITY),
    side: "PAST",
    regularity: regularityFor("spin"),
    target_label_sentence: conceptualLabelSentence(PRACTICE_ENTITY, "spin"),
    target_canonical_sentence: canonicalSentence(PRACTICE_ENTITY, "spin"),
  },
  {
    verb: "drag",
    form: pastForm("drag"),
    object: objectFor("drag"),
    event_phrase: eventPhraseFor("drag"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("drag", PRACTICE_ENTITY),
    side: "PAST",
    regularity: regularityFor("drag"),
    target_label_sentence: conceptualLabelSentence(PRACTICE_ENTITY, "drag"),
    target_canonical_sentence: canonicalSentence(PRACTICE_ENTITY, "drag"),
  },
  {
    verb: "cut",
    form: pastForm("cut"),
    object: objectFor("cut"),
    event_phrase: eventPhraseFor("cut"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("cut", PRACTICE_ENTITY),
    side: "PAST",
    regularity: regularityFor("cut"),
    target_label_sentence: conceptualLabelSentence(PRACTICE_ENTITY, "cut"),
    target_canonical_sentence: canonicalSentence(PRACTICE_ENTITY, "cut"),
  },
  {
    verb: "hammer",
    form: pastForm("hammer"),
    object: objectFor("hammer"),
    event_phrase: eventPhraseFor("hammer"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("hammer", PRACTICE_ENTITY),
    side: "PAST",
    regularity: regularityFor("hammer"),
    target_label_sentence: conceptualLabelSentence(PRACTICE_ENTITY, "hammer"),
    target_canonical_sentence: canonicalSentence(PRACTICE_ENTITY, "hammer"),
  },
];

const PRACTICE_PRODUCTION_ITEMS = fisherYates(PRACTICE_ITEMS.slice());
const PRACTICE_PRODUCTION_LABELS = PRACTICE_PRODUCTION_ITEMS.map(
  (item) => `practice_production_${item.verb}_${item.side.toLowerCase()}`,
);

introTrial("practice", PRACTICE_ITEMS);
decisionReadyTrial("practice", {
  title: "Practice: Speak past-tense sentences",
  body:
    `<p>You heard sentences in the form of "Cut a bread". Now you will them in sentences with an overt subject.</p>` +
    `<p>Produce sentences in the following form:</p>` +
    `<p><b>The ${PRACTICE_ENTITY} spun a top.</b><br>` +
    `<b>The ${PRACTICE_ENTITY} dragged a sack.</b><br>` +
    `<b>The ${PRACTICE_ENTITY} cut a bread.</b><br>` +
    `<b>The ${PRACTICE_ENTITY} hammered a nail.</b></p>` +
    `<p>You are going to be recorded. The recording starts and stops automatically. Speak as soon as possible once you see the picture.</p>` +
    `<p><b>Do not use pronouns for subjects as in 'he' or 'she'.</b></p>`,
  buttonText: "Start Practice Recording",
});
PRACTICE_PRODUCTION_ITEMS.forEach((item, idx) => {
  practiceDecisionTrial(PRACTICE_PRODUCTION_LABELS[idx], item);
});

// --- Static trials ---
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
      "<li><b>Describe pictures out loud</b>:<br>" +
      "Picture that you learned will be shown to you randomly and you will be asked to describe the picture." +
      "For each picture, produce a sentence in the <b>past tense</b>.<br><br>" +
      "Your sentences should be in the form of:<br>" +
      "<i>The Pirate spun a top</i> or <i>The Pirate dragged a sack.</i><br><br>" +
      "<b>Important:</b> Do not use pronouns like 'he' or 'she', and do not produce incomplete sentences!<br><br>" +
      "You will be recorded while you say these sentences out loud. The recording starts and stops automatically. Speak as soon as possible once you see the picture.<br>" +
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
      "<p>Then you will be recorded while describing each scene out loud in past-tense.</p>" +
      "<p>You will have <b>4 seconds</b> to describe the picture. Speak as soon as possible once you see it.</p>",
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
      "<p>For example: <i>The Pirate spun a top</i> or <i>The Pirate dragged a sack.</i></p>" +
      "<p>Please get ready for the first block and make sure that you are in a relatively silent environment.</p>" +
      "<p>Remember you have only <b>4 seconds</b> to describe the scenes. Speak as soon as possible once you see the picture.</p>" +
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
  newVoiceRecorder(SUBJECT_ID + "_recording_test")
    .log()
    .center()
    .print(),
  newButton("recording_test_continue", "Continue")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait(
      getVoiceRecorder(SUBJECT_ID + "_recording_test")
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
          getVoiceRecorder(SUBJECT_ID + "_recording_test")
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
  ...(isDemoMode ? [] : ["intro", "consent", "demo"]),
  "init",
  "recording_test",
  "instructions",
  "remember",
  "practice_intro",
  "intro_practice",
  "ready_practice",
  ...PRACTICE_PRODUCTION_LABELS,
  "exp_ready",
];

CheckPreloaded().label("check");

newTrial(
  "debrief",
  newText("debrief_title", "Debrief")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .print(),
  newText(
    "debrief_body",
    "<p>This study examines how people plan past-tense information during real-time language production.</p>" +
      "<p>We are testing when past tense is planned at different levels of representation:</p>" +
      "<p>1) <b>Conceptual planning</b> (event-time meaning),</p>" +
      "<p>2) <b>Syntactic planning</b> (grammatical tense features), and</p>" +
      "<p>3) <b>Morphophonological planning</b> (the form used to express regular/irregular past tense).</p>" +
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

UploadRecordings("upload_recordings");

Sequence(
  ...introBlock,
  "check",
  ...metaSequences.flat(),
  "upload_recordings",
  "send_results",
  "debrief",
  "exit_sona",
);
