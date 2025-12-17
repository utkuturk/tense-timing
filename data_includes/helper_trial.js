// Decision trial (C/M past vs future)
var trial = (blockLabel) => (row) => {
  const uniqueLabel = `exp_${blockLabel}_${row.verb}_${row.side}`;
  const verbImage   = newImage(row.verb, row.pic).size(150, 150);

  const options = Math.random() < 0.5
    ? ["Past", "Future"]
    : ["Future", "Past"];

  const leftLabel  = options[0];
  const rightLabel = options[1];

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    // picture
    verbImage.center().print(),

    // left/right labels
    newText("leftOpt",  leftLabel),
    newText("rightOpt", rightLabel),

    newCanvas("choices", 800, 150)
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
    .log("LeftOpt", leftLabel)
    .log("RightOpt", rightLabel)
    .log("DecisionRT", getVar("decision_RT"));
};

// Randomly enforce one of two P/F patterns per block:
// 1) PAST, FUTURE, FUTURE, PAST, PAST, FUTURE
// 2) FUTURE, PAST, PAST, FUTURE, FUTURE, PAST
function orderItemsByTensePattern(items) {
  const past   = items.filter(it => it.side === "PAST");
  const future = items.filter(it => it.side === "FUTURE");

  const patterns = [
    ["PAST",   "FUTURE", "FUTURE", "PAST",   "PAST",   "FUTURE"],
    ["FUTURE", "PAST",   "PAST",   "FUTURE", "FUTURE", "PAST"]
  ];

  // pick one pattern at random for this block
  const pattern = patterns[Math.floor(Math.random() * patterns.length)];

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

var recall_trial = (blockLabel) => (row) => {
  const uniqueLabel = `recall_${blockLabel}_${row.verb}_${row.side}`;
  const verbImage   = newImage(row.verb, row.pic).size(150, 150);

  return newTrial(
    uniqueLabel,
    defaultText.css({ "font-size": "2em", "font-family": "sans-serif" }),

    verbImage.center().print(),

    newText("prompt", "Type the original verb (base form), without tense:")
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
      .print()
      .wait(),

    getTextInput("answer")
      .test.text(new RegExp(`^\\s*${row.verb}\\s*$`, "i"))
      .success(
        newText("feedback-ok",
          "Correct! The verb was '" + row.verb + "'."
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
          "The verb was '" + row.verb + "'. Please try to remember them carefully next time."
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
    newText("title", "Practice time")
      .css({ "font-size": "2.5em", "font-weight": "bold" })
      .center()
      .print(),

    newText("body",
      "Before the experimental trials, we will practice to see if you learned the verbs."
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue")
      .center()
      .print()
      .wait()
  )
    .setOption("hideProgressBar", true);

var recallOutroTrial = (blockName) =>
  newTrial(
    `recall_outro_${blockName}`,
    newText("title", "Practice finished")
      .css({ "font-size": "2.5em", "font-weight": "bold" })
      .center()
      .print(),

    newText("body",
      "We practiced enough. Now we will start the experimental trials."
    )
      .css({ "font-size": "1.6em", "margin-top": "20px" })
      .center()
      .print(),

    newButton("Continue")
      .center()
      .print()
      .wait()
  )
    .setOption("hideProgressBar", true);
