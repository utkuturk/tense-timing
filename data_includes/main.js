// --- Initial Setup ---
PennController.ResetPrefix(null);
DebugOff();
SendResults("send_results");
SendResults("senddebrief");
PreloadZip("elevenlabs_audio.zip");
PreloadZip("https://raw.githubusercontent.com/utkuturk/tense-timing/norming/chunk_includes/pictures.zip");
const PSYCH_SONA_LINK_BASE = "https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=2052&credit_token=26041bec45c64b83ba65ac7b05b6bd93&survey_code=";
const LING_SONA_LINK_BASE = "https://umlinguistics.sona-systems.com/webstudy_credit.aspx?experiment_id=528&credit_token=0076a3889d544e94a368b38e997e923d&survey_code=";
var psych_sona_link = PSYCH_SONA_LINK_BASE + GetURLParameter("id");
var ling_sona_link = LING_SONA_LINK_BASE + GetURLParameter("id");

Header(
  newVar("source", "").global().set(GetURLParameter("source"))
)
  .log("SONA_ID_URL", GetURLParameter("id"))
  .log("source", GetURLParameter("source"));

defineBreakTrial();


const ENTITIES = ["Pirate", "Chef", "Wizard"];


const verbs = [
  "blow", "build", "carry", "climb", "dig", "drink", "eat", "paint", "peel",
  "play", "push", "read", "ride", "shake", "smell", "spin", "stir", "sweep", "wash", "drag"
];

const verbsBlock1 = ["drink", "read", "eat", "paint", "wash", "push"];
const verbsBlock2 = ["build", "sweep", "ride", "climb", "stir", "peel"];
const verbsBlock3 = ["blow", "dig", "shake", "carry", "play", "smell"];

const cbSets = {
  a: { // R seed: 271486
    past1: ["drink", "read", "eat"],
    past2: ["build", "sweep", "ride"],
    past3: ["blow", "dig", "shake"]
  },
  b: {
    past1: ["paint", "wash", "push"],
    past2: ["climb", "stir", "peel"],
    past3: ["carry", "play", "smell"]
  },
  c: { // R seed: 394761
    past1: ["paint", "wash", "push"], // flipped from b
    past2: ["climb", "stir", "peel"],
    past3: ["carry", "play", "smell"]
  },
  d: {
    past1: ["drink", "read", "eat"], // flipped from a
    past2: ["build", "sweep", "ride"],
    past3: ["blow", "dig", "shake"]
  }
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
    wash: "pirate_wash_dish_v3.png"
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
    wash: "chef_wash_dish_v3.png"
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
    wash: "wizard_wash_dish_v5.png"
  }
};

const PAST_FORMS = {
  "blow": "blew",
  "build": "built",
  "carry": "carried",
  "climb": "climbed",
  "dig": "dug",
  "drag": "dragged",
  "drink": "drank",
  "eat": "ate",
  "paint": "painted",
  "peel": "peeled",
  "play": "played",
  "push": "pushed",
  "read": "read",
  "ride": "rode",
  "shake": "shook",
  "smell": "smelled",
  "spin": "spun",
  "stir": "stirred",
  "sweep": "swept",
  "wash": "washed"
};

const OBJECT_PHRASE_BY_VERB = {
  "blow": "bubbles",
  "build": "a tower",
  "carry": "a box",
  "climb": "a ladder",
  "dig": "a hole",
  "drag": "a sack",
  "drink": "coffee",
  "eat": "an apple",
  "paint": "a canvas",
  "peel": "a banana",
  "play": "the guitar",
  "push": "a cart",
  "read": "a book",
  "ride": "a bicycle",
  "shake": "a bottle",
  "smell": "a flower",
  "spin": "a top",
  "stir": "a pot",
  "sweep": "the floor",
  "wash": "a dish"
};

const pastForm = v => PAST_FORMS[v] || v + "ed"; // Simple fallback
const futureForm = v => "will " + v;
const pictureFor = (verb, entity) => {
  const byEntity = PICTURE_BY_ENTITY_VERB[entity] || {};
  const picture = byEntity[verb];
  if (!picture) throw new Error(`Missing picture mapping for ${entity}_${verb}`);
  return picture;
};
const objectFor = (verb) => OBJECT_PHRASE_BY_VERB[verb] || "";

const practiceItems = [
  {
    verb: "spin",
    form: pastForm("spin"),
    object: objectFor("spin"),
    entity: "Pirate",
    pic: pictureFor("spin", "Pirate"),
    side: "PAST"
  },
  {
    verb: "drag",
    form: futureForm("drag"),
    object: objectFor("drag"),
    entity: "Wizard",
    pic: pictureFor("drag", "Wizard"),
    side: "FUTURE"
  }
];

// Helper to manually build the practice sequence
function buildPracticeSequence() {
  return [
    "intro_practice",
    "recall_intro_practice",
    // Recall trials
    ...practiceItems.map(item => `recall_practice_${item.verb}_${item.side}`),
    "recall_outro_practice",
    "tense_intro_practice",
    "tense_pairs_practice",
    // Decision trials
    ...practiceItems.map(item => `exp_practice_${item.verb}_${item.side}`)
  ];
}

function makeBlockItems(blockVerbs, pastVerbs) {
  // Split verbs by tense
  const futureVerbs = blockVerbs.filter(v => !pastVerbs.includes(v));

  // Sort so the assignment is fixed and reproducible
  const pastSorted = pastVerbs.slice().sort();
  const futureSorted = futureVerbs.slice().sort();

  // Map from verb -> entity so each entity gets 1 past, 1 future
  const entityByVerb = {};

  ENTITIES.forEach((ent, i) => {
    entityByVerb[pastSorted[i]] = ent;  // one past per entity
    entityByVerb[futureSorted[i]] = ent;  // one future per entity
  });

  return [
    ...pastVerbs.map(v => ({
      verb: v,
      form: pastForm(v),
      object: objectFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "PAST"
    })),
    ...futureVerbs.map(v => ({
      verb: v,
      form: futureForm(v),
      object: objectFor(v),
      entity: entityByVerb[v],
      pic: pictureFor(v, entityByVerb[v]),
      side: "FUTURE"
    }))
  ];
}

function makeItemsForList(listId) {
  const cfg = cbSets[listId];
  const items1 = makeBlockItems(verbsBlock1, cfg.past1);
  const items2 = makeBlockItems(verbsBlock2, cfg.past2);
  const items3 = makeBlockItems(verbsBlock3, cfg.past3);
  return { items1, items2, items3 };
}

// choose which CB list
const listOptions = ["a", "b", "c", "d"];
const LIST_ID = listOptions[Math.floor(Math.random() * listOptions.length)];
let { items1, items2, items3 } = makeItemsForList(LIST_ID);

// ==============================
// 3. REGISTER ALL TRIALS
// ==============================

// PRACTICE TRIALS
introTrial("practice", practiceItems);
// Register recall trials for practice items
practiceItems.forEach(recall_trial("practice"));
// Register decision trials for practice items
practiceItems.forEach(item => {
  // Manually register decision trial for practice
  trial("practice")(item);
});
recallIntroTrial("practice");
recallOutroTrial("practice");
tenseIntroTrial("practice");
tensePairTrial("practice", practiceItems);


// decision trials
items1.forEach(trial("block1"));
items2.forEach(trial("block2"));
items3.forEach(trial("block3"));

// recall trials
items1.forEach(recall_trial("block1"));
items2.forEach(recall_trial("block2"));
items3.forEach(recall_trial("block3"));

// teaching intros
introTrial("block1", items1);
introTrial("block2", items2);
introTrial("block3", items3);
tenseIntroTrial("block1");
tenseIntroTrial("block2");
tenseIntroTrial("block3");
tensePairTrial("block1", items1);
tensePairTrial("block2", items2);
tensePairTrial("block3", items3);

// recall intros / outros
recallIntroTrial("block1");
recallIntroTrial("block2");
recallIntroTrial("block3");

recallOutroTrial("block1");
recallOutroTrial("block2");
recallOutroTrial("block3");

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

function shuffled(arr) {
  return fisherYates(arr.slice());
}

const blocks = [
  { name: "block1", items: items1 },
  { name: "block2", items: items2 },
  { name: "block3", items: items3 }
];

function buildBlockSequence(blockOrder, withIntro, withRecall) {
  const seq = [];

  blockOrder.forEach((b, index) => {
    if (index > 0) {
      seq.push("Break");
    }

    if (withIntro) {
      seq.push(`intro_${b.name}`);
    }

    if (withRecall) {
      seq.push(`recall_intro_${b.name}`);

      // RECALL TRIALS: random order within this block
      shuffled(b.items).forEach(item => {
        seq.push(`recall_${b.name}_${item.verb}_${item.side}`);
      });

      seq.push(`recall_outro_${b.name}`);
    }

    if (withIntro) {
      seq.push(`tense_intro_${b.name}`);
      seq.push(`tense_pairs_${b.name}`);
    }

    // Decision trials in fixed P F F P P F order
    const decisionItems = orderItemsByTensePattern(b.items, index);
    decisionItems.forEach(item => {
      seq.push(`exp_${b.name}_${item.verb}_${item.side}`);
    });
  });

  return seq;
}

const order1 = blocks.slice();
fisherYates(order1);
const metaBlock1 = buildBlockSequence(order1, true, true);

const order2 = blocks.slice();
fisherYates(order2);

const metaBlock2 = [
  "Break",
  ...buildBlockSequence(order2, true, true)
];

const practiceBlockSeq = buildPracticeSequence();


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
    "</ul>"
  )
    .css({ "font-size": "1.1em", "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("CONTINUE")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait()
)
  .setOption("hideProgressBar", true);



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
    "<a target='_blank' rel='noopener noreferrer' href='irb.pdf'>here</a> " +
    "to open the consent form for this study in a new tab." +
    "<p>If you read it and agree to participate, click <b>I Agree</b> below." +
    "<br>You can leave the study at any time by closing this tab." +
    "<p>If you have any questions or encounter problems, you can contact the researchers by email."
  )
    .css({ "font-size": "1.1em", "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newText(
    "researchers",
    "<p><b>Researchers:</b><br>" +
    "Utku Turk, PhD (utkuturk@umd.edu) and Prof. Shota Momma"
  )
    .css({ "font-size": "0.95em", "max-width": "40em", "text-align": "left", "margin-top": "1em" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("agree", "I AGREE")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait()
)
  .setOption("hideProgressBar", true);

newTrial(
  "demo",

  ...newDemo("age", "Age*:"),
  ...newDemo("gender", "Gender*:"),
  ...newDemo("geo", "Location (state, country)*:"),
  ...newDemo("comp", "Computer type (e.g. Mac, PC)*:"),
  ...newDemo("language", "Native language*:"),
  ...newDemo("otherlg", "Other languages you speak:"),

  newText("demo-note", "Fields with * are required.")
    .center()
    .print(),

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
            .print()
        )
        .and(requireFilled("language",
          "Please enter your native language."))
        .and(requireFilled("gender",
          "Please indicate your gender or write 'prefer not to say'."))
        .and(requireFilled("geo",
          "Please enter your current location."))
        .and(requireFilled("comp",
          "Please indicate your computer type."))
    )
)
  .setOption("hideProgressBar", true);


newTrial(
  "instructions",

  newText("inst-title", "Instructions<br><br>")
    .css({ "font-size": "2em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "inst-body",
    "<p>You will see simple pictures of characters doing actions (verbs)." +
    "<p>The experiment has two parts that will repeat multiple times for a variety of set of actions:" +
    "<ol>" +
    "<li><b>Learning and practice</b>:<br>" +
    "You will first learn the verbs and their tenses." +
    " Press the <b>SPACE</b> bar to reveal each verb and its tense." +
    " Then you will practice by typing the base form of the verb" +
    " (for example, type <b>build tower</b>, not <b>built tower</b>).<br><br>" +
    "</li>" +
    "<li><b>Main task</b>:<br>" +
    "You will see a picture and choose whether the sentence is in the <b>Past</b> or <b>Future</b>." +
    " You will see two words on the screen: <b>Past</b> on one side and <b>Future</b> on the other." +
    " Press <b>C</b> for the option on the left and <b>M</b> for the option on the right." +
    "</li>" +
    "</ol>" +
    "<p>Please respond as quickly and accurately as you can." +
    "<br>Keep your fingers on the <b>C</b> and <b>M</b> keys during the decision parts."
  )
    .css({ "font-size": "1.1em", "max-width": "45em", "text-align": "left" })
    .center()
    .print(),

  newText("<p>").print(),

  newButton("CONTINUE")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait()
)
  .setOption("hideProgressBar", true);

const introBlock = ["intro", "consent", "demo", "instructions"];


CheckPreloaded().label("check");

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
    "<p>If you have any questions, contact <a href='mailto:utkuturk@umd.edu'>utkuturk@umd.edu</a>.</p>"
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
  newText("d_q3", "Optional feedback")
    .css({ "margin-top": "10px" })
    .print(),
  newTextInput("feedback")
    .lines(4)
    .size("900px", "120px")
    .log()
    .print(),
  newButton("debrief_continue", "Continue")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait()
).setOption("hideProgressBar", true);

newTrial(
  "exit_sona",
  newText("exit_thanks", "<center><b>Thank you for participating!</b></center>")
    .css(text_css)
    .print()
    .center(),
  newText("exit_sona_msg", "<p>You can confirm your participation on SONA by clicking the link below:</p>")
    .css(text_css),
  newText("psych_link", "<p><a href='" + psych_sona_link + "'>Confirm your participation.</a></p>")
    .css(text_css),
  newText("ling_link", "<p><a href='" + ling_sona_link + "'>Confirm your participation.</a></p>")
    .css(text_css),
  newText("fallback_msg", "<p>Thank you for your participation. Your credit will be approved within 3 days after the due date of the experiment.</p>")
    .css(text_css),
  getVar("source").test.is("psych")
    .success(
      getText("exit_sona_msg").print(),
      getText("psych_link").print()
    )
    .failure(
      getVar("source").test.is("ling")
        .success(
          getText("exit_sona_msg").print(),
          getText("ling_link").print()
        )
        .failure(getText("fallback_msg").print())
    ),
  newText("exit_close", "<p>When you are finished, you may close this tab.</p>")
    .css(text_css)
    .print()
    .center(),
  newButton("exit_wait", "END")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait()
).setOption("hideProgressBar", true);


Sequence(...introBlock, "check", ...practiceBlockSeq, ...metaBlock1, ...metaBlock2, "send_results", "debrief", "senddebrief", "exit_sona");
