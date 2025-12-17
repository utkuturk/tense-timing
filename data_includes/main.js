// --- Initial Setup ---
PennController.ResetPrefix(null);
DebugOff();
SendResults("send_results");
baselink = "https://github.com/utkuturk/tense-timing/conceptual-task/chunk_includes/"
var EXPID = "AAAA";
var CREDIT = 0.5;
var debrief_link = "https://forms.gle/38QgPd9iFFF336oq6";
var psych_sona_link =
  "https://umpsychology.sona-systems.com/webstudy_credit.aspx?experiment_id=" +
  EXPID +
  "&credit_token=" +
  CREDIT +
  "&survey_code=" +
  GetURLParameter("id");
var prolific_code = "C110NELM";
var prolific_link = "https://app.prolific.com/submissions/complete?cc=" + prolific_code;

PreloadZip(`${baselink}chef.zip`);
PreloadZip(`${baselink}pirate.zip`);
PreloadZip(`${baselink}doctor.zip`);


defineBreakTrial();


const ENTITIES = ["Pirate", "Chef", "Wizard"];


const verbs = [
  "cut", "build", "sweep", "ride", "drink", "throw", "break", "eat", "dig",
  "paint", "kick", "play", "wash", "stir", "climb", "push", "peel", "smell"
];

const verbsBlock1 = ["drink", "break", "eat", "paint", "wash", "push"];
const verbsBlock2 = ["cut", "sweep", "throw", "kick", "stir", "peel"];
const verbsBlock3 = ["build", "ride", "dig", "play", "climb", "smell"];

const cbSets = {
  a: { // R seed: 271486
    past1: ["drink", "break", "eat"],
    past2: ["cut", "sweep", "throw"],
    past3: ["build", "ride", "dig"]
  },
  b: {
    past1: ["paint", "wash", "push"],
    past2: ["kick", "stir", "peel"],
    past3: ["play", "climb", "smell"]
  },
  c: { // R seed: 394761
    past1: ["paint", "wash", "push"], // flipped from b
    past2: ["kick", "stir", "peel"],
    past3: ["play", "climb", "smell"]
  },
  d: {
    past1: ["drink", "break", "eat"], // flipped from a
    past2: ["cut", "sweep", "throw"],
    past3: ["build", "ride", "dig"]
  }
};

const IMAGE_SUFFIXES = {
  // Practice
  "light": "candle",
  "hammer": "nail",

  // Irregular
  "cut": "bread",
  "build": "tower",
  "sweep": "floor",
  "ride": "bicycle",
  "drink": "coffee",
  "throw": "frisbee",
  "break": "stick",
  "eat": "apple",
  "dig": "hole",

  // Regular
  "paint": "canvas",
  "kick": "ball",
  "play": "guitar",
  "wash": "dish",
  "stir": "pot",
  "climb": "ladder",
  "push": "cart",
  "peel": "banana",
  "smell": "flower"
};

const PAST_FORMS = {
  // Practice
  "light": "lit",
  "hammer": "hammered",

  // Irregular
  "cut": "cut",
  "build": "built",
  "sweep": "swept",
  "ride": "rode",
  "drink": "drank",
  "throw": "threw",
  "break": "broke",
  "eat": "ate",
  "dig": "dug",

  // Regulars will be handled by default fallback if not listed, but listing to be safe/explicit if needed.
  // We can let the fallback regularPast logic handle them, or list them.
  // Given user wants simplest "verbs", standard -ed applies.
};

const pastForm = v => PAST_FORMS[v] || v + "ed"; // Simple fallback
const futureForm = v => "will " + v;
// Entity + "_" + verb + "_" + suffix + ".png" -> e.g. "Wizard_cut_bread.png"
const toPicFilename = (v, ent) => `${ent}_${v}_${IMAGE_SUFFIXES[v]}.png`;

const practiceItems = [
  {
    verb: "light",
    form: PAST_FORMS["light"],
    entity: "Wizard",
    pic: toPicFilename("light", "Wizard"),
    side: "PAST"
  },
  {
    verb: "hammer",
    form: futureForm("hammer"),
    entity: "Pirate",
    pic: toPicFilename("hammer", "Pirate"),
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
      entity: entityByVerb[v],
      pic: toPicFilename(v, entityByVerb[v]),
      side: "PAST"
    })),
    ...futureVerbs.map(v => ({
      verb: v,
      form: futureForm(v),
      entity: entityByVerb[v],
      pic: toPicFilename(v, entityByVerb[v]),
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

    // Decision trials in fixed P F F P P F order
    const decisionItems = orderItemsByTensePattern(b.items);
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
  ...buildBlockSequence(order2, false, false)
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
    "<p>You will see simple pictures of a chef doing actions (verbs)." +
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

// PROLIFIC EXIT
newTrial(
  "exit_prolific",
  newText("exit-title",
    "Thank you for participating in our study!"
  )
    .css({ "font-size": "1.6em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "exit-body",
    "Your completion code is: <b>" + prolific_code + "</b>." +
    "<p>Please paste this code into Prolific." +
    "<p>You can also confirm your participation by clicking this link: " +
    "<a href='" + prolific_link + "'>Confirm your participation on Prolific</a>." +
    "<p>When you are finished, you may close this tab."
  )
    .css({ "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newTimer("wait-a-bit", 1000).start().wait()
)
  .setOption("hideProgressBar", true);



// SONA (Psych) EXIT
newTrial(
  "exit_sona_psych",
  newText("exit-title",
    "Thank you for participating in our study!"
  )
    .css({ "font-size": "1.6em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "exit-body",
    "You can confirm your participation on SONA by clicking this link: " +
    "<a href='" + psych_sona_link + "'>Confirm your participation on SONA</a>." +
    "<p>When you are finished, you may close this tab."
  )
    .css({ "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newTimer("wait-a-bit", 1000).start().wait()
)
  .setOption("hideProgressBar", true);



// SONA (Ling) EXIT + DEBRIEF REDIRECT
newTrial(
  "exit_sona_ling",
  exitFullscreen(),

  newText("exit-title",
    "Thank you for participating in our study!"
  )
    .css({ "font-size": "1.6em", "font-weight": "bold" })
    .center()
    .print(),

  newText(
    "exit-body",
    "You can confirm your participation on SONA by clicking the <b>END</b> button below." +
    "<p>After clicking it, you will be redirected to a short form that explains the study and asks a few questions."
  )
    .css({ "max-width": "40em", "text-align": "left" })
    .center()
    .print(),

  newButton("END")
    .bold()
    .css(button_css)
    .center()
    .print()
    .wait(),

  // Replace content with redirect message
  getText("exit-title").remove(),
  getText("exit-body").remove(),

  newHtml(
    "ling_debrief",
    "<!DOCTYPE html>" +
    "<meta http-equiv='refresh' content='0; url=" + debrief_link + "'>" +
    "The experiment has ended and your answers have been sent.<br />" +
    "If you need credit, <a href='" + debrief_link + "'>click this link</a> and follow the instructions."
  )
    .print()
    .wait()
)
  .setOption("hideProgressBar", true);


Sequence(...introBlock, "check", ...practiceBlockSeq, ...metaBlock1, ...metaBlock2, "send_results", "exit_sona_ling");