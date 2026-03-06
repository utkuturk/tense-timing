var MIN_VERB_STUDY_MS = 1200;
var MIN_TENSE_STUDY_MS = 1400;
var __speechCounter = 0;
var ENTITY_DISPLAY_ORDER = ["Pirate", "Wizard", "Chef"];

function uniqueByVerb(items) {
  const seen = {};
  const out = [];
  items.forEach(item => {
    if (!seen[item.verb]) {
      seen[item.verb] = true;
      out.push(item);
    }
  });
  return out;
}

function sortByEntityThenVerb(items) {
  return items.slice().sort((a, b) => {
    if (a.entity === b.entity) return a.verb.localeCompare(b.verb);
    return a.entity.localeCompare(b.entity);
  });
}

function audioFileForVerb(item) {
  return `tts_verb_${item.verb}.mp3`;
}

function audioFileForSentence(item) {
  const entity = String(item.entity || "").toLowerCase();
  const tense = String(item.side || "").toLowerCase();
  return `tts_sent_${entity}_${item.verb}_${tense}.mp3`;
}

function playPreGeneratedAudio(fileName) {
  const id = `audio_${__speechCounter++}`;
  return [
    newAudio(id, fileName),
    getAudio(id).play()
  ];
}

function withObject(verb, objectPhrase) {
  return objectPhrase && objectPhrase.length ? `${verb} ${objectPhrase}` : verb;
}

var introTrial = (blockName, items) => {
  const verbItems = sortByEntityThenVerb(uniqueByVerb(items));
  const commands = [
    defaultText.css({ "font-size": "1.25em", "font-family": "sans-serif" }),
    newText("intro_title", "Learn the verbs")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "intro_body",
      "You will now see the verbs one by one.<br>" +
      "Listen to each verb, and click <b>Next</b> when it becomes available."
    )
      .css({ "font-size": "1.25em", "margin-top": "20px" })
      .center()
      .print(),
    newButton("intro_start", "Start")
      .bold()
      .css(button_css)
      .center()
      .print(),
    newKey(`intro_start_space_${blockName}`, " ").callback(getButton("intro_start").click()),
    getButton("intro_start").wait(),
    getText("intro_title").remove(),
    getText("intro_body").remove(),
    getButton("intro_start").remove()
  ];

  verbItems.forEach((item, idx) => {
    const n = idx + 1;
    commands.push(
      newImage(`vimg_${n}`, item.pic).size(220, 220).center().print(),
      newText(`vent_${n}`, item.entity).css({ "font-size": "1.1em" }).center().print(),
      newText(`vtxt_${n}`, item.verb)
        .css({ "font-size": "2.2em", "font-weight": "bold" })
        .center()
        .print(),
      newText(`vobj_${n}`, item.object || "")
        .css({ "font-size": "1.25em", "margin-top": "6px" })
        .center()
        .print(),
      ...playPreGeneratedAudio(audioFileForVerb(item)),
      newTimer(`vmin_${n}`, MIN_VERB_STUDY_MS).start(),
      newButton(`vnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .disable()
        .print(),
      getTimer(`vmin_${n}`).wait(),
      getButton(`vnext_${n}`).enable(),
      newKey(`vnext_space_${n}`, " ").callback(getButton(`vnext_${n}`).click()),
      getButton(`vnext_${n}`).wait(),
      getImage(`vimg_${n}`).remove(),
      getText(`vent_${n}`).remove(),
      getText(`vtxt_${n}`).remove(),
      getText(`vobj_${n}`).remove(),
      getButton(`vnext_${n}`).remove()
    );
  });

  return newTrial(`intro_${blockName}`, ...commands).setOption("hideProgressBar", true);
};

var tenseIntroTrial = (blockName) =>
  newTrial(
    `tense_intro_${blockName}`,
    newText("title", "Now let's place events in time")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "body",
      "<p>Some events happened <b>yesterday</b> (Past).</p>" +
      "<p>Some events will happen <b>tomorrow</b> (Future).</p>" +
      "<p>Next, each item will appear one by one.</p>" +
      "<p>For each item, press <b>SPACE</b> to reveal the picture and hear the sentence audio.</p>" +
      "<p>Then click <b>Next</b> to continue.</p>"
    )
      .css({ "font-size": "1.25em", "max-width": "38em", "text-align": "left", "margin-top": "20px" })
      .center()
      .print(),
    newText("space_to_start", "Press SPACE to begin.")
      .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "16px" })
      .center()
      .print(),
    newKey(`tense_intro_space_${blockName}`, " ").wait()
  ).setOption("hideProgressBar", true);

var tensePairTrial = (blockName, items) => {
  const byEntity = {};
  uniqueByVerb(items).forEach(item => {
    if (!byEntity[item.entity]) byEntity[item.entity] = {};
    byEntity[item.entity][item.side] = item;
  });

  const extraEntities = Object.keys(byEntity)
    .filter(e => !ENTITY_DISPLAY_ORDER.includes(e))
    .sort();

  const entityOrder = ENTITY_DISPLAY_ORDER
    .concat(extraEntities)
    .filter(e => byEntity[e] && byEntity[e].PAST && byEntity[e].FUTURE);

  const orderedItems = [];
  entityOrder.forEach(entity => {
    orderedItems.push(byEntity[entity].PAST);
    orderedItems.push(byEntity[entity].FUTURE);
  });

  const rowYByEntity = {};
  entityOrder.forEach((entity, idx) => {
    rowYByEntity[entity] = 165 + idx * 200;
  });

  const slotFor = (item) => ({
    x: item.side === "PAST" ? 34 : 66,
    y: rowYByEntity[item.entity]
  });

  const canvasId = `pairs_canvas_${blockName}`;
  const commands = [
    defaultText.css({ "font-size": "1.2em", "font-family": "sans-serif" }),
    newText("pairs_title", "Tense Assignment")
      .css({ "font-size": "2.1em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "pairs_body",
      "All six locations are shown below.<br>" +
      "Press <b>SPACE</b> to reveal each item in its correct location and hear the sentence audio."
    )
      .css({ "font-size": "1.2em", "margin-top": "10px" })
      .center()
      .print(),
    newText("pairs_space_start", "Press SPACE to start.")
      .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "12px" })
      .center()
      .print(),
    newKey(`pairs_start_space_${blockName}`, " ").wait(),
    getText("pairs_title").remove(),
    getText("pairs_body").remove(),
    getText("pairs_space_start").remove(),
    newText(`lbl_past_${blockName}`, "Past (Yesterday)")
      .css({ "font-size": "1.1em", "font-weight": "bold" }),
    newText(`lbl_future_${blockName}`, "Future (Tomorrow)")
      .css({ "font-size": "1.1em", "font-weight": "bold" }),
    newCanvas(canvasId, 1200, 660)
      .center()
      .add("center at 34%", "top at 10px", getText(`lbl_past_${blockName}`))
      .add("center at 66%", "top at 10px", getText(`lbl_future_${blockName}`))
      .print()
  ];

  entityOrder.forEach(entity => {
    const rowY = rowYByEntity[entity];
    const entityId = entity.toLowerCase();
    commands.push(
      newText(`row_ent_${blockName}_${entityId}`, `<b>${entity}</b>`)
        .css({ "font-size": "1.2em" }),
      getCanvas(canvasId)
        .add("center at 10%", `middle at ${rowY}px`, getText(`row_ent_${blockName}_${entityId}`))
    );
  });

  orderedItems.forEach((item, idx) => {
    const n = idx + 1;
    const tenseLabel = item.side === "PAST" ? "Past (Yesterday)" : "Future (Tomorrow)";
    const slot = slotFor(item);
    commands.push(
      newText(`pc_${n}`, `Item ${n} of ${orderedItems.length}`)
        .css({ "font-size": "1.1em", "font-weight": "bold" })
        .center()
        .print(),
      newText(`ptense_${n}`, `${item.entity} - ${tenseLabel}`)
        .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "8px" })
        .center()
        .print(),
      newText(`pwait_${n}`, "Press SPACE to reveal and hear this item.")
        .css({ "font-size": "1.05em", "margin-top": "10px" })
        .center()
        .print(),
      newKey(`preveal_${blockName}_${n}`, " ").wait(),
      getText(`pwait_${n}`).remove(),
      newImage(`pimg_${n}`, item.pic).size(170, 170),
      getCanvas(canvasId).add(`center at ${slot.x}%`, `middle at ${slot.y}px`, getImage(`pimg_${n}`)),
      ...playPreGeneratedAudio(audioFileForSentence(item)),
      newTimer(`pmin_${n}`, MIN_TENSE_STUDY_MS).start(),
      newButton(`pnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .disable()
        .print(),
      getTimer(`pmin_${n}`).wait(),
      getButton(`pnext_${n}`).enable(),
      newKey(`pnext_space_${blockName}_${n}`, " ").callback(getButton(`pnext_${n}`).click()),
      getButton(`pnext_${n}`).wait(),
      getText(`pc_${n}`).remove(),
      getText(`ptense_${n}`).remove(),
      getButton(`pnext_${n}`).remove()
    );
  });

  return newTrial(`tense_pairs_${blockName}`, ...commands).setOption("hideProgressBar", true);
};

var decisionReadyTrial = (blockName) =>
  newTrial(
    `ready_${blockName}`,
    newText("ready_title", "Get Ready")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "ready_body",
      "<p>The decision trials start next.</p>" +
      "<p>Use this fixed key mapping:</p>" +
      "<p><b>F = Past</b> (left), <b>J = Future</b> (right)</p>" +
      "<p>Please respond quickly and accurately.</p>"
    )
      .css({ "font-size": "1.2em", "text-align": "left", "max-width": "36em" })
      .center()
      .print(),
    newButton("ready_button", "Start Decision Trials")
      .bold()
      .css(button_css)
      .center()
      .print(),
    newKey(`ready_space_${blockName}`, " ").callback(getButton("ready_button").click()),
    getButton("ready_button").wait()
  ).setOption("hideProgressBar", true);
