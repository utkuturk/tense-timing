// --- Initial Setup ---
PennController.ResetPrefix(null);
DebugOff();
SendResults("send_results");
SendResults("senddebrief");
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/conceptual-task/chunk_includes/elevenlabs_audio.zip",
);
PreloadZip(
  "https://raw.githubusercontent.com/utkuturk/tense-timing/norming/chunk_includes/pictures.zip",
);
const EXP_START_TIMESTAMP = Date.now();
const PSYCH_SONA_LINK_BASE =
  "https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=2052&credit_token=26041bec45c64b83ba65ac7b05b6bd93&survey_code=";
const LING_SONA_LINK_BASE =
  "https://umlinguistics.sona-systems.com/webstudy_credit.aspx?experiment_id=528&credit_token=0076a3889d544e94a368b38e997e923d&survey_code=";
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

Header(
  newVar("source", "").global().set(GetURLParameter("source")),
  newVar("exp_start_timestamp", 0).global().set(EXP_START_TIMESTAMP),
  newVar("requested_list", "")
    .global()
    .set(requestedListParam || "none"),
  newVar("assigned_list", "").global().set(LIST_ID),
  newVar("list_source", "").global().set(LIST_SOURCE),
)
  .log("SONA_ID_URL", GetURLParameter("id"))
  .log("source", GetURLParameter("source"))
  .log("exp_start_timestamp", getVar("exp_start_timestamp"))
  .log("requested_list", getVar("requested_list"))
  .log("assigned_list", getVar("assigned_list"))
  .log("list_source", getVar("list_source"));

defineBreakTrial();

const ENTITIES = ["Pirate", "Chef", "Wizard"];

const verbs = [
  "blow",
  "build",
  "carry",
  "climb",
  "dig",
  "drink",
  "eat",
  "paint",
  "peel",
  "play",
  "push",
  "read",
  "ride",
  "shake",
  "smell",
  "spin",
  "stir",
  "sweep",
  "wash",
  "drag",
];

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
};

const pastForm = (v) => PAST_FORMS[v] || v + "ed"; // Simple fallback
const futureForm = (v) => "will " + v;
const pictureFor = (verb, entity) => {
  const byEntity = PICTURE_BY_ENTITY_VERB[entity] || {};
  const picture = byEntity[verb];
  if (!picture)
    throw new Error(`Missing picture mapping for ${entity}_${verb}`);
  return picture;
};
const objectFor = (verb) => OBJECT_PHRASE_BY_VERB[verb] || "";

function makeBlockItems(blockVerbs, pastVerbs, entityRotation = 0) {
  // Split verbs by tense
  const futureVerbs = blockVerbs.filter((v) => !pastVerbs.includes(v));

  // Sort so the assignment is fixed and reproducible
  const pastSorted = pastVerbs.slice().sort();
  const futureSorted = futureVerbs.slice().sort();

  // Map from verb -> entity so each entity gets 1 past, 1 future
  const entityByVerb = {};

  ENTITIES.forEach((_, i) => {
    const ent = ENTITIES[(i + entityRotation) % ENTITIES.length];
    entityByVerb[pastSorted[i]] = ent; // one past per entity
    entityByVerb[futureSorted[i]] = ent; // one future per entity
  });

  return [
    ...pastVerbs.map((v) => ({
      verb: v,
      form: pastForm(v),
      object: objectFor(v),
      regularity: regularityFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "PAST",
    })),
    ...futureVerbs.map((v) => ({
      verb: v,
      form: futureForm(v),
      object: objectFor(v),
      regularity: regularityFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "FUTURE",
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

const METABLOCK_ROTATIONS = [0, 1, 2];
const metaBlocks = METABLOCK_ROTATIONS.map((rotation, idx) => ({
  metaName: `m${idx + 1}`,
  itemsByBlock: makeItemsForList(LIST_ID, rotation),
}));

// ==============================
// 3. REGISTER ALL TRIALS
// ==============================

function registerBlockTrials(blockName, items) {
  // decision trials (two passes per block: one pass per tense pattern)
  items.forEach(trial(blockName, "p1"));
  items.forEach(trial(blockName, "p2"));

  // teaching trials
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
  return { metaName: meta.metaName, blocks };
});

// ==============================
// 4. SEQUENCE
// ==============================

function fisherYates(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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

    // Decision trials: both tense patterns per block (12 total), randomizing which pattern comes first.
    const patternOrder = fisherYates([0, 1]);
    let previousEntity = null;
    patternOrder.forEach((patternIndex) => {
      const patternTag = patternIndex === 0 ? "p1" : "p2";
      const decisionItems = orderItemsByTensePattern(
        b.items,
        patternIndex,
        previousEntity,
      );
      decisionItems.forEach((item) => {
        seq.push(`exp_${b.name}_${patternTag}_${item.verb}_${item.side}`);
      });
      if (decisionItems.length > 0) {
        previousEntity = decisionItems[decisionItems.length - 1].entity;
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

const PRACTICE_ENTITY = ENTITIES[Math.floor(Math.random() * ENTITIES.length)];
const PRACTICE_ITEMS = [
  {
    verb: "spin",
    form: pastForm("spin"),
    object: objectFor("spin"),
    regularity: regularityFor("spin"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("spin", PRACTICE_ENTITY),
    side: "PAST",
  },
  {
    verb: "drag",
    form: futureForm("drag"),
    object: objectFor("drag"),
    regularity: regularityFor("drag"),
    entity: PRACTICE_ENTITY,
    pic: pictureFor("drag", PRACTICE_ENTITY),
    side: "FUTURE",
  },
];

const PRACTICE_DECISION_ITEMS = fisherYates(PRACTICE_ITEMS.slice());
const PRACTICE_DECISION_LABELS = PRACTICE_DECISION_ITEMS.map(
  (item) => `practice_decision_${item.verb}_${item.side.toLowerCase()}`,
);

introTrial("practice", PRACTICE_ITEMS);
tenseIntroTrial("practice", {
  title: "Practice: Place events in time",
  body:
    `<p>This is a short practice with two ${PRACTICE_ENTITY} actions: <b>spin</b> and <b>drag</b>.</p>` +
    "<p>One action happened in the <b>past</b>, and one action will happen in the <b>future</b>.</p>" +
    "<p>Press <b>SPACE</b> to reveal each item and hear the sentence audio.</p>" +
    "<p>Then click <b>Next</b> to continue.</p>",
});
tensePairTrial("practice", PRACTICE_ITEMS, {
  body:
    "The two practice items will be shown according to their tense.<br><br>" +
    "Press <b>SPACE</b> to reveal each item and hear the sentence audio.",
});
decisionReadyTrial("practice", {
  title: "Practice: Choose Past or Future",
  body:
    "<p>Now you will choose the tense for each practice item.</p>" +
    "<p>Use this fixed key mapping:</p>" +
    "<p><b>C = Past</b> (left), <b>M = Future</b> (right)</p>" +
    "<p>You will receive feedback after each response.</p>",
  buttonText: "Start Practice Choices",
});
PRACTICE_DECISION_ITEMS.forEach((item, idx) => {
  practiceDecisionTrial(PRACTICE_DECISION_LABELS[idx], item);
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
    "This experiment takes about 25 minutes and requires your full attention." +
      "<p>Before you begin, please make sure:" +
      "<ul>" +
      "<li>You are using a <b>computer</b>, not a phone or tablet.</li>" +
      "<li>You are using <b>Google Chrome</b>.</li>" +
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
      // age must be numeric
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
      "You will then study whether these actions are already done or will be done in the future. " +
      "<li><b>Recalling</b>:<br>" +
      "Lastly, you will be asked to remember when these actions were done.<br>" +
      "You are expected the choose whether the event was in past or future according to what has been told by using keys: <br>" +
      "<b>C for Past</b> (left), <b>M for Future</b> (right).<br>" +
      "</li>" +
      "</ol>" +
      "<p>Please respond as quickly and accurately as possible.</p>" +
      "<p>Keep your left index finger on <b>C</b> and right index finger on <b>M</b> during decision trials.</p>",
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
  "practice_intro",
  newText("practice_intro_title", "Practice")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),
  newText(
    "practice_intro_body",
    "<p>You will now complete a short practice before the real experiment.</p>" +
      `<p>First, you will learn two ${PRACTICE_ENTITY} verbs: <b>spin</b> and <b>drag</b>.</p>` +
      "<p>Then you will see which one is <b>past</b> and which one is <b>future</b>, and make choices with feedback.</p>",
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
      "<p>Please get ready for the first block.</p>" +
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

const introBlock = [
  "intro",
  "consent",
  "demo",
  "instructions",
  "practice_intro",
  "intro_practice",
  "tense_intro_practice",
  "tense_pairs_practice",
  "ready_practice",
  ...PRACTICE_DECISION_LABELS,
  "exp_ready",
];

CheckPreloaded().label("check");

newTrial(
  "time_summary",
  newVar("exp_end_timestamp", 0)
    .global()
    .set(() => Date.now()),
  newVar("exp_elapsed_ms", 0)
    .global()
    .set(() => Date.now() - EXP_START_TIMESTAMP),
  newVar("exp_elapsed_min", 0)
    .global()
    .set(() => {
      const elapsed = Date.now() - EXP_START_TIMESTAMP;
      return Math.round((elapsed / 60000) * 100) / 100;
    }),
  newTimer("time_summary_wait", 1).start().wait(),
)
  .log("exp_start_timestamp", getVar("exp_start_timestamp"))
  .log("exp_end_timestamp", getVar("exp_end_timestamp"))
  .log("exp_elapsed_ms", getVar("exp_elapsed_ms"))
  .log("exp_elapsed_min", getVar("exp_elapsed_min"))
  .setOption("hideProgressBar", true);

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
  newKey("debrief_space_continue", " ").callback(
    getButton("debrief_continue").click(),
  ),
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
  newText("exit_close", "<p>When you are finished, you may close this tab.</p>")
    .css(text_css)
    .print()
    .center(),
  newButton("exit_wait", "END")
    .bold()
    .css(button_css)
    .center()
    .disable()
    .print(),
  newTimer("exit_end_gate", 900).start(),
  getTimer("exit_end_gate").wait(),
  getButton("exit_wait").enable(),
  newKey("exit_space_end", " ").callback(getButton("exit_wait").click()),
  getButton("exit_wait").wait(),
).setOption("hideProgressBar", true);

Sequence(
  ...introBlock,
  "check",
  ...metaSequences.flat(),
  "time_summary",
  "send_results",
  "debrief",
  "senddebrief",
  "exit_sona",
);
