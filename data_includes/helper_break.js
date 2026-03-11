function defineBreakTrial() {
  newTrial("Break",
    newText("message", "Break")
        .css({ "font-size": "3em", "font-weight": "bold", "color": "#cc0000" })
        .center()
        .print(),

    newText("instruction",
            "Now we are going to learn about other things they did. Please <b>rest for a second</b>.")
        .css({ "font-size": "1.8em", "margin-top": "30px" })
        .center()
        .print(),

    newText("note",
            "Click 'Continue' when you are ready to see the verbs for the next block.")
        .css({ "font-size": "1.2em", "margin-top": "50px" })
        .center()
        .print(),
    newText("space1break", "<p>")
        .center()
        .print(),
    newTimer("break_continue_gate", 2000)
        .start()
        .wait()
        ,
    newButton("Continue")
        .css(button_css)
        .center()
        .print(),
    newKey("break_space_continue", " ").callback(getButton("Continue").click())
        ,
    getButton("Continue")
        .wait()
  )
    .setOption("hideProgressBar", true);
};

function defineSituationSwitchTrial() {
  newTrial("SituationSwitch",
    newText("switch_title", "New Situation")
        .css({ "font-size": "3em", "font-weight": "bold", "color": "#003366" })
        .center()
        .print(),

    newText("switch_instruction",
            "Now we are moving to a <b>new situation</b>.<br>The times of the events may be different from what you learned before. Please <b>rest for a second</b> and then click 'Continue' to see the verbs for the next block.")
        .css({ "font-size": "1.6em", "margin-top": "24px", "text-align": "center" })
        .center()
        .print(),

    newText("switch_note",
            "Click 'Continue' when you are ready to begin the next situation.")
        .css({ "font-size": "1.2em", "margin-top": "42px" })
        .center()
        .print(),
    newText("space_switch", "<p>")
        .center()
        .print(),
    newTimer("switch_continue_gate", 2000)
        .start()
        .wait(),
    newButton("switch_continue", "Continue")
        .css(button_css)
        .center()
        .print(),
    newKey("switch_space_continue", " ").callback(getButton("switch_continue").click()),
    getButton("switch_continue")
        .wait()
  )
    .setOption("hideProgressBar", true);
};
