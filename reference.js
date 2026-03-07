PennController.ResetPrefix(null); // Initiates PennController
PennController.DebugOff(); // turn off debugger
PennController.SetCounter("setcounter");
SendResults("send_results");






/// WRITING
// TALK ABOUT WHY UNRELATEDs in the gender one matter
// SOA -200 no unrelated and gender, but SOA 0 unrelated too
// SAY SOMETHING LIKE ZIZEKS SUBSTACK
// IF YOU ARE HERE FOR THE COMFORT OF CERTAINTY AND NEAT CONCLUSIONS, YOU ARE LOST.

// AFTER PROLIFIC 2
// XX DONE DECREASE EXPLORE
// XX DONE ADD WHITE SCREEN
// CORRECT PRESENTATION
// CORRECT RED SQUARE
// MAYBE ADD BLACK SQUARE
// XX DONE FEEDBACK BEFORE SEND RESULTS

// AFTER LONDON
// TRIALS too FAST - now it is 500+3000+(500)
// TYPING TOO FAST - now 7000 sc.
// CHARACTERS TOO SMALL !! Made it to 30. we will see.
// NOT GOING TO GOOGLE FORM !!!! DONE

var mylist = ["L1", "L2"];
var mylistindex = mylist[Math.floor(Math.random() * 2)];
var mylistcond = mylist[mylistcond];
var EXPID = "corner_same_verb";
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
var prolific_link =
  "https://app.prolific.com/submissions/complete?cc=" + prolific_code;
// var prolific_link = "https://www.google.com";
critical = randomizeNoMoreThan(startsWith("trial_"), 2);

Sequence(
  "setcounter",
  "intro",
  "consent",
  "demo",
  "init",
  "recording_test",
  "preloadTrial",
  "instruction-1",
  "instruction-2",
  "instruction-3",
  "inst_trial",
  "quite", // NOT THERE COMPLETELY
  "pre-habit-subj",
  randomize("habit-subj-hear"),
  "pre-habit-subj-recall",
  randomize("habit-subj-recall"),
  "async",
  "pre-habit-verb",
  randomize("habit-verb-hear"),
  "pre-habit-verb-recall",
  randomize("habit-verb-recall"),
  "async",
  "prac-intro",
  "prac-intro2",
  "prac-intro3",
  randomize("practice"), // NOT DONE
  // TRIALS
  "exp-start",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  "break",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  "break",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  pick(critical, 6),
  "async",
  // "beforeExit",
  "feedback",
  "send_results",
  "exit_prolific"
  // ,
  // "exit_sona_ling"
  // ,
  // "exit_sona_psych"
);

// **** Server Stuff  ****
var dir =
  "https://hjpatt-136.umd.edu/Web_Experiments/Phillips/Utku/corner_same_verb/";
AddHost(dir + "hab/");
AddHost(dir + "prac/");
AddHost(dir + "stimuli/");
InitiateRecorder(
  dir + "PCIbex.php",
  "<center><font style='margin: 0 auto; font-size: 20px; font-family: sans-serif;'><strong>This experiment will automatically upload voice recordings to a private server.</strong> Make sure that you allow recordings on your browser and then click 'I consent' below. </font></center>"
)
  .label("init")
  .consent(
    "<center><font style='margin: 0 auto; font-size: 20px; font-family: sans-serif;'>I consent.</font></center>"
  );

// Check preload
CheckPreloaded().label("preloadTrial"); // Change this to preload all

// **** CSV Hearder  ****
Header(
  newVar("head").global(),
  newVar("head_number").global(),
  newVar("verb_type").global(),
  newVar("distractor0").global(),
  newVar("distractor1").global(),
  newVar("distractor_number").global(),
  newVar("itemnum").global(),
  newVar("target_location").global(), // ADD ALL POSITIONS
  newVar("cohort_location").global(),
  newVar("distractor_location").global(),
  newVar("trialNum").global()
)
  .log("sonaID", GetURLParameter("id"))
  .log("PROLIFIC", GetURLParameter("id"))
  .log("Mylist", mylistindex)
  .log("head", getVar("head"))
  .log("head_number", getVar("head_number"))
  .log("verb_type", getVar("verb_type"))
  .log("distractor0", getVar("distractor0"))
  .log("distractor1", getVar("distractor1"))
  .log("distractor_number", getVar("distractor_number"))
  .log("itemnum", getVar("itemnum"))
  .log("target_location", getVar("target_location"))
  .log("cohort_location", getVar("cohort_location"))
  .log("distractor_location", getVar("distractor_location"))
  .log("trialNum", getVar("trialNum"));

// upload async
UploadRecordings("async", "noblock");

// TIMINGS
var white = 300;
var cross_time = 500;
var explore = 1000;
var square = 500;
var nosquare = 3500;
var habit_record_timer = 2500;
var habit_answer_timer = 7000;
var ProceedTimeOut = 5000;
var next_trial = 500;

const fname = "exp_" + mylistindex + ".csv";
const fname_practice = "practice_" + mylistindex + ".csv";

// CSS
var cross_css = { "font-size": "100" };

var page_css = {
  overflow: "auto",
  padding: "1em",
  "box-shadow": "4px 4px 2px #cacfd2",
  border: "1px solid #cacfd2",
  "border-radius": "2em",
};

var button_css = {
  "background-color": "#E03A3E",
  color: "white",
  "font-size": "1.25em",
  padding: "0.5em",
  "border-radius": "0.25em",
  // "width": "4em",
  margin: "0 auto",
  "text-align": "center",
  border: "none", // Remove default button border
  display: "block", // To center the button
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

// FUNCTIONS
// Trial number
const trialN = () => [
  newVar("TrialN", 0)
    .settings.global()
    .set((v) => v + 1),
];

// Cross
const newCross = () => [
  newTimer("white_timer", white).start().wait(),
  newText("cross", "+")
    .center()
    .bold()
    .css(cross_css)
    .print("center at 50%", "middle at 50%"),
  newTimer("cross_timer", cross_time).start().wait(),
  getText("cross").remove(),
];

const hideRec = () => [
  newFunction("hideRec", () =>
    $("div:contains(Recording...)").css("display", "none")
  ).call(),
];

const showRec = () => [
  newFunction("showNotRec", () =>
    $("div:contains(Not recording)").css("display", "block")
  ).call(),
];

const newDemo = (label, text) => [
  newTextInput(label)
    .before(newText(text).size("15em", "1.5em"))
    .size("15em", "1.5em")
    .lines(1)
    .css(underline_blank)
    .center()
    .log(),
];

const get_target_cohort = (f, head, head_num) => [
  newCanvas("TargetCanvas-bare", "30vw", "30vh").add(
    "center at 50%",
    "middle at 50%",
    newImage("Target-bare", head_num + "_" + head + ".png").size("", "30vh")
  ),
  newCanvas("CohortCanvas", "30vw", "30vh").add(
    "center at 50%",
    "middle at 50%",
    newImage("Cohort", head_num + "_" + head + ".png").size("", "30vh")
  ),
  newCanvas("TargetCanvas", "30vw", "30vh").add(
    "center at 50%",
    "middle at 50%",
    newImage("Target", f).size("", "30vh")
  ),
  // Randomly determine target's vertical location (0 = top, 1 = bottom)
  newVar("target_Vert", "").set((v) => Math.floor(Math.random() * 2)),
  // Determine target left/right location
  newVar("target_side", "").set((v) => Math.floor(Math.random() * 2)),
  newVar("target_LR", ""),
  getVar("target_side")
    .test.is(1)
    .success(getVar("target_LR").set("L")) // Target on left when target_side = 1
    .failure(getVar("target_LR").set("R")), // Otherwise target on right
  // Determine target left/right location
  newVar("cohort_side", "").set((v) => Math.floor(Math.random() * 2)),
  newVar("cohort_LR", ""),
  getVar("cohort_side")
    .test.is(1)
    .success(getVar("cohort_LR").set("L")) // Target on left when target_side = 1
    .failure(getVar("cohort_LR").set("R")), // Otherwise target on right
];

const get_distractor = (distlist) => [
  (randomSubset = getRandomSubset(distlist, 2)),
  // Randomly determine distractor's horizontal location (0 = left, 1 = right)
  newVar("dist_AB", "").set((v) => Math.floor(Math.random() * 2)),

  // Determine distractor locations (randomly order our two distractors; index 0 = left, index 1 = right)
  (Distractors = randomSubset.sort((v) => Math.random() - Math.random())),
  newCanvas("DistCanvas_A", "30vw", "30vh").add(
    "center at 50%",
    "middle at 50%",
    newImage("Distractor_A", Distractors[0]).size("", "30vh")
  ),
  newCanvas("DistCanvas_B", "30vw", "30vh").add(
    "center at 50%",
    "middle at 50%",
    newImage("Distractor_B", Distractors[1]).size("", "30vh")
  ),
];

function getRandomSubset(arr, size) {
  const shuffled = arr.slice(0);
  let i = arr.length;
  let temp;
  let index;
  // Fisher-Yates algorithm
  while (i--) {
    index = Math.floor((i + 1) * Math.random());
    temp = shuffled[index];
    shuffled[index] = shuffled[i];
    shuffled[i] = temp;
  }
  return shuffled.slice(0, size);
}

function getRandomStr() {
  const LENGTH = 8;
  const SOURCE = "abcdefghijklmnopqrstuvwxyz";
  let result = "";

  for (let i = 0; i < LENGTH; i++) {
    result += SOURCE[Math.floor(Math.random() * SOURCE.length)];
  }
  return result;
}
// Generate a subject ID
const s = getRandomStr();

function SepWithN(sep, main, n) {
  this.args = [sep, main];

  this.run = function (arrays) {
    assert(
      arrays.length == 2,
      "Wrong number of arguments (or bad argument) to SepWithN"
    );
    assert(parseInt(n) > 0, "N must be a positive number");
    let sep = arrays[0];
    let main = arrays[1];

    if (main.length <= 1) return main;
    else {
      let newArray = [];
      while (main.length) {
        for (let i = 0; i < n && main.length > 0; i++)
          newArray.push(main.pop());
        for (let j = 0; j < sep.length && main.length > 0; ++j)
          newArray.push(sep[j]);
      }
      return newArray;
    }
  };
}
function sepWithN(sep, main, n) {
  return new SepWithN(sep, main, n);
}

// INTRO
newTrial(
  "intro",
  defaultText.css(text_css),
  newText(
    "welcome-body",
    "<center><b>Welcome!</b></center>" +
      "<p>In this experiment, you will be asked to recall characters and their actions while locating them on the screen. Your voice will be recorded while you recall them out loud ." +
      "<p>The experiment is reasonably brief. Most people find that the study takes around 30 minutes. " +
      "During this time, you must give your <b>complete attention</b>." +
      "<p>Before proceeding please make sure:<ol>" +
      "<li>You are using your <b>computer</b>, and not your phone or tablet,</li>" +
      "<li>You are using <b>Google Chrome</b> or <b>Firefox</b>, and not Safari,</li>" +
      "<li>You have a <b>working mouse/trackpad and keyboard</b>,</li>" +
      // "<li>You are a native speaker of <b>American English</b>,</li>" +
      "<li>You are <b>older than 18</b> years old,</li>" +
      "<li>This is your <b>first time doing this experiment</b>,</li>" +
      "<li>You have a working microphone and speakers.</li>" +
      "</ol>"
  ),
  newCanvas("welcome-page", 1500, 550)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("welcome-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
).setOption("hideProgressBar", true);

// CONSENT
newTrial(
  "consent",
  defaultText.css(text_css),
  newText(
    "consent-body",
    "<center><b>Consent Form</b></center>" +
      "<p>Please click <a target='_blank' rel='noopener noreferrer' href='https://utkuturk.com/files/html_consent_demo.pdf'> here</a> to download the consent form for this study. If you read it and agree to participate in this study, click 'I Agree' below. If you do not agree to participate in this study, you can leave this study by closing the tab. You can leave the experiment at any time by closing the tab during the experiment. If you leave the experiment before completion of both parts, you will not be compensated for your time. If you encounter any problems, do not hesitate to reach us either via " +
      // "Prolific or e-mail." +
      "email. " +
      "<br><br><b> Researchers:</b> <br>Utku Turk, PhD Student <i> (utkuturk@umd.edu)</i>,<br>Assoc. Prof. Ellen Lau<br>Prof. Colin Phillips<br>University of Maryland, Department of Linguistics"
  ),

  newCanvas("consent-page", 1500, 500)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("consent-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("agree", "I AGREE").bold().css(button_css).print().wait()
).setOption("hideProgressBar", true);

// DEMO
newTrial(
  "demo",
  defaultText.css(text_css),
  newDemo("pid", "Prolific ID*:"),
  newDemo("age", "Age*:"),
  newDemo("gender", "Gender*:"),
  newDemo("geo", "Location (state, country):"),
  newDemo("comp", "Computer type (e.g. Mac, PC)*:"),
  newDemo("language", "Native language*:"),
  newDemo("otherlg", "Other languages you speak (please list):"),
  newCanvas("demo-page", 1500, 450)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(
      0,
      130,
      newText(
        "Make sure that you entered all the information below. Obligatory ones are marked with *."
      )
    )
    .add(0, 210, getTextInput("age"))
    .add(0, 250, getTextInput("gender"))
    .add(0, 290, getTextInput("comp"))
    .add(0, 330, getTextInput("language"))
    .add(0, 370, getTextInput("otherlg"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE")
    .bold()
    .css(button_css)
    .print()
    .wait(
      getTextInput("age")
        .test.text(/^\d+.+$/)
        .failure(
          newText("Age should be a numeric value").settings.color("red").print()
        )
        .and(
          getTextInput("language")
            .testNot.text("")
            .failure(
              newText("Please enter your native language")
                .settings.color("red")
                .print()
            )
        )
        .and(
          getTextInput("gender")
            .testNot.text("")
            .failure(
              newText(
                "Please indicate your gender or write 'prefer not to say'"
              )
                .settings.color("red")
                .print()
            )
        )
        .and(
          getTextInput("comp")
            .testNot.text("")
            .failure(
              newText("Please indicate your computer type")
                .settings.color("red")
                .print()
            )
        )
    )
);

// RECORDING TEST
newTrial(
  "recording_test",
  defaultText.css(text_css),
  (recording_name = s + "_test-recorder"),
  newText(
    "audio-body1",
    "<b>This experiment involves audio recording. " +
      "Before you start the experiment, please test your recording.</b>" +
      "<p> Please record yourself saying the sentence 'This is a test' (this recording will be saved). " +
      "To start the recording, press the Record button below. " +
      "To stop the recording, press it again. " +
      "To test whether your voice was recorded, click the play button."
  ).css(text_css),
  newMediaRecorder(recording_name, "audio").center(),
  newText(
    "audio-body2",
    "Make sure you can hear your voice clearly in the playback before you continue. " +
      "<b>Please do not hesitate to test recording yourself multiple times to adjust your volume, " +
      "and make sure you can hear your voice clearly in the playback before you continue.</b>" +
      "<p> During the experiment, recordings will start and stop automatically. " +
      "There is a notification at the top of the page that will indicate when audio is being recorded."
  ).css(text_css),
  newCanvas("audio-page", 1500, 550)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("audio-body1"))
    .add(130, 280, getVoiceRecorder(recording_name))
    .add(0, 350, getText("audio-body2"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE")
    .bold()
    .css(button_css)
    .print()
    .wait(
      getMediaRecorder(recording_name)
        .test.recorded()
        // .failure(
        //   newText("Please test your audio recording before continuing!")
        //     .color("red")
        //     .print()
        // )
        .and(
          getMediaRecorder(recording_name)
            .test.hasPlayed()
            .failure(
              newText(
                "Please make sure you tested your audio recording and listened to your recording before continuing!"
              )
                .settings.color("red")
                .print()
            )
        )
    )
).setOption("hideProgressBar", true);

// INSTR FIRST
newTrial(
  "instruction-1",
  defaultText.css(text_css),
  newText(
    "inst-1-body",
    " <p>Please read instructions carefully!" +
      "<p>In each trial of this experiment, you will see couple of characters on the screen. After a brief moment, one of the characters performing an action will be briefly marked with a thick square. You will also hear a click sound."
  ),
  newCanvas("inst-1-page", 1500, 300)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("inst-1-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

newTrial(
  "instruction-2",
  defaultText.css(text_css),
  newText(
    "inst-2-body",
    " <p>Please read instructions carefully!" +
      "<p><b>Your task is to describe that scene by recalling the character’s name, the action they’re performing, and the other character they’re positioned near</b>. <p> You are asked to describe the scene <b>aloud</b> and as <b>accurate</b> as possible in terms of character and action. You are given <b>4 seconds</b> to complete the task."
  ),
  newCanvas("inst-2-page", 1500, 360)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("inst-2-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

newTrial(
  "instruction-3",
  defaultText.css(text_css),
  newText(
    "inst-3-body",
    " <p>Please read instructions carefully!" +
      "<p>You should start describing the scene as soon as you see the thick square and hear the click sound. " +
      "<p>Please use sentences such as the following:" +
      "<br>'<i>The doctor to the left of the wizard is flying.</i>' <p><b>Do not use</b> '<i>The doctor is flying to left of the wizard,</i> since it means something completely different.' <p>It is <b>important</b> that you use phrases like <b>'by' or 'near' after the subject </b>to make it clear which scene you are describing." +
      "<p>Click 'Continue' to see the example in action."
  ),
  newCanvas("inst-3-page", 1500, 500)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("inst-3-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);




// HABITUATION

// MOVE TO QUITE
newTrial(
  "quite",
  defaultText.css(text_css),
  newText(
    "inst-4-body",
    "<p>Please move to a quiet environment so that there are no background sounds " +
      "(e.g. music, television, voices) that will be picked up in the audio recordings. " +
      "Please also silence computer notifications or use headphones " +
      "(note that there will be audio during the experiment, so please do not mute your computer)." +
      "<p>When you are ready, please turn off any distractions " +
      "such as music, television, or your cell phone for the duration of the experiment, " +
      "and click below to continue to the familiarization section. Thank you!"
  ),
  newCanvas("inst-4-page", 1500, 350)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 130, getText("inst-4-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait(),
  fullscreen()
);

// BEFORE FAMILIARIZATION SUBJECTS
newTrial(
  "pre-habit-subj",
  defaultText.css(text_css),
  newText(
    "inst-3-body-1",
    "In this experiment, you will be asked the recall characters and will use them in sentences like '<b>The doctor to the left of the chef is running.</b>'" +
      "<p>In this section, we will introduce these characters to you. Please study their names carefully. <b>Repeat each name out loud after its name disappears</b>." +
      "<p>You will see these characters performing several actions throughout this study and will need to be able to correctly recall their names." +
      "<p>As you read their names out loud, your voice will be recorded. You will later asked their names. Moreover, you will frequently refer to these characters throughout the experiment. <p><b>High number of wrong answers can lead to exclusion from the experiment, thus no compensation.</b> <p> Press 'Continue' to proceed to the familiarization section."
  ),
  newCanvas("inst-3-page-1", 1500, 550)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 130, getText("inst-3-body-1"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

// SUBJECT FAMILIARIZATION
Template("familiarisation_stimuli_subj.csv", (row) =>
  newTrial(
    "habit-subj-hear",
    (recording_name = s + "_fam_" + row.subject),
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    // SHOW SUBJECT AND IMAGE
    newText("subject", row.subject + "<br>")
      .center()
      .print(),
    newImage("subject_img", row.subject_img).size(300, 400).center().print(),
    newText("linebreak1", "<p>").print(),
    newTimer("fam_pause1", 2500).start().wait(), // WAIT 2500 ms
    getText("subject").hidden(), // DELETE SUBJECT
    newAudio("click-subj", "click.wav").play(),
    newTimer("habit-record-timer", habit_record_timer).start(), // START RECORDING TIMER
    newMediaRecorder(recording_name, "audio").record().log(), // START RECORDING
    newButton("Next"),
    newTimer("habit-record-atleast", 1000).start().wait(), // START RECORDING TIMER
    getButton("Next")
      .bold()
      .css(button_css)
      .print()
      .callback(getTimer("habit-record-timer").stop()),
    getTimer("habit-record-timer").wait(),
    getMediaRecorder(recording_name).stop().log()
  )
);

newTrial(
  "pre-habit-subj-recall",
  defaultText.css(text_css),
  newText(
    "inst-3b-body-1",
    "Now, let's test how well you remember these characters. You will be asked to type the names of the characters. <p><b>High number of wrong answers can lead to exclusion from the experiment, thus no compensation.</b> <p> Press 'Continue' to proceed to the familiarization section."
  ),
  newCanvas("inst-3b-page-1", 1500, 300)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 130, getText("inst-3b-body-1"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

// SUBJECT FAMILIARIZATION
Template("familiarisation_stimuli_subj.csv", (row) =>
  newTrial(
    "habit-subj-recall",
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),
    newImage("subject_img", row.subject_img).size(200, 267).center().print(),
    newText("linebreak1", "<p>").print(),
    newTimer("habit-answer-timer", habit_answer_timer).start(),
    newTextInput("answer")
      .log("validate")
      .lines(1)
      .css(underline_blank)
      .center()
      .print(),
    newText("linebreak2", "<p>").print(),
    newButton("Next"),
    getButton("Next")
      .bold()
      .css(button_css)
      .print()
      .callback(getTimer("habit-answer-timer").stop()),
    getTimer("habit-answer-timer").wait(),
    clear(),
    getTextInput("answer")
      .test.text(new RegExp(row.subject, "i"))
      .success(
        newText(
          "successP",
          "The answer was '" +
            row.subject +
            "'.<br>It seems like you got it correct!"
        )
          .settings.bold()
          .settings.color("green")
          .settings.center()
          .print("center at 50vw", "middle at 40vh"),
        newTimer("habit-suc-3s", habit_answer_timer).start(),
        getButton("Next")
          .bold()
          .css(button_css)
          .print("center at 50vw", "middle at 52vh")
          .callback(getTimer("habit-suc-3s").stop()),
        getTimer("habit-suc-3s").wait(),
        getText("successP").remove()
      )
      .failure(
        newText(
          "failP",
          "The answer was '" +
            row.subject +
            "'.<br>It seems like you did not get it correct," +
            "<br>please pay more attention!"
        )
          .settings.bold()
          .settings.color("red")
          .settings.center()
          .print("center at 50vw", "middle at 40vh"),
        newTimer("habit-fail-3s", ProceedTimeOut).start(),
        getButton("Next")
          .bold()
          .css(button_css)
          .print("center at 50vw", "middle at 52vh")
          .callback(getTimer("habit-fail-3s").stop()),
        getTimer("habit-fail-3s").wait(),
        getText("failP").remove()
      )
  )
);
// BEFORE FAMILIARIZATION VERB
newTrial(
  "pre-habit-verb",
  defaultText.css(text_css),
  newText(
    "inst-5-body-1",
    "While you recall the characters you just learned, we will ask you to recall some actions too. You will now see some pictures depicting those actions." +
      "<p> These pictures, first, will have the name of the action as well. After a brief pause, the name will disappear. <b>When the name disappears, name each action out loud.</b>." +
      "<p>As you recall actions out loud, your voice will be recorded. Later, you will be asked to type the name of the actions. You will refer to these actions throughout the experiment. <b>High number of wrong answers can lead to exclusion from the experiment, thus no compensation.</b> <p> Press 'Continue' to proceed to the familiarization section."
  ),
  newCanvas("inst-5-page-1", 1500, 550)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 180, getText("inst-5-body-1"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

// VERB FAMILIARIZATION

Template("familiarisation_stimuli_verb.csv", (row) =>
  newTrial(
    "habit-verb-hear",
    (recording_name = s + "_fam_" + row.action),
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    // SHOW SUBJECT AND IMAGE
    newText("subject", row.action + "</b><br>")
      .center()
      .print(),
    newImage("subject_img", row.action_img).center().print(),
    newText("linebreak1", "<p>").print(),
    newTimer("fam_pause1", 2500).start().wait(), // WAIT 2500 ms
    getText("subject").hidden(), // DELETE SUBJECT
    newAudio("click-action", "click.wav").play(),
    newTimer("habit-record-timer", habit_record_timer).start(), // START RECORDING TIMER
    newMediaRecorder(recording_name, "audio").record().log(), // START RECORDING
    newButton("Next"),
    newTimer("habit-record-atleast", 1000).start().wait(), // START RECORDING TIMER
    getButton("Next")
      .bold()
      .css(button_css)
      .print()
      .callback(getTimer("habit-record-timer").stop()),
    getTimer("habit-record-timer").wait(),
    getMediaRecorder(recording_name).stop().log()
  )
);

newTrial(
  "pre-habit-verb-recall",
  defaultText.css(text_css),
  newText(
    "inst-5b-body-1",
    "Now, let's test how well you remember these actions. You will be asked to type the names of the actions. <p><b>High number of wrong answers can lead to exclusion from the experiment, thus no compensation.</b> <p> Press 'Continue' to proceed to the familiarization section."
  ),
  newCanvas("inst-5b-page-1", 1500, 280)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 130, getText("inst-5b-body-1"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

Template("familiarisation_stimuli_verb.csv", (row) =>
  newTrial(
    "habit-verb-recall",
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),
    newImage("subject_img", row.action_img).size(200, 200).center().print(),
    newText("linebreak1", "<p>").print(),
    newTimer("habit-answer-timer", habit_answer_timer).start(),
    newTextInput("answer")
      .log("validate")
      .lines(1)
      .css(underline_blank)
      .center()
      .print(),
    newText("linebreak2", "<p>").print(),
    newButton("Next"),
    getButton("Next")
      .bold()
      .css(button_css)
      .print()
      .callback(getTimer("habit-answer-timer").stop()),
    getTimer("habit-answer-timer").wait(),
    clear(),
    getTextInput("answer")
      .test.text(new RegExp(row.action, "i"))
      .success(
        newText(
          "successP",
          "The action was '" +
            row.action +
            "'.<br>It seems like you got it correct!"
        )
          .settings.bold()
          .settings.color("green")
          .settings.center()
          .print("center at 50vw", "middle at 35vh"),
        newTimer("habit-suc-3s", habit_answer_timer).start(),
        getButton("Next")
          .bold()
          .css(button_css)
          .print("center at 50vw", "middle at 55vh")
          .callback(getTimer("habit-suc-3s").stop()),
        getTimer("habit-suc-3s").wait(),
        getText("successP").remove()
      )
      .failure(
        newText(
          "failP",
          "The action was '" +
            row.action +
            "'.<br>It seems like you did not get it correct," +
            "<br>please pay more attention!"
        )
          .settings.bold()
          .settings.color("red")
          .settings.center()
          .print("center at 50vw", "middle at 35vh"),
        newTimer("habit-fail-3s", ProceedTimeOut).start(),
        getButton("Next")
          .bold()
          .css(button_css)
          .print("center at 50vw", "middle at 55vh")
          .callback(getTimer("habit-fail-3s").stop()),
        getTimer("habit-fail-3s").wait(),
        getText("failP").remove()
      )
  )
);

// FILTER THE DF using mylistcond
// select randomly from NON mylistcond
// trial function is going to be used
// WRITE PRACTICE INTRO TEXTS

// PRAC INTRO
newTrial(
  "prac-intro",
  defaultText.css(text_css),
  newText(
    "prac-body1",
    "Now that you learned all the actions and characters, let's do some practice recalling them while forming sentences! First, here's what is going to happen step-by-step. " +
      "<p>First, you will see a cross '+' in the middle of the screen. " +
      "After the cross, the characters will appear on the screen. " +
      "A second later, a character performing an action and will be marked with a thick square briefly."
  ),
  newText(
    "prac-body3",
    "<p><b>The moment an action is performed and it is marked</b>, you will hear a click sound. When you hear the click sound, you should immediately start recalling characters and <b>use it in the sentence in a format we communicated to you</b>: 'The doctor to the left of the wizard is running.'"
  ),
  newCanvas("prac-page", 1500, 560)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("prac-body1"))
    .add(0, 310, newImage("inst.gif").size("90%", "auto").center())
    .add(0, 430, getText("prac-body3"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

newTrial(
  "prac-intro2",
  defaultText.css(text_css),
  newText(
    "prac2-body1",
    "<p>There will be multiple characters on the screen. It is <b>very important</b> that you distinguish between which character is doing the action by stating the other character they’re positioned near with words like <b>TO THE LEFT OF THE</b> or <b>TO THE LEFT OF THE</b>." +
      "<p>The descriptions should be in the form of: <br>'<b>The doctor to the left of the wizard is running,</b>' <p><b>❌Not</b> in the form of: <i> 'The doctor is running to the left of the wizard.</i>'"
  ),
  newCanvas("prac-page2", 1500, 540)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("prac2-body1"))
    .add(0, 370, newImage("inst.gif").size("90%", "auto").center())
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

newTrial(
  "prac-intro3",
  defaultText.css(text_css),
  newText(
    "prac2-body3",
    "<p>You are expected to provide a description as fast as possible. <b>You will have 4 seconds</b> after the scene is marked. " +
      "During the practice session, the correct description will be shown to you when the time is up." +
      "<p>Press 'Continue' when you are ready for the practice session."
  ),
  newCanvas("prac-page3", 1500, 300)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("prac2-body3"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

var prac_trial = (label) => (row) => {
  return newTrial(
    label,
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),
    showRec(),
    trialN(),
    newCross(),
    (filename = row.main),
    (trialname = s + "_" + row.type + "_" + row.id),
    get_target_cohort(filename, row.head, row.head_num),
    (full_distractors = [row.dist1, row.dist2]),
    get_distractor(full_distractors),

    // SEMANTIC INTERFERENCE TASK

    /// SQUARE
    newTimer("explore", explore),
    newCanvas("square", "15vw", "25vh")
      .css({ border: "solid 5px black", "border-radius": "1em" })
      .hidden(),
    newCanvas("bsquare1", "30vw", "28vh")
      .css({ border: "solid 1px black", "border-radius": "1em" })
      .hidden(),
    newCanvas("bsquare2", "30vw", "28vh")
      .css({ border: "solid 1px black", "border-radius": "1em" })
      .hidden(),

    newTimer("square", square),
    newTimer("nosquare", nosquare),

    // CLICK SOUND
    newAudio("click", "click.wav"),
    // RECORDING BASE
    newMediaRecorder(trialname, "audio"),

    newVar("target_loc", ""),
    newVar("cohort_loc", ""),

    getVar("target_Vert")
      .test.is(0)
      .success(
        getVar("target_LR")
          .test.is("L")
          .success(
            (pos = "to the right of"),
            getCanvas("TargetCanvas-bare").print(
              "center at 42.5%",
              "middle at 35%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 42.5%", "middle at 35%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 57.5%", "middle at 35%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 35%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              )
              .failure(
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 42.5%", "middle at 35%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
          .failure(
            (pos = "to the left of"),
            getCanvas("TargetCanvas-bare").print(
              "center at 57.5%",
              "middle at 35%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 57.5%", "middle at 35%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 42.5%", "middle at 35%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 35%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                // T-AboveRight C-BelowLeft
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              )
              .failure(
                // T-AboveRight C-BelowRight
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 57.5%", "middle at 35%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
      )
      .failure(
        getVar("target_LR")
          .test.is("L")
          .success(
            (pos = "to the right of"),
            getCanvas("TargetCanvas-bare").print(
              "center at 42.5%",
              "middle at 65%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 42.5%", "middle at 65%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 57.5%", "middle at 65%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 65%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              )
              .failure(
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 42.5%", "middle at 65%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
          .failure(
            (pos = "to the left of"),
            getCanvas("TargetCanvas-bare").print(
              "center at 57.5%",
              "middle at 65%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 57.5%", "middle at 65%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 42.5%", "middle at 65%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 65%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                // T-AboveRight C-BelowLeft
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              )
              .failure(
                // T-AboveRight C-BelowRight
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 57.5%", "middle at 65%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
      ),

    clear(),
    hideRec(),
    newTimer(next_trial).start().wait(),
    getMediaRecorder(trialname).stop(),
    newText(
      "dist_asked_dist1",
      "The target sentence was<br>'" +
        row.text1left +
        pos +
        row.text1right +
        ".'"
    )
      .settings.bold()
      .settings.center(),
    newText(
      "dist_asked_dist2",
      "The target sentence was<br>'" +
        row.text2left +
        pos +
        row.text2right +
        ".'"
    )
      .settings.bold()
      .settings.center(),
    getVar("target_loc")
      .test.is("TL")
      .success(
        newVar("dist_asked_left", row.dist1 == Distractors[0])
          .test.is(true)
          .success(
            getText("dist_asked_dist1").print(
              "center at 50vw",
              "middle at 40vh"
            ),
            newTimer("habit-suc-3s-1left", habit_answer_timer).start().wait()
          )
          .failure(
            getText("dist_asked_dist2").print(
              "center at 50vw",
              "middle at 40vh"
            ),
            newTimer("habit-suc-3s-2left", habit_answer_timer).start().wait()
          )
      )
      .failure(
        getVar("target_loc")
          .test.is("BL")
          .success(
            newVar("dist_asked_bleft", row.dist1 == Distractors[0])
              .test.is(true)
              .success(
                getText("dist_asked_dist1").print(
                  "center at 50vw",
                  "middle at 40vh"
                ),
                newTimer("habit-suc-3s-1bleft", habit_answer_timer)
                  .start()
                  .wait()
              )
              .failure(
                getText("dist_asked_dist2").print(
                  "center at 50vw",
                  "middle at 40vh"
                ),
                newTimer("habit-suc-3s-2bleft", habit_answer_timer)
                  .start()
                  .wait()
              )
          )
          .failure(
            newVar("dist_asked_right", row.dist1 == Distractors[1])
              .test.is(true)
              .success(
                getText("dist_asked_dist1").print(
                  "center at 50vw",
                  "middle at 40vh"
                ),
                newTimer("habit-suc-3s-1-right", habit_answer_timer)
                  .start()
                  .wait()
              )
              .failure(
                getText("dist_asked_dist2").print(
                  "center at 50vw",
                  "middle at 40vh"
                ),
                newTimer("habit-suc-3s-2right", habit_answer_timer)
                  .start()
                  .wait()
              )
          )
      ),
    getVar("head").set(trialname),
    getVar("head_number").set(trialname),
    getVar("verb_type").set(trialname),
    getVar("distractor0").set(trialname),
    getVar("distractor1").set(trialname),
    getVar("distractor_number").set(trialname),
    getVar("itemnum").set(row.id),
    getVar("trialNum").set(getVar("TrialN")),
    getVar("target_location").set(getVar("target_loc")),
    getVar("cohort_location").set(getVar("cohort_loc")),
    getVar("distractor_location").set(getVar("dist_LR"))
  ).setOption("hideProgressBar", true);
};


Template(
  GetTable(fname_practice).filter("type", /practice/),
  prac_trial("practice")
);

Template(
  GetTable(fname_practice).filter("type", /intro/),
  prac_trial("inst_trial")
);
// !: Check filenames for distractors and habituations

var trial = (label) => (row) => {
  return newTrial(
    label,
    showRec(),
    trialN(),
    newCross(),
    (filename_base = row.verb + "_" + row.head + "_" + row.head_num),
    (filename = filename_base + ".png"),
    (trialname =
      s + "_" + filename_base + "_" + row.dist_num + "_" + row.verb_type),
    get_target_cohort(filename, row.head, row.head_num),
    (full_distractors = [
      row.dist1,
      row.dist2,
      row.dist3,
      row.dist4,
      row.dist5,
    ]),
    get_distractor(full_distractors),

    // SEMANTIC INTERFERENCE TASK

    // SQUARE
    newTimer("explore", explore),
    newCanvas("square", "15vw", "25vh")
      .css({ border: "solid 5px black", "border-radius": "1em" })
      .hidden(),
    newCanvas("bsquare1", "30vw", "28vh")
      .css({ border: "solid 1px black", "border-radius": "1em" })
      .hidden(),
    newCanvas("bsquare2", "30vw", "28vh")
      .css({ border: "solid 1px black", "border-radius": "1em" })
      .hidden(),
    newTimer("square", square),
    newTimer("nosquare", nosquare),

    // CLICK SOUND
    newAudio("click", "click.wav"),
    // RECORDING BASE
    newMediaRecorder(trialname, "audio"),

    newVar("target_loc", ""),
    newVar("cohort_loc", ""),

    getVar("target_Vert")
      .test.is(0)
      .success(
        getVar("target_LR")
          .test.is("L")
          .success(
            getCanvas("TargetCanvas-bare").print(
              "center at 42.5%",
              "middle at 35%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 42.5%", "middle at 35%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 57.5%", "middle at 35%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 35%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              )
              .failure(
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 42.5%", "middle at 35%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
          .failure(
            getCanvas("TargetCanvas-bare").print(
              "center at 57.5%",
              "middle at 35%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 57.5%", "middle at 35%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 42.5%", "middle at 35%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 35%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                // T-AboveRight C-BelowLeft
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              )
              .failure(
                // T-AboveRight C-BelowRight
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 65%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 65%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 65%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 57.5%", "middle at 35%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
      )
      .failure(
        getVar("target_LR")
          .test.is("L")
          .success(
            getCanvas("TargetCanvas-bare").print(
              "center at 42.5%",
              "middle at 65%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 42.5%", "middle at 65%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 57.5%", "middle at 65%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 65%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              )
              .failure(
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 42.5%", "middle at 65%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
          .failure(
            getCanvas("TargetCanvas-bare").print(
              "center at 57.5%",
              "middle at 65%"
            ),
            getCanvas("TargetCanvas")
              .print("center at 57.5%", "middle at 65%")
              .hidden()
              .log(),
            getVar("target_loc").set("TL").log(),
            getCanvas("DistCanvas_A")
              .print("center at 42.5%", "middle at 65%")
              .log(), // BL
            getCanvas("bsquare1")
              .print("center at 50%", "middle at 65%")
              .visible(),

            getVar("cohort_LR")
              .test.is("L")
              .success(
                // T-AboveRight C-BelowLeft
                getCanvas("CohortCanvas")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              )
              .failure(
                // T-AboveRight C-BelowRight
                getCanvas("CohortCanvas")
                  .print("center at 57.5%", "middle at 35%")
                  .log(),
                getVar("cohort_loc").set("TR").log(),
                getCanvas("DistCanvas_B")
                  .print("center at 42.5%", "middle at 35%")
                  .log(),
                getCanvas("bsquare2")
                  .print("center at 50%", "middle at 35%")
                  .visible()
              ),

            getTimer("explore").start().wait(),
            getAudio("click").play(),
            getCanvas("square")
              .print("center at 57.5%", "middle at 65%")
              .visible(),
            getCanvas("TargetCanvas-bare").hidden(),
            getCanvas("TargetCanvas").visible(),
            getMediaRecorder(trialname).record(),
            getTimer("square").start().wait(),
            getCanvas("square").hidden(),
            getTimer("nosquare").start().wait()
          )
      ),

    clear(),
    hideRec(),
    newTimer(next_trial).start().wait(),
    getMediaRecorder(trialname).stop(),
    getVar("head").set(row.head),
    getVar("head_number").set(row.head_num),
    getVar("verb_type").set(row.verb_type),
    getVar("distractor0").set(Distractors[0]),
    getVar("distractor1").set(Distractors[1]),
    getVar("distractor_number").set(row.dist_num),
    getVar("itemnum").set(row.id),
    getVar("trialNum").set(getVar("TrialN")),
    getVar("target_location").set(getVar("target_loc")),
    getVar("cohort_location").set(getVar("cohort_loc")),
    getVar("distractor_location").set(getVar("dist_LR"))
  ).setOption("hideProgressBar", true);
};

Template(GetTable(fname).filter("head", /chef/), trial("trial_chef"));
Template(GetTable(fname).filter("head", /clown/), trial("trial_clown"));
Template(GetTable(fname).filter("head", /wizard/), trial("trial_wizard"));
Template(GetTable(fname).filter("head", /cowboy/), trial("trial_cowboy"));
Template(GetTable(fname).filter("head", /doctor/), trial("trial_doctor"));
Template(GetTable(fname).filter("head", /pirate/), trial("trial_pirate"));

// MAKE PIRATE SURF PL

newTrial(
  "exp-start",
  newText("exp-start-title", "Time to start the experiment!")
    .css({ "font-size": "36", "font-family": "sans-serif" })
    .bold(),
  newText(
    "exp-start-body",
    "<p>Before continuing, please double-check " +
      "that you are in a quiet environment with minimal or no background noise." +
      "<p>You can press any key to start the experiment."
  ).css({ "font-size": "22", "font-family": "sans-serif" }),
  newCanvas("start-page", 1500, 300)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 130, getText("exp-start-title"))
    .add(0, 160, getText("exp-start-body"))
    .cssContainer(page_css)
    .print(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait(),
  newTimer(300).start().wait(),
  // The text above
  newTimer(1000).start().wait()
);

newTrial(
  "break",
  defaultText.css(text_css),
  newText(
    "Let's take a short break! Press any key to continue when you are ready."
  ).print("center at 50vw", "middle at 40vh"),
  newKey("breakspace", "").wait()
);

newTrial(
  "beforeExit",
  newText(
    "<center><b>As a final step, please download your recordings!</b></center><br><br>"
  )
    .css(text_css)
    .print(),
  newText(
    "download",
    DownloadRecordingButton(
      "<font style='margin: 0 auto; font-size: 20px; font-family: sans-serif;'>Download your recordings</font>"
    )
  )
    .css(text_css)
    .center()
    .print()
    .wait(),
  newText("<p>").print(),
  newButton("CONTINUE").bold().css(button_css).print().wait()
);

var centered_justified_style = {
  "text-align": "justify",
  margin: "0 auto",
  "margin-bottom": "3em",
  width: "30em",
};

var feedback_style = {
  "text-align": "justify",
  margin: "0 auto",
  "margin-bottom": "1em",
  width: "30em",
};

newTrial(
  "feedback",
  newText(
    "That's it for the experiment! We have just a few " +
      "follow-up questions that will help us interpret " +
      "your responses."
  )
    .css(feedback_style)
    .print(),
  newText("Did you have enough time to describe the scenes?")
    .css(feedback_style)
    .print(),
  newTextInput("feedback_sentences")
    .cssContainer("text-align", "center")
    .css(centered_justified_style)
    .log()
    .lines(5)
    .print(),
  newText("Were you able to remember characters and the actions?")
    .css(feedback_style)
    .print(),
  newTextInput("feedback_hard_to_understand_sentences")
    .cssContainer("text-align", "center")
    .css(centered_justified_style)
    .log()
    .lines(5)
    .print(),
  newText(
    "Did you experience any difficulties (technical or otherwise) " +
      "in doing the experiment?"
  )
    .css(feedback_style)
    .print(),
  newTextInput("feedback_difficulties")
    .cssContainer("text-align", "center")
    .css(centered_justified_style)
    .log()
    .lines(5)
    .print(),
  newText("Do you have any more comments?").css(feedback_style).print(),
  newTextInput("feedback_more")
    .cssContainer("text-align", "center")
    .css(centered_justified_style)
    .log()
    .lines(5)
    .print(),
  newText("<p />").center().print(),
  newButton("Next", "Next").center().print().wait()
);

newTrial(
  "exit_prolific",
  newText(
    "exit-text",
    "<center><b>Thank you for participating in our study!</b></center><br><br>" +
      "The experiment code is     <b>" +
      prolific_code +
      "</b>     " +
      "Please paste this value into Prolific." +
      "<p>You can also confirm your participation on Prolific by clicking the link below: " +
      "<a href='" +
      prolific_link +
      "'>Confirm your participation.</a>" +
      "<p>When you are finished, you may close this tab."
  ).css(text_css),
  newCanvas("exit-page", 1500, 400)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("exit-text"))
    .cssContainer(page_css)
    .print(),
  newTimer("infinite", 1000).wait()
);

newTrial(
  "exit_sona_psych",
  newText(
    "exit-text",
    "<center><b>Thank you for participating in our study!</b></center><br><br>" +
      "<p>You can also confirm your participation on SONA by clicking the link below: " +
      "<a href='" +
      psych_sona_link +
      "'>Confirm your participation.</a>" +
      "<p>When you are finished, you may close this tab."
  ).css(text_css),
  newCanvas("exit-page", 1500, 250)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("exit-text"))
    .cssContainer(page_css)
    .print(),
  newTimer("infinite", 1000).wait()
);

// https://forms.gle/38QgPd9iFFF336oq6

newTrial(
  "exit_sona_ling",
  exitFullscreen(),
  newText(
    "exit-text-ling",
    "<center><b>Thank you for participating in our study!</b></center><br><br>" +
      "<p>You can confirm your participation on SONA by clicking the 'END' button below." +
      "<p>It will redirect you to a Google Form to explain you the experimental details and ask you some questions."
  ).css(text_css),
  newCanvas("exit-page-ling", 1500, 250)
    .add(100, 20, newImage("umd_ling.png").size("60%", "auto"))
    .add(0, 120, getText("exit-text-ling"))
    .cssContainer(page_css)
    .print(),
  newButton("   END   ").bold().css(button_css).print().wait(),
  getText("exit-text-ling").remove(),
  getCanvas("exit-page-ling").remove(),
  newHtml(
    "ling_debrief",
    "<!DOCTYPE html><meta http-equiv='refresh' content='0; url=" +
      debrief_link +
      "'>The experiment has ended and your answers are sent to the server.<br />If you want to get a credit for a class, <a href = '" +
      debrief_link +
      "'>click this link</a> and follow instructions."
  )
    .print()
    .wait()
);