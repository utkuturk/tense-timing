// Minimal PCIbex: tense switch × regularity (TEXT-only stimuli) with two sub-canvases

PennController.ResetPrefix(null);
DebugOff();

// ---------- ORDER ----------
const pairs = [
  ["intro-SwitchRegular", "SwitchRegular"],
  ["intro-SwitchIrregular", "SwitchIrregular"],
  ["intro-NoSwitchRegular", "NoSwitchRegular"],
  ["intro-NoSwitchIrregular", "NoSwitchIrregular"],
];
const order = [0, 1, 2, 3].sort(() => Math.random() - 0.5);
const seqPairs = order.flatMap((i) => [pairs[i][0], randomize(pairs[i][1])]);

Sequence("consent", "instructions", randomize("practice"), ...seqPairs, "end");

// ---------- CONSENT / INSTRUCTIONS ----------
newTrial(
  "consent",
  newText("consent-t", "By continuing you consent to participate.").print(),
  newButton("consent-go", "Continue").print().wait()
);

newTrial(
  "instructions",
  newText(
    "inst1",
    "Rule: if under PAST → use past; if under NOW → use present."
  ).print(),
  newText(
    "inst2",
    "Speak one short sentence. Press SPACE after speaking."
  ).print(),
  newButton("inst-go", "Start").print().wait()
);

// ---------- BLOCK INTROS ----------
const intro = (name, txt) =>
  newTrial(name, newText(txt).print(), newButton("Begin").print().wait());

intro("intro-SwitchRegular", "Block: SWITCH + REGULAR");
intro("intro-SwitchIrregular", "Block: SWITCH + IRREGULAR");
intro("intro-NoSwitchRegular", "Block: NO-SWITCH + REGULAR (past only)");
intro("intro-NoSwitchIrregular", "Block: NO-SWITCH + IRREGULAR (past only)");

// ---------- TRIALS FROM CSV ----------
Template("trials.csv", (row) => basicTrial(row));

// ---------- TRIAL FACTORY ----------
function basicTrial(row) {
  const isPast = String(row.tense).toUpperCase() === "PAST";

  // stage position on screen (four anchors)
  const anchors = [
    { left: "5%", top: "8%" },
    { left: "60%", top: "8%" },
    { left: "5%", top: "55%" },
    { left: "60%", top: "55%" },
  ];
  const pick = anchors[Math.floor(Math.random() * anchors.length)];

  // layout numbers
  const stageW = 760,
    stageH = 260;
  const paneW = 320,
    paneH = 140;
  const gap = 40;
  const leftX = Math.round((stageW - (2 * paneW + gap)) / 2);
  const topY = Math.round((stageH - paneH) / 2);
  const rightX = leftX + paneW + gap;

  // stimulus
  const stim = newText("stim", String(row.stim_text))
    .css("font-size", "20px")
    .css("padding", "8px");

  return newTrial(
    String(row.label),

    // fixation
    newText("fix", "+").css("font-size", "28px").print(),
    newTimer("fixTimer", 400).start().wait(),
    getText("fix").remove(),

    // parent stage (no border now)
    newCanvas("stage", stageW, stageH)
      .css("position", "absolute")
      .css("left", pick.left)
      .css("top", pick.top),

    // LEFT header + pane (PAST) — pane just a transparent space
    newText("hdrPast", "PAST ———————————————").bold(),
    newCanvas("panePast", paneW, paneH),

    // RIGHT header + pane (NOW)
    newText("hdrNow", "NOW ————————————————").bold(),
    newCanvas("paneNow", paneW, paneH),

    // Add everything into the stage
    getCanvas("stage")
      .add(leftX, topY - 26, getText("hdrPast"))
      .add(leftX, topY, getCanvas("panePast"))
      .add(rightX, topY - 26, getText("hdrNow"))
      .add(rightX, topY, getCanvas("paneNow"))
      .print(),

    // place stimulus centered in the chosen pane
    isPast
      ? stim.center().print(getCanvas("panePast"), paneW / 2, paneH / 2)
      : stim.center().print(getCanvas("paneNow"), paneW / 2, paneH / 2),
    // prompt
    newText("prompt", "Speak now. Press SPACE to continue.")
      .css("margin-top", "8px")
      .print(),

    // RT via timestamps
    newVar("t0")
      .global()
      .set((v) => Date.now()),
    newKey("advance", " ").wait(),
    newVar("RT")
      .global()
      .set((v) => Date.now())
      .set((v) => v - getVar("t0").value),

    newTimer("isi", 200).start().wait()
  )
    .log("id", row.item)
    .log("block", row.block)
    .log("switch", row.switch)
    .log("regularity", row.regularity)
    .log("tense", row.tense)
    .log("subject", row.subject)
    .log("verb_base", row.verb_base)
    .log("verb_past", row.verb_past)
    .log("stim_text", row.stim_text)
    .log("RTms", getVar("RT"));
}

// ---------- END ----------
newTrial(
  "end",
  newText("Thanks for participating.").print(),
  newButton("Finish").print().wait()
);
