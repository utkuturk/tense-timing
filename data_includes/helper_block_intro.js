var MIN_VERB_STUDY_MS = 1200;
var MIN_TENSE_STUDY_MS = 1400;
var __speechCounter = 0;
var __ttsCurrentAudio = null;

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

function speakText(text) {
  const id = `speak_${__speechCounter++}`;
  return newFunction(id, () => {
    const fallbackSpeak = () => {
      if (!window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(text);
        utter.rate = 0.95;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // Keep the trial running even if speech synthesis is unavailable.
      }
    };

    try {
      fallbackSpeak();
    } catch (e) {
      fallbackSpeak();
    }
  }).call();
}

function audioFileForVerb(item) {
  return `tts_verb_${item.verb}.mp3`;
}

function audioFileForSentence(item) {
  const entity = String(item.entity || "").toLowerCase();
  const tense = String(item.side || "").toLowerCase();
  return `tts_sent_${entity}_${item.verb}_${tense}.mp3`;
}

function playPreGeneratedAudio(fileName, fallbackText) {
  const id = `audio_${__speechCounter++}`;
  return newFunction(id, () => {
    const fallbackSpeak = () => {
      if (!window.speechSynthesis) return;
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(fallbackText);
        utter.rate = 0.95;
        utter.pitch = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // If both audio and fallback fail, continue silently.
      }
    };

    try {
      if (__ttsCurrentAudio) {
        __ttsCurrentAudio.pause();
        __ttsCurrentAudio.currentTime = 0;
      }
      const audio = new Audio(fileName);
      __ttsCurrentAudio = audio;
      audio.onerror = () => fallbackSpeak();
      audio.play().catch(() => fallbackSpeak());
    } catch (e) {
      fallbackSpeak();
    }
  }).call();
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
      .print()
      .wait(),
    getText("intro_title").remove(),
    getText("intro_body").remove(),
    getButton("intro_start").remove()
  ];

  verbItems.forEach((item, idx) => {
    const n = idx + 1;
    commands.push(
      newText(`vcount_${n}`, `Verb ${n} of ${verbItems.length}`)
        .css({ "font-size": "1.2em", "font-weight": "bold" })
        .center()
        .print(),
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
      playPreGeneratedAudio(audioFileForVerb(item), withObject(item.verb, item.object)),
      newTimer(`vmin_${n}`, MIN_VERB_STUDY_MS).start(),
      newButton(`vnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .disable()
        .print(),
      getTimer(`vmin_${n}`).wait(),
      getButton(`vnext_${n}`).enable(),
      getButton(`vnext_${n}`).wait(),
      getText(`vcount_${n}`).remove(),
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
      "<p>Next, each verb will be shown with its <b>assigned tense</b>.</p>"
    )
      .css({ "font-size": "1.25em", "max-width": "38em", "text-align": "left", "margin-top": "20px" })
      .center()
      .print(),
    newButton("Continue")
      .bold()
      .css(button_css)
      .center()
      .print()
      .wait()
  ).setOption("hideProgressBar", true);

var tensePairTrial = (blockName, items) => {
  const orderedItems = sortByEntityThenVerb(uniqueByVerb(items));
  const commands = [
    defaultText.css({ "font-size": "1.2em", "font-family": "sans-serif" }),
    newText("pairs_title", "Assigned tense for each verb")
      .css({ "font-size": "2.2em", "font-weight": "bold" })
      .center()
      .print(),
    newText(
      "pairs_body",
      "Read each item carefully. Each character+verb has one assigned tense."
    )
      .css({ "font-size": "1.2em", "margin-top": "14px" })
      .center()
      .print(),
    newButton("pairs_start", "Start")
      .bold()
      .css(button_css)
      .center()
      .print()
      .wait(),
    getText("pairs_title").remove(),
    getText("pairs_body").remove(),
    getButton("pairs_start").remove()
  ];

  orderedItems.forEach((item, idx) => {
    const n = idx + 1;
    const objectSegment = item.object && item.object.length ? ` ${item.object}` : "";
    const isPast = item.side === "PAST";
    const tenseLabel = isPast ? "Yesterday (Past)" : "Tomorrow (Future)";
    const sentence = isPast
      ? `The ${item.entity} ${pastForm(item.verb)}${objectSegment}.`
      : `The ${item.entity} will ${item.verb}${objectSegment}.`;
    commands.push(
      newText(`pc_${n}`, `Item ${n} of ${orderedItems.length}`)
        .css({ "font-size": "1.1em", "font-weight": "bold" })
        .center()
        .print(),
      newImage(`pimg_${n}`, item.pic).size(220, 220).center().print(),
      newText(`pent_${n}`, item.entity)
        .css({ "font-size": "1.2em", "font-weight": "bold", "margin-top": "8px" })
        .center()
        .print(),
      newText(`ptense_${n}`, tenseLabel)
        .css({ "font-size": "1.1em", "font-weight": "bold", "margin-top": "10px" })
        .center()
        .print(),
      newText(`psent_${n}`, sentence)
        .css({ "font-size": "1.3em", "margin-top": "6px" })
        .center()
        .print(),
      playPreGeneratedAudio(audioFileForSentence(item), sentence),
      newTimer(`pmin_${n}`, MIN_TENSE_STUDY_MS).start(),
      newButton(`pnext_${n}`, "Next")
        .bold()
        .css(button_css)
        .center()
        .disable()
        .print(),
      getTimer(`pmin_${n}`).wait(),
      getButton(`pnext_${n}`).enable(),
      getButton(`pnext_${n}`).wait(),
      getText(`pc_${n}`).remove(),
      getImage(`pimg_${n}`).remove(),
      getText(`pent_${n}`).remove(),
      getText(`ptense_${n}`).remove(),
      getText(`psent_${n}`).remove(),
      getButton(`pnext_${n}`).remove()
    );
  });

  return newTrial(`tense_pairs_${blockName}`, ...commands).setOption("hideProgressBar", true);
};
