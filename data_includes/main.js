PennController.ResetPrefix(null);
DebugOff();
SetCounter("setcounter");

const SONA_LINK_BASE = "<LINK>";
var sona_link = SONA_LINK_BASE + GetURLParameter("id");

const BREAK_EVERY = 20;
const ANSWER_WINDOW_MS = 15000;

function SepWithN(sep, main, n) {
  this.args = [sep, main];
  this.run = function (arrays) {
    assert(arrays.length === 2, "Wrong number of arguments to SepWithN");
    assert(parseInt(n) > 0, "N must be a positive number");
    const sepArray = arrays[0];
    const mainArray = arrays[1];
    if (mainArray.length <= 1) return mainArray;

    const out = [];
    while (mainArray.length) {
      for (let i = 0; i < n && mainArray.length > 0; i++) out.push(mainArray.pop());
      for (let j = 0; j < sepArray.length && mainArray.length > 0; j++) out.push(sepArray[j]);
    }
    return out;
  };
}

function sepWithN(sep, main, n) {
  return new SepWithN(sep, main, n);
}

Sequence(
  "setcounter",
  "intro",
  "consent",
  "demo",
  "instruction",
  "practice_intro",
  "practice_1",
  "practice_2",
  "exp_start",
  sepWithN("break", randomize("experiment"), BREAK_EVERY),
  "sendresults",
  "debrief",
  "exit_sona"
);

Header(
  newVar("TrialN", 0).global(),
  newVar("RT_answer", 0).global()
)
  .log("SONA_ID_URL", GetURLParameter("id"))
  .log("trialN_header", getVar("TrialN"))
  .log("RT_answer_header", getVar("RT_answer"));

const bodyCss = {"font-size": "1.1em", "line-height": "1.45", margin: "0 auto", width: "900px"};
const pageCss = {padding: "1.2em", border: "1px solid #d0d7de", "border-radius": "12px", "box-shadow": "0 2px 8px rgba(0,0,0,0.08)"};
const buttonCss = {"background-color": "#1f6feb", color: "white", "font-size": "1.1em", padding: "0.55em 1.1em", border: "none", "border-radius": "8px"};

const ratingBlock = (picture, sentence) => [
  getVar("TrialN").set((v) => v + 1),
  newImage("stim", picture).size(420, 420).center().print(),
  newText("sentence", sentence).center().css("font-size", "1.25em").css("margin-top", "18px").print(),
  newText("question", "How natural is this sentence for the picture? (1-7)")
    .center()
    .css("margin-top", "12px")
    .print(),
  getVar("RT_answer").set((v) => Date.now()),
  newTimer("answer_timer", ANSWER_WINDOW_MS).start(),
  newScale("rating", "1", "2", "3", "4", "5", "6", "7")
    .before(newText("left", "Does not fit"))
    .after(newText("right", "Fits very well"))
    .labelsPosition("bottom")
    .keys("1", "2", "3", "4", "5", "6", "7")
    .center()
    .callback(getTimer("answer_timer").stop())
    .log()
    .print(),
  getTimer("answer_timer").wait(),
  getVar("RT_answer").set((v) => Date.now() - v),
  getScale("rating").remove(),
  getText("question").remove(),
  getText("sentence").remove(),
  getImage("stim").remove()
];

newTrial(
  "intro",
  newText(
    "intro_text",
    "<center><b>Welcome</b></center>" +
      "<p>In this study, you will see a picture and rate how well a sentence matches it.</p>" +
      "<p>Please complete the task on a computer in a quiet place.</p>" +
      "<p>Next, you will complete demographics, instructions, practice, and the main experiment.</p>"
  ).css(bodyCss),
  newCanvas("intro_page", 980, 340)
    .add(20, 20, getText("intro_text"))
    .cssContainer(pageCss)
    .print(),
  newButton("intro_continue", "CONTINUE").css(buttonCss).center().print().wait()
).setOption("hideProgressBar", true);

newTrial(
  "consent",
  newText(
    "consent-text",
    "<center><b>Consent Form</b></center>" +
      "<p>Please click <a target='_blank' rel='noopener noreferrer' href='https://utkuturk.com/files/web_consent.pdf'> here</a> to download the consent form for this study. If you read it and agree to participate in this study, click 'I Agree' below. If you do not agree to participate in this study, you can leave this study by closing the tab. You can leave the experiment at any time by closing the tab during the experiment. If you leave the experiment before completion of both parts, you will not be compensated for your time. If you encounter any problems, do not hesitate to reach either of us  via " +
      "SONA or e-mail." +
      // "email. " +
      "<br><br><b> Researchers:</b> <br>Utku Turk, PhD Student <i> (utkuturk@umd.edu)</i>,<br>Prof. Shota Momma<br>University of Massachusetts, Amherst, Department of Linguistics"
  ).css(bodyCss),
  newScale("consent_choice", "I agree to participate")
    .radio()
    .labelsPosition("right")
    .center()
    .print(),
  newButton("consent_continue", "I AGREE")
    .css(buttonCss)
    .center()
    .print()
    .wait(
      getScale("consent_choice")
        .test.selected("I agree to participate")
        .failure(newText("consent_error", "Please confirm consent to continue.").color("red").center().print())
    )
).setOption("hideProgressBar", true);

newTrial(
  "demo",
  newText("demo_title", "Demographics").css("font-size", "1.35em").center().print(),
//   newTextInput("pid").before(newText("pid_label", "SONA Participant ID*: ")).size("18em", "1.4em").log().print(),
  newTextInput("age").before(newText("age_label", "Age*: ")).size("18em", "1.4em").log().print(),
  newTextInput("gender").before(newText("gender_label", "Gender*: ")).size("18em", "1.4em").log().print(),
  newTextInput("location").before(newText("loc_label", "Location (state/country)*: ")).size("18em", "1.4em").log().print(),
  newTextInput("native_language").before(newText("lang_label", "Native language*: ")).size("18em", "1.4em").log().print(),
  newButton("demo_continue", "CONTINUE")
    .css(buttonCss)
    .center()
    .print()
    .wait(
      getTextInput("age")
        .test.text(/^\d+$/)
        .and(getTextInput("gender").testNot.text(""))
        .and(getTextInput("location").testNot.text(""))
        .and(getTextInput("native_language").testNot.text(""))
        .failure(
          newText("demo_error", "Please fill all required fields. Age must be numeric.")
            .color("red")
            .center()
            .print()
        )
    )
).setOption("hideProgressBar", true);

newTrial(
  "instruction",
  newText(
    "instruction_text",
    "<center><b>Instructions</b></center>" +
      "<p>Each trial shows a picture and a sentence.</p>" +
      "<p>You have up to <b>15 seconds</b> to give your rating on a <b>1-7</b> scale.</p>" +
      "<p>Use number keys 1-7 or click on the scale.</p>" +
      "<p>There are no right or wrong answers. Use your natural judgment.</p>" +
      "<p>Some sentences will refer to similar events in different tenses (for example, past vs. future). Please judge how well the specific sentence fits the picture you just saw.</p>"
  ).css(bodyCss),
  newCanvas("instruction_page", 980, 360)
    .add(20, 20, getText("instruction_text"))
    .cssContainer(pageCss)
    .print(),
  newButton("instruction_continue", "See practice items")
    .css(buttonCss)
    .center()
    .print()
    .wait()
).setOption("hideProgressBar", true);

newTrial(
  "practice_intro",
  newText(
    "practice_intro_text",
    "You will now complete two practice trials."
  ).css(bodyCss).center().print(),
  newButton("practice_intro_continue", "START PRACTICE").css(buttonCss).center().print().wait()
).setOption("hideProgressBar", true);

newTrial(
  "practice_1",
  ...ratingBlock("wizard_eat_apple.png", "The Wizard ate an apple.")
)
  .log("trialN", getVar("TrialN"))
  .log("RT-answer", getVar("RT_answer"))
  .setOption("hideProgressBar", true);

newTrial(
  "practice_2",
  ...ratingBlock("wizard_eat_apple.png", "The Wizard will build a tower.")
)
  .log("trialN", getVar("TrialN"))
  .log("RT-answer", getVar("RT_answer"))
  .setOption("hideProgressBar", true);

newTrial(
  "exp_start",
  newText(
    "exp_start_text",
    "<center><b>Main experiment starts now</b></center>" +
      "<p>Please keep your attention on the screen and respond on every trial.</p>" +
      "<p>You will get short breaks during the task.</p>"
  ).css(bodyCss),
  newCanvas("exp_start_page", 980, 280)
    .add(20, 20, getText("exp_start_text"))
    .cssContainer(pageCss)
    .print(),
  newButton("exp_start_continue", "CONTINUE")
    .css(buttonCss)
    .center()
    .print()
    .wait()
).setOption("hideProgressBar", true);

newTrial(
  "break",
  newText("break_text", "Short break. Press space to continue.").center().css("font-size", "1.3em").print(),
  newKey(" ").wait()
);

Template(GetTable("items.csv").setGroupColumn("group"), row =>
  newTrial(
    "experiment",
    ...ratingBlock(row.picture, row.sentence)
  )
    .log("trialN", getVar("TrialN"))
    .log("RT-answer", getVar("RT_answer"))
    .log("item_id", row.item_id)
    .log("group", row.group)
    .log("character", row.character)
    .log("verb", row.verb)
    .log("past_form", row.past_form)
    .log("type", row.type)
    .log("picture", row.picture)
    .log("tense", row.tense)
    .log("sentence", row.sentence)
);

SendResults("sendresults");

newTrial(
  "debrief",
  newText(
    "debrief_text",
    "<center><b>Debrief</b></center>" +
      "<p>This study examines how people plan tense information during real-time language production.</p>" +
      "<p>We are testing when tense is planned at different levels of representation:</p>" +
      "<p>1) <b>Conceptual planning</b> (event-time meaning),</p>" +
      "<p>2) <b>Syntactic planning</b> (grammatical tense features), and</p>" +
      "<p>3) <b>Morphophonological planning</b> (the form used to express tense).</p>" +
      "<p>In these experiments we are going to use certain images that you have seen here. Your responses help us create a baseline for understanding how good of a fit these images are for the sentences.</p>" +
      "<p>Thank you for helping with this research.</p>"
  ).css(bodyCss).print(),
  newText("d_q1", "Did you experience any technical issues during the study?").print(),
  newScale("tech_issues", "No", "Yes")
    .radio()
    .labelsPosition("right")
    .log()
    .print(),
  newText("d_q2", "How clear were the instructions overall?").css("margin-top", "12px").print(),
  newScale("instruction_clarity", "1", "2", "3", "4", "5")
    .labelsPosition("bottom")
    .keys("1", "2", "3", "4", "5")
    .log()
    .print(),
  newText("feedback_label", "Optional feedback: anything confusing, unclear, or notable?").css("margin-top", "12px").print(),
  newTextInput("feedback")
    .lines(4)
    .size("900px", "120px")
    .log()
    .print(),
  newButton("debrief_continue", "Continue")
    .css(buttonCss)
    .center()
    .print()
    .wait()
).setOption("hideProgressBar", true);

newTrial(
  "exit_sona",
  newText(
    "exit_text",
    "<center><b>Thank you for participating!</b></center>" +
      "<p>You can confirm your participation on SONA by clicking the link below:</p>" +
      "<p><a href='" + sona_link + "'>Confirm your participation.</a></p>" +
      "<p>When you are finished, you may close this tab.</p>"
  ).css(bodyCss),
  newCanvas("exit_page", 980, 220)
    .add(20, 20, getText("exit_text"))
    .cssContainer(pageCss)
    .print(),
  newButton().wait()
).setOption("hideProgressBar", true);
