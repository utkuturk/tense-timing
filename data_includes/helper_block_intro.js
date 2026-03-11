var MIN_VERB_STUDY_MS = 3000;
var MIN_TENSE_STUDY_MS = 3000;
var VERB_WHITE_MS = 300;
var VERB_FIX_MS = 500;
var VERB_POST_AUDIO_MS = 2000;
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
  const verbItems = shuffledCopy(uniqueByVerb(items));
  const commands = [
    defaultText.css({ "font-size": "1.25em", "font-family": "sans-serif" }),
    newText("intro_title", "Learn the verbs")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "intro_body",
      "You will now see the verbs one by one.<br>" +
      "Listen to each verb, and click <b>Next</b> or press <b>SPACE</b> when it becomes available."
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
    newKey(`intro_start_space_${blockName}`, " ").callback(getButton("intro_start").click()),
    getButton("intro_start").wait(),
    getText("intro_title").remove(),
    getText("intro_body").remove(),
    getButton("intro_start").remove()
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
        .print("center at 50vw", "middle at 50vh"),
      newTimer(`vcross_t_${n}`, VERB_FIX_MS).start(),
      getTimer(`vcross_t_${n}`).wait(),
      getText(`vcross_${n}`).remove(),
      newImage(`vimg_${n}`, item.pic).size(400, 400).center().print(),
      newText(`vent_${n}`, item.entity).css({ "font-size": "1.1em" }).center().print(),
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
      newText(`vspace2_${n}`, "<p>")
        .print(),
      newButton(`vnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .print(),
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
      "<p>Then click <b>Next</b> to continue.</p>"
    )
      .css({ "font-size": "1.25em", "max-width": "38em", "text-align": "left", "margin-top": "20px" })
      .center()
      .print(),
    newText("space_to_start", options.startPrompt || "Press SPACE to begin.")
      .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "16px" })
      .center()
      .print(),
    newKey(`tense_intro_space_${blockName}`, " ").wait()
  ).setOption("hideProgressBar", true);

var tensePairTrial = (blockName, items, options = {}) => {
  const byEntity = {};
  uniqueByVerb(items).forEach(item => {
    if (!byEntity[item.entity]) byEntity[item.entity] = { PAST: [], FUTURE: [] };
    if (!byEntity[item.entity][item.side]) byEntity[item.entity][item.side] = [];
    byEntity[item.entity][item.side].push(item);
  });

  Object.keys(byEntity).forEach(entity => {
    byEntity[entity].PAST = (byEntity[entity].PAST || [])
      .slice()
      .sort((a, b) => a.verb.localeCompare(b.verb));
    byEntity[entity].FUTURE = (byEntity[entity].FUTURE || [])
      .slice()
      .sort((a, b) => a.verb.localeCompare(b.verb));
  });

  const extraEntities = Object.keys(byEntity)
    .filter(e => !ENTITY_DISPLAY_ORDER.includes(e))
    .sort();

  const entityOrder = ENTITY_DISPLAY_ORDER
    .concat(extraEntities)
    .filter(
      e =>
        byEntity[e] &&
        ((byEntity[e].PAST && byEntity[e].PAST.length) ||
          (byEntity[e].FUTURE && byEntity[e].FUTURE.length)),
    );

  const rows = [];
  entityOrder.forEach(entity => {
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
  rows.forEach(row => {
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

  const itemKey = item => `${item.entity}|${item.side}|${item.verb}`;
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

  const slotFor = item =>
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
      "Press <b>SPACE</b> to reveal each item and hear the sentence audio."
    )
      .css({ "font-size": "1.2em", "margin-top": "10px" })
      .center()
      .print(),
    newText("pairs_space_start", options.startPrompt || "Press SPACE to start.")
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
    newCanvas(canvasId, 1200, pairCanvasHeight)
      .center()
      .add("center at 34%", "top at 10px", getText(`lbl_past_${blockName}`))
      .add("center at 66%", "top at 10px", getText(`lbl_future_${blockName}`))
      .print()
  ];

  rows.forEach((row, idx) => {
    const rowY = rowStartY + idx * rowStepY;
    const entityId = `${row.entity.toLowerCase()}_${idx + 1}`;
    commands.push(
      newText(`row_ent_${blockName}_${entityId}`, `<b>${row.entity}</b>`)
        .css({ "font-size": "1.2em" }),
      getCanvas(canvasId)
        .add("center at 10%", `middle at ${rowY}px`, getText(`row_ent_${blockName}_${entityId}`))
    );
  });

  orderedItems.forEach((item, idx) => {
    const n = idx + 1;
    const slot = slotFor(item);
    commands.push(
      // newText(`pc_${n}`, `Item ${n} of ${orderedItems.length}`)
      //   .css({ "font-size": "1.1em", "font-weight": "bold" })
      //   .center()
      //   .print(),
      // newText(`ptense_${n}`, `${item.entity} - ${tenseLabel}`)
      //   .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "8px" })
      //   .center()
      //   .print(),
      newText(`pwait_${n}`, options.revealPrompt || "Press SPACE to reveal the next item.")
        .css({ "font-size": "1.05em", "margin-top": "10px" })
        .center()
        .print(),
      newKey(`preveal_${blockName}_${n}`, " ").wait(),
      getText(`pwait_${n}`).remove(),
      newImage(`pimg_${n}`, item.pic).size(tensePairImageSize, tensePairImageSize),
      getCanvas(canvasId).add(`center at ${slot.x}%`, `middle at ${slot.y}px`, getImage(`pimg_${n}`)),
      newAudio(`p_audio_${blockName}_${n}`, audioFileForSentence(item)),
      getAudio(`p_audio_${blockName}_${n}`).play(),
      newTimer(`pmin_${n}`, MIN_TENSE_STUDY_MS).start(),
      newButton(`pnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .disable(),
      // Do not block on audio end; missing/failed files can otherwise freeze the trial.
      getTimer(`pmin_${n}`).wait(),
      getButton(`pnext_${n}`).print(),
      getButton(`pnext_${n}`).enable(),
      newKey(`pnext_space_${blockName}_${n}`, " ").callback(getButton(`pnext_${n}`).click()),
      getButton(`pnext_${n}`).wait(),
      getButton(`pnext_${n}`).remove()
    );
  });

  return newTrial(`tense_pairs_${blockName}`, ...commands).setOption("hideProgressBar", true);
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
      "<p>The decision trials start next.</p>" +
      "<p>Use this fixed key mapping:</p>" +
      "<p><b>C = Past</b> (left), <b>M = Future</b> (right)</p>" +
      "<p>Please respond quickly and accurately.</p>"
    )
      .css({ "font-size": "1.2em", "text-align": "left", "max-width": "36em" })
      .center()
      .print(),
    newButton("ready_button", options.buttonText || "Start Decision Trials")
      .bold()
      .css(button_css)
      .center()
      .disable()
      .print(),
    newTimer(`ready_gate_${blockName}`, 900).start(),
    getTimer(`ready_gate_${blockName}`).wait(),
    getButton("ready_button").enable(),
    newKey(`ready_space_${blockName}`, " ").callback(getButton("ready_button").click()),
    getButton("ready_button").wait()
  ).setOption("hideProgressBar", true);
